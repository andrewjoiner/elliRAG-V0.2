import { useEffect } from "react";
import { useAuth } from "@/auth";
import { useNavigate } from "react-router-dom";

export default function SignOutPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function processSignOut() {
      await signOut();
      navigate("/login", { replace: true });
    }
    processSignOut();
  }, [signOut, navigate]);

  return <div className="p-4 text-center">Signing out...</div>;
}