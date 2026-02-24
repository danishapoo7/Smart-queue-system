import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { messaging } from "../firebase"; 
import { getToken } from "firebase/messaging";

function StudentDashboard() {
  const [queue, setQueue] = useState([]);
  const [waiting, setWaiting] = useState(null);
  const [ahead, setAhead] = useState(0);
  const [position, setPosition] = useState(null);
  const [prevPosition, setPrevPosition] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  
  useEffect(() => { 
    getToken(messaging, { 
      vapidKey: "BCIRHtMXcgSqYXg17LwN7z-GcAJQ9QIKsk8UBxPJ6vremRlfrdo-7FSCVgnm0MzispuyA2KN_X4sbsM1DXqE9Ec" 
    }).then(token => { 
      console.log("FCM token:", token); 
    }); }, []);
    /* 🔥 AUTH CHECK → ADD HERE */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/me");
      } catch {
        sessionStorage.clear();
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  /* ======================
     AUTH CHECK + USER
  ====================== */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token || role !== "student") {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/me");

        setUser(res.data);
      } catch (err) {
        console.log("Auth error:", err);
        sessionStorage.clear();
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  /* ======================
     LOAD QUEUE
  ====================== */
  const loadQueue = useCallback(async () => {
    try {
      const res = await api.get("/queue");
      setQueue(res.data);

      if (user) {
        const index = res.data.findIndex(
          t => t.studentId === user.id
        );

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
     REALTIME SOCKET
  ====================== */
  useEffect(() => {
    if (!user) return;

    loadQueue();

    const socket = io("http://localhost:5000", {
      transports: ["websocket"]
    });

    socket.on("queueUpdated", () => {
      loadQueue();
    });

    return () => socket.disconnect();
  }, [user, loadQueue]);

  /* ======================
     TURN ALERT
  ====================== */
  useEffect(() => {
    if (position === 1 && prevPosition !== 1) {
      alert("🔔 It's your turn! Please go to the counter.");

      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
      );
      audio.play();
    }

    setPrevPosition(position);
  }, [position, prevPosition]);

  /* ======================
     BOOK TOKEN
  ====================== */
  const bookToken = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await api.post(
        "/token",
        { feeType: "Tuition" },
        { headers: { Authorization: token } }
      );

      setWaiting(res.data.waitingTime);
      setAhead(res.data.tokensAhead);
      setPosition(res.data.position);

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
     LOADING UI
  ====================== */
  if (!user) {
    return (
      <div className="p-6">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Student Dashboard</h2>

      <p className="mb-4">Logged in as: {user.name}</p>

      <button
        onClick={bookToken}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Book Token
      </button>

      <button
        onClick={logout}
        className="ml-3 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

      {waiting !== null && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h3>Your Token Info</h3>
          <p>People ahead: {ahead}</p>
          <p>Estimated waiting: {waiting} min</p>
          <p>Your position: {position}</p>
        </div>
      )}

      <h3 className="mt-6 font-bold">Live Queue</h3>

      {queue.map((q, i) => (
        <div key={q._id} className="border p-2 mt-2">
          {i + 1}. {q.studentName}
        </div>
      ))}
    </div>
  );
}

export default StudentDashboard;