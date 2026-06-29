import { api } from "/src/api/axios.js";
const unwrap = (res) => res.data?.data ?? res.data;

export const adminCommonApi = {
  suppliers: () => api.get("/api/admin/users", { params: { role: "SUPPLIER" } }).then(unwrap),

  products: (keyword) =>
    api
      .get("/api/admin/products", { params: { keyword } })
      .then((res) => {
        const data = unwrap(res);      
        return Array.isArray(data) ? data : (data?.content ?? []);
      }),
};