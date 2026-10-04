import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import VolunteerDashboard from "./pages/dashboard/VolunteerDashboard";
import ServiceHours from "./pages/dashboard/ServiceHours";
import Events from "./pages/dashboard/Events";
import History from "./pages/volunteer/History";
import Profile from "./pages/dashboard/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";


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

      <Route
  path="/profile"
  element={<Profile />}
/>
        <Route
    path="/admin"
    element={<AdminDashboard />}
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