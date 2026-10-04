import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import VolunteerDashboard from "./pages/dashboard/VolunteerDashboard";
import ServiceHours from "./pages/dashboard/ServiceHours";
import Events from "./pages/dashboard/Events";
import History from "./pages/volunteer/History";
import Profile from "./pages/dashboard/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import AdminEvents from "./pages/admin/Events";
import EventAttendance from "./pages/admin/EventAttendance";


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
                AUTH
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
                VOLUNTEER
            ====================================================== */}

            <Route
                path="/dashboard"
                element={<VolunteerDashboard />}
            />

            <Route
                path="/events"
                element={<Events />}
            />

            <Route
                path="/service-hours"
                element={<ServiceHours />}
            />

            <Route
                path="/profile"
                element={<Profile />}
            />

            <Route
                path="/history"
                element={<History />}
            />


            {/* =====================================================
                ADMIN
            ====================================================== */}

            <Route
                path="/admin"
                element={<AdminDashboard />}
            />

            <Route
                path="/admin/users"
                element={<Users />}
            />

            <Route
                path="/admin/events"
                element={<AdminEvents />}
            />


            {/* =====================================================
                ADMIN EVENT ATTENDANCE
            ====================================================== */}

            <Route
                path="/admin/events/:eventId/attendance"
                element={<EventAttendance />}
            />

        </Routes>
    );
}

export default App;