export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="bg-white shadow-md rounded-2xl p-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">
          <span className="text-black">Connect</span>
          <span className="text-red-500">ED</span>
        </h1>

        {/* Description */}
        <p className="text-slate-600 text-lg leading-relaxed mb-4 text-center">
          <span className="font-semibold">ConnectED</span> is a
          <span className="text-blue-600 font-medium">
            {" "}
            college complaint and feedback system{" "}
          </span>
          built using the MERN stack. It provides students with a secure
          platform to share complaints, suggestions, and feedback while enabling
          authorities to track, manage, and resolve issues efficiently.
        </p>

        {/* Features Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            ✨ Key Features
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li>
              ✅ File complaints with the option to stay{" "}
              <span className="font-medium">anonymous</span>.
            </li>
            <li>✅ Track live complaint status & progress updates.</li>
            <li>✅ Role-based access for students and authorities.</li>
            <li>✅ Suggestions & feedback system for improvements.</li>
            <li>✅ Simple and clean interface.</li>
          </ul>
        </div>

        {/* Closing Note */}
        <div className="mt-10 text-center">
          <p className="text-slate-600 text-lg">
            Our goal with{" "}
            <span className="font-semibold text-red-500">ConnectED</span> is to
            build a transparent and effective communication bridge between
            students and the administration.
          </p>
        </div>
      </div>
    </div>
  );
}
