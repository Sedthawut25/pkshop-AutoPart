import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPoApi } from "../../../api/adminPo";

export default function AdminPoDetailPage() {
  const { poId } = useParams();
  const qc = useQueryClient();

  const poQuery = useQuery({
    queryKey: ["admin-po-detail", poId],
    queryFn: () => adminPoApi.get(poId),
  });

  const quoQuery = useQuery({
    queryKey: ["admin-po-quotations", poId],
    queryFn: () => adminPoApi.quotations(poId),
    enabled: !!poId,
  });

  const detail = poQuery.data;
  const po = detail?.po;
  const items = detail?.items || [];
  const quotations = quoQuery.data || [];

  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [targetUnitCost, setTargetUnitCost] = useState("");

  const addItemMut = useMutation({
    mutationFn: () =>
      adminPoApi.addItem(poId, {
        productId: Number(productId),
        qty: Number(qty),
        targetUnitCost: targetUnitCost === "" ? null : Number(targetUnitCost),
      }),
    onSuccess: async () => {
      setProductId("");
      setQty(1);
      setTargetUnitCost("");
      await qc.invalidateQueries({ queryKey: ["admin-po-detail", poId] });
    },
  });

  const sendMut = useMutation({
    mutationFn: () => adminPoApi.send(poId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-po-detail", poId] });
    },
  });

  const canAdd = useMemo(
    () => Number(productId) > 0 && Number(qty) > 0,
    [productId, qty],
  );
  const canSend = po?.status?.toUpperCase?.() === "DRAFT";

  return (
    <div className="space-y-4">
      {poQuery.isLoading ? (
        <div className="text-sm text-muted">กำลังโหลด...</div>
      ) : poQuery.isError ? (
        <div className="text-sm text-rose-700">
          โหลดรายละเอียดใบสั่งไม่สำเร็จ
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">
                รายละเอียดใบสั่งซื้อ — {po?.poNumber || `PO-${po?.id}`}
              </div>
              <div className="text-xs text-muted">
                ซัพพลายเออร์: {po?.supplier?.email || po?.supplier?.name || "-"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={po?.status} />
              <button
                disabled={!canSend || sendMut.isPending}
                onClick={() => sendMut.mutate()}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  canSend
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {sendMut.isPending ? "Sending..." : "ส่งใบสั่งซื้อ"}
              </button>
            </div>
          </div>

          {/* Items */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">รายการ</div>
                <div className="text-xs text-muted">คำขอใบสั่งซื้อสินค้า</div>
              </div>
              <Badge tone="gray">{items.length} รายการ</Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">สินค้า</th>
                    <th className="py-3 text-right font-medium">จำนวน</th>
                    <th className="py-3 text-right font-medium">
                      ต้นทุนต่อหน่วย
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-line">
                      <td className="py-3">
                        {it.product?.name || `#${it.product?.id || "-"}`}
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
                        ยังไม่มีรายการ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Add Item */}
          <Card className="p-5">
            <div className="text-sm font-semibold">เพิ่มรายการ</div>
            <div className="text-xs text-muted">เพิ่มสินค้าลงใบสั่งซื้อ</div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <input
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
                placeholder="รหัสสินค้า"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
              <input
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
                type="number"
                min={1}
                placeholder="Qty"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
              <input
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm md:col-span-2"
                placeholder="ต้นทุนต่อหน่วย"
                type="number"
                step="0.01"
                value={targetUnitCost}
                onChange={(e) => setTargetUnitCost(e.target.value)}
              />
            </div>

            <div className="mt-3">
              <button
                disabled={!canAdd || addItemMut.isPending}
                onClick={() => addItemMut.mutate()}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  canAdd
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {addItemMut.isPending ? "Adding..." : "เพิ่มรายการ"}
              </button>

              {addItemMut.isError ? (
                <div className="mt-2 text-sm text-rose-700">
                  เพิ่มรายการไม่สำเร็จ (check DTO fields:
                  productId/qty/targetUnitCost).
                </div>
              ) : null}
            </div>
          </Card>

          {/* Quotations */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">
                  ใบเสนอราคาจากซัพพลายเออร์
                </div>
                <div className="text-xs text-muted">
                  ใบเสนอราคาสำหรับใบสั่งซื้อถูกส่งไปแล้ว
                </div>
              </div>
              <Badge tone="blue">{quotations.length} ใบเสนอราคา</Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              {quoQuery.isLoading ? (
                <div className="text-sm text-muted">โหลดใบเสนอราคา...</div>
              ) : quoQuery.isError ? (
                <div className="text-sm text-rose-700">
                  โหลดใบเสนอราคาไม่สำเร็จ
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted">
                    <tr className="border-b border-line">
                      <th className="py-3 text-left font-medium">
                        หมายเลขใบสเสนอราคา
                      </th>
                      <th className="py-3 text-left font-medium">สถานะ</th>
                      <th className="py-3 text-right font-medium">วันที่</th>
                      <th className="py-3 text-left font-medium">สร้างขึ้น</th>
                      <th className="py-3 text-right font-medium">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((q) => (
                      <tr key={q.id} className="border-b border-line">
                        <td className="py-3">
                          {q.quotationNumber || `QT-${q.id}`}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={q.status} />
                        </td>
                        <td className="py-3 text-right">
                          {q.totalAmount ?? "-"}
                        </td>
                        <td className="py-3">{q.createdAt || "-"}</td>
                        <td className="py-3 text-right">
                          <Link 
                            to={`/admin/po/${poId}/quotations/${q.id}`}
                            className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {quotations.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-sm text-muted"
                        >
                          ไมมีใบเสนอราคาใดๆ
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
  const normalizedStatus = (status || "").toUpperCase();
  if (normalizedStatus === "DRAFT") return <Badge tone="gray">ฉบับร่าง</Badge>;
  if (normalizedStatus === "SENT") return <Badge tone="blue">ส่งแล้ว</Badge>;
  if (normalizedStatus === "PENDING")
    return <Badge tone="yellow">รอดำเนินการ</Badge>;
  if (normalizedStatus === "APPROVED")
    return <Badge tone="green">ได้รับการอนุมัติ</Badge>;
  if (normalizedStatus === "REJECTED") return <Badge tone="red">ปฏิเสธ</Badge>;
  return <Badge tone="gray">{status || "UNKNOWN"}</Badge>;
}
