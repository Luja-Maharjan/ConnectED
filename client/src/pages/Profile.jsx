import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ComplaintCard from "../components/ComplaintCard.jsx";

export default function Profile() {
  const { currentUser, authLoading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/sign-in");
    }
  }, [authLoading, currentUser, navigate]);

  useEffect(() => {
    const fetchMyComplaints = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const res = await fetch("/api/complaint/my-complaints", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || data.success === false) {
          setError(data.message || "Failed to fetch complaints");
          return;
        }
        setComplaints(data.complaints || []);
        setError(null);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchMyComplaints();
  }, [currentUser]);

  if (authLoading) {
    return <p className="p-4 text-center">Loading profile...</p>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="p-3 max-w-5xl mx-auto space-y-6">
      <section className="border rounded-lg p-6 shadow-sm bg-white">
        <h1 className="text-3xl font-semibold mb-4">Profile</h1>
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Username:</span> {currentUser.username}
          </p>
          <p>
            <span className="font-medium">Email:</span> {currentUser.email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {currentUser.role}
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Your Complaints</h2>
          <p className="text-sm text-gray-500">
            {complaints.length} complaint{complaints.length === 1 ? "" : "s"}
          </p>
        </div>

        {loading ? (
          <p>Loading your complaints...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : complaints.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-gray-500">
            You have not submitted any complaints yet.
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
