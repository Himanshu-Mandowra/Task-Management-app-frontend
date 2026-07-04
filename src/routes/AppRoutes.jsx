import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}

      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/tasks"
            // element={<Tasks />}
          />

          <Route
            path="/users"
            // element={<Users />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
