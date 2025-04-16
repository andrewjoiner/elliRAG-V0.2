import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}
