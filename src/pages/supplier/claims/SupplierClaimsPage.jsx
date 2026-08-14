import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, X, XCircle } from "lucide-react";
import Card from "../../../components/ui/Card";
import { supplierClaimsApi } from "../../../api/supplierClaims";
import {
  CLAIM_STATUSES,
  ClaimStatusBadge,
  claimTypeLabel,
  formatClaimMoney,
  formatDateTime,
  getApiErrorMessage,
  supplierDisplayName,
} from "../../../features/supplierClaims/supplierClaimHelpers";

export default function SupplierClaimsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [response, setResponse] = useState("");
  const [notice, setNotice] = useState(null);

  const listQuery = useQuery({
    queryKey: ["supplier-claims", status],
    queryFn: () => supplierClaimsApi.supplierList({ status }),
    staleTime: 10_000,
  });

  const detailQuery = useQuery({
    queryKey: ["supplier-claim-detail", selectedId],
    queryFn: () => supplierClaimsApi.supplierDetail(selectedId),
    enabled: !!selectedId,
  });

  const respondMut = useMutation({
    mutationFn: ({ claimId, action, responseText }) =>
      supplierClaimsApi.respond(claimId, {
        action,
        response: responseText,
      }),
    onSuccess: async () => {
      setNotice({ type: "success", text: "ตอบกลับเคลมสำเร็จ" });
      setResponse("");
      await qc.invalidateQueries({ queryKey: ["supplier-claims"] });
      await qc.invalidateQueries({ queryKey: ["supplier-claim-detail", selectedId] });
    },
    onError: (error) => {
      setNotice({ type: "error", text: getApiErrorMessage(error) });
    },
  });

  const rows = Array.isArray(listQuery.data) ? listQuery.data : [];
  const counts = useMemo(() => {
    return rows.reduce(
      (acc, claim) => {
        const key = (claim.status || "UNKNOWN").toUpperCase();
        acc[key] = (acc[key] || 0) + 1;
        acc.ALL += 1;
        return acc;
      },
      { ALL: 0 },
    );
  }, [rows]);
  const selectedClaim = detailQuery.data;

  function openDetail(claim) {
    setNotice(null);
    setResponse(claim.supplierResponse || "");
    setSelectedId(claim.id);
  }

  function respond(action) {
    if (!selectedClaim) return;

    if (selectedClaim.status !== "PENDING") {
      setNotice({
        type: "error",
        text: `ตอบกลับได้เฉพาะเคลมสถานะ PENDING เท่านั้น (สถานะปัจจุบัน: ${selectedClaim.status || "-"})`,
      });
      return;
    }

    const label = action === "APPROVE" ? "อนุมัติ" : "ปฏิเสธ";
    const ok = window.confirm(`ยืนยัน${label}เคลม #${selectedClaim.id}?`);
    if (ok) {
      setNotice(null);
      respondMut.mutate({
        claimId: selectedClaim.id,
        action,
        responseText: response,
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">เคลมจากแอดมิน</div>
          <div className="text-xs text-muted">
            ตรวจสอบสินค้าเคลม อนุมัติ ปฏิเสธ และตอบกลับให้แอดมิน
          </div>
        </div>

        <select
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {CLAIM_STATUSES.map((item) => (
            <option key={item.value || "ALL"} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {notice ? (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-sm",
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
        >
          {notice.text}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-5">
        <Metric label="ทั้งหมด" value={counts.ALL || 0} />
        <Metric label="รอตอบ" value={counts.PENDING || 0} />
        <Metric label="อนุมัติ" value={counts.APPROVED || 0} />
        <Metric label="ปฏิเสธ" value={counts.REJECTED || 0} />
        <Metric label="เสร็จสิ้น" value={counts.COMPLETED || 0} />
      </div>

      <Card className="p-5">
        {listQuery.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : listQuery.isError ? (
          <div className="text-sm text-rose-700">
            โหลดรายการเคลมไม่สำเร็จ ({getApiErrorMessage(listQuery.error)})
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="py-3 text-left font-medium">เลขเคลม</th>
                  <th className="py-3 text-left font-medium">สินค้า</th>
                  <th className="py-3 text-left font-medium">PO / Admin</th>
                  <th className="py-3 text-right font-medium">จำนวน</th>
                  <th className="py-3 text-right font-medium">ยอดเงิน</th>
                  <th className="py-3 text-left font-medium">สถานะ</th>
                  <th className="py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((claim) => (
                  <tr key={claim.id} className="border-b border-line align-top">
                    <td className="py-3">
                      <div className="font-medium">#{claim.id}</div>
                      <div className="text-xs text-muted">
                        {formatDateTime(claim.createdAt)}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="font-medium">{claim.productName || "-"}</div>
                      <div className="text-xs text-muted">
                        {claimTypeLabel(claim.claimType)}
                      </div>
                    </td>
                    <td className="py-3">
                      <div>{claim.poNumber || `PO-${claim.purchaseOrderId}`}</div>
                      <div className="text-xs text-muted">
                        {supplierDisplayName(claim.admin)}
                      </div>
                    </td>
                    <td className="py-3 text-right">{claim.quantity ?? "-"}</td>
                    <td className="py-3 text-right">
                      {formatClaimMoney(claim.refundAmount)}
                    </td>
                    <td className="py-3">
                      <ClaimStatusBadge status={claim.status} />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(claim)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                      >
                        <Eye size={15} />
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-muted">
                      ไม่พบรายการเคลม
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedId ? (
        <SupplierClaimDetailModal
          claim={selectedClaim}
          isLoading={detailQuery.isLoading}
          response={response}
          setResponse={setResponse}
          onClose={() => setSelectedId(null)}
          onApprove={() => respond("APPROVE")}
          onReject={() => respond("REJECT")}
          isWorking={respondMut.isPending}
        />
      ) : null}
    </div>
  );
}

function SupplierClaimDetailModal({
  claim,
  isLoading,
  response,
  setResponse,
  onClose,
  onApprove,
  onReject,
  isWorking,
}) {
  const isPending = claim?.status === "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-3xl rounded-xl border border-line bg-white shadow-soft">
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <div className="text-base font-semibold">
              {claim ? `เคลม #${claim.id}` : "รายละเอียดเคลม"}
            </div>
            <div className="text-xs text-muted">
              {claim ? `${claim.poNumber || `PO-${claim.purchaseOrderId}`} / ${formatDateTime(claim.createdAt)}` : "-"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line p-2 hover:bg-stone-50"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !claim ? (
          <div className="p-5 text-sm text-muted">กำลังโหลด...</div>
        ) : (
          <>
            <div className="space-y-5 p-5">
              <div className="grid gap-3 md:grid-cols-4">
                <InfoBox label="สถานะ" value={<ClaimStatusBadge status={claim.status} />} />
                <InfoBox label="ประเภท" value={claimTypeLabel(claim.claimType)} />
                <InfoBox label="จำนวน" value={`${claim.quantity ?? "-"} ชิ้น`} />
                <InfoBox label="ยอดเงิน" value={formatClaimMoney(claim.refundAmount)} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock
                  title="สินค้า"
                  lines={[claim.productName || "-", `ID: ${claim.productId || "-"}`]}
                />
                <InfoBlock
                  title="แอดมินผู้สร้างเคลม"
                  lines={[supplierDisplayName(claim.admin), claim.admin?.email || ""]}
                />
              </div>

              <TextBlock title="รายละเอียดจากแอดมิน" value={claim.description} />

              {claim.attachments?.length > 0 ? (
                <div>
                  <div className="mb-2 text-sm font-semibold">หลักฐานแนบ</div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {claim.attachments.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-xl border border-line bg-stone-50"
                      >
                        <img
                          src={url}
                          alt="claim attachment"
                          className="h-36 w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <label className="block space-y-2 text-sm">
                <span className="font-semibold">ข้อความตอบกลับ</span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm disabled:bg-stone-50"
                  value={response}
                  disabled={!isPending || isWorking}
                  placeholder="ระบุเงื่อนไขการอนุมัติ เหตุผลการปฏิเสธ หรือรายละเอียดการจัดส่งสินค้าเปลี่ยน"
                  onChange={(event) => setResponse(event.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 border-t border-line p-5 md:flex-row md:justify-end">
              {isPending ? (
                <>
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={onReject}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    ปฏิเสธเคลม
                  </button>
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={onApprove}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    อนุมัติเคลม
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line bg-white px-4 py-2 text-sm hover:bg-stone-50"
              >
                ปิด
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </Card>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function InfoBlock({ title, lines }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 space-y-1 text-sm text-muted">
        {lines.filter(Boolean).map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function TextBlock({ title, value }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="whitespace-pre-wrap rounded-xl border border-line bg-stone-50 p-4 text-sm">
        {value || "-"}
      </div>
    </div>
  );
}
