import React, { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customsDocsApi } from "../../api/customsDocs";
import { api } from "../../api/axios";
import { Link, useParams } from "react-router-dom";

const unwrap = (res) => res.data?.data ?? res.data;

function fmtDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

function fmtMoney(v) {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (!isFinite(n)) return String(v);
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function CustomsDocumentDetailPage() {
  const { docId } = useParams();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["customs-doc", docId],
    queryFn: () => api.get(`/api/customs/import-documents/${docId}/detail`).then(unwrap),
    enabled: !!docId,
  });

  const [comment, setComment] = useState("");

  const approveMut = useMutation({
    mutationFn: () => customsDocsApi.approve(docId, comment || "Approved"),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customs-doc", docId] });
      await qc.invalidateQueries({ queryKey: ["customs-docs"] });
    },
  });

  const rejectMut = useMutation({
    mutationFn: () => customsDocsApi.reject(docId, comment || "Rejected"),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customs-doc", docId] });
      await qc.invalidateQueries({ queryKey: ["customs-docs"] });
    },
  });

  const doc = q.data || {};
  const status = (doc?.status || "").toUpperCase();
  const canDecide = status === "UNDER_REVIEW";

  // ✅ รองรับได้ทั้งโครงสร้างใหม่/เก่า
  const lot =
    doc?.lotInfo ||
    doc?.importLot ||
    doc?.lot ||
    {
      id: doc?.lotId,
      lotNumber: doc?.lotNumber,
      shippingMethod: doc?.shippingMethod,
      originCountry: doc?.originCountry,
      totalImportCost: doc?.totalImportCost,
    };

  const submitter =
    doc?.submittedByInfo ||
    doc?.submittedBy ||
    doc?.submitter ||
    {
      id: doc?.submittedById,
      email: doc?.submittedByEmail,
      fullName: doc?.submittedByFullName,
    };

  const items = Array.isArray(doc?.items) ? doc.items : [];

  const goodsTotal = useMemo(() => {
    // ถ้า backend ส่ง total มาแล้ว ใช้เลย
    if (doc?.goodsTotal !== undefined && doc?.goodsTotal !== null) return Number(doc.goodsTotal) || 0;
    if (doc?.totalGoodsCost !== undefined && doc?.totalGoodsCost !== null) return Number(doc.totalGoodsCost) || 0;

    // ไม่งั้นรวมจาก items
    return items.reduce((sum, it) => {
      const line = it?.lineCost ?? it?.lineTotal;
      const n = Number(line);
      if (isFinite(n)) return sum + n;
      const unit = Number(it?.unitCost ?? 0);
      const qty = Number(it?.qty ?? 0);
      return sum + unit * qty;
    }, 0);
  }, [doc, items]);

  return (
    <div className="space-y-4">
      {q.isLoading ? (
        <div className="text-sm text-muted">กำลังโหลด...</div>
      ) : q.isError ? (
        <div className="text-sm text-rose-700">โหลดเอกสารไม่สำเร็จ</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">รายละเอียดเอกสาร</div>
              <div className="text-xs text-muted">
                {doc?.docNumber || `DOC-${doc?.id}`} • {doc?.docType || "-"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                tone={
                  status === "APPROVED"
                    ? "green"
                    : status === "REJECTED"
                    ? "red"
                    : "yellow"
                }
              >
                {status === "UNDER_REVIEW" ? "รอตรวจสอบ" : status || "UNKNOWN"}
              </Badge>

              <Link
                to="/customs/documents"
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
              >
                กลับ
              </Link>
            </div>
          </div>

          {/* Info */}
          <Card className="p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Info label="Lot ID" value={lot?.id ?? "-"} />
              <Info label="เลข Lot" value={lot?.lotNumber ?? "-"} />

              <Info label="ผู้ส่ง (Admin)" value={submitter?.fullName ?? submitter?.email ?? "-"} />
              <Info label="อีเมลผู้ส่ง" value={submitter?.email ?? "-"} />

              <Info label="สถานะ" value={doc?.status ?? "-"} />
              <Info label="วันที่ส่ง" value={fmtDate(doc?.submittedAt)} />

              <Info label="ประเทศต้นทาง" value={lot?.originCountry ?? "-"} />
              <Info label="รุปแบบการขนส่ง" value={lot?.shippingMethod ?? "-"} />

              <Info label="รวมค่าสินค้า" value={fmtMoney(goodsTotal)} />
              <Info label="รวมต้นทุนนำเข้า" value={fmtMoney(lot?.totalImportCost)} />
            </div>
          </Card>

          {/* Items */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">รายละเอียดสินค้าในเอกสาร</div>
                <div className="text-xs text-muted">จำนวนและต้นทุนต่อหน่วย (จากล็อตนำเข้า)</div>
              </div>
              <Badge tone="gray">{items.length} รายการ</Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">สินค้า</th>
                    <th className="py-3 text-right font-medium">จำนวน</th>
                    <th className="py-3 text-right font-medium">ต้นทุน/หน่วย</th>
                    <th className="py-3 text-right font-medium">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const line = it?.lineCost ?? it?.lineTotal;
                    const unit = it?.unitCost ?? it?.quotedUnitCost;
                    return (
                      <tr key={it.productId ?? it.id} className="border-b border-line">
                        <td className="py-3">{it.productName ?? "-"}</td>
                        <td className="py-3 text-right">{it.qty ?? "-"}</td>
                        <td className="py-3 text-right">{fmtMoney(unit)}</td>
                        <td className="py-3 text-right">{fmtMoney(line)}</td>
                      </tr>
                    );
                  })}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted">
                        ไม่มีรายการสินค้า
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Decision */}
          <Card className="p-5">
            <div className="text-sm font-semibold">ความเห็นเจ้าหน้าที่</div>
            <div className="text-xs text-muted">ระบุเหตุผลเมื่อปฏิเสธ หรือหมายเหตุเมื่ออนุมัติ</div>

            <textarea
              className="mt-3 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              rows={4}
              placeholder="ใส่หมายเหตุ..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <button
                disabled={!canDecide || approveMut.isPending}
                onClick={() => approveMut.mutate()}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  canDecide
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {approveMut.isPending ? "กำลังอนุมัติ..." : "อนุมัติ"}
              </button>

              <button
                disabled={!canDecide || rejectMut.isPending}
                onClick={() => rejectMut.mutate()}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  canDecide
                    ? "border border-line bg-white hover:bg-stone-50"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {rejectMut.isPending ? "กำลังปฏิเสธ..." : "ปฏิเสธ"}
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-sm font-semibold">{value ?? "-"}</div>
    </div>
  );
}