import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    withCredentials: true,
});

export function formatApiErrorDetail(detail) {
    if (detail == null) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
        return detail
            .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
            .filter(Boolean)
            .join(" ");
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
}

// ==================== MOCK FALLBACK DATABASE ENGINE ====================
const STORAGE_KEYS = {
    USER: "ks_current_user",
    USERS: "ks_users",
    CENTRES: "ks_centres",
    BOOKINGS: "ks_bookings",
    NOTIFS: "ks_notifications",
};

const DEFAULT_USERS = [
    {
        id: "farmer-1",
        name: "Suresh Yadav",
        email: "farmer.demo@kisansetu.in",
        mobile: "9876543210",
        password: "Farmer@2026",
        role: "farmer",
        village: "Bero",
        district: "Ranchi",
        state: "Jharkhand",
        preferred_language: "hi",
        active: true,
    },
    {
        id: "staff-1",
        name: "Ravi Kumar (Staff)",
        email: "staff.ranchi@kisansetu.gov.in",
        mobile: "9000000001",
        password: "Staff@2026",
        role: "staff",
        centre_id: "c1",
        active: true,
    },
    {
        id: "admin-1",
        name: "Subham Sathua",
        email: "subhamsathua57@gmail.com",
        mobile: "9999999999",
        password: "Admin@2026",
        role: "admin",
        active: true,
    },
];

const DEFAULT_CENTRES = [
    { id: "c1", name: "Ranchi Procurement Centre", location: "Kanke Road", district: "Ranchi", state: "Jharkhand", capacity: 120, operating_hours: "09:00-17:00", status: "active", avg_processing_minutes: 5 },
    { id: "c2", name: "Dhanbad Mandi Centre", location: "Bank More", district: "Dhanbad", state: "Jharkhand", capacity: 80, operating_hours: "08:30-16:30", status: "active", avg_processing_minutes: 6 },
    { id: "c3", name: "Patna Krishi Kendra", location: "Bailey Road", district: "Patna", state: "Bihar", capacity: 150, operating_hours: "09:00-18:00", status: "active", avg_processing_minutes: 4 },
    { id: "c4", name: "Lucknow APMC Centre", location: "Sitapur Road", district: "Lucknow", state: "Uttar Pradesh", capacity: 200, operating_hours: "08:00-17:00", status: "active", avg_processing_minutes: 5 },
    { id: "c5", name: "Bhopal Mandi", location: "Karond", district: "Bhopal", state: "Madhya Pradesh", capacity: 100, operating_hours: "09:00-17:00", status: "active", avg_processing_minutes: 5 },
];

function getStored(key, def) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : def;
    } catch {
        return def;
    }
}

function setStored(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch { }
}

