import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/navbar";
import Login from "./components/login";
import Users from "./pages/user_pages/users";
import AddUser from "./pages/user_pages/add_user";
import EditUser from "./pages/user_pages/edit_user";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/protected_route";
import Organization from "./pages/organization_pages/organization";
import Category from "./pages/category_pages/category";
import Solution from "./pages/solution_pages/solution";
import Reports from "./pages/Report_pages/reports";

function AppRoutes() {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // ❗ Detect login page based on current route
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<ProtectedRoute requiredRole="user"><Users /></ProtectedRoute>} />
        <Route path="/users/add" element={<ProtectedRoute requiredRole="user"><AddUser /></ProtectedRoute>} />
        <Route path="/users/edit/:id" element={<ProtectedRoute requiredRole="user"><EditUser /></ProtectedRoute>} />
        <Route path="/organizations" element={<ProtectedRoute requiredRole="user"><Organization /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute requiredRole="user"><Category /></ProtectedRoute>} />
        <Route path="/solutions" element={<ProtectedRoute requiredRole="user"><Solution /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute requiredRole="user"><Reports /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default AppRoutes;
