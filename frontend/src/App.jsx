import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";

import Register from "./pages/auth/Register";

import VolunteerDashboard from "./pages/dashboard/VolunteerDashboard";

import AdminDashboard from "./pages/dashboard/AdminDashboard";

import ServiceHours from "./pages/dashboard/ServiceHours";

import Events from "./pages/dashboard/Events";

import History from "./pages/volunteer/History";

import Profile from "./pages/dashboard/Profile";

function App() {
  return (
    <Routes>
      {/* =====================================================
          DEFAULT
      ====================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/register"
            replace
          />
        }
      />

      {/* =====================================================
          AUTHENTICATION
      ====================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =====================================================
          VOLUNTEER DASHBOARD
      ====================================================== */}

      <Route
        path="/dashboard"
        element={<VolunteerDashboard />}
      />

      {/* =====================================================
          ADMIN DASHBOARD
      ====================================================== */}

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />

      {/* =====================================================
          EVENTS
      ====================================================== */}

      <Route
        path="/events"
        element={<Events />}
      />

      {/* =====================================================
          SERVICE HOURS
      ====================================================== */}

      <Route
        path="/service-hours"
        element={<ServiceHours />}
      />

      {/* =====================================================
          PROFILE
      ====================================================== */}

      <Route
        path="/profile"
        element={<Profile />}
      />

      {/* =====================================================
          SERVICE HISTORY
      ====================================================== */}

      <Route
        path="/history"
        element={<History />}
      />
    </Routes>
  );
}

export default App;