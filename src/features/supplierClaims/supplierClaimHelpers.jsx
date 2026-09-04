import React from "react";
import Badge from "../../components/ui/Badge";
import { formatMoney } from "../../utils/money";

export const CLAIM_STATUSES = [
  { value: "", label: "ทุกสถานะ" },
  { value: "PENDING", label: "รอซัพพลายเออร์ตอบ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "REJECTED", label: "ปฏิเสธแล้ว" },
  { value: "CANCELLED", label: "ยกเลิกแล้ว" },
  { value: "COMPLETED", label: "เสร็จสิ้น" },
];

export const CLAIM_TYPES = [
  { value: "RETURN_REFUND", label: "ส่งคืนและขอเงินคืน" },
  { value: "REPLACEMENT", label: "เปลี่ยนสินค้า" },
];

const STATUS_META = {
  PENDING: { label: "รอซัพพลายเออร์ตอบ", tone: "yellow" },
  APPROVED: { label: "อนุมัติแล้ว", tone: "blue" },
  REJECTED: { label: "ปฏิเสธแล้ว", tone: "red" },
  CANCELLED: { label: "ยกเลิกแล้ว", tone: "gray" },
  COMPLETED: { label: "เสร็จสิ้น", tone: "green" },
};

const TYPE_META = {
  RETURN_REFUND: "ส่งคืนและขอเงินคืน",
  REPLACEMENT: "เปลี่ยนสินค้า",
};

export function claimStatusMeta(status) {
  return STATUS_META[(status || "").toUpperCase()] || { label: status || "-", tone: "gray" };
}

export function ClaimStatusBadge({ status }) {
  const meta = claimStatusMeta(status);
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function claimTypeLabel(type) {
  return TYPE_META[(type || "").toUpperCase()] || type || "-";
}

export function formatClaimMoney(value) {
  return value === null || value === undefined ? "-" : formatMoney(value);
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getApiErrorMessage(error, fallback = "ดำเนินการไม่สำเร็จ") {
  const data = error?.response?.data;
  const errors = data?.errors || data?.fieldErrors;

  if (Array.isArray(errors) && errors.length > 0) {
    return errors
      .map((item) => item?.message || item?.defaultMessage || item)
      .filter(Boolean)
      .join(", ");
  }

  if (errors && typeof errors === "object") {
    const messages = Object.values(errors).flat().filter(Boolean);
    if (messages.length > 0) return messages.join(", ");
  }

  return (
    data?.message ||
    data?.error ||
    error?.message ||
    fallback
  );
}

export function pageContent(pageData) {
  if (Array.isArray(pageData)) return pageData;
  if (Array.isArray(pageData?.content)) return pageData.content;
  return [];
}

export function poRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export function poDetailItems(data) {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.po?.items)) return data.po.items;
  if (Array.isArray(data)) return data;
  return [];
}

export function poDisplayName(po) {
  return po?.poNumber || (po?.id ? `PO-${po.id}` : "-");
}

export function supplierDisplayName(supplier) {
  return supplier?.fullName || supplier?.name || supplier?.email || "-";
}

export function getAttachmentUrls(claim) {
  if (!claim) return [];
  const list = [];

  const addUrl = (url) => {
    if (typeof url === "string" && url.trim() && !list.includes(url.trim())) {
      list.push(url.trim());
    } else if (url && typeof url === "object") {
      const u = url.fileUrl || url.imageUrl || url.url || url.path;
      if (typeof u === "string" && u.trim() && !list.includes(u.trim())) {
        list.push(u.trim());
      }
    }
  };

  if (Array.isArray(claim.attachments)) {
    claim.attachments.forEach(addUrl);
  }
  if (Array.isArray(claim.attachmentUrls)) {
    claim.attachmentUrls.forEach(addUrl);
  }
  if (claim.imageUrl) {
    addUrl(claim.imageUrl);
  }

  return list;
}
