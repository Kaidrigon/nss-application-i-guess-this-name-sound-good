import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  return (
    <Routes>
      {/* Default page */}
      <Route
        path="/"
        element={<Navigate to="/register" replace />}
      />

      {/* Authentication */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Your other routes stay here */}
    </Routes>
  );
}

export default App;