import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Header = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center max-w-6xl mx-auto p-3">
        <Link to="/" className="flex items-center">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-black">Connect</span>
            <span className="text-red-500">ED</span>
          </h1>
        </Link>

        <nav>
          <ul className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm sm:text-base">
            <li>
              <Link
                to="/"
                className="text-slate-700 hover:underline"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/submit-complaint"
                className="text-slate-700 hover:underline"
              >
                Submit Complaint
              </Link>
            </li>

            {currentUser?.role === "admin" && (
              <li>
                <Link
                  to="/admin-dashboard"
                  className="text-slate-700 hover:underline"
                >
                  Admin
                </Link>
              </li>
            )}

            {currentUser && (
              <li>
                <Link
                  to="/profile"
                  className="text-slate-700 hover:underline"
                >
                  Profile
                </Link>
              </li>
            )}

            <li>
              <Link
                to="/about"
                className="text-slate-700 hover:underline"
              >
                About
              </Link>
            </li>

            {currentUser ? (
              <li>
                <button
                  onClick={handleSignOut}
                  className="text-red-600 hover:underline"
                >
                  Sign Out
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/sign-in"
                  className="text-slate-700 hover:underline"
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
