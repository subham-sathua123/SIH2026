import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { useLang } from "../context/LangContext";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Users, MapPin, TrendingUp, IndianRupee, Ban, CheckCircle2, PlusCircle } from "lucide-react";

const COLORS = ["#1E4620", "#B85B28", "#D99B26", "#526251", "#15803D"];

const Stat = ({ icon: Icon, label, value, testid, tone = "text-[#1E4620]" }) => (
    <div className="card-earth p-5" data-testid={testid}>
        <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest text-[#526251]">{label}</div>
            <Icon className="w-4 h-4 text-[#B85B28]" />
        </div>
        <div className={`font-display text-3xl font-bold mt-1 ${tone}`}>{value}</div>
    </div>
);

export default function AdminDashboard() {
    const { t } = useLang();
    const [tab, setTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [centres, setCentres] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [q, setQ] = useState("");
    const [newCentre, setNewCentre] = useState({ name: "", location: "", district: "", state: "", capacity: 100, operating_hours: "09:00-17:00", avg_processing_minutes: 5, status: "active" });
    const [showCentreForm, setShowCentreForm] = useState(false);

    const loadAll = async () => {
        const [s, u, c, b] = await Promise.all([
            api.get("/admin/stats"),
            api.get(`/admin/users${q ? `?q=${q}` : ""}`),
            api.get("/centres"),
            api.get("/admin/bookings"),
        ]);
        setStats(s.data); setUsers(u.data); setCentres(c.data); setBookings(b.data);
    };
    useEffect(() => { loadAll(); }, []);

    const toggleUser = async (uid) => {
        try { await api.patch(`/admin/users/${uid}/toggle`); toast.success("Updated"); loadAll(); }
        catch { toast.error("Failed"); }
    };

    const createCentre = async () => {
        try {
            await api.post("/centres", newCentre);
            toast.success("Centre created");
            setShowCentreForm(false);
            setNewCentre({ name: "", location: "", district: "", state: "", capacity: 100, operating_hours: "09:00-17:00", avg_processing_minutes: 5, status: "active" });
            loadAll();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    const searchUsers = async () => {
        const r = await api.get(`/admin/users${q ? `?q=${q}` : ""}`);
        setUsers(r.data);
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-up">
                <div className="mb-6">
                    <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">Administrator</div>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1C241B] mt-1" data-testid="admin-title">Command Centre</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-[#DDD8C7]" data-testid="admin-tabs">
                    {[["overview", "Overview"], ["farmers", "Farmers"], ["centres", "Centres"], ["bookings", "Bookings"]].map(([k, label]) => (
                        <button key={k} onClick={() => setTab(k)}
                            className={`px-4 py-2.5 text-sm font-semibold transition ${tab === k ? "text-[#1E4620] border-b-2 border-[#1E4620]" : "text-[#526251] hover:text-[#1C241B]"}`}
                            data-testid={`tab-${k}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {tab === "overview" && stats && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            <Stat icon={Users} label="Total Farmers" value={stats.total_farmers} testid="stat-total-farmers" />
                            <Stat icon={TrendingUp} label="Total Bookings" value={stats.total_bookings} testid="stat-total-bookings" />
                            <Stat icon={CheckCircle2} label="Completed" value={stats.completed_procurements} testid="stat-completed" tone="text-[#15803D]" />
                            <Stat icon={IndianRupee} label="Paid" value={stats.completed_payments} testid="stat-paid" tone="text-[#B85B28]" />
                            <Stat icon={TrendingUp} label="Pending Procurements" value={stats.pending_procurements} testid="stat-pending-proc" tone="text-[#B45309]" />
                            <Stat icon={IndianRupee} label="Pending Payments" value={stats.pending_payments} testid="stat-pending-pay" tone="text-[#B45309]" />
                            <Stat icon={MapPin} label="Active Centres" value={(centres || []).filter(c => c.status === "active").length} testid="stat-centres" />
                            <Stat icon={TrendingUp} label="Avg Wait (min)" value={stats.avg_wait_minutes} testid="stat-wait" />
                        </div>

                        <div className="grid lg:grid-cols-2 gap-4">
                            <div className="card-earth p-5" data-testid="chart-daily">
                                <div className="text-xs uppercase tracking-widest text-[#526251] mb-3">Daily Bookings · Last 7 days</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={stats?.daily_bookings || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#DDD8C7" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#526251" }} tickFormatter={(v) => (v ? String(v).slice(0, 10) : "")} />
                                        <YAxis tick={{ fontSize: 11, fill: "#526251" }} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#1E4620" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="card-earth p-5" data-testid="chart-commodity">
                                <div className="text-xs uppercase tracking-widest text-[#526251] mb-3">Commodity Breakdown</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={stats?.commodity_breakdown || []} dataKey="count" nameKey="commodity" outerRadius={90} innerRadius={40}>
                                            {(stats?.commodity_breakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Legend />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {tab === "farmers" && (
                    <div>
                        <div className="flex gap-2 mb-4">
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, mobile"
                                className="px-4 py-2.5 rounded-full bg-white border border-[#DDD8C7] text-sm outline-none flex-1"
                                data-testid="user-search" />
                            <button onClick={searchUsers} className="btn-primary text-sm" data-testid="user-search-btn">Search</button>
                        </div>
                        <div className="card-earth overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#EFECE1] text-left">
                                        {["Name", "Role", "Mobile", "Email", "District", "Status", "Action"].map(h =>
                                            <th key={h} className="px-4 py-3 text-xs uppercase tracking-widest text-[#526251]">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(users || []).map(u => (
                                        <tr key={u.id} className="border-t border-[#DDD8C7]" data-testid={`user-row-${u.id}`}>
                                            <td className="px-4 py-3 font-medium">{u.name}</td>
                                            <td className="px-4 py-3 uppercase text-xs text-[#B85B28] font-semibold tracking-widest">{u.role}</td>
                                            <td className="px-4 py-3">{u.mobile}</td>
                                            <td className="px-4 py-3 text-xs">{u.email}</td>
                                            <td className="px-4 py-3 text-xs">{u.district || "—"}</td>
                                            <td className="px-4 py-3"><span className={`badge-${u.active ? "serving" : "urgent"} px-2 py-0.5 rounded-full text-xs font-semibold`}>{u.active ? "Active" : "Inactive"}</span></td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => toggleUser(u.id)} className="btn-ghost text-xs inline-flex items-center gap-1" data-testid={`toggle-${u.id}`}>
                                                    <Ban className="w-3 h-3" /> {u.active ? "Deactivate" : "Activate"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === "centres" && (
                    <div>
                        <div className="mb-4 flex justify-end">
                            <button onClick={() => setShowCentreForm(!showCentreForm)} className="btn-terra inline-flex items-center gap-2 text-sm" data-testid="add-centre-btn">
                                <PlusCircle className="w-4 h-4" /> Add Centre
                            </button>
                        </div>
                        {showCentreForm && (
                            <div className="card-earth p-5 mb-4" data-testid="centre-form">
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {["name", "location", "district", "state", "operating_hours"].map(k => (
                                        <input key={k} placeholder={k.replace("_", " ")} value={newCentre[k]}
                                            onChange={(e) => setNewCentre({ ...newCentre, [k]: e.target.value })}
                                            className="px-3 py-2 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7] text-sm"
                                            data-testid={`new-centre-${k}`} />
                                    ))}
                                    <input type="number" placeholder="Capacity" value={newCentre.capacity}
                                        onChange={(e) => setNewCentre({ ...newCentre, capacity: Number(e.target.value) })}
                                        className="px-3 py-2 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7] text-sm"
                                        data-testid="new-centre-capacity" />
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                    <button onClick={() => setShowCentreForm(false)} className="btn-ghost text-sm">Cancel</button>
                                    <button onClick={createCentre} className="btn-primary text-sm" data-testid="create-centre-submit">Create</button>
                                </div>
                            </div>
                        )}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(centres || []).map(c => (
                                <div key={c.id} className="card-earth p-5" data-testid={`centre-card-${c.id}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-display text-lg font-semibold">{c.name}</div>
                                            <div className="text-xs text-[#526251] mt-1">{c.location}, {c.district}</div>
                                        </div>
                                        <span className={`badge-${c.status === "active" ? "serving" : "urgent"} px-2 py-0.5 rounded-full text-xs font-semibold`}>{c.status}</span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                        <div><span className="text-[#526251]">Cap:</span> <span className="font-semibold">{c.capacity}</span></div>
                                        <div><span className="text-[#526251]">Hrs:</span> <span className="font-semibold">{c.operating_hours}</span></div>
                                        <div><span className="text-[#526251]">Avg:</span> <span className="font-semibold">{c.avg_processing_minutes} min</span></div>
                                        <div><span className="text-[#526251]">State:</span> <span className="font-semibold">{c.state}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "bookings" && (
                    <div className="card-earth overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#EFECE1] text-left">
                                    {["Token", "Farmer", "Centre", "Date", "Commodity", "Qty", "Queue", "Payment", "Amount"].map(h =>
                                        <th key={h} className="px-4 py-3 text-xs uppercase tracking-widest text-[#526251]">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {(bookings || []).map(b => (
                                    <tr key={b.id} className="border-t border-[#DDD8C7]" data-testid={`booking-${b.id}`}>
                                        <td className="px-4 py-3 token-display font-semibold text-[#1E4620]">#{String(b.token_number).padStart(3, "0")}</td>
                                        <td className="px-4 py-3">{b.farmer_name}</td>
                                        <td className="px-4 py-3 text-xs">{b.centre_name}</td>
                                        <td className="px-4 py-3">{b.slot_date}</td>
                                        <td className="px-4 py-3">{b.commodity}</td>
                                        <td className="px-4 py-3">{b.expected_quantity} Q</td>
                                        <td className="px-4 py-3"><span className={`badge-${b.queue_status === "completed" ? "serving" : "waiting"} px-2 py-0.5 rounded-full text-xs font-semibold`}>{b.queue_status}</span></td>
                                        <td className="px-4 py-3"><span className={`badge-${b.payment_status === "paid" ? "serving" : "waiting"} px-2 py-0.5 rounded-full text-xs font-semibold`}>{b.payment_status}</span></td>
                                        <td className="px-4 py-3">₹{(b.payment_amount || 0).toLocaleString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
