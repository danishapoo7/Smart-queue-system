import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //  Password validation
  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
  };

  //  Name validation
  const validateName = (name) => {
    return /^[A-Za-z. ]+$/.test(name);
  };

  //  Email validation
  const validateEmail = (email) => {
    return email.includes("@") && email.includes(".com");
  };

  const register = async () => {
    if (loading) return;

    let newErrors = {};

    //  Name check
    if (!validateName(form.name)) {
      newErrors.name = "Only letters, spaces and dots allowed";
    }

    // Email check
    if (!validateEmail(form.email)) {
      newErrors.email = "Enter valid email (must include @ and .com)";
    }

    // Password policy
    if (!validatePassword(form.password)) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, lowercase, number & symbol";
    }

    //  Confirm password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    //  Stop if errors exist
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await api.post("/register", {
        name: form.name,
        email: form.email,
        password: form.password
      });

      //  Auto login
      const loginRes = await api.post("/login", {
        email: form.email,
        password: form.password
      });

      sessionStorage.setItem("token", loginRes.data.token);
      sessionStorage.setItem("role", loginRes.data.role);

      //  Redirect
      navigate("/student");

    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Registration failed"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-r from-green-500 to-teal-600">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition w-full max-w-md">

        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Register</h2>

        {/* NAME */}
        <input
          className="w-full mb-2 p-3 border rounded-lg"
          placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-2">{errors.name}</p>
        )}

        {/* EMAIL */}
        <input
          className="w-full mb-2 p-3 border rounded-lg"
          placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email}</p>
        )}

        {/* PASSWORD */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-3 border rounded-lg"
            placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">{errors.password}</p>
        )}

        {/* PASSWORD POLICY */}
        <p className="text-sm text-gray-500 mb-2">
          Minimum 8 characters, include uppercase, lowercase, number & symbol
        </p>

        {/* CONFIRM PASSWORD */}
        <div className="relative mb-1">
          <input
            type={showConfirm ? "text" : "password"}
            className="w-full p-2 border rounded-lg"
            placeholder="Confirm Password"
            onChange={e =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />
          <span
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
          >
            {showConfirm ? "🙈" : "👁️"}
          </span>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mb-2">
            {errors.confirmPassword}
          </p>
        )}

        {/* GENERAL ERROR */}
        {errors.general && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {errors.general}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={register}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}