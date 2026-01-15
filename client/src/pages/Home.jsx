import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ComplaintCard from "../components/ComplaintCard.jsx";

export default function Home() {
  const { currentUser, authLoading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!currentUser) {
        setComplaints([]);
        return;
      }
      const endpoint =
        currentUser.role === "admin"
          ? "/api/complaint/all"
          : "/api/complaint/my-complaints";
      try {
        setLoadingComplaints(true);
        const res = await fetch(endpoint, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || data.success === false) {
          setError(data.message || "Failed to load complaints");
          return;
        }
        setComplaints(data.complaints || []);
        setError(null);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoadingComplaints(false);
      }
    };
    fetchComplaints();
  }, [currentUser]);

  return (
    <div className="p-3 max-w-6xl mx-auto space-y-8">
      <section className="bg-slate-100 border rounded-lg p-6 text-center shadow-sm">
        <h1 className="text-4xl font-bold mb-4">Welcome to ConnectED</h1>
        <p className="text-lg text-gray-600 mb-4">
          A safe space to submit feedback, report issues anonymously, and track progress.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {currentUser?.role !== "admin" && currentUser?.role !== "teacher" && (
            <Link
              to="/submit-complaint"
              className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:opacity-95"
            >
              Submit Complaint
            </Link>
          )}
          {!currentUser && (
            <Link
              to="/sign-in"
              className="border border-slate-700 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50"
            >
              Sign In to Track
            </Link>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-3">Anonymous by Default</h2>
          <p className="text-gray-600">
            Share genuine feedback without fear. Choose whether or not to reveal your name.
          </p>
        </div>
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-3">Live Progress</h2>
          <p className="text-gray-600">
            Administrators keep you in the loop with real-time progress updates.
          </p>
        </div>
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-3">Track from Anywhere</h2>
          <p className="text-gray-600">
            Visit your profile to view the full history of every complaint you created.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            {currentUser?.role === "admin" ? "All Complaints" : "Your Complaints"}
          </h2>
          {currentUser && (
            <p className="text-sm text-gray-500">
              Showing {complaints.length} complaint{complaints.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {authLoading ? (
          <p>Checking your session...</p>
        ) : !currentUser ? (
          <div className="border rounded-lg p-6 text-center">
            <p className="text-gray-600">
              Sign in to view and track your complaints in real time.
            </p>
            <Link
              to="/sign-in"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Go to Sign In
            </Link>
          </div>
        ) : loadingComplaints ? (
          <p>Loading complaints...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : complaints.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-gray-600">
            {currentUser.role === "admin"
              ? "No complaints submitted yet."
              : "You haven't submitted any complaints yet."}
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                showUserInfo={currentUser.role === "admin"}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
