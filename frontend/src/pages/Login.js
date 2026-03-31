import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const login = async () => {
    //  prevent multiple clicks
    if (loading) return;

    setLoading(true);
    setError(""); //  clear previous error

    try {
      const res = await api.post("/login", {
        email,
        password
      });

      //  store data
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", res.data.role);

      //  navigate safely
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }

    } catch (err) {
       setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100">

      {/* LOGO + TITLE */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="/Logo.png"
          alt="Logo"
          className="w-20 h-16 sm:w-24 sm:h-20 mix-blend-multiply"
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 text-center">
          Smart Queue System
        </h1>

        <p className="text-gray-500 text-sm">
          Fast • Efficient • Smart
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition w-full max-w-md">

        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        {/* EMAIL */}
        <input
          type="text"
          placeholder="Email"
          value={email}
          className={`border p-3 w-full mb-3 rounded focus:outline-none focus:ring-2 ${
            error ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
          }`}
          onChange={e => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            className={`border p-3 w-full rounded focus:outline-none focus:ring-2 ${
              error ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
            }`}
            onChange={e => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* ❗ ERROR MESSAGE */}
        {error && (
          <p className="text-red-500 text-sm mb-3 text-center font-medium">
            {error}
          </p>
        )}

        {/* LOGIN BUTTON */}
        <button
          onClick={login}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* REGISTER */}
        <button
          onClick={() => navigate("/register")}
          className="mt-4 text-blue-600 hover:underline w-full"
        >
          Don’t have an account? Register
        </button>
      </div>
    </div>
  );
}