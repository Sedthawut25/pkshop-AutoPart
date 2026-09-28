import React, { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useQuery } from "@tanstack/react-query";
import { supplierPoApi } from "../../../api/supplierPo";
import { Link } from "react-router-dom";

export default function SupplierPoListPage() {
  const [status, setStatus] = useState("SENT");

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    return p;
  }, [status]);

  const q = useQuery({
    queryKey: ["supplier-po-list", params],
    queryFn: () => supplierPoApi.list(params),
  });

  const rows = Array.isArray(q.data) ? q.data : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">ใบสั่งซื้อที่ได้รับ</div>
          <div className="text-xs text-muted">
            เลือกรายการใบสั่งซื้อจากแอดมิน → ดูรายละเอียด → ทำใบเสนอราคา
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="SENT">ส่งแล้ว (SENT)</option>
            <option value="DRAFT">ฉบับร่าง (DRAFT)</option>
            <option value="QUOTED">เสนอราคาแล้ว (QUOTED)</option>
            <option value="CONFIRMED">ยืนยันแล้ว (CONFIRMED)</option>
            <option value="">ทุกสถานะ</option>
          </select>
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        {q.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : q.isError ? (
          <div className="text-sm text-rose-700">โหลดรายการไม่สำเร็จ</div>
        ) : (
          <div>
            {/* 📱 Mobile Card View */}
            <div className="md:hidden divide-y divide-line">
              {rows.map((po) => (
                <div key={po.id} className="p-4 space-y-3 bg-white">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-sm text-ink">{po.poNumber || `PO-${po.id}`}</div>
                      <div className="text-xs text-muted mt-0.5">{po.adminFullName || po.adminEmail || "Admin"}</div>
                    </div>
                    <StatusBadge status={po.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-muted">สกุลเงิน: <span className="font-semibold text-ink">{po.currency || "-"}</span></span>
                    <span className="text-stone-400">{po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "-"}</span>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Link
                      to={`/supplier/po/${po.id}`}
                      className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium hover:bg-stone-50"
                    >
                      ดูรายละเอียด →
                    </Link>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="py-8 text-center text-sm text-muted">ไม่พบรายการ</div>
              )}
            </div>

            {/* 💻 Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 px-3 text-left font-medium">เลข PO</th>
                    <th className="py-3 px-3 text-left font-medium">จากแอดมิน</th>
                    <th className="py-3 px-3 text-left font-medium">สถานะ</th>
                    <th className="py-3 px-3 text-left font-medium">สกุลเงิน</th>
                    <th className="py-3 px-3 text-left font-medium">วันที่สร้าง</th>
                    <th className="py-3 px-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((po) => (
                    <tr key={po.id} className="border-b border-line hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-medium">{po.poNumber || `PO-${po.id}`}</td>
                      <td className="py-3 px-3">
                        {po.adminFullName || po.adminEmail || "-"}
                        {po.adminEmail ? (
                          <div className="text-xs text-muted">{po.adminEmail}</div>
                        ) : null}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="py-3 px-3">{po.currency || "-"}</td>
                      <td className="py-3 px-3 text-stone-500">
                        {po.createdAt ? new Date(po.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/supplier/po/${po.id}`}
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
                        ไม่พบรายการ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
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