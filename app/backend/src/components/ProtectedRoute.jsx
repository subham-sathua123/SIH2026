import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading || user === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F5EE]">
                <div className="text-[#526251] text-sm">Loading…</div>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
}
