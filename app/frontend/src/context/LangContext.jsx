import React, { createContext, useContext, useState } from "react";

const dict = {
    en: {
        brand: "Kisan Setu",
        tagline: "Smart Procurement. Less Waiting. Better Service.",
        subtitle: "Book your procurement slot, track your queue, and monitor procurement & payment — all from one trusted platform.",
        book_slot: "Book Procurement Slot",
        check_status: "Check Live Queue",
        login: "Login", register: "Register", logout: "Logout",
        dashboard: "Dashboard", bookings: "Bookings", notifications: "Notifications",
        how_it_works: "How It Works",
        benefits: "Why Farmers Choose Us",
        step_register: "Register",
        step_book: "Book Slot",
        step_token: "Get Token",
        step_track: "Track Queue",
        step_procure: "Complete Procurement",
        step_pay: "Receive Payment",
        email: "Email", password: "Password", name: "Full Name", mobile: "Mobile Number",
        village: "Village", district: "District", state: "State",
        farmer: "Farmer", staff: "Staff", admin: "Admin",
        token: "Token", currently_serving: "Currently Serving", farmers_ahead: "Farmers Ahead",
        est_wait: "Estimated Wait", minutes: "min",
        centre: "Procurement Centre", commodity: "Commodity", date: "Date", slot: "Time Slot",
        quantity: "Expected Quantity (Quintals)", vehicle: "Vehicle Number (Optional)",
        confirm_booking: "Confirm Booking", booking_confirmed: "Booking Confirmed",
        call_next: "Call Next Farmer",
        mark_arrived: "Mark Arrived", start_processing: "Start Processing",
        complete_procurement: "Complete Procurement", update_payment: "Update Payment",
        waiting: "Waiting", called: "Called", processing: "Processing",
        completed: "Completed", cancelled: "Cancelled",
        paid: "Paid", pending: "Pending",
    },
    hi: {
        brand: "किसान सेतु",
        tagline: "स्मार्ट खरीद। कम प्रतीक्षा। बेहतर सेवा।",
        subtitle: "अपना खरीद स्लॉट बुक करें, कतार की स्थिति जानें, और भुगतान तक की पूरी प्रक्रिया एक ही मंच पर देखें।",
        book_slot: "खरीद स्लॉट बुक करें",
        check_status: "लाइव कतार देखें",
        login: "लॉगिन", register: "पंजीकरण", logout: "लॉगआउट",
        dashboard: "डैशबोर्ड", bookings: "बुकिंग", notifications: "सूचनाएँ",
        how_it_works: "यह कैसे काम करता है",
        benefits: "किसान क्यों चुनते हैं",
        step_register: "पंजीकरण",
        step_book: "स्लॉट बुक",
        step_token: "टोकन पाएँ",
        step_track: "कतार ट्रैक",
        step_procure: "खरीद पूर्ण",
        step_pay: "भुगतान प्राप्त",
        email: "ईमेल", password: "पासवर्ड", name: "पूरा नाम", mobile: "मोबाइल नंबर",
        village: "गाँव", district: "ज़िला", state: "राज्य",
        farmer: "किसान", staff: "कर्मचारी", admin: "प्रशासक",
        token: "टोकन", currently_serving: "अभी सेवा में", farmers_ahead: "आपसे आगे किसान",
        est_wait: "अनुमानित प्रतीक्षा", minutes: "मिनट",
        centre: "खरीद केंद्र", commodity: "फसल", date: "तारीख़", slot: "समय स्लॉट",
        quantity: "अनुमानित मात्रा (क्विंटल)", vehicle: "वाहन संख्या (वैकल्पिक)",
        confirm_booking: "बुकिंग की पुष्टि करें", booking_confirmed: "बुकिंग पुष्ट",
        call_next: "अगले किसान को बुलाएँ",
        mark_arrived: "आगमन दर्ज", start_processing: "प्रक्रिया शुरू",
        complete_procurement: "खरीद पूर्ण करें", update_payment: "भुगतान अपडेट",
        waiting: "प्रतीक्षा में", called: "बुलाया गया", processing: "प्रक्रिया में",
        completed: "पूर्ण", cancelled: "रद्द",
        paid: "भुगतान", pending: "लंबित",
    },
};

const LangCtx = createContext(null);
export function LangProvider({ children }) {
    const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
    const change = (l) => { setLang(l); localStorage.setItem("lang", l); };
    const t = (k) => dict[lang][k] || dict.en[k] || k;
    return <LangCtx.Provider value={{ lang, setLang: change, t }}>{children}</LangCtx.Provider>;
}
export const useLang = () => useContext(LangCtx);
