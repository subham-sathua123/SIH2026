import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { useLang } from "../context/LangContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Wheat, MapPin, Calendar as CalIcon } from "lucide-react";

const COMMODITIES = [
    { key: "Paddy", label: "Paddy · धान", msp: 2300 },
    { key: "Wheat", label: "Wheat · गेहूँ", msp: 2275 },
    { key: "Gram", label: "Gram · चना", msp: 5440 },
    { key: "Mustard", label: "Mustard · सरसों", msp: 5650 },
];

function today() { return new Date().toISOString().slice(0, 10); }
function next7Days() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
    });
}

export default function BookSlot() {
    const { t } = useLang();
    const nav = useNavigate();
    const [step, setStep] = useState(1);
    const [centres, setCentres] = useState([]);
    const [slots, setSlots] = useState([]);
    const [busy, setBusy] = useState(false);
    const [confirmed, setConfirmed] = useState(null);
    const [form, setForm] = useState({
        centre_id: "", commodity: "", date: today(),
        slot_id: "", expected_quantity: 25, vehicle_number: "",
    });

    useEffect(() => { api.get("/centres").then(r => setCentres(r.data.filter(c => c.status === "active"))); }, []);
    useEffect(() => {
        if (form.centre_id && form.date)
            api.get(`/slots?centre_id=${form.centre_id}&date=${form.date}`).then(r => setSlots(r.data));
    }, [form.centre_id, form.date]);

    const centre = centres.find(c => c.id === form.centre_id);
    const slot = slots.find(s => s.id === form.slot_id);
    const commodity = COMMODITIES.find(c => c.key === form.commodity);

    const submit = async () => {
        setBusy(true);
        try {
            const { data } = await api.post("/bookings", form);
            setConfirmed(data);
            toast.success("Booking confirmed");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Booking failed");
        } finally { setBusy(false); }
    };

    if (confirmed) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 fade-up">
                    <div className="card-earth p-8 text-center relative overflow-hidden" data-testid="booking-confirmed">
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#D99B26]/10" />
                        <div className="w-16 h-16 rounded-full bg-[#1E4620] mx-auto flex items-center justify-center relative">
                            <Check className="w-8 h-8 text-[#D99B26]" />
                        </div>
                        <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold mt-4">{t("booking_confirmed")}</div>
                        <div className="token-display text-6xl font-bold text-[#1E4620] mt-2" data-testid="confirmed-token">#{String(confirmed.token_number).padStart(3, "0")}</div>
                        <div className="text-sm text-[#526251] mt-2">Show this token at the centre gate</div>
                        <div className="mt-6 grid sm:grid-cols-2 gap-3 text-left">
                            <div className="p-3 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7]"><div className="text-[10px] uppercase text-[#526251] tracking-widest">Centre</div><div className="font-semibold">{confirmed.centre_name}</div></div>
                            <div className="p-3 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7]"><div className="text-[10px] uppercase text-[#526251] tracking-widest">Date & Time</div><div className="font-semibold">{confirmed.slot_date} · {confirmed.slot_start}</div></div>
                            <div className="p-3 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7]"><div className="text-[10px] uppercase text-[#526251] tracking-widest">Commodity</div><div className="font-semibold">{confirmed.commodity}</div></div>
                            <div className="p-3 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7]"><div className="text-[10px] uppercase text-[#526251] tracking-widest">Quantity</div><div className="font-semibold">{confirmed.expected_quantity} Quintals</div></div>
                        </div>
                        <button onClick={() => nav("/farmer")} className="btn-primary mt-6 inline-flex items-center gap-2" data-testid="go-dashboard-btn">
                            View my dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 fade-up">
                <div className="mb-6">
                    <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">Slot Booking Wizard</div>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1C241B] mt-1">{t("book_slot")}</h1>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 mb-6" data-testid="wizard-stepper">
                    {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className="flex-1 flex items-center gap-2">
                            <div className={`step-dot ${n < step ? "active" : n === step ? "current" : ""}`}>{n < step ? <Check className="w-4 h-4" /> : n}</div>
                            {n < 5 && <div className={`flex-1 h-0.5 ${n < step ? "bg-[#1E4620]" : "bg-[#DDD8C7]"}`} />}
                        </div>
                    ))}
                </div>

                <div className="card-earth p-6 sm:p-8">
                    {step === 1 && (
                        <div data-testid="step-centre">
                            <h2 className="font-display text-xl font-semibold mb-4"><MapPin className="w-5 h-5 inline mr-2 text-[#1E4620]" />Select Procurement Centre</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {centres.map(c => (
                                    <button key={c.id} onClick={() => setForm({ ...form, centre_id: c.id })}
                                        className={`p-4 rounded-xl border text-left transition ${form.centre_id === c.id ? "border-[#1E4620] bg-[#EFECE1]" : "border-[#DDD8C7] bg-white hover:border-[#1E4620]"}`}
                                        data-testid={`centre-${c.id}`}>
                                        <div className="font-semibold">{c.name}</div>
                                        <div className="text-xs text-[#526251] mt-1">{c.location}, {c.district}, {c.state}</div>
                                        <div className="text-xs text-[#B85B28] mt-2 uppercase tracking-widest">Cap: {c.capacity} · {c.operating_hours}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div data-testid="step-commodity">
                            <h2 className="font-display text-xl font-semibold mb-4"><Wheat className="w-5 h-5 inline mr-2 text-[#1E4620]" />Select Commodity</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {COMMODITIES.map(c => (
                                    <button key={c.key} onClick={() => setForm({ ...form, commodity: c.key })}
                                        className={`p-4 rounded-xl border text-left transition ${form.commodity === c.key ? "border-[#1E4620] bg-[#EFECE1]" : "border-[#DDD8C7] bg-white hover:border-[#1E4620]"}`}
                                        data-testid={`commodity-${c.key}`}>
                                        <div className="font-semibold">{c.label}</div>
                                        <div className="text-xs text-[#B85B28] mt-2 uppercase tracking-widest">MSP ₹{c.msp} / Quintal</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div data-testid="step-date">
                            <h2 className="font-display text-xl font-semibold mb-4"><CalIcon className="w-5 h-5 inline mr-2 text-[#1E4620]" />Select Date</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                                {next7Days().map(d => {
                                    const dt = new Date(d);
                                    return (
                                        <button key={d} onClick={() => setForm({ ...form, date: d, slot_id: "" })}
                                            className={`p-3 rounded-xl border text-center transition ${form.date === d ? "border-[#1E4620] bg-[#EFECE1]" : "border-[#DDD8C7] bg-white hover:border-[#1E4620]"}`}
                                            data-testid={`date-${d}`}>
                                            <div className="text-xs text-[#526251] uppercase">{dt.toLocaleDateString("en", { weekday: "short" })}</div>
                                            <div className="text-lg font-bold token-display">{dt.getDate()}</div>
                                            <div className="text-[10px] text-[#526251] uppercase">{dt.toLocaleDateString("en", { month: "short" })}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div data-testid="step-slot">
                            <h2 className="font-display text-xl font-semibold mb-4">Select Time Slot</h2>
                            {slots.length === 0 && <div className="text-[#526251] text-sm">No slots available. Try another date.</div>}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {slots.map(s => {
                                    const full = s.current_bookings >= s.maximum_bookings;
                                    return (
                                        <button key={s.id} disabled={full} onClick={() => setForm({ ...form, slot_id: s.id })}
                                            className={`p-4 rounded-xl border text-center transition ${form.slot_id === s.id ? "border-[#1E4620] bg-[#EFECE1]" : "border-[#DDD8C7] bg-white hover:border-[#1E4620]"} ${full ? "opacity-40 cursor-not-allowed" : ""}`}
                                            data-testid={`slot-${s.id}`}>
                                            <div className="font-semibold token-display">{s.start_time}</div>
                                            <div className="text-[10px] text-[#526251] uppercase mt-1">{s.current_bookings}/{s.maximum_bookings} booked</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div data-testid="step-quantity">
                            <h2 className="font-display text-xl font-semibold mb-4">Quantity & Vehicle</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-[#526251] uppercase tracking-wider">{t("quantity")}</label>
                                    <input type="number" min="1" value={form.expected_quantity}
                                        onChange={(e) => setForm({ ...form, expected_quantity: Number(e.target.value) })}
                                        className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7] focus:border-[#1E4620] outline-none"
                                        data-testid="input-quantity" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#526251] uppercase tracking-wider">{t("vehicle")}</label>
                                    <input value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                                        placeholder="JH01-AB-1234"
                                        className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7] focus:border-[#1E4620] outline-none"
                                        data-testid="input-vehicle" />
                                </div>
                            </div>
                            <div className="mt-6 p-4 rounded-xl bg-[#EFECE1] border border-[#DDD8C7]">
                                <div className="text-xs uppercase tracking-widest text-[#526251] mb-2">Summary</div>
                                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-[#526251]">Centre:</span> <span className="font-semibold">{centre?.name}</span></div>
                                    <div><span className="text-[#526251]">Date:</span> <span className="font-semibold">{form.date}</span></div>
                                    <div><span className="text-[#526251]">Slot:</span> <span className="font-semibold">{slot?.start_time}</span></div>
                                    <div><span className="text-[#526251]">Commodity:</span> <span className="font-semibold">{commodity?.label}</span></div>
                                    <div><span className="text-[#526251]">Qty:</span> <span className="font-semibold">{form.expected_quantity} Quintals</span></div>
                                    <div><span className="text-[#526251]">Est. MSP:</span> <span className="font-semibold">₹{((commodity?.msp || 0) * form.expected_quantity).toLocaleString("en-IN")}</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8">
                        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="btn-ghost inline-flex items-center gap-2 disabled:opacity-40" data-testid="wizard-prev">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        {step < 5 ? (
                            <button onClick={() => setStep(step + 1)}
                                disabled={(step === 1 && !form.centre_id) || (step === 2 && !form.commodity) || (step === 4 && !form.slot_id)}
                                className="btn-primary inline-flex items-center gap-2 disabled:opacity-40" data-testid="wizard-next">
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={submit} disabled={busy} className="btn-terra inline-flex items-center gap-2" data-testid="wizard-submit">
                                {busy ? "Booking…" : t("confirm_booking")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
