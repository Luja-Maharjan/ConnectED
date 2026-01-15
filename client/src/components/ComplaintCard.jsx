import React from "react";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const urgencyStyles = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const priorityStyles = {
  high: "bg-red-500 text-white",
  medium: "bg-orange-500 text-white",
  low: "bg-yellow-500 text-white",
};

const getStatusClass = (status) => statusStyles[status] || "bg-gray-100 text-gray-800";
const getUrgencyClass = (urgency) => urgencyStyles[urgency] || "bg-gray-100 text-gray-700";

const getPriorityLevel = (score) => {
  if (score >= 100) return { level: "high", label: "High Priority" };
  if (score >= 50) return { level: "medium", label: "Medium Priority" };
  return { level: "low", label: "Low Priority" };
};

const ComplaintCard = ({ complaint, showUserInfo = false, children }) => {
  const priorityInfo = complaint.priorityScore !== undefined 
    ? getPriorityLevel(complaint.priorityScore)
    : null;

  return (
    <div className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{complaint.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-gray-600 capitalize">{complaint.category}</span>
            {complaint.urgency && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyClass(complaint.urgency)}`}>
                {complaint.urgency}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {priorityInfo && (
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityStyles[priorityInfo.level]}`}>
                Priority: {complaint.priorityScore}
              </span>
            </div>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(complaint.status)}`}>
            {complaint.status}
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{complaint.description}</p>

      {showUserInfo && (
        <p className="text-sm text-gray-500 mb-3">
          Submitted by:{" "}
          {complaint.isAnonymous ? "Anonymous" : complaint.userId?.username || "Unknown"}
        </p>
      )}

      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Progress Updates</p>
        {complaint.updates && complaint.updates.length > 0 ? (
          <ul className="space-y-2">
            {[...complaint.updates]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((update) => (
                <li
                  key={update._id || `${update.createdAt}-${update.message}`}
                  className="bg-slate-50 border rounded-md p-3 text-sm"
                >
                  <p className="font-medium">{update.status || "Update"}</p>
                  {update.message && <p className="text-gray-700">{update.message}</p>}
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                    <span>{new Date(update.createdAt).toLocaleString()}</span>
                    {update.updatedBy?.username && (
                      <span>• {update.updatedBy.username}</span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No progress updates yet.</p>
        )}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default ComplaintCard;

