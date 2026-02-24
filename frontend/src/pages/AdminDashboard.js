import { useState, useEffect } from "react";
import api from "../api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [avgTime, setAvgTime] = useState(0);

  const navigate = useNavigate();

  /* 🔐 AUTH + ROLE CHECK (ONLY ONE) */
  useEffect(() => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (!token || role !== "admin") {
    navigate("/");
  }
}, [navigate]);

  /* ======================
     LOAD QUEUE
  ====================== */
  const loadQueue = async () => {
    try {
      const res = await api.get("/queue");
      setQueue(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ======================
     LOAD ANALYTICS
  ====================== */
  const loadAnalytics = async () => {
    try {
      const res = await api.get("/analytics");
      setAvgTime(res.data.avgTime);
    } catch (err) {
      console.log(err);
    }
  };

  /* ======================
     REALTIME SOCKET
  ====================== */
  useEffect(() => {
    loadQueue();
    loadAnalytics();

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socket.on("queueUpdated", () => {
      loadQueue();
      loadAnalytics();
    });

    return () => socket.disconnect();
  }, []);

  /* ======================
     CALL NEXT TOKEN
  ====================== */
  const nextToken = async () => {
    try {
      await api.post("/next");

      // update UI immediately
      loadQueue();
      loadAnalytics();
    } catch (err) {
      alert(err.response?.data || "Call next failed");
    }
  };

  /* ======================
     LOGOUT
  ====================== */
  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      sessionStorage.clear();
      navigate("/");
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">Queue Admin</h2>

        <nav className="space-y-4">
          <button className="block w-full text-left hover:bg-indigo-600 p-2 rounded">
            Dashboard
          </button>
          <button className="block w-full text-left hover:bg-indigo-600 p-2 rounded">
            Analytics
          </button>
          <button className="block w-full text-left hover:bg-indigo-600 p-2 rounded">
            Settings
          </button>
        </nav>

        <button
          onClick={logout}
          className="mt-10 bg-red-500 w-full p-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <button
            onClick={nextToken}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Call Next
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500">Total Tokens</h3>
            <p className="text-2xl font-bold">{queue.length}</p>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500">Waiting</h3>
            <p className="text-2xl font-bold">{queue.length}</p>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500">Avg Time</h3>
            <p className="text-2xl font-bold">{avgTime} min</p>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Live Queue</h2>

          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">#</th>
                <th className="p-2">Student</th>
                <th className="p-2">Fee Type</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {queue.map((q, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{q.studentName}</td>
                  <td className="p-2">{q.feeType}</td>
                  <td className="p-2 text-green-600">Waiting</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;