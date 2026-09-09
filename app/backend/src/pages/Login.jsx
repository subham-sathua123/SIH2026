import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { Wheat } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const { login } = useAuth();
    const { t } = useLang();
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        const r = await login(email, password);
        setBusy(false);
        if (!r.ok) return toast.error(r.error);
        toast.success("Welcome back");
        const me = r.user;
        if (me?.role === "admin") nav("/admin");
        else if (me?.role === "staff") nav("/staff");
        else nav("/farmer");
    };

    const quickFill = (u) => {
        if (u === "admin") { setEmail("subhamsathua57@gmail.com"); setPassword("Admin@2026"); }
        if (u === "staff") { setEmail("staff.ranchi@kisansetu.gov.in"); setPassword("Staff@2026"); }
        if (u === "farmer") { setEmail("farmer.demo@kisansetu.in"); setPassword("Farmer@2026"); }
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-2 gap-10 items-center">
                <div className="hidden lg:block">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDD8C7] mb-6">
                        <Wheat className="w-4 h-4 text-[#1E4620]" />
                        <span className="text-xs font-medium">Farmer · Staff · Admin</span>
                    </div>
                    <h1 className="font-display text-4xl xl:text-5xl font-bold text-[#1C241B] leading-tight">Welcome back to the mandi that never makes you wait.</h1>
                    <p className="mt-4 text-[#526251]">Sign in to book a slot, check your queue, or manage today's procurement.</p>

                    <div className="mt-8 space-y-2">
                        <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">Demo Accounts</div>
                        <button onClick={() => quickFill("farmer")} className="w-full text-left px-4 py-3 rounded-xl bg-white border border-[#DDD8C7] hover:border-[#1E4620] transition" data-testid="demo-farmer">
                            <div className="text-sm font-semibold text-[#1C241B]">Farmer Demo</div>
                            <div className="text-xs text-[#526251]">farmer.demo@kisansetu.in · Farmer@2026</div>
                        </button>
                        <button onClick={() => quickFill("staff")} className="w-full text-left px-4 py-3 rounded-xl bg-white border border-[#DDD8C7] hover:border-[#1E4620] transition" data-testid="demo-staff">
                            <div className="text-sm font-semibold text-[#1C241B]">Staff (Ranchi Centre)</div>
                            <div className="text-xs text-[#526251]">staff.ranchi@kisansetu.gov.in · Staff@2026</div>
                        </button>
                        <button onClick={() => quickFill("admin")} className="w-full text-left px-4 py-3 rounded-xl bg-white border border-[#DDD8C7] hover:border-[#1E4620] transition" data-testid="demo-admin">
                            <div className="text-sm font-semibold text-[#1C241B]">Administrator</div>
                            <div className="text-xs text-[#526251]">subhamsathua57@gmail.com · Admin@2026</div>
                        </button>
                    </div>
                </div>

                <div className="card-earth p-6 sm:p-8">
                    <div className="mb-6">
                        <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">Sign In</div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C241B] mt-1">{t("login")}</h2>
                    </div>
                    <form onSubmit={submit} className="space-y-4" data-testid="login-form">
                        <div>
                            <label className="text-xs font-medium text-[#526251] uppercase tracking-wider">{t("email")}</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
                                className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7] focus:border-[#1E4620] outline-none transition"
                                data-testid="login-email" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-[#526251] uppercase tracking-wider">{t("password")}</label>
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
                                className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7] focus:border-[#1E4620] outline-none transition"
                                data-testid="login-password" />
                        </div>
                        <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="login-submit">
                            {busy ? "Signing in…" : t("login")}
                        </button>
                    </form>
                    <div className="mt-4 text-sm text-[#526251] text-center">
                        No account? <Link to="/register" className="text-[#1E4620] font-semibold underline underline-offset-2" data-testid="go-register">{t("register")}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
