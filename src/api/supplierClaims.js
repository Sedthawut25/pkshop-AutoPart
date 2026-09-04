import { api } from "./axios";

const CLAIM_RESPONSE_ACTION_MAP = {
  APPROVE: "APPROVED",
  APPROVED: "APPROVED",
  REJECT: "REJECTED",
  REJECTED: "REJECTED",
};

const unwrap = (res) => {
  const body = res?.data;
  if (body?.success === false) throw new Error(body?.message || "API error");
  return body?.data ?? body;
};

const normalizeRespondPayload = (payload = {}) => {
  const actionKey = String(payload.action || "").trim().toUpperCase();
  const action = CLAIM_RESPONSE_ACTION_MAP[actionKey];

  if (!action) {
    throw new Error("action ต้องเป็น APPROVED หรือ REJECTED");
  }

  const response = String(payload.response || "").trim();
  return response ? { action, response } : { action };
};

export const supplierClaimsApi = {
  adminList: ({ status, page = 0, size = 12 } = {}) =>
    api
      .get("/api/admin/supplier-claims", {
        params: { ...(status ? { status } : {}), page, size },
      })
      .then(unwrap),

  adminDetail: (claimId) =>
    api.get(`/api/admin/supplier-claims/${claimId}`).then(unwrap),

  create: (payload) => api.post("/api/admin/supplier-claims", payload).then(unwrap),

  cancel: (claimId) =>
    api.put(`/api/admin/supplier-claims/${claimId}/cancel`).then(unwrap),

  receiveReplacement: (claimId) =>
    api.post(`/api/admin/supplier-claims/${claimId}/receive-replacement`).then(unwrap),

  supplierList: ({ status } = {}) =>
    api
      .get("/api/supplier/claims", {
        params: status ? { status } : {},
      })
      .then(unwrap),

  supplierDetail: (claimId) => api.get(`/api/supplier/claims/${claimId}`).then(unwrap),

  respond: (claimId, payload) =>
    api
      .put(`/api/supplier/claims/${claimId}/respond`, normalizeRespondPayload(payload))
      .then(unwrap),

  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/api/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap);
  },
};