function initMockDB() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) setStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (!localStorage.getItem(STORAGE_KEYS.CENTRES)) setStored(STORAGE_KEYS.CENTRES, DEFAULT_CENTRES);

    const todayStr = new Date().toISOString().slice(0, 10);

    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
        const initialBookings = [
            {
                id: "b-1",
                farmer_id: "farmer-1",
                farmer_name: "Suresh Yadav",
                farmer_mobile: "9876543210",
                centre_id: "c1",
                centre_name: "Ranchi Procurement Centre",
                slot_id: "slot-1030",
                slot_date: todayStr,
                slot_start: "10:30",
                slot_end: "12:00",
                commodity: "Wheat",
                expected_quantity: 25,
                vehicle_number: "JH01-9876",
                token_number: 1,
                status: "active",
                queue_status: "waiting",
                procurement_status: "booked",
                payment_status: "pending",
                payment_amount: 56875,
                created_at: new Date().toISOString(),
            },
            {
                id: "b-2",
                farmer_id: "demo-1",
                farmer_name: "Ramesh Singh",
                farmer_mobile: "9800000001",
                centre_id: "c1",
                centre_name: "Ranchi Procurement Centre",
                slot_id: "slot-0900",
                slot_date: todayStr,
                slot_start: "09:00",
                slot_end: "10:30",
                commodity: "Paddy",
                expected_quantity: 30,
                vehicle_number: "JH01-1001",
                token_number: 2,
                status: "active",
                queue_status: "completed",
                procurement_status: "completed",
                payment_status: "pending",
                payment_amount: 69000,
                created_at: new Date().toISOString(),
            },
            {
                id: "b-3",
                farmer_id: "demo-2",
                farmer_name: "Kiran Devi",
                farmer_mobile: "9800000002",
                centre_id: "c1",
                centre_name: "Ranchi Procurement Centre",
                slot_id: "slot-0900",
                slot_date: todayStr,
                slot_start: "09:00",
                slot_end: "10:30",
                commodity: "Wheat",
                expected_quantity: 25,
                vehicle_number: "JH01-1002",
                token_number: 3,
                status: "active",
                queue_status: "completed",
                procurement_status: "completed",
                payment_status: "pending",
                payment_amount: 56875,
                created_at: new Date().toISOString(),
            },
            {
                id: "b-4",
                farmer_id: "demo-3",
                farmer_name: "Manoj Mahto",
                farmer_mobile: "9800000003",
                centre_id: "c1",
                centre_name: "Ranchi Procurement Centre",
                slot_id: "slot-1030",
                slot_date: todayStr,
                slot_start: "10:30",
                slot_end: "12:00",
                commodity: "Paddy",
                expected_quantity: 40,
                vehicle_number: "JH01-1003",
                token_number: 4,
                status: "active",
                queue_status: "processing",
                procurement_status: "verification",
                payment_status: "pending",
                payment_amount: 92000,
                created_at: new Date().toISOString(),
            },
        ];
        setStored(STORAGE_KEYS.BOOKINGS, initialBookings);
    }

    if (!localStorage.getItem(STORAGE_KEYS.NOTIFS)) {
        const initialNotifs = [
            {
                id: "n-1",
                user_id: "farmer-1",
                title: "Slot Booked",
                message: `Token #1 confirmed at Ranchi Procurement Centre on ${todayStr} 10:30`,
                read: false,
                created_at: new Date().toISOString(),
            },
        ];
        setStored(STORAGE_KEYS.NOTIFS, initialNotifs);
    }
}

initMockDB();

function mockResponse(data) {
    return Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config: {} });
}

function mockError(msg, status = 400) {
    const err = new Error(msg);
    err.response = { data: { detail: msg }, status };
    return Promise.reject(err);
}

