import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        {/* Project Name */}
        <Link to="/" className="flex items-center">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-black">Connect</span>
            <span className="text-red-500">ED</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="flex gap-4">
            <li>
              <Link
                to="/"
                className="hidden sm:inline text-slate-700 hover:underline"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="hidden sm:inline text-slate-700 hover:underline"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                to="/sign-in"
                className="hidden sm:inline text-slate-700 hover:underline"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
