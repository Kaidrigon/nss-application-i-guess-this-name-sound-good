import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import VolunteerDashboard from "./pages/dashboard/VolunteerDashboard";
import ServiceHours from "./pages/dashboard/ServiceHours";

function App() {
return ( <Routes>
{/* DEFAULT */}


  <Route
    path="/"
    element={
      <Navigate
        to="/register"
        replace
      />
    }
  />

  {/* AUTHENTICATION */}

  <Route
    path="/login"
    element={<Login />}
  />

  <Route
    path="/register"
    element={<Register />}
  />

  {/* VOLUNTEER */}

  <Route
    path="/dashboard"
    element={<VolunteerDashboard />}
  />

  <Route
    path="/service-hours"
    element={<ServiceHours />}
  />
</Routes>


);
}

export default App;
