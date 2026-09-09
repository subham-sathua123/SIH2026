import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wheat, Clock, ShieldCheck, TrendingUp, Users, IndianRupee, Truck, Sprout } from "lucide-react";
import Navbar from "../components/Navbar";
import { useLang } from "../context/LangContext";

const StatChip = ({ value, label, testid }) => (
    <div className="card-earth p-5" data-testid={testid}>
        <div className="font-display text-3xl font-bold text-[#1E4620]">{value}</div>
        <div className="text-xs uppercase tracking-wider text-[#526251] mt-1">{label}</div>
    </div>
);

const StepCard = ({ n, title, desc, icon: Icon, testid }) => (
    <div className="card-earth p-6 flex gap-4" data-testid={testid}>
        <div className="shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#EFECE1] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#1E4620]" />
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#B85B28] font-semibold mt-2 pl-1">Step {n}</div>
        </div>
        <div>
            <h3 className="font-display text-lg font-semibold text-[#1C241B]">{title}</h3>
            <p className="text-sm text-[#526251] leading-relaxed mt-1">{desc}</p>
        </div>
    </div>
);

export default function Landing() {
    const { t } = useLang();
    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero */}
            <section className="grain-bg" data-testid="hero-section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24 relative">
                    <div className="grid lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDD8C7] mb-6">
                                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                                <span className="text-xs font-medium tracking-wide text-[#1C241B]">SIH 2026 · Government of India Initiative</span>
                            </div>
                            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-[#1C241B]" data-testid="hero-title">
                                {t("tagline")}
                            </h1>
                            <p className="mt-5 text-base sm:text-lg text-[#526251] leading-relaxed max-w-xl" data-testid="hero-subtitle">
                                {t("subtitle")}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link to="/register" className="btn-primary inline-flex items-center gap-2" data-testid="cta-book-slot">
                                    {t("book_slot")} <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/login" className="btn-ghost inline-flex items-center gap-2" data-testid="cta-login">
                                    {t("login")}
                                </Link>
                            </div>

                            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
                                <StatChip value="1.2L+" label="Farmers" testid="stat-farmers" />
                                <StatChip value="248" label="Centres" testid="stat-centres" />
                                <StatChip value="28 min" label="Avg wait" testid="stat-wait" />
                                <StatChip value="₹184Cr" label="Paid via DBT" testid="stat-dbt" />
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="card-earth p-6 relative overflow-hidden">
                                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#D99B26]/10" />
                                <div className="flex items-center justify-between relative">
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[#526251]">Sample Token</div>
                                        <div className="token-display text-5xl font-bold text-[#1E4620] mt-1">#TK-2026</div>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-[#1E4620] text-[#D99B26] flex items-center justify-center pulse-ring">
                                        <Wheat className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7]">
                                        <div className="text-[10px] uppercase text-[#526251] tracking-wider">Now Serving</div>
                                        <div className="token-display text-2xl font-bold text-[#B85B28]">#18</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7]">
                                        <div className="text-[10px] uppercase text-[#526251] tracking-wider">Ahead of you</div>
                                        <div className="text-2xl font-bold text-[#1C241B]">6</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[#F7F5EE] border border-[#DDD8C7] col-span-2">
                                        <div className="text-[10px] uppercase text-[#526251] tracking-wider">Estimated Wait</div>
                                        <div className="text-2xl font-bold text-[#1E4620] flex items-baseline gap-1">30 <span className="text-sm text-[#526251]">min</span></div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs text-[#526251]">
                                    <Clock className="w-3.5 h-3.5" /> Live estimate · updates every 30s
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16" data-testid="how-it-works-section">
                <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">Process</div>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1C241B] mt-1">{t("how_it_works")}</h2>
                    </div>
                    <p className="text-sm text-[#526251] max-w-md">Six clear steps from registration to Direct Bank Transfer — designed for India's mandis.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StepCard n="1" title={t("step_register")} desc="Sign up with your mobile, village and preferred language." icon={Users} testid="step-1" />
                    <StepCard n="2" title={t("step_book")} desc="Select centre, commodity, date and time slot with real availability." icon={Sprout} testid="step-2" />
                    <StepCard n="3" title={t("step_token")} desc="Receive a unique digital token — no paper, no queues at the gate." icon={ShieldCheck} testid="step-3" />
                    <StepCard n="4" title={t("step_track")} desc="Watch the live queue and estimated wait time from home." icon={Clock} testid="step-4" />
                    <StepCard n="5" title={t("step_procure")} desc="Verification, weighing and completion — every stage transparent." icon={Truck} testid="step-5" />
                    <StepCard n="6" title={t("step_pay")} desc="MSP payment credited directly to your bank via DBT." icon={IndianRupee} testid="step-6" />
                </div>
            </section>

            {/* Benefits */}
            <section className="bg-[#EFECE1] border-y border-[#DDD8C7]" data-testid="benefits-section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                    <div className="text-xs uppercase tracking-widest text-[#B85B28] font-semibold">Why us</div>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1C241B] mt-1 mb-8">{t("benefits")}</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { i: Clock, t: "60% Less Waiting", d: "Live queue and time-boxed slots reduce standing time at the mandi." },
                            { i: ShieldCheck, t: "Full Transparency", d: "Every stage visible — from weighing to payment status." },
                            { i: TrendingUp, t: "Better Planning", d: "Book from home. Plan your travel, transport and money-in." },
                            { i: IndianRupee, t: "Direct Payment", d: "Payments via DBT with a clear paper trail and reference." },
                        ].map((b, i) => (
                            <div key={i} className="card-earth p-5" data-testid={`benefit-${i + 1}`}>
                                <div className="w-10 h-10 rounded-lg bg-[#1E4620] flex items-center justify-center mb-3">
                                    <b.i className="w-5 h-5 text-[#D99B26]" />
                                </div>
                                <div className="font-display text-lg font-semibold text-[#1C241B]">{b.t}</div>
                                <p className="text-sm text-[#526251] mt-1 leading-relaxed">{b.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="bg-[#163418] text-[#F7F5EE]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-[#D99B26]/15 flex items-center justify-center">
                                <Wheat className="w-5 h-5 text-[#D99B26]" />
                            </div>
                            <div className="font-display text-xl font-bold">{t("brand")}</div>
                        </div>
                        <p className="mt-3 text-sm opacity-75 max-w-xs">A Digital India initiative to modernise agricultural procurement across states.</p>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-widest opacity-60 mb-3">Helpline</div>
                        <div className="text-lg font-medium">Kisan Call Centre</div>
                        <div className="font-mono-tk text-2xl mt-1">1800-180-1551</div>
                        <div className="text-xs opacity-60 mt-2">Toll-free · 6:00 AM to 10:00 PM · All languages</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-widest opacity-60 mb-3">Legal</div>
                        <ul className="text-sm space-y-1 opacity-80">
                            <li>Terms & Conditions</li>
                            <li>Privacy Policy</li>
                            <li>Accessibility</li>
                            <li>SIH 2026 · Problem SIH26032</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">© 2026 Kisan Setu · Government of India</div>
            </footer>
        </div>
    );
}
