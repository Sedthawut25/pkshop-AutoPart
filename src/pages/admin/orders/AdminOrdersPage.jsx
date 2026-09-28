import React, { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useQuery } from "@tanstack/react-query";
import { adminOrdersApi } from "../../../api/adminOrders";
import { Link } from "react-router-dom";
import { formatMoney } from "../../../utils/money";

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const size = 20;

  const params = useMemo(() => {
    const p = { page, size };
    if (status.trim()) p.status = status.trim();
    if (keyword.trim()) p.keyword = keyword.trim();
    return p;
  }, [status, keyword, page]);

  const q = useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => adminOrdersApi.list(params),
  });

  const pageData = q.data; // Page<AdminOrderListItemResponse>
  const rows = pageData?.content || [];
  const totalPages = pageData?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">คำสั่งซื้อ (ลูกค้า)</div>
          <div className="text-xs text-muted">จัดการสถานะคำสั่งซื้อและติดตามการจัดส่ง</div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">ทุกสถานะ</option>
            <option value="PAID">ชำระแล้ว (PAID)</option>
            <option value="PACKING">กำลังแพ็ก (PACKING)</option>
            <option value="SHIPPED">จัดส่งแล้ว (SHIPPED)</option>
            <option value="DELIVERED">สำเร็จ (DELIVERED)</option>
            <option value="CANCELLED">ยกเลิก (CANCELLED)</option>
          </select>

          <input
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            placeholder="ค้นหาเลขออเดอร์..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      <Card className="p-5">
        {q.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : q.isError ? (
          <div className="text-sm text-rose-700">โหลดคำสั่งซื้อไม่สำเร็จ</div>
        ) : (
          <>
            {/* 📱 Mobile Card View */}
            <div className="md:hidden divide-y divide-line">
              {rows.map((o) => (
                <div key={o.orderId} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-ink">{o.orderNumber}</div>
                      <div className="text-xs text-muted mt-0.5">{o.fullName || "-"}</div>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-muted">ยอดรวม: <span className="font-bold text-ink">{formatMoney(o.grandTotal)}</span></span>
                    <span className="text-muted">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</span>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Link
                      to={`/admin/orders/${o.orderId}`}
                      className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium hover:bg-stone-50"
                    >
                      ดูรายละเอียด →
                    </Link>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="py-8 text-center text-sm text-muted">ไม่พบคำสั่งซื้อ</div>
              )}
            </div>

            {/* 💻 Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 px-3 text-left font-medium">เลขออเดอร์</th>
                    <th className="py-3 px-3 text-left font-medium">ลูกค้า</th>
                    <th className="py-3 px-3 text-left font-medium">สถานะ</th>
                    <th className="py-3 px-3 text-right font-medium">ยอดรวม</th>
                    <th className="py-3 px-3 text-left font-medium">วันที่สร้าง</th>
                    <th className="py-3 px-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.orderId} className="border-b border-line hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-medium">{o.orderNumber}</td>
                      <td className="py-3 px-3">{o.fullName || "-"}</td>
                      <td className="py-3 px-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="py-3 px-3 text-right font-semibold">{formatMoney(o.grandTotal)}</td>
                      <td className="py-3 px-3 text-stone-500">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/admin/orders/${o.orderId}`}
                          className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50 transition"
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-muted">
                        ไม่พบคำสั่งซื้อ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-muted">
                หน้า {page + 1} / {totalPages}
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-50"
                  disabled={page <= 0}
                  onClick={() => setPage((x) => x - 1)}
                >
                  ก่อนหน้า
                </button>
                <button
                  className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-50"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((x) => x + 1)}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
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