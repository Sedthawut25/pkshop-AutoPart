// src/app/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authStorage } from "../../utils/authStorage";
import { hasRole } from "./roleGuard";

export default function ProtectedRoute({ roles = [] }) {
  const token = authStorage.token();

  if (!token) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}