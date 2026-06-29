import { api } from "./axios";
const unwrap = (res) => res.data?.data ?? res.data;

export const adminProductsApi = {
  list: (params) => api.get("/api/admin/products", { params }).then(unwrap),

  create: (payload) => api.post("/api/admin/products", payload).then(unwrap),

  update: (id, payload) => api.put(`/api/admin/products/${id}`, payload).then(unwrap),

  delete: (id) => api.delete(`/api/admin/products/${id}`).then(unwrap),

  fitments: (productId) =>
    api.get(`/api/admin/products/${productId}/fitments`).then(unwrap),
  addFitment: (productId, payload) =>
    api.post(`/api/admin/products/${productId}/fitments`, payload).then(unwrap),
  updateFitment: (productId, fitmentId, payload) =>
    api.put(`/api/admin/products/${productId}/fitments/${fitmentId}`, payload).then(unwrap),
  deleteFitment: (productId, fitmentId) =>
    api.delete(`/api/admin/products/${productId}/fitments/${fitmentId}`).then(unwrap),
};