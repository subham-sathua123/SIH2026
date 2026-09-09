import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { Link } from "react-router-dom";
import { Ticket, Clock, Users, Wheat, Bell, CheckCircle2, ArrowRight, IndianRupee } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
    { key: "booked", label: "Slot Booked" },
    { key: "arrived", label: "Arrived at Centre" },
    { key: "verification", label: "Token Verified" },
    { key: "weighing", label: "Weighing" },
    { key: "completed", label: "Procurement Completed" },
    { key: "payment_processing", label: "Payment Processing" },
    { key: "paid", label: "DBT Paid" },
];

function currentStepIndex(booking) {
    if (booking.payment_status === "paid") return 6;
    if (booking.payment_status === "processing") return 5;
    const map = { booked: 0, arrived: 1, verification: 2, weighing: 3, completed: 4 };
    return map[booking.procurement_status] ?? 0;
}

export default function FarmerDashboard() {
    const { user } = useAuth();
    const { t } = useLang();
    const [bookings, setBookings] = useState([]);
    const [notifs, setNotifs] = useState([]);
    const [queue, setQueue] = useState(null);
    const [active, setActive] = useState(null);

    const load = async () => {
        try {
            const [b, n] = await Promise.all([api.get("/bookings"), api.get("/notifications")]);
            setBookings(b.data);
            setNotifs(n.data);
            const upcoming = b.data.find((x) => x.queue_status !== "completed" && x.queue_status !== "cancelled") || b.data[0];
            setActive(upcoming || null);
            if (upcoming) {
                const q = await api.get(`/queue/${upcoming.centre_id}?date=${upcoming.slot_date}`);
                setQueue(q.data);
            }
        } catch (e) { /* ignore */ }
    };
    useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, []);

    const farmersAhead = queue && active
        ? queue.queue.filter((x) => x.queue_status === "waiting" && x.token_number < active.token_number).length
        : 0;
    const estWait = queue ? farmersAhead * (queue.avg_processing_minutes || 5) : 0;

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-up">
                <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">{t("farmer")} · {t("dashboard")}</div>
                        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1C241B] mt-1" data-testid="dashboard-title">
                            Namaste, {user?.name?.split(" ")[0]} 🌾
                        </h1>
                    </div>
                    <Link to="/book" className="btn-primary inline-flex items-center gap-2" data-testid="book-new-btn">
                        {t("book_slot")} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {!active ? (
                    <div className="card-earth p-10 text-center" data-testid="no-booking">
                        <Wheat className="w-10 h-10 text-[#1E4620] mx-auto" />
                        <h3 className="font-display text-xl font-semibold mt-3">No active bookings yet</h3>
                        <p className="text-[#526251] mt-1">Book your first procurement slot to get a digital token.</p>
                        <Link to="/book" className="btn-primary inline-flex mt-4">{t("book_slot")}</Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-4">
                        {/* Token card */}
                        <div className="card-earth p-6 lg:col-span-2 relative overflow-hidden" data-testid="active-token-card">
                            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#D99B26]/10" />
                            <div className="flex justify-between items-start relative">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-[#526251]">{t("token")}</div>
                                    <div className="token-display text-5xl sm:text-6xl font-bold text-[#1E4620] mt-1" data-testid="token-number">
                                        #{String(active.token_number).padStart(3, "0")}
                                    </div>
                                    <div className="text-sm text-[#526251] mt-2">{active.centre_name}</div>
                                    <div className="text-sm font-medium text-[#1C241B]">{active.slot_date} · {active.slot_start}</div>
                                </div>
                                <span className={`badge-${active.queue_status === "processing" ? "serving" : active.queue_status === "called" ? "urgent" : "waiting"} px-3 py-1 rounded-full text-xs uppercase font-semibold tracking-wider`} data-testid="queue-status">
                                    {t(active.queue_status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-6">
                                <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7]">
                                    <div className="text-[10px] uppercase text-[#526251] tracking-widest">{t("currently_serving")}</div>
                                    <div className="token-display text-2xl font-bold text-[#B85B28]" data-testid="now-serving">
                                        #{queue?.now_serving ? String(queue.now_serving.token_number).padStart(3, "0") : "—"}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7]">
                                    <div className="text-[10px] uppercase text-[#526251] tracking-widest">{t("farmers_ahead")}</div>
                                    <div className="text-2xl font-bold text-[#1C241B]" data-testid="farmers-ahead">{farmersAhead}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7]">
                                    <div className="text-[10px] uppercase text-[#526251] tracking-widest">{t("est_wait")}</div>
                                    <div className="text-2xl font-bold text-[#1E4620]" data-testid="est-wait">{estWait} <span className="text-sm text-[#526251] font-normal">{t("minutes")}</span></div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="mt-8">
                                <div className="text-xs uppercase tracking-widest text-[#526251] mb-4">Procurement Timeline</div>
                                <div className="space-y-3">
                                    {STEPS.map((s, i) => {
                                        const idx = currentStepIndex(active);
                                        const state = i < idx ? "active" : i === idx ? "current" : "";
                                        return (
                                            <div key={s.key} className="flex items-center gap-3" data-testid={`step-${s.key}`}>
                                                <div className={`step-dot ${state}`}>{i < idx ? <CheckCircle2 className="w-4 h-4" /> : i + 1}</div>
                                                <div className={`flex-1 text-sm ${state === "current" ? "font-semibold text-[#1C241B]" : state === "active" ? "text-[#1C241B]" : "text-[#526251]"}`}>{s.label}</div>
                                                {state === "current" && <span className="text-[10px] uppercase tracking-widest text-[#B85B28] font-semibold">Now</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="space-y-4">
                            <div className="card-earth p-5" data-testid="payment-card">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#526251] mb-2"><IndianRupee className="w-3.5 h-3.5" /> Payment</div>
                                <div className="text-2xl font-bold text-[#1C241B]">₹ {(active.payment_amount || 0).toLocaleString("en-IN")}</div>
                                <div className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-semibold badge-${active.payment_status === "paid" ? "serving" : "waiting"}`}>{active.payment_status}</div>
                                <div className="text-xs text-[#526251] mt-2">{active.commodity} · {active.expected_quantity} Q</div>
                            </div>

                            <div className="card-earth p-5" data-testid="notifications-panel">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#526251]"><Bell className="w-3.5 h-3.5" /> {t("notifications")}</div>
                                    <span className="text-xs text-[#B85B28] font-semibold">{notifs.filter(n => !n.read).length} new</span>
                                </div>
                                <div className="space-y-2 max-h-80 overflow-auto">
                                    {notifs.slice(0, 8).map((n) => (
                                        <div key={n.id} className={`p-3 rounded-lg border ${n.read ? "border-[#DDD8C7] bg-[#F7F5EE]/50" : "border-[#1E4620]/30 bg-[#EFECE1]"}`} data-testid={`notif-${n.id}`}>
                                            <div className="text-sm font-semibold text-[#1C241B]">{n.title}</div>
                                            <div className="text-xs text-[#526251] mt-0.5">{n.message}</div>
                                        </div>
                                    ))}
                                    {notifs.length === 0 && <div className="text-sm text-[#526251] text-center py-6">No notifications yet</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {bookings.length > 1 && (
                    <div className="mt-8">
                        <h3 className="font-display text-xl font-semibold text-[#1C241B] mb-3">All bookings</h3>
                        <div className="card-earth overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#EFECE1] text-left">
                                        {["Token", "Centre", "Date", "Slot", "Commodity", "Queue", "Payment"].map(h => <th key={h} className="px-4 py-3 text-xs uppercase tracking-widest text-[#526251]">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id} className="border-t border-[#DDD8C7]" data-testid={`booking-row-${b.id}`}>
                                            <td className="px-4 py-3 token-display font-semibold text-[#1E4620]">#{String(b.token_number).padStart(3, "0")}</td>
                                            <td className="px-4 py-3">{b.centre_name}</td>
                                            <td className="px-4 py-3">{b.slot_date}</td>
                                            <td className="px-4 py-3">{b.slot_start}</td>
                                            <td className="px-4 py-3">{b.commodity}</td>
                                            <td className="px-4 py-3"><span className={`badge-${b.queue_status === "completed" ? "serving" : "waiting"} px-2 py-0.5 rounded-full text-xs font-medium`}>{b.queue_status}</span></td>
                                            <td className="px-4 py-3"><span className={`badge-${b.payment_status === "paid" ? "serving" : "waiting"} px-2 py-0.5 rounded-full text-xs font-medium`}>{b.payment_status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