function handleMockRequest(method, url, data) {
    const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, "").replace(/^\/api/, "");
    const currentUser = getStored(STORAGE_KEYS.USER, null);

    // Auth Login
    if (method === "post" && cleanUrl === "/auth/login") {
        const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
        const match = users.find(
            (u) => u.email.toLowerCase() === (data?.email || "").toLowerCase()
        );
        if (!match) return mockError("Invalid email or password", 401);
        if (data?.password && match.password && match.password !== data.password) {
            return mockError("Invalid email or password", 401);
        }
        setStored(STORAGE_KEYS.USER, match);
        return mockResponse(match);
    }

    // Auth Register
    if (method === "post" && cleanUrl === "/auth/register") {
        const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
        if (users.some((u) => u.email.toLowerCase() === (data?.email || "").toLowerCase())) {
            return mockError("Email already registered", 400);
        }
        const newUser = {
            id: `u-${Date.now()}`,
            name: data.name,
            email: data.email,
            mobile: data.mobile || "",
            role: data.role || "farmer",
            village: data.village || "",
            district: data.district || "",
            state: data.state || "Jharkhand",
            preferred_language: data.preferred_language || "en",
            active: true,
        };
        users.push(newUser);
        setStored(STORAGE_KEYS.USERS, users);
        setStored(STORAGE_KEYS.USER, newUser);
        return mockResponse(newUser);
    }

    // Auth Me
    if (method === "get" && cleanUrl === "/auth/me") {
        if (!currentUser) return mockError("Not authenticated", 401);
        return mockResponse(currentUser);
    }

    // Auth Logout
    if (method === "post" && cleanUrl === "/auth/logout") {
        setStored(STORAGE_KEYS.USER, null);
        return mockResponse({ ok: true });
    }

    // Centres
    if (method === "get" && cleanUrl === "/centres") {
        const centres = getStored(STORAGE_KEYS.CENTRES, DEFAULT_CENTRES);
        return mockResponse(centres);
    }

    if (method === "post" && cleanUrl === "/centres") {
        const centres = getStored(STORAGE_KEYS.CENTRES, DEFAULT_CENTRES);
        const newC = { id: `c-${Date.now()}`, ...data, status: "active" };
        centres.push(newC);
        setStored(STORAGE_KEYS.CENTRES, centres);
        return mockResponse(newC);
    }

    // Slots
    if (method === "get" && cleanUrl.startsWith("/slots")) {
        const timeSlots = [
            { id: "s-0900", start_time: "09:00", end_time: "10:30", maximum_bookings: 15, current_bookings: 4 },
            { id: "s-1030", start_time: "10:30", end_time: "12:00", maximum_bookings: 15, current_bookings: 2 },
            { id: "s-1300", start_time: "13:00", end_time: "14:30", maximum_bookings: 15, current_bookings: 0 },
            { id: "s-1430", start_time: "14:30", end_time: "16:00", maximum_bookings: 15, current_bookings: 0 },
        ];
        return mockResponse(timeSlots);
    }

    // Bookings
    if (method === "get" && cleanUrl === "/bookings") {
        const bookings = getStored(STORAGE_KEYS.BOOKINGS, []);
        const farmerBookings = bookings.filter((b) => !currentUser || b.farmer_id === currentUser.id || currentUser.role !== "farmer");
        return mockResponse(farmerBookings);
    }

    if (method === "post" && cleanUrl === "/bookings") {
        const bookings = getStored(STORAGE_KEYS.BOOKINGS, []);
        const centres = getStored(STORAGE_KEYS.CENTRES, DEFAULT_CENTRES);
        const centre = centres.find((c) => c.id === data.centre_id) || centres[0];

        const newBooking = {
            id: `b-${Date.now()}`,
            farmer_id: currentUser?.id || "farmer-1",
            farmer_name: currentUser?.name || "Suresh Yadav",
            farmer_mobile: currentUser?.mobile || "9876543210",
            centre_id: centre.id,
            centre_name: centre.name,
            slot_id: data.slot_id || "s-0900",
            slot_date: data.date || new Date().toISOString().slice(0, 10),
            slot_start: "09:00",
            slot_end: "10:30",
            commodity: data.commodity || "Wheat",
            expected_quantity: Number(data.expected_quantity || 25),
            vehicle_number: data.vehicle_number || "JH01-LOCAL",
            token_number: bookings.length + 1,
            status: "active",
            queue_status: "waiting",
            procurement_status: "booked",
            payment_status: "pending",
            payment_amount: Number(data.expected_quantity || 25) * 2275,
            created_at: new Date().toISOString(),
        };
        bookings.unshift(newBooking);
        setStored(STORAGE_KEYS.BOOKINGS, bookings);

        // Add notification
        const notifs = getStored(STORAGE_KEYS.NOTIFS, []);
        notifs.unshift({
            id: `n-${Date.now()}`,
            user_id: currentUser?.id || "farmer-1",
            title: "Slot Booked",
            message: `Token #${newBooking.token_number} confirmed at ${centre.name} on ${newBooking.slot_date}`,
            read: false,
            created_at: new Date().toISOString(),
        });
        setStored(STORAGE_KEYS.NOTIFS, notifs);

        return mockResponse(newBooking);
    }

    // Notifications
    if (method === "get" && cleanUrl === "/notifications") {
        const notifs = getStored(STORAGE_KEYS.NOTIFS, []);
        return mockResponse(notifs);
    }

    // Live Queue
    if (method === "get" && cleanUrl.startsWith("/queue/")) {
        const parts = cleanUrl.split("/");
        const centreId = parts[2]?.split("?")[0];
        const bookings = getStored(STORAGE_KEYS.BOOKINGS, []);
        const centreBookings = bookings.filter((b) => !centreId || b.centre_id === centreId);
        const nowServing = centreBookings.find((b) => b.queue_status === "processing" || b.queue_status === "called") || null;

        return mockResponse({
            centre_id: centreId,
            queue: centreBookings,
            now_serving: nowServing,
            avg_processing_minutes: 5,
        });
    }

    // Call Next Farmer
    if (method === "post" && cleanUrl.includes("/call-next")) {
        const bookings = getStored(STORAGE_KEYS.BOOKINGS, []);
        const waiting = bookings.find((b) => b.queue_status === "waiting");
        if (waiting) {
            waiting.queue_status = "called";
            waiting.procurement_status = "called";
            setStored(STORAGE_KEYS.BOOKINGS, bookings);
            return mockResponse({ next: waiting });
        }
        return mockResponse({ next: null });
    }

    // Patch booking status
    if (method === "patch" && cleanUrl.startsWith("/bookings/")) {
        const bid = cleanUrl.split("/")[2];
        const bookings = getStored(STORAGE_KEYS.BOOKINGS, []);
        const target = bookings.find((b) => b.id === bid);
        if (target) {
            Object.assign(target, data);
            setStored(STORAGE_KEYS.BOOKINGS, bookings);
            return mockResponse(target);
        }
        return mockError("Booking not found", 404);
    }

    // Admin endpoints
    if (method === "get" && cleanUrl.startsWith("/admin/stats")) {
        const bookings = getStored(STORAGE_KEYS.BOOKINGS, []);
        const users = getStored(STORAGE_KEYS.USERS, []);
        return mockResponse({
            total_farmers: users.filter((u) => u.role === "farmer").length || 120,
            total_bookings: bookings.length || 4,
            completed_procurements: bookings.filter((b) => b.queue_status === "completed").length,
            completed_payments: bookings.filter((b) => b.payment_status === "paid").length,
            pending_procurements: bookings.filter((b) => b.queue_status !== "completed").length,
            pending_payments: bookings.filter((b) => b.payment_status !== "paid").length,
            avg_wait_minutes: 28,
            daily_bookings: [
                { date: "2026-09-01", count: 12 },
                { date: "2026-09-02", count: 18 },
                { date: "2026-09-03", count: 15 },
                { date: "2026-09-04", count: 22 },
                { date: "2026-09-05", count: 28 },
                { date: "2026-09-06", count: 30 },
                { date: "2026-09-07", count: 8 },
            ],
            commodity_breakdown: [
                { commodity: "Paddy", count: 70 },
                { commodity: "Wheat", count: 50 },
                { commodity: "Gram", count: 20 },
                { commodity: "Mustard", count: 15 },
            ],
        });
    }

    if (method === "get" && cleanUrl.startsWith("/admin/users")) {
        const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
        return mockResponse(users);
    }

    if (method === "patch" && cleanUrl.includes("/admin/users/")) {
        const uid = cleanUrl.split("/")[3];
        const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
        const u = users.find((x) => x.id === uid);
        if (u) {
            u.active = !u.active;
            setStored(STORAGE_KEYS.USERS, users);
            return mockResponse(u);
        }
        return mockError("User not found", 404);
    }

    if (method === "get" && cleanUrl.startsWith("/admin/bookings")) {
        const bookings = getStored(STORAGE_KEYS.BOOKINGS, []);
        return mockResponse(bookings);
    }

    return mockResponse({ ok: true });
}

// Axios Interceptor to catch network errors & execute mock handler
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (
            !error.response ||
            error.code === "ERR_NETWORK" ||
            error.code === "ECONNABORTED" ||
            error.response.status === 404 ||
            error.response.status === 500
        ) {
            const config = error.config || {};
            const method = (config.method || "get").toLowerCase();
            const url = config.url || "";
            let data = null;
            try {
                data = config.data ? JSON.parse(config.data) : null;
            } catch {
                data = config.data;
            }

            try {
                return await handleMockRequest(method, url, data);
            } catch (mockErr) {
                return Promise.reject(mockErr);
            }
        }
        return Promise.reject(error);
    }
);
