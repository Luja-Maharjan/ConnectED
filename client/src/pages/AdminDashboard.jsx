import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintCard from "../components/ComplaintCard.jsx";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/complaint/all", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        if (res.status === 401 || res.status === 403) {
          setError("Access denied. Admin access required.");
          setTimeout(() => navigate("/sign-in"), 2000);
        } else {
          setError(data.message || "Failed to fetch complaints");
        }
        return;
      }

      setComplaints(data.complaints || []);
      setError(null);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId) => {
    if (!updateStatus && !progressMessage) {
      alert("Please provide a status or progress update");
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch(`/api/complaint/${complaintId}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: updateStatus || undefined,
          adminResponse: progressMessage || undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        alert(data.message || "Failed to update complaint");
        return;
      }

      // Refresh complaints list
      fetchComplaints();
      setSelectedComplaintId(null);
      setUpdateStatus("");
      setProgressMessage("");
      alert("Progress update posted successfully");
    } catch (error) {
      alert(error.message || "Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      const res = await fetch(`/api/complaint/${complaintId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        alert(data.message || "Failed to delete complaint");
        return;
      }

      // Refresh complaints list
      fetchComplaints();
      alert("Complaint deleted successfully");
    } catch (error) {
      alert(error.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="p-3 max-w-6xl mx-auto">
        <h1 className="text-3xl text-center font-semibold my-7">
          Admin Dashboard
        </h1>
        <p className="text-center">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">
        Admin Dashboard
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Manage all complaints and feedback
      </p>

      {error && (
        <div className="mb-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No complaints found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              showUserInfo
            >
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <button
                  onClick={() => {
                    setSelectedComplaintId((prev) =>
                      prev === complaint._id ? null : complaint._id
                    );
                    setUpdateStatus("");
                    setProgressMessage("");
                  }}
                  className="text-blue-600 hover:underline"
                >
                  {selectedComplaintId === complaint._id ? "Hide Progress Form" : "Post Progress Update"}
                </button>
                <button
                  onClick={() => handleDelete(complaint._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>

              {selectedComplaintId === complaint._id && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 md:flex-row md:gap-6">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Update Status
                      </label>
                      <select
                        className="border p-2 rounded-lg w-full"
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                      >
                        <option value="">Select status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Progress Update
                      </label>
                      <textarea
                        className="border p-2 rounded-lg w-full min-h-[100px]"
                        placeholder="Share the latest progress or notes..."
                        value={progressMessage}
                        onChange={(e) => setProgressMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateStatus(complaint._id)}
                      disabled={updating}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Post Update"}
                    </button>
                  </div>
                </div>
              )}
            </ComplaintCard>
          ))}
        </div>
      )}
    </div>
  );
}