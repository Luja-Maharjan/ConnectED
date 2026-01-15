import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SubmitComplaint() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    urgency: "medium",
    isAnonymous: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if not authenticated, or redirect admin/teacher
  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
    } else if (currentUser.role === "admin" || currentUser.role === "teacher") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    if (e.target.type === "checkbox") {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const res = await fetch("/api/complaint/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // Include cookies for authentication if logged in
      });

      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        setLoading(false);
        setError(data.message || "Failed to submit complaint");
        return;
      }

      setLoading(false);
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        category: "other",
        urgency: "medium",
        isAnonymous: false,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setLoading(false);
      setError(error.message || "Something went wrong");
    }
  };

  // Show loading or redirect message if not authenticated or if admin/teacher
  if (!currentUser || currentUser.role === "admin" || currentUser.role === "teacher") {
    return (
      <div className="p-3 max-w-2xl mx-auto">
        <p className="text-center text-gray-600">
          {!currentUser ? "Redirecting to login..." : "Redirecting..."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-2xl mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">
        Submit Feedback or Complaint
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Your feedback is important to us. Please provide details to help us prioritize your complaint.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            placeholder="Enter complaint title"
            className="border p-3 rounded-lg w-full"
            id="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            className="border p-3 rounded-lg w-full"
            id="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="bullying">Bullying</option>
            <option value="academic">Academic</option>
            <option value="facility">Facility</option>
            <option value="staff">Staff</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Urgency Level</label>
          <select
            className="border p-3 rounded-lg w-full"
            id="urgency"
            value={formData.urgency}
            onChange={handleChange}
            required
          >
            <option value="low">Low - Can wait a few days</option>
            <option value="medium">Medium - Should be addressed soon</option>
            <option value="high">High - Needs immediate attention</option>
            <option value="critical">Critical - Emergency situation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            placeholder="Describe your complaint or feedback in detail..."
            className="border p-3 rounded-lg w-full min-h-[150px]"
            id="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label htmlFor="isAnonymous" className="text-sm">
            Submit anonymously (uncheck to track progress)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>

      {error && (
        <div className="mt-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Complaint submitted successfully! Redirecting...
        </div>
      )}
    </div>
  );
}

