import { api } from "./axios";
const unwrap = (res) => res.data?.data ?? res.data;

export const adminOrdersApi = {
  list: (params) => api.get("/api/admin/orders", { params }).then(unwrap),
  detail: (orderId) => api.get(`/api/admin/orders/${orderId}`).then(unwrap),
  updateStatus: (orderId, status) =>
    api.put(`/api/admin/orders/${orderId}/status`, { status }).then(unwrap),
  upsertShipment: (orderId, payload) =>
    api.put(`/api/admin/orders/${orderId}/shipment`, payload).then(unwrap),
};