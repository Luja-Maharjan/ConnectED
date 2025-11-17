import React from "react";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const getStatusClass = (status) => statusStyles[status] || "bg-gray-100 text-gray-800";

const ComplaintCard = ({ complaint, showUserInfo = false, children }) => {
  return (
    <div className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-semibold">{complaint.title}</h3>
          <p className="text-gray-600">{complaint.category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(complaint.status)}`}>
          {complaint.status}
        </span>
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

