import { api } from "./axios";
const unwrap = (res) => res.data?.data ?? res.data;

export const adminImportApi = {
  // create lot
  createLot: (payload) => api.post("/api/admin/import/lots", payload).then(unwrap),

  // add lot item
  addLotItem: (lotId, payload) =>
    api.post(`/api/admin/import/lots/${lotId}/items`, payload).then(unwrap),

  // create document
  createDoc: (lotId, payload) =>
    api.post(`/api/admin/import/lots/${lotId}/documents`, payload).then(unwrap),

  // submit document to customs
  submitDoc: (docId) =>
    api.post(`/api/admin/import/documents/${docId}/submit`).then(unwrap),

  // (optional) receive later
  receiveLot: (lotId, payload) =>
    api.post(`/api/admin/import/lots/${lotId}/receive`, payload).then(unwrap),

  listLots: (params) =>
    api.get("/api/admin/import/lots", { params }).then(unwrap),

  getLotDetail: (lotId) =>
    api.get(`/api/admin/import/lots/${lotId}`).then(unwrap),
};