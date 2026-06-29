import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrdersApi } from "../../../api/adminOrders";
import { formatMoney } from "../../../utils/money";

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => adminOrdersApi.detail(orderId),
  });

  const o = q.data;

  // status update
  const [nextStatus, setNextStatus] = useState("PACKING");
  const statusMut = useMutation({
    mutationFn: () => adminOrdersApi.updateStatus(orderId, nextStatus),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-order-detail", orderId] });
      await qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  // shipment form
  const [carrier, setCarrier] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const shipMut = useMutation({
    mutationFn: () =>
      adminOrdersApi.upsertShipment(orderId, {
        carrier: carrier || null,
        trackingNo: trackingNo || null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-order-detail", orderId] });
    },
  });

  const canUpdateStatus = useMemo(() => {
    return !!nextStatus && !statusMut.isPending;
  }, [nextStatus, statusMut.isPending]);

  const canSaveShipment = useMemo(() => {
    return (carrier.trim() || trackingNo.trim()) && !shipMut.isPending;
  }, [carrier, trackingNo, shipMut.isPending]);

  // prefill shipment when loaded
  React.useEffect(() => {
    if (o?.shipment) {
      setCarrier(o.shipment.carrier || "");
      setTrackingNo(o.shipment.trackingNo || "");
    }
  }, [o?.shipment?.carrier, o?.shipment?.trackingNo]);

  return (
    <div className="space-y-4">
      {q.isLoading ? (
        <div className="text-sm text-muted">กำลังโหลด...</div>
      ) : q.isError ? (
        <div className="text-sm text-rose-700">โหลดออเดอร์ไม่สำเร็จ</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">
                รายละเอียดคำสั่งซื้อ — {o.orderNumber}
              </div>
              <div className="text-xs text-muted">
                ลูกค้า: {o.customer?.email || "-"} • สร้างเมื่อ:{" "}
                {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <OrderStatusBadge status={o.status} />
              <Link
                to="/admin/orders"
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
              >
                กลับไปหน้ารายการ
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat title="ยอดก่อนส่ง" value={formatMoney(o.subtotal)} />
            <Stat title="ค่าส่ง" value={formatMoney(o.shippingFee)} />
            <Stat title="ส่วนลด" value={formatMoney(o.discount)} />
            <Stat title="ยอดรวมสุทธิ" value={formatMoney(o.grandTotal)} />
          </div>

          {/* Items */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">รายการสินค้า</div>
                <div className="text-xs text-muted">สินค้าในคำสั่งซื้อ</div>
              </div>
              <Badge tone="gray">{(o.items || []).length} รายการ</Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">สินค้า</th>
                    <th className="py-3 text-right font-medium">จำนวน</th>
                    <th className="py-3 text-right font-medium">ราคา/ชิ้น</th>
                    <th className="py-3 text-right font-medium">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {(o.items || []).map((it) => (
                    <tr key={`${it.productId}`} className="border-b border-line">
                      <td className="py-3">{it.productName}</td>
                      <td className="py-3 text-right">{it.qty}</td>
                      <td className="py-3 text-right">{formatMoney(it.unitPrice)}</td>
                      <td className="py-3 text-right">{formatMoney(it.lineTotal)}</td>
                    </tr>
                  ))}

                  {(o.items || []).length === 0 && (
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

          {/* Update status */}
          <Card className="p-5">
            <div className="text-sm font-semibold">อัปเดตสถานะคำสั่งซื้อ</div>
            <div className="text-xs text-muted">เปลี่ยนสถานะตามขั้นตอนการจัดส่ง</div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div>
                <label className="text-xs text-muted">สถานะใหม่</label>
                <select
                  className="mt-1 rounded-xl border border-line bg-white px-2 py-1 text-sm"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                >
                  <option value="PACKING">PACKING (กำลังแพ็ก)</option>
                  <option value="SHIPPED">SHIPPED (จัดส่งแล้ว)</option>
                  <option value="DELIVERED">DELIVERED (ส่งสำเร็จ)</option>
                  <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
                </select>
              </div>

              <button
                disabled={!canUpdateStatus}
                onClick={() => statusMut.mutate()}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  canUpdateStatus
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {statusMut.isPending ? "กำลังอัปเดต..." : "อัปเดตสถานะ"}
              </button>

              {statusMut.isError ? (
                <div className="text-sm text-rose-700">อัปเดตสถานะไม่สำเร็จ</div>
              ) : null}
            </div>
          </Card>

          {/* Shipment */}
          <Card className="p-5">
            <div className="text-sm font-semibold">ข้อมูลการจัดส่ง</div>
            <div className="text-xs text-muted">ใส่ขนส่งและเลขติดตาม</div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs text-muted">ขนส่ง (Carrier)</label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="เช่น Kerry, Flash"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-muted">เลขติดตาม (Tracking No.)</label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  placeholder="TH123456..."
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                disabled={!canSaveShipment}
                onClick={() => shipMut.mutate()}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  canSaveShipment
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {shipMut.isPending ? "กำลังบันทึก..." : "บันทึกการจัดส่ง"}
              </button>

              {o.shipment ? (
                <div className="text-xs text-muted">
                  shippedAt: {o.shipment.shippedAt || "-"} • deliveredAt: {o.shipment.deliveredAt || "-"}
                </div>
              ) : (
                <div className="text-xs text-muted">ยังไม่มีข้อมูลการจัดส่ง</div>
              )}
            </div>

            {shipMut.isError ? (
              <div className="mt-2 text-sm text-rose-700">บันทึกการจัดส่งไม่สำเร็จ</div>
            ) : null}
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <Card className="p-5">
      <div className="text-xs text-muted">{title}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </Card>
  );
}

function OrderStatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  if (s === "PAID") return <Badge tone="blue">ชำระแล้ว</Badge>;
  if (s === "PACKING") return <Badge tone="yellow">กำลังแพ็ก</Badge>;
  if (s === "SHIPPED") return <Badge tone="blue">จัดส่งแล้ว</Badge>;
  if (s === "DELIVERED") return <Badge tone="green">สำเร็จ</Badge>;
  if (s === "CANCELLED") return <Badge tone="red">ยกเลิก</Badge>;
  return <Badge tone="gray">{s || "UNKNOWN"}</Badge>;
}