// src/app/routes/roleGuard.js
import { authStorage } from "../../utils/authStorage";

export function hasRole(allowedRoles = []) {
  const role = authStorage.role();
  return !!role && allowedRoles.includes(role);
}