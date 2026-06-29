import { api } from "./axios";

export const dashboardApi = {
  summary: (params) => api.get("/api/admin/dashboard/summary", { params }).then((r) => r.data),
  salesSeries: (params) => api.get("/api/admin/dashboard/sales-series", { params }).then((r) => r.data),
  bestSellers: (params) => api.get("/api/admin/dashboard/best-sellers", { params }).then((r) => r.data),
  deadStock: (params) => api.get("/api/admin/dashboard/dead-stock", { params }).then((r) => r.data),
};