import React, { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { supplierPoApi } from "../../../api/supplierPo";

export default function SupplierPoDetailPage() {
  const { poId } = useParams();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["supplier-po-detail", poId],
    queryFn: () => supplierPoApi.detail(poId),
    enabled: !!poId,
  });

  const detail = q.data;
  const po = detail?.po;
  const items = detail?.items || [];

  const [validUntil, setValidUntil] = useState("");
  const [quoteRows, setQuoteRows] = useState({});

  const canSubmit = useMemo(() => {
    if (!poId) return false;
    if (!items || items.length === 0) return false;

    for (const it of items) {
      const productId = it.productId;
      const row = quoteRows[productId];
      const cost = Number(row?.quotedUnitCost);
      if (!row || !isFinite(cost) || cost <= 0) return false;
    }
    return true;
  }, [poId, items, quoteRows]);

  const submitMut = useMutation({
    mutationFn: () => {
      const payload = {
        validUntil: validUntil || null,
        items: items.map((it) => ({
          productId: it.productId,
          qty: it.qty,
          quotedUnitCost: Number(quoteRows[it.productId]?.quotedUnitCost),
          leadTimeDays: quoteRows[it.productId]?.leadTimeDays
            ? Number(quoteRows[it.productId]?.leadTimeDays)
            : null,
        })),
      };
      return supplierPoApi.createQuotation(poId, payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["supplier-po-detail", poId] });
      await qc.invalidateQueries({
        queryKey: ["supplier-po-quotations", poId],
      });
      alert("ส่งใบเสนอราคาเรียบร้อย ✅");
    },
  });

  const quoQ = useQuery({
    queryKey: ["supplier-po-quotations", poId],
    queryFn: () => supplierPoApi.quotations(poId),
    enabled: !!poId,
  });

  const quotations = quoQ.data || [];

  function setRow(productId, patch) {
    setQuoteRows((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), ...patch },
    }));
  }

  const adminText = po?.adminFullName || po?.adminEmail || "-";

  return (
    <div className="space-y-4">
      {q.isLoading ? (
        <div className="text-sm text-muted">กำลังโหลด...</div>
      ) : q.isError ? (
        <div className="text-sm text-rose-700">โหลดรายละเอียดไม่สำเร็จ</div>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <div className="flex items-center gap-2">
              <Link
                to="/supplier/po"
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
              >
                กลับ
              </Link>
            </div>
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">รายการสินค้าใน PO</div>
                <div className="text-xs text-muted">
                  ตรวจสอบจำนวน/ต้นทุนเป้าหมาย (ถ้ามี)
                </div>
              </div>
              <Badge tone="gray">{items.length} รายการ</Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">สินค้า</th>
                    <th className="py-3 text-right font-medium">จำนวน</th>
                    <th className="py-3 text-right font-medium">Target Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-line">
                      <td className="py-3">
                        <div className="font-medium">
                          {it.productName || "-"}
                        </div>
                        <div className="text-xs text-muted">
                          {it.sku || "-"} • #{it.productId || "-"}
                        </div>
                      </td>
                      <td className="py-3 text-right">{it.qty}</td>
                      <td className="py-3 text-right">
                        {it.targetUnitCost ?? "-"}
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 text-center text-sm text-muted"
                      >
                        ไม่มีรายการสินค้า
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-semibold">ทำใบเสนอราคา</div>
            <div className="text-xs text-muted">
              ใส่ราคาต่อชิ้นและระยะเวลาจัดส่ง แล้วกด “ส่งใบเสนอราคา”
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs text-muted">
                  วันหมดอายุใบเสนอราคา (ไม่บังคับ)
                </div>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">สินค้า</th>
                    <th className="py-3 text-right font-medium">จำนวน</th>
                    <th className="py-3 text-right font-medium">
                      ราคาต่อชิ้น*
                    </th>
                    <th className="py-3 text-right font-medium">
                      Lead Time (วัน)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.productId} className="border-b border-line">
                      <td className="py-3">{it.productName}</td>
                      <td className="py-3 text-right">{it.qty}</td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-32 rounded-xl border border-line bg-white px-2 py-1 text-sm text-right"
                          value={quoteRows[it.productId]?.quotedUnitCost ?? ""}
                          onChange={(e) =>
                            setRow(it.productId, {
                              quotedUnitCost: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          min="0"
                          className="w-28 rounded-xl border border-line bg-white px-2 py-1 text-sm text-right"
                          value={quoteRows[it.productId]?.leadTimeDays ?? ""}
                          onChange={(e) =>
                            setRow(it.productId, {
                              leadTimeDays: e.target.value,
                            })
                          }
                          placeholder="-"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
              <button
                disabled={!canSubmit || submitMut.isPending}
                onClick={() => submitMut.mutate()}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  canSubmit
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {submitMut.isPending ? "กำลังส่ง..." : "ส่งใบเสนอราคา"}
              </button>

              {submitMut.isError ? (
                <div className="text-sm text-rose-700">
                  ส่งใบเสนอราคาไม่สำเร็จ
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">
                  ใบเสนอราคาที่ส่งแล้ว
                </div>
                <div className="text-xs text-muted">
                  รายการใบเสนอราคาของ PO นี้
                </div>
              </div>
              <Badge tone="blue">{quotations.length} ใบ</Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              {quoQ.isLoading ? (
                <div className="text-sm text-muted">กำลังโหลด...</div>
              ) : quoQ.isError ? (
                <div className="text-sm text-rose-700">
                  โหลดใบเสนอราคาไม่สำเร็จ
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted">
                    <tr className="border-b border-line">
                      <th className="py-3 text-left font-medium">
                        เลขใบเสนอราคา
                      </th>
                      <th className="py-3 text-left font-medium">สถานะ</th>
                      <th className="py-3 text-left font-medium">หมดอายุ</th>
                      <th className="py-3 text-left font-medium">สร้างเมื่อ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((qq) => (
                      <tr key={qq.id} className="border-b border-line">
                        <td className="py-3">
                          {qq.quotationNumber || `QT-${qq.id}`}
                        </td>
                        <td className="py-3">
                          <QuoteStatusBadge status={qq.status} />
                        </td>
                        <td className="py-3">{qq.validUntil || "-"}</td>
                        <td className="py-3">
                          {qq.createdAt
                            ? new Date(qq.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                    {quotations.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-sm text-muted"
                        >
                          ยังไม่มีใบเสนอราคา
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  if (s === "SENT") return <Badge tone="blue">ส่งแล้ว</Badge>;
  if (s === "DRAFT") return <Badge tone="gray">ร่าง</Badge>;
  if (s === "QUOTED") return <Badge tone="yellow">เสนอราคาแล้ว</Badge>;
  if (s === "CONFIRMED") return <Badge tone="green">ยืนยันแล้ว</Badge>;
  return <Badge tone="gray">{s || "UNKNOWN"}</Badge>;
}

function QuoteStatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  if (s === "SUBMITTED") return <Badge tone="blue">ส่งแล้ว</Badge>;
  if (s === "ACCEPTED") return <Badge tone="green">ยอมรับแล้ว</Badge>;
  if (s === "REJECTED") return <Badge tone="red">ปฏิเสธ</Badge>;
  return <Badge tone="gray">{s || "UNKNOWN"}</Badge>;
}
