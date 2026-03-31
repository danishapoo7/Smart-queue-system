import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

/* ===========================
   PROTECTED ROUTE
=========================== */

function PrivateRoute({ children, role }) {
  const token = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("role");

  if (!token) return <Navigate to="/" />;

  if (role && userRole !== role) return <Navigate to="/" />;

  return children;
}
/* ===========================
   MAIN APP
=========================== */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route
          path="/student"
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
