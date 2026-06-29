import { api } from "./axios";
const unwrap = (res) => res.data?.data ?? res.data;

export const supplierPoApi = {
  list: (params) => api.get("/api/supplier/po", { params }).then(unwrap),
  detail: (poId) => api.get(`/api/supplier/po/${poId}`).then(unwrap),
  createQuotation: (poId, payload) =>
    api.post(`/api/supplier/po/${poId}/quotation`, payload).then(unwrap),
  quotations: (poId) => api.get(`/api/supplier/po/${poId}/quotations`).then(unwrap),
};