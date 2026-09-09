import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";

export default function Register() {
    const [form, setForm] = useState({
        name: "", email: "", password: "", mobile: "",
        village: "", district: "", state: "Jharkhand", preferred_language: "en",
    });
    const [busy, setBusy] = useState(false);
    const { register } = useAuth();
    const { t } = useLang();
    const nav = useNavigate();

    const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        const r = await register({ ...form, role: "farmer" });
        setBusy(false);
        if (!r.ok) return toast.error(r.error);
        toast.success("Account created");
        nav("/farmer");
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <div className="card-earth p-6 sm:p-8">
                    <div className="mb-6">
                        <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">New Farmer</div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C241B] mt-1">{t("register")}</h2>
                        <p className="text-sm text-[#526251] mt-1">Create your Kisan Setu account. Free · Takes under a minute.</p>
                    </div>
                    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4" data-testid="register-form">
                        {[
                            ["name", t("name"), "text", true],
                            ["mobile", t("mobile"), "tel", true],
                            ["email", t("email"), "email", true],
                            ["password", t("password"), "password", true],
                            ["village", t("village"), "text", false],
                            ["district", t("district"), "text", false],
                            ["state", t("state"), "text", false],
                        ].map(([k, lbl, type, req]) => (
                            <div key={k} className={k === "name" || k === "mobile" ? "sm:col-span-1" : ""}>
                                <label className="text-xs font-medium text-[#526251] uppercase tracking-wider">{lbl}</label>
                                <input value={form[k]} onChange={on(k)} type={type} required={req}
                                    className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7] focus:border-[#1E4620] outline-none transition"
                                    data-testid={`register-${k}`} />
                            </div>
                        ))}
                        <div>
                            <label className="text-xs font-medium text-[#526251] uppercase tracking-wider">Preferred Language</label>
                            <select value={form.preferred_language} onChange={on("preferred_language")}
                                className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F7F5EE] border border-[#DDD8C7] focus:border-[#1E4620] outline-none"
                                data-testid="register-language">
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                            </select>
                        </div>
                        <button type="submit" disabled={busy} className="btn-primary sm:col-span-2 mt-2" data-testid="register-submit">
                            {busy ? "Creating…" : t("register")}
                        </button>
                    </form>
                    <div className="mt-4 text-sm text-[#526251] text-center">
                        Already registered? <Link to="/login" className="text-[#1E4620] font-semibold underline underline-offset-2" data-testid="go-login">{t("login")}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
