import { api } from "./axios";
const unwrap = (res) => res.data?.data ?? res.data;

export const customsDocsApi = {
  list: (params) => api.get("/api/customs/import-documents", { params }).then(unwrap),
  approve: (docId, comment) =>
    api.post(`/api/customs/import-documents/${docId}/approve`, { comment }).then(unwrap),
  reject: (docId, comment) =>
    api.post(`/api/customs/import-documents/${docId}/reject`, { comment }).then(unwrap),
};