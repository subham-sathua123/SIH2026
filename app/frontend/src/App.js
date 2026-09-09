import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import "./app.css";

import { AuthProvider } from "./context/AuthContext";
import { LangProvider } from "./context/LangContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/FarmerDashboard";
import BookSlot from "./pages/BookSlot";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <div className="App">
      <LangProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Farmer */}
              <Route
                path="/farmer"
                element={
                  <ProtectedRoute roles={["farmer"]}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/book"
                element={
                  <ProtectedRoute roles={["farmer"]}>
                    <BookSlot />
                  </ProtectedRoute>
                }
              />

              {/* Staff */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute roles={["staff", "admin"]}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Unknown URL */}
              <Route path="*" element={<Landing />} />
            </Routes>

            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </AuthProvider>
      </LangProvider>
    </div>
  );
}

export default App;