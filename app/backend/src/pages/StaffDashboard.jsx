import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { toast } from "sonner";
import { PhoneCall, UserCheck, PlayCircle, CheckCircle2, IndianRupee, Users, Clock } from "lucide-react";

const KPI = ({ label, value, testid, color = "text-[#1E4620]" }) => (
    <div className="card-earth p-5" data-testid={testid}>
        <div className="text-[10px] uppercase tracking-widest text-[#526251]">{label}</div>
        <div className={`font-display text-3xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
);

export default function StaffDashboard() {
    const { user } = useAuth();
    const { t } = useLang();
    const [centres, setCentres] = useState([]);
    const [centreId, setCentreId] = useState("");
    const [queue, setQueue] = useState({ queue: [], now_serving: null, avg_processing_minutes: 5 });
    const [busy, setBusy] = useState(false);
    const [amount, setAmount] = useState({});

    useEffect(() => {
        (async () => {
            const c = await api.get("/centres");
            setCentres(c.data);
            const cid = user?.centre_id || c.data[0]?.id;
            setCentreId(cid);
        })();
    }, [user]);

    const load = async () => {
        if (!centreId) return;
        const q = await api.get(`/queue/${centreId}`);
        setQueue(q.data);
    };
    useEffect(() => { if (centreId) { load(); const id = setInterval(load, 10000); return () => clearInterval(id); } }, [centreId]);

    const stats = useMemo(() => {
        const q = queue.queue || [];
        return {
            total: q.length,
            waiting: q.filter(x => x.queue_status === "waiting").length,
            processing: q.filter(x => x.queue_status === "processing" || x.queue_status === "called").length,
            completed: q.filter(x => x.queue_status === "completed").length,
        };
    }, [queue]);

    const act = async (bid, patch) => {
        setBusy(true);
        try {
            await api.patch(`/bookings/${bid}/status`, patch);
            await load();
        } catch (e) { toast.error("Failed"); }
        setBusy(false);
    };

    const callNext = async () => {
        setBusy(true);
        try {
            const { data } = await api.post(`/queue/${centreId}/call-next`);
            if (data.next) toast.success(`Called token #${data.next.token_number}`);
            else toast.info("No more farmers in queue");
            await load();
        } catch { toast.error("Failed to call next"); }
        setBusy(false);
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-up">
                <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">Staff · Live Queue</div>
                        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1C241B] mt-1" data-testid="staff-title">Procurement Control Room</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={centreId} onChange={(e) => setCentreId(e.target.value)}
                            className="px-4 py-2.5 rounded-full bg-white border border-[#DDD8C7] text-sm outline-none" data-testid="centre-select">
                            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={callNext} disabled={busy} className="btn-terra inline-flex items-center gap-2" data-testid="call-next-btn">
                            <PhoneCall className="w-4 h-4" /> {t("call_next")}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <KPI label="Today Bookings" value={stats.total} testid="kpi-total" />
                    <KPI label={t("waiting")} value={stats.waiting} testid="kpi-waiting" color="text-[#B45309]" />
                    <KPI label={t("processing")} value={stats.processing} testid="kpi-processing" color="text-[#B85B28]" />
                    <KPI label={t("completed")} value={stats.completed} testid="kpi-completed" color="text-[#15803D]" />
                </div>

                <div className="card-earth overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#EFECE1] text-left">
                                {["Token", "Farmer", "Commodity", "Qty", "Vehicle", "Queue", "Procurement", "Payment", "Actions"].map(h =>
                                    <th key={h} className="px-4 py-3 text-xs uppercase tracking-widest text-[#526251]">{h}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {queue.queue.map(b => (
                                <tr key={b.id} className="border-t border-[#DDD8C7]" data-testid={`queue-row-${b.token_number}`}>
                                    <td className="px-4 py-3 token-display font-semibold text-[#1E4620]">#{String(b.token_number).padStart(3, "0")}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{b.farmer_name}</div>
                                        <div className="text-xs text-[#526251]">{b.farmer_mobile}</div>
                                    </td>
                                    <td className="px-4 py-3">{b.commodity}</td>
                                    <td className="px-4 py-3">{b.expected_quantity} Q</td>
                                    <td className="px-4 py-3 text-xs">{b.vehicle_number || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`badge-${b.queue_status === "processing" ? "serving" : b.queue_status === "completed" ? "completed" : b.queue_status === "called" ? "urgent" : "waiting"} px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide`}>
                                            {b.queue_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs capitalize">{b.procurement_status}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <span className={`badge-${b.payment_status === "paid" ? "serving" : "waiting"} px-2 py-0.5 rounded-full text-xs font-semibold`}>{b.payment_status}</span>
                                            {b.payment_amount ? <span className="text-xs">₹{b.payment_amount}</span> : null}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {b.queue_status === "called" && (
                                                <button title="Mark Arrived" onClick={() => act(b.id, { queue_status: "arrived", procurement_status: "arrived" })} className="p-1.5 rounded-lg bg-[#EFECE1] hover:bg-[#DDD8C7]" data-testid={`btn-arrived-${b.token_number}`}>
                                                    <UserCheck className="w-4 h-4 text-[#1E4620]" />
                                                </button>
                                            )}
                                            {["arrived", "waiting", "called"].includes(b.queue_status) && (
                                                <button title="Start" onClick={() => act(b.id, { queue_status: "processing", procurement_status: "verification" })} className="p-1.5 rounded-lg bg-[#EFECE1] hover:bg-[#DDD8C7]" data-testid={`btn-start-${b.token_number}`}>
                                                    <PlayCircle className="w-4 h-4 text-[#B85B28]" />
                                                </button>
                                            )}
                                            {b.queue_status === "processing" && (
                                                <button title="Complete" onClick={() => {
                                                    const amt = amount[b.id] || Math.round((b.expected_quantity || 0) * 2300);
                                                    act(b.id, { queue_status: "completed", procurement_status: "completed", payment_status: "processing", payment_amount: amt });
                                                }} className="p-1.5 rounded-lg bg-[#EFECE1] hover:bg-[#DDD8C7]" data-testid={`btn-complete-${b.token_number}`}>
                                                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                                                </button>
                                            )}
                                            {b.payment_status === "processing" && (
                                                <button title="Mark Paid" onClick={() => act(b.id, { payment_status: "paid" })} className="p-1.5 rounded-lg bg-[#EFECE1] hover:bg-[#DDD8C7]" data-testid={`btn-pay-${b.token_number}`}>
                                                    <IndianRupee className="w-4 h-4 text-[#15803D]" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {queue.queue.length === 0 && (
                                <tr><td colSpan="9" className="px-4 py-10 text-center text-[#526251]">No bookings for today at this centre.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
