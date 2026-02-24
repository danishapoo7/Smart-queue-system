import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
const login = async () => {
  try {
    const res = await api.post("/login", {
      email,
      password
    });

    console.log(res.data);

    sessionStorage.setItem("token", res.data.token);
    sessionStorage.setItem("role", res.data.role);

    if (res.data.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/student");
    }

  } catch (err) {
    alert(err.response?.data || "Login failed");
  }
};

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          placeholder="Email"
          value={email}
          className="border p-2 w-full mb-3 rounded"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          className="border p-2 w-full mb-3 rounded"
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          className="mt-4 text-blue-600 underline w-full"
        >
          Don’t have an account? Register
        </button>
      </div>
    </div>
  );
}