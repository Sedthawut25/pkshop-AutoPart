import { api } from "./axios";
const unwrap = (res) => res.data?.data ?? res.data;

export const adminPromotionsApi = {
  list: () => api.get("/api/admin/promotions").then(unwrap),
  get: (id) => api.get(`/api/admin/promotions/${id}`).then(unwrap),
  create: (payload) => api.post("/api/admin/promotions", payload).then(unwrap),
  update: (id, payload) => api.put(`/api/admin/promotions/${id}`, payload).then(unwrap),
  delete: (id) => api.delete(`/api/admin/promotions/${id}`).then(unwrap),
  setTargets: (id, payload) => api.put(`/api/admin/promotions/${id}/targets`, payload).then(unwrap),
};