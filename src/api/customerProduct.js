// src/api/customerProduct.js
import { api } from "./axios";

const unwrap = (res) => res.data?.data ?? res.data;

export const customerProductsApi = {
  list: async (params = {}) => {
    const res = await api.get("/api/customer/shop/products", { params });
    return unwrap(res); 
  },

  detail: async (id) => {
    const res = await api.get(`/api/customer/shop/products/${id}`);
    return unwrap(res);
  },

  filters: async () => {
    const res = await api.get("/api/customer/shop/products/filters");
    return unwrap(res);
  },
};