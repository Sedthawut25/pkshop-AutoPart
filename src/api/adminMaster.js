import { api } from "./axios";
const unwrap = (res) => res.data?.data ?? res.data;

export const adminMasterApi = {
  // categories
  listCategories: () => api.get("/api/admin/categories").then(unwrap),
  createCategory: (name) => api.post("/api/admin/categories", { name }).then(unwrap),
  updateCategory: (id, name) => api.put(`/api/admin/categories/${id}`, { name }).then(unwrap),
  deleteCategory: (id) => api.delete(`/api/admin/categories/${id}`).then(unwrap),

  // car brands
  listBrands: () => api.get("/api/admin/car-brands").then(unwrap),
  createBrand: (name) => api.post("/api/admin/car-brands", { name }).then(unwrap),
  updateBrand: (id, name) => api.put(`/api/admin/car-brands/${id}`, { name }).then(unwrap),
  deleteBrand: (id) => api.delete(`/api/admin/car-brands/${id}`).then(unwrap),

  // car models
  listModels: (brandId) =>
    api.get("/api/admin/car-models", { params: brandId ? { brandId } : {} }).then(unwrap),
  createModel: (payload) => api.post("/api/admin/car-models", payload).then(unwrap),
  updateModel: (id, payload) => api.put(`/api/admin/car-models/${id}`, payload).then(unwrap),
  deleteModel: (id) => api.delete(`/api/admin/car-models/${id}`).then(unwrap),
};