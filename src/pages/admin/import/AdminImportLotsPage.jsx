import React, { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useQuery } from "@tanstack/react-query";
import { adminImportApi } from "../../../api/adminImport";
import { Link } from "react-router-dom";

export default function AdminImportLotsPage() {
  const [status, setStatus] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (status.trim()) p.status = status.trim();
    return p;
  }, [status]);

  const q = useQuery({
    queryKey: ["admin-import-lots", params],
    queryFn: () => adminImportApi.listLots(params),
  });

  const lots = q.data || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">รายการนำเข้า</div>
          <div className="text-xs text-muted">
            ติดตามสถานะล็อตนำเข้า: เอกสาร → ศุลกากร → รับเข้าโกดัง
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">ทุกสถานะ</option>
            <option value="DRAFT">DRAFT</option>
            <option value="DOC_SENT">DOC_SENT</option>
            <option value="CUSTOMS_PENDING">CUSTOMS_PENDING</option>
            <option value="CUSTOMS_APPROVED">CUSTOMS_APPROVED</option>
            <option value="CUSTOMS_REJECTED">CUSTOMS_REJECTED</option>
            <option value="RECEIVED">RECEIVED</option>
          </select>
        </div>
      </div>

      <Card className="p-5">
        {q.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : q.isError ? (
          <div className="text-sm text-rose-700">โหลดรายการนำเข้าไม่สำเร็จ</div>
        ) : (
          <div>
            {/* 📱 Mobile Card View */}
            <div className="md:hidden divide-y divide-line">
              {lots.map((lot) => (
                <div key={lot.id} className="p-4 space-y-3 bg-white">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-sm text-ink">{lot.lotNumber || `LOT-${lot.id}`}</div>
                      <div className="text-xs text-muted mt-0.5">PO: {lot.purchaseOrder?.poNumber || `PO-${lot.purchaseOrder?.id || "-"}`}</div>
                    </div>
                    <StatusBadge status={lot.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-muted">ต้นทุนรวม:</span>
                    <span className="font-bold text-ink">฿ {Number(lot.totalImportCost || 0).toLocaleString()}</span>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Link
                      to={`/admin/import/lots/${lot.id}`}
                      className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium hover:bg-stone-50"
                    >
                      ดูรายละเอียด →
                    </Link>
                  </div>
                </div>
              ))}
              {lots.length === 0 && (
                <div className="py-8 text-center text-sm text-muted">ไม่พบรายการนำเข้า</div>
              )}
            </div>

            {/* 💻 Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[650px] text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 px-3 text-left font-medium">Lot No.</th>
                    <th className="py-3 px-3 text-left font-medium">PO</th>
                    <th className="py-3 px-3 text-left font-medium">สถานะ</th>
                    <th className="py-3 px-3 text-right font-medium">ต้นทุนรวม</th>
                    <th className="py-3 px-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => (
                    <tr key={lot.id} className="border-b border-line hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-medium">{lot.lotNumber || `LOT-${lot.id}`}</td>
                      <td className="py-3 px-3">{lot.purchaseOrder?.poNumber || `PO-${lot.purchaseOrder?.id || "-"}`}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={lot.status} />
                      </td>
                      <td className="py-3 px-3 text-right font-semibold">
                        {lot.totalImportCost ? `฿ ${Number(lot.totalImportCost).toLocaleString()}` : "-"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/admin/import/lots/${lot.id}`}
                          className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50 transition"
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {lots.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-muted">
                        ไม่พบรายการนำเข้า
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
  if (s === "CUSTOMS_APPROVED") return <Badge tone="green">CUSTOMS_APPROVED</Badge>;
  if (s === "CUSTOMS_REJECTED") return <Badge tone="red">CUSTOMS_REJECTED</Badge>;
  if (s === "CUSTOMS_PENDING") return <Badge tone="yellow">CUSTOMS_PENDING</Badge>;
  if (s === "RECEIVED") return <Badge tone="blue">RECEIVED</Badge>;
  return <Badge tone="gray">{s || "UNKNOWN"}</Badge>;
}