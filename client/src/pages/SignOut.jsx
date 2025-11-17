import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignOut() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const doSignOut = async () => {
      await signOut();
      navigate("/sign-in");
    };
    doSignOut();
  }, [signOut, navigate]);

  return (
    <div className="p-4 text-center">
      <p>Signing you out...</p>
    </div>
  );
}
