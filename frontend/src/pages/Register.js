import { useState } from "react";
import api from "../api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
const register = async () => {
  try {
    await api.post("/register", form);
    alert("Registered successfully");
  } catch (err) {
    alert(err.response?.data?.message || "Error");
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-500 to-teal-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <input
          className="w-full mb-3 p-2 border rounded-lg"
          placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full mb-3 p-2 border rounded-lg"
          placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="w-full mb-3 p-2 border rounded-lg"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <select
  className="border p-2 w-full mb-3 rounded"
  value="student"
  disabled
>
  <option value="student">Student</option>
</select>

        <button
          onClick={register}
          className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;