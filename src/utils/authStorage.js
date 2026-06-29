// src/utils/authStorage.js
export const authStorage = {
  setAuth: ({ token, role, user, roles }) => {
    localStorage.setItem("pk_token", token);
    if (role) localStorage.setItem("pk_role", role);
    if (Array.isArray(roles)) localStorage.setItem("pk_roles", JSON.stringify(roles));
    if (user) localStorage.setItem("pk_user", JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem("pk_token");
    localStorage.removeItem("pk_role");
    localStorage.removeItem("pk_roles");
    localStorage.removeItem("pk_user");
  },
  token: () => localStorage.getItem("pk_token"),
  role: () => localStorage.getItem("pk_role"),
  roles: () => {
    const raw = localStorage.getItem("pk_roles");
    return raw ? JSON.parse(raw) : [];
  },
  user: () => {
    const raw = localStorage.getItem("pk_user");
    return raw ? JSON.parse(raw) : null;
  },
};