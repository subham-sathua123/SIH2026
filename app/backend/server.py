from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------- Setup ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Kisan Setu API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kisansetu")

# ---------- Utils ----------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": now_utc() + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": now_utc() + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def set_auth_cookies(resp: Response, access: str, refresh: str):
    resp.set_cookie("access_token", access, httponly=True, secure=True, samesite="none",
                    max_age=60 * 60 * 12, path="/")
    resp.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none",
                    max_age=60 * 60 * 24 * 7, path="/")

def clear_auth_cookies(resp: Response):
    resp.delete_cookie("access_token", path="/")
    resp.delete_cookie("refresh_token", path="/")

def _sanitize_user(u: dict) -> dict:
    u = dict(u)
    u.pop("password_hash", None)
    if "_id" in u:
        u["id"] = str(u.pop("_id"))
    return u

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(401, "User not found")
        return _sanitize_user(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

def require_role(*roles: str):
    async def _dep(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return _dep

# ---------- Models ----------
class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    mobile: str
    role: Literal["farmer", "staff", "admin"] = "farmer"
    village: Optional[str] = ""
    district: Optional[str] = ""
    state: Optional[str] = ""
    preferred_language: Optional[str] = "en"
    centre_id: Optional[str] = None  # for staff

class LoginBody(BaseModel):
    email: EmailStr
    password: str

class CentreBody(BaseModel):
    name: str
    location: str
    district: str
    state: str
    capacity: int = 100
    operating_hours: str = "09:00-17:00"
    status: Literal["active", "inactive"] = "active"
    avg_processing_minutes: int = 5

class SlotBody(BaseModel):
    centre_id: str
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str
    maximum_bookings: int = 10

class BookingBody(BaseModel):
    centre_id: str
    slot_id: str
    commodity: str
    expected_quantity: float
    vehicle_number: Optional[str] = ""

class StatusUpdateBody(BaseModel):
    procurement_status: Optional[str] = None  # booked, arrived, verification, weighing, completed
    payment_status: Optional[str] = None  # pending, processing, paid
    payment_amount: Optional[float] = None
    queue_status: Optional[str] = None  # waiting, called, arrived, processing, completed, cancelled

# ---------- Notifications helper ----------
async def push_notification(user_id: str, title: str, message: str, ntype: str = "info"):
    await db.notifications.insert_one({
        "user_id": user_id, "title": title, "message": message, "type": ntype,
        "read": False, "created_at": now_utc().isoformat(),
    })

# ---------- Auth Routes ----------
@api.post("/auth/register")
async def register(body: RegisterBody, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    doc = {
        "name": body.name, "email": email, "mobile": body.mobile,
        "password_hash": hash_password(body.password), "role": body.role,
        "village": body.village, "district": body.district, "state": body.state,
        "preferred_language": body.preferred_language, "centre_id": body.centre_id,
        "active": True, "created_at": now_utc().isoformat(),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    access = create_access_token(uid, email, body.role)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    doc["id"] = uid
    await push_notification(uid, "Welcome to Kisan Setu",
                            "Your account has been created. Book your first procurement slot now.", "success")
    return _sanitize_user(doc)

@api.post("/auth/login")
async def login(body: LoginBody, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    if not user.get("active", True):
        raise HTTPException(403, "Account deactivated")
    uid = str(user["_id"])
    access = create_access_token(uid, email, user["role"])
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return _sanitize_user(user)

@api.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    clear_auth_cookies(response)
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# ---------- Centres ----------
@api.get("/centres")
async def list_centres():
    docs = await db.centres.find({}).to_list(500)
    return [{**{k: v for k, v in d.items() if k != "_id"}, "id": str(d["_id"])} for d in docs]

@api.post("/centres")
async def create_centre(body: CentreBody, user: dict = Depends(require_role("admin"))):
    doc = body.model_dump()
    doc["created_at"] = now_utc().isoformat()
    res = await db.centres.insert_one(doc)
    return {**doc, "id": str(res.inserted_id)}

@api.put("/centres/{cid}")
async def update_centre(cid: str, body: CentreBody, user: dict = Depends(require_role("admin"))):
    await db.centres.update_one({"_id": ObjectId(cid)}, {"$set": body.model_dump()})
    return {"ok": True}

@api.delete("/centres/{cid}")
async def delete_centre(cid: str, user: dict = Depends(require_role("admin"))):
    await db.centres.update_one({"_id": ObjectId(cid)}, {"$set": {"status": "inactive"}})
    return {"ok": True}

# ---------- Slots ----------
@api.get("/slots")
async def list_slots(centre_id: str = Query(...), date: Optional[str] = None):
    q = {"centre_id": centre_id}
    if date:
        q["date"] = date
    docs = await db.slots.find(q).sort("start_time", 1).to_list(200)
    return [{**{k: v for k, v in d.items() if k != "_id"}, "id": str(d["_id"])} for d in docs]

@api.post("/slots")
async def create_slot(body: SlotBody, user: dict = Depends(require_role("admin", "staff"))):
    doc = body.model_dump()
    doc.update({"current_bookings": 0, "status": "open", "created_at": now_utc().isoformat()})
    res = await db.slots.insert_one(doc)
    return {**doc, "id": str(res.inserted_id)}

# ---------- Bookings ----------
async def _next_token(centre_id: str, date: str) -> int:
    counter = await db.bookings.count_documents({"centre_id": centre_id, "slot_date": date})
    return counter + 1

@api.post("/bookings")
async def create_booking(body: BookingBody, user: dict = Depends(get_current_user)):
    if user["role"] != "farmer":
        raise HTTPException(403, "Only farmers can book slots")
    slot = await db.slots.find_one({"_id": ObjectId(body.slot_id)})
    if not slot:
        raise HTTPException(404, "Slot not found")
    if slot.get("current_bookings", 0) >= slot["maximum_bookings"]:
        raise HTTPException(400, "Slot is full")
    # Prevent duplicate booking in same slot
    if await db.bookings.find_one({"farmer_id": user["id"], "slot_id": body.slot_id,
                                    "status": {"$ne": "cancelled"}}):
        raise HTTPException(400, "You have already booked this slot")

    centre = await db.centres.find_one({"_id": ObjectId(body.centre_id)})
    token_num = await _next_token(body.centre_id, slot["date"])
    doc = {
        "farmer_id": user["id"], "farmer_name": user["name"], "farmer_mobile": user.get("mobile"),
        "centre_id": body.centre_id, "centre_name": centre["name"] if centre else "",
        "slot_id": body.slot_id, "slot_date": slot["date"],
        "slot_start": slot["start_time"], "slot_end": slot["end_time"],
        "commodity": body.commodity, "expected_quantity": body.expected_quantity,
        "vehicle_number": body.vehicle_number,
        "token_number": token_num, "status": "active",
        "queue_status": "waiting", "procurement_status": "booked",
        "payment_status": "pending", "payment_amount": 0,
        "created_at": now_utc().isoformat(),
    }
    res = await db.bookings.insert_one(doc)
    await db.slots.update_one({"_id": ObjectId(body.slot_id)}, {"$inc": {"current_bookings": 1}})
    await push_notification(user["id"], "Slot Booked",
        f"Token #{token_num} confirmed at {doc['centre_name']} on {slot['date']} {slot['start_time']}", "success")
    return {**doc, "id": str(res.inserted_id)}

def _booking_out(d: dict) -> dict:
    return {**{k: v for k, v in d.items() if k != "_id"}, "id": str(d["_id"])}

@api.get("/bookings")
async def list_bookings(user: dict = Depends(get_current_user),
                        centre_id: Optional[str] = None, date: Optional[str] = None,
                        status: Optional[str] = None):
    q = {}
    if user["role"] == "farmer":
        q["farmer_id"] = user["id"]
    elif user["role"] == "staff":
        if user.get("centre_id"):
            q["centre_id"] = user["centre_id"]
        elif centre_id:
            q["centre_id"] = centre_id
    else:  # admin
        if centre_id: q["centre_id"] = centre_id
    if date: q["slot_date"] = date
    if status: q["queue_status"] = status
    docs = await db.bookings.find(q).sort("created_at", -1).to_list(500)
    return [_booking_out(d) for d in docs]

@api.get("/bookings/{bid}")
async def get_booking(bid: str, user: dict = Depends(get_current_user)):
    d = await db.bookings.find_one({"_id": ObjectId(bid)})
    if not d: raise HTTPException(404, "Booking not found")
    if user["role"] == "farmer" and d["farmer_id"] != user["id"]:
        raise HTTPException(403, "Not allowed")
    return _booking_out(d)

@api.patch("/bookings/{bid}/status")
async def update_booking_status(bid: str, body: StatusUpdateBody,
                                 user: dict = Depends(require_role("staff", "admin"))):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "Nothing to update")
    d = await db.bookings.find_one({"_id": ObjectId(bid)})
    if not d: raise HTTPException(404, "Booking not found")
    await db.bookings.update_one({"_id": ObjectId(bid)}, {"$set": updates})
    # notifications
    msgs = {
        "arrived": ("Marked Arrived", "You have been marked arrived at the centre."),
        "processing": ("Processing Started", "Your procurement is now being processed."),
        "completed": ("Procurement Completed", "Your procurement has been completed."),
        "called": ("Please Reach Counter", "Your token has been called. Please proceed to the counter."),
    }
    key = updates.get("queue_status") or updates.get("procurement_status")
    if key and key in msgs:
        t, m = msgs[key]
        await push_notification(d["farmer_id"], t, m, "info")
    if updates.get("payment_status") == "paid":
        await push_notification(d["farmer_id"], "Payment Credited",
            f"Payment of Rs.{updates.get('payment_amount', d.get('payment_amount', 0))} has been credited.", "success")
    return {"ok": True}

@api.delete("/bookings/{bid}")
async def cancel_booking(bid: str, user: dict = Depends(get_current_user)):
    d = await db.bookings.find_one({"_id": ObjectId(bid)})
    if not d: raise HTTPException(404, "Booking not found")
    if user["role"] == "farmer" and d["farmer_id"] != user["id"]:
        raise HTTPException(403, "Not allowed")
    await db.bookings.update_one({"_id": ObjectId(bid)},
                                  {"$set": {"status": "cancelled", "queue_status": "cancelled"}})
    await db.slots.update_one({"_id": ObjectId(d["slot_id"])}, {"$inc": {"current_bookings": -1}})
    return {"ok": True}

# ---------- Queue ----------
@api.get("/queue/{centre_id}")
async def get_queue(centre_id: str, date: Optional[str] = None):
    today = date or now_utc().strftime("%Y-%m-%d")
    docs = await db.bookings.find({"centre_id": centre_id, "slot_date": today,
                                    "queue_status": {"$ne": "cancelled"}}) \
        .sort("token_number", 1).to_list(500)
    now_serving = next((d for d in docs if d.get("queue_status") in ("called", "processing")), None)
    centre = await db.centres.find_one({"_id": ObjectId(centre_id)})
    avg = centre.get("avg_processing_minutes", 5) if centre else 5
    waiting = [d for d in docs if d.get("queue_status") == "waiting"]
    return {
        "centre_id": centre_id,
        "date": today,
        "now_serving": _booking_out(now_serving) if now_serving else None,
        "avg_processing_minutes": avg,
        "waiting_count": len(waiting),
        "queue": [_booking_out(d) for d in docs],
    }

@api.post("/queue/{centre_id}/call-next")
async def call_next(centre_id: str, user: dict = Depends(require_role("staff", "admin"))):
    today = now_utc().strftime("%Y-%m-%d")
    # Complete current called/processing
    await db.bookings.update_many(
        {"centre_id": centre_id, "slot_date": today,
         "queue_status": {"$in": ["called", "processing"]}},
        {"$set": {"queue_status": "completed"}}
    )
    nxt = await db.bookings.find_one(
        {"centre_id": centre_id, "slot_date": today, "queue_status": "waiting"},
        sort=[("token_number", 1)]
    )
    if not nxt:
        return {"ok": True, "next": None}
    await db.bookings.update_one({"_id": nxt["_id"]}, {"$set": {"queue_status": "called"}})
    await push_notification(nxt["farmer_id"], "Your Token is Called",
        f"Token #{nxt['token_number']} — please proceed to the counter now.", "urgent")
    return {"ok": True, "next": _booking_out(nxt)}

# ---------- Notifications ----------
@api.get("/notifications")
async def list_notifications(user: dict = Depends(get_current_user)):
    docs = await db.notifications.find({"user_id": user["id"]}).sort("created_at", -1).to_list(100)
    return [{**{k: v for k, v in d.items() if k != "_id"}, "id": str(d["_id"])} for d in docs]

@api.patch("/notifications/{nid}/read")
async def read_notification(nid: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one({"_id": ObjectId(nid), "user_id": user["id"]},
                                       {"$set": {"read": True}})
    return {"ok": True}

@api.post("/notifications/mark-all-read")
async def read_all(user: dict = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"], "read": False},
                                        {"$set": {"read": True}})
    return {"ok": True}

# ---------- Admin ----------
@api.get("/admin/users")
async def admin_users(role: Optional[str] = None, q: Optional[str] = None,
                       user: dict = Depends(require_role("admin"))):
    filt = {}
    if role: filt["role"] = role
    if q: filt["$or"] = [{"name": {"$regex": q, "$options": "i"}},
                          {"email": {"$regex": q, "$options": "i"}},
                          {"mobile": {"$regex": q, "$options": "i"}}]
    docs = await db.users.find(filt).sort("created_at", -1).to_list(500)
    return [_sanitize_user(d) for d in docs]

@api.patch("/admin/users/{uid}/toggle")
async def toggle_user(uid: str, user: dict = Depends(require_role("admin"))):
    u = await db.users.find_one({"_id": ObjectId(uid)})
    if not u: raise HTTPException(404, "User not found")
    await db.users.update_one({"_id": ObjectId(uid)},
                               {"$set": {"active": not u.get("active", True)}})
    return {"ok": True}

@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_role("admin"))):
    total_farmers = await db.users.count_documents({"role": "farmer"})
    total_bookings = await db.bookings.count_documents({})
    completed = await db.bookings.count_documents({"procurement_status": "completed"})
    pending_proc = await db.bookings.count_documents({"procurement_status": {"$in": ["booked", "arrived", "verification", "weighing"]}})
    pending_pay = await db.bookings.count_documents({"payment_status": {"$in": ["pending", "processing"]}, "procurement_status": "completed"})
    paid = await db.bookings.count_documents({"payment_status": "paid"})
    # daily counts (last 7 days)
    daily = []
    for i in range(6, -1, -1):
        day = (now_utc() - timedelta(days=i)).strftime("%Y-%m-%d")
        c = await db.bookings.count_documents({"slot_date": day})
        daily.append({"date": day, "count": c})
    # commodity breakdown
    pipeline = [{"$group": {"_id": "$commodity", "count": {"$sum": 1}, "qty": {"$sum": "$expected_quantity"}}}]
    commodity = []
    async for d in db.bookings.aggregate(pipeline):
        commodity.append({"commodity": d["_id"], "count": d["count"], "quintals": d.get("qty", 0)})
    # avg wait time (mock: avg processing across centres)
    centres = await db.centres.find({}).to_list(50)
    avg_wait = sum(c.get("avg_processing_minutes", 5) for c in centres) / max(len(centres), 1)
    return {
        "total_farmers": total_farmers,
        "total_bookings": total_bookings,
        "completed_procurements": completed,
        "pending_procurements": pending_proc,
        "pending_payments": pending_pay,
        "completed_payments": paid,
        "avg_wait_minutes": round(avg_wait, 1),
        "daily_bookings": daily,
        "commodity_breakdown": commodity,
    }

@api.get("/admin/bookings")
async def admin_bookings(centre_id: Optional[str] = None, date: Optional[str] = None,
                          status: Optional[str] = None,
                          user: dict = Depends(require_role("admin"))):
    q = {}
    if centre_id: q["centre_id"] = centre_id
    if date: q["slot_date"] = date
    if status: q["queue_status"] = status
    docs = await db.bookings.find(q).sort("created_at", -1).to_list(1000)
    return [_booking_out(d) for d in docs]

# ---------- Root ----------
@api.get("/")
async def root():
    return {"service": "Kisan Setu API", "status": "ok"}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Seed ----------
async def seed():
    await db.users.create_index("email", unique=True)
    # Admin
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    admin_name = os.environ.get("ADMIN_NAME", "Admin")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "name": admin_name, "email": admin_email, "mobile": "9999999999",
            "password_hash": hash_password(admin_pw), "role": "admin",
            "active": True, "created_at": now_utc().isoformat(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one({"_id": existing["_id"]},
            {"$set": {"password_hash": hash_password(admin_pw), "role": "admin"}})

    # Centres
    if await db.centres.count_documents({}) == 0:
        centres = [
            {"name": "Ranchi Procurement Centre", "location": "Kanke Road", "district": "Ranchi", "state": "Jharkhand", "capacity": 120, "operating_hours": "09:00-17:00", "status": "active", "avg_processing_minutes": 5},
            {"name": "Dhanbad Mandi Centre", "location": "Bank More", "district": "Dhanbad", "state": "Jharkhand", "capacity": 80, "operating_hours": "08:30-16:30", "status": "active", "avg_processing_minutes": 6},
            {"name": "Patna Krishi Kendra", "location": "Bailey Road", "district": "Patna", "state": "Bihar", "capacity": 150, "operating_hours": "09:00-18:00", "status": "active", "avg_processing_minutes": 4},
            {"name": "Lucknow APMC Centre", "location": "Sitapur Road", "district": "Lucknow", "state": "Uttar Pradesh", "capacity": 200, "operating_hours": "08:00-17:00", "status": "active", "avg_processing_minutes": 5},
            {"name": "Bhopal Mandi", "location": "Karond", "district": "Bhopal", "state": "Madhya Pradesh", "capacity": 100, "operating_hours": "09:00-17:00", "status": "active", "avg_processing_minutes": 5},
        ]
        for c in centres:
            c["created_at"] = now_utc().isoformat()
        await db.centres.insert_many(centres)
        logger.info("Centres seeded")

    # Staff demo
    staff_email = "staff.ranchi@kisansetu.gov.in"
    if not await db.users.find_one({"email": staff_email}):
        centre = await db.centres.find_one({"name": "Ranchi Procurement Centre"})
        await db.users.insert_one({
            "name": "Ravi Kumar (Staff)", "email": staff_email, "mobile": "9000000001",
            "password_hash": hash_password("Staff@2026"), "role": "staff",
            "centre_id": str(centre["_id"]) if centre else None,
            "active": True, "created_at": now_utc().isoformat(),
        })

    # Farmer demo
    farmer_email = "farmer.demo@kisansetu.in"
    if not await db.users.find_one({"email": farmer_email}):
        await db.users.insert_one({
            "name": "Suresh Yadav", "email": farmer_email, "mobile": "9876543210",
            "password_hash": hash_password("Farmer@2026"), "role": "farmer",
            "village": "Bero", "district": "Ranchi", "state": "Jharkhand",
            "preferred_language": "hi", "active": True, "created_at": now_utc().isoformat(),
        })

    # Seed slots for next 7 days for each active centre
    if await db.slots.count_documents({}) < 10:
        centres = await db.centres.find({"status": "active"}).to_list(20)
        for centre in centres:
            for i in range(7):
                d = (now_utc() + timedelta(days=i)).strftime("%Y-%m-%d")
                for start, end in [("09:00", "10:30"), ("10:30", "12:00"),
                                    ("13:00", "14:30"), ("14:30", "16:00")]:
                    exists = await db.slots.find_one({"centre_id": str(centre["_id"]),
                                                       "date": d, "start_time": start})
                    if not exists:
                        await db.slots.insert_one({
                            "centre_id": str(centre["_id"]), "date": d,
                            "start_time": start, "end_time": end,
                            "maximum_bookings": 15, "current_bookings": 0,
                            "status": "open", "created_at": now_utc().isoformat(),
                        })

    # Seed sample bookings for today for demo queue
    farmer = await db.users.find_one({"email": farmer_email})
    centre = await db.centres.find_one({"name": "Ranchi Procurement Centre"})
    today = now_utc().strftime("%Y-%m-%d")
    if farmer and centre and await db.bookings.count_documents({"centre_id": str(centre["_id"]), "slot_date": today}) == 0:
        slot = await db.slots.find_one({"centre_id": str(centre["_id"]), "date": today})
        if slot:
            demo_farmers = [
                ("Ramesh Singh", "9800000001", "Paddy", 30),
                ("Kiran Devi", "9800000002", "Wheat", 25),
                ("Manoj Mahto", "9800000003", "Paddy", 40),
                ("Sunita Kumari", "9800000004", "Gram", 15),
            ]
            for idx, (nm, mob, com, qty) in enumerate(demo_farmers, start=1):
                await db.bookings.insert_one({
                    "farmer_id": f"demo-{idx}", "farmer_name": nm, "farmer_mobile": mob,
                    "centre_id": str(centre["_id"]), "centre_name": centre["name"],
                    "slot_id": str(slot["_id"]), "slot_date": today,
                    "slot_start": slot["start_time"], "slot_end": slot["end_time"],
                    "commodity": com, "expected_quantity": qty, "vehicle_number": f"JH01-{1000+idx}",
                    "token_number": idx, "status": "active",
                    "queue_status": "processing" if idx == 1 else "waiting",
                    "procurement_status": "verification" if idx == 1 else "booked",
                    "payment_status": "pending", "payment_amount": 0,
                    "created_at": now_utc().isoformat(),
                })

@app.on_event("startup")
async def on_startup():
    try:
        await seed()
    except Exception as e:
        logger.exception(f"Seeding error: {e}")

@app.on_event("shutdown")
async def on_shutdown():
    client.close()
