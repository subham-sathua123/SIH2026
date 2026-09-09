import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Wheat, LogOut, Bell, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { lang, setLang, t } = useLang();
    const nav = useNavigate();
    const loc = useLocation();

    const goDashboard = () => {
        if (!user) return nav("/login");
        if (user.role === "admin") nav("/admin");
        else if (user.role === "staff") nav("/staff");
        else nav("/farmer");
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F7F5EE]/85 border-b border-[#DDD8C7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group" data-testid="brand-link">
                    <div className="w-9 h-9 rounded-lg bg-[#1E4620] flex items-center justify-center">
                        <Wheat className="w-5 h-5 text-[#D99B26]" />
                    </div>
                    <div className="leading-none">
                        <div className="font-display text-lg font-bold text-[#1C241B]" data-testid="brand-name">{t("brand")}</div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[#526251]">Procurement Portal</div>
                    </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 border border-[#DDD8C7] rounded-full p-0.5 bg-white" data-testid="lang-toggle">
                        <button data-testid="lang-en"
                            onClick={() => setLang("en")}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${lang === "en" ? "bg-[#1E4620] text-white" : "text-[#526251]"}`}>EN</button>
                        <button data-testid="lang-hi"
                            onClick={() => setLang("hi")}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${lang === "hi" ? "bg-[#1E4620] text-white" : "text-[#526251]"}`}>हिं</button>
                    </div>

                    {user ? (
                        <>
                            <button onClick={goDashboard} className="btn-ghost text-sm hidden sm:inline-flex" data-testid="nav-dashboard">
                                {t("dashboard")}
                            </button>
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDD8C7]">
                                <div className="w-7 h-7 rounded-full bg-[#B85B28] text-white text-xs font-bold flex items-center justify-center">
                                    {(user.name || "U").slice(0, 1).toUpperCase()}
                                </div>
                                <span className="text-xs font-medium text-[#1C241B]" data-testid="user-name">{user.name}</span>
                                <span className="text-[10px] uppercase text-[#B85B28] font-semibold tracking-wider">{user.role}</span>
                            </div>
                            <button onClick={async () => { await logout(); nav("/"); }} className="btn-ghost text-sm inline-flex items-center gap-1" data-testid="logout-btn">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-ghost text-sm" data-testid="login-link">{t("login")}</Link>
                            <Link to="/register" className="btn-primary text-sm" data-testid="register-link">{t("register")}</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
