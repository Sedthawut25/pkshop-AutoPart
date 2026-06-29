import { api } from "./axios";

const unwrap = (res) => res.data?.data ?? res.data;

export const authApi = {
  login: async (payload) => {
    const res = await api.post("/api/auth/login", payload);

    const apiResponse = res.data;
    const data = apiResponse?.data;

    const authHeader = res.headers?.["authorization"] || res.headers?.authorization;
    const headerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;

    const token = data?.accessToken || headerToken || null;

    const roles =
      data?.roles ||
      data?.user?.roles?.map((r) => r.name) ||
      data?.user?.roles ||
      [];

    const user =
      data?.user ||
      (data
        ? { id: data.userId, email: data.email, fullName: data.fullName }
        : null);

    const role = Array.isArray(roles) && roles.length > 0 ? roles[0] : null;

    return { token, roles, role, user };
  },

  registerSupplier: (payload) => api.post("/api/auth/register", payload).then(unwrap),

  registerCustomer: (payload) => api.post("/api/auth/register", payload).then(unwrap),

};