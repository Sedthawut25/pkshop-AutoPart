import { api } from "./axios";

const unwrap = (res) => {
  const body = res?.data;
  if (body?.success === false) throw new Error(body?.message || "API error");
  return body?.data ?? body;
};

export const adminPoApi = {
  list: (params) => api.get("/api/admin/po", { params }).then(unwrap),

  get: (poId) => api.get(`/api/admin/po/${poId}`).then(unwrap),

  create: (payload) => api.post("/api/admin/po", payload).then(unwrap),

  // ✅ FIX: backend ใช้ /items
  addItem: (poId, payload) => api.post(`/api/admin/po/${poId}/items`, payload).then(unwrap),

  send: (poId) => api.post(`/api/admin/po/${poId}/send`).then(unwrap),

  quotations: (poId) => api.get(`/api/admin/po/${poId}/quotations`).then(unwrap),

   quotationDetail: (poId, quotationId) =>
     api.get(`/api/admin/po/${poId}/quotations/${quotationId}`).then(unwrap),

   decideQuotation: (poId, quotationId, action) =>
     api.post(`/api/admin/po/${poId}/quotations/${quotationId}/decision`, { action }).then(unwrap),
};