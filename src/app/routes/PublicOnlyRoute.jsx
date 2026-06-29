// src/app/routes/PublicOnlyRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authStorage } from "../../utils/authStorage";

function roleHome(role) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "SUPPLIER":
      return "/supplier";
    case "CUSTOMER":
      return "/";
    case "CUSTOMS":
      return "/customs";
    default:
      return null;
  }
}

export default function PublicOnlyRoute() {
  const token = authStorage.token();
  const role = authStorage.role();

  if (token) {
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (role === "SUPPLIER") return <Navigate to="/supplier/po" replace />;
    if (role === "CUSTOMS") return <Navigate to="/customs/documents" replace />;
    if (role === "CUSTOMER") return <Navigate to="/customer" replace />;
  }

  return <Outlet />;
}