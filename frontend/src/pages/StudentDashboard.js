import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const [queue, setQueue] = useState([]);
  const [waiting, setWaiting] = useState(null);
  const [ahead, setAhead] = useState(0);
  const [position, setPosition] = useState(null);
  const [prevPosition, setPrevPosition] = useState(null);
  const [user, setUser] = useState(null);
  const [turnAlert, setTurnAlert] = useState(false);

  const navigate = useNavigate();

  /* ======================
     AUTH + USER
  ====================== */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/me");
        setUser(res.data.data);
      } catch {
        sessionStorage.clear();
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  /* ======================
     LOAD QUEUE
  ====================== */
  const loadQueue = useCallback(async () => {
    try {
      const res = await api.get("/queue");
      const queueData = res.data.data || [];
      setQueue(queueData);

      if (user) {
        const index = queueData.findIndex((t) => t.studentId === user.id);

        if (index !== -1) {
          setPosition(index + 1);
          setAhead(index);
          setWaiting(index * 5);
        } else {
          setPosition(null);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, [user]);

  /* ======================
     SOCKET
  ====================== */
  useEffect(() => {
    if (!user) return;

    loadQueue();

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socket.on("queueUpdated", loadQueue);

    return () => socket.disconnect();
  }, [user, loadQueue]);

  /* ======================
     TURN ALERT
  ====================== */
  useEffect(() => {
    if (position === 1 && prevPosition !== 1) {
      setTurnAlert(true);
    }

    setPrevPosition(position);
  }, [position, prevPosition]);

  /* ======================
     DISMISS ALERT + PLAY SOUND
  ====================== */
  const dismissAlert = () => {
    setTurnAlert(false);

    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
    );
    audio.play().catch((err) => console.log("Audio blocked:", err));
  };

  /* ======================
     BOOK TOKEN
  ====================== */
  const bookToken = async () => {
    try {
      const res = await api.post("/token", {
        feeType: "Tuition",
      });

      const data = res.data.data;

      setWaiting(data.waitingTime);
      setAhead(data.tokensAhead);
      setPosition(data.position);
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  /* ======================
     LOGOUT
  ====================== */
  const logout = () => {
    if (window.confirm("Logout?")) {
      sessionStorage.clear();
      navigate("/");
    }
  };

  /* ======================
     LOADING
  ====================== */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-lg font-medium">Loading dashboard...</h2>
      </div>
    );
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-100">

      {/* ALERT */}
      {turnAlert && (
        <div className="fixed top-4 left-2 right-2 sm:left-auto sm:right-5 bg-yellow-400 text-black px-4 py-3 rounded shadow-lg flex justify-between items-center z-50">
          <span>🔔 It's your turn! Go to the counter.</span>
          <button
            onClick={dismissAlert}
            className="bg-black text-white px-2 py-1 rounded"
          >
            OK
          </button>
        </div>
      )}

      {/* HEADER */}
      <h2 className="text-lg sm:text-xl font-bold mb-4">Student Dashboard</h2>

      <p className="mb-4 text-gray-700">
        Logged in as: <span className="font-semibold">{user.name}</span>
      </p>

      {/* BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={bookToken}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Book Token
        </button>

        <button
          onClick={logout}
          className="w-full sm:w-auto bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* TOKEN INFO */}
      {waiting !== null && (
        <div className="mt-4 p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold mb-2">Your Token Info</h3>
          <p>People ahead: {ahead}</p>
          <p>Estimated waiting: {waiting} min</p>
          <p>Your position: {position}</p>
        </div>
      )}

      {/* QUEUE */}
      <h3 className="mt-6 font-bold">Live Queue</h3>

      <div className="mt-2">
        {Array.isArray(queue) &&
          queue.map((q, i) => (
            <div
              key={q._id}
              className="bg-white p-3 mt-2 rounded shadow-sm hover:shadow-md transition"
            >
              {i + 1}. {q.studentName}
            </div>
          ))}
      </div>
    </div>
  );
}

export default StudentDashboard;