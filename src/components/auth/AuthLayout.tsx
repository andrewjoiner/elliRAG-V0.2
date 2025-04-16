import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  useEffect(() => {
    if (user && (location.pathname === "/login" || location.pathname === "/signup")) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}
