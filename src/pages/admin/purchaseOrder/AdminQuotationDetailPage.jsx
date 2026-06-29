import React from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPoApi } from "../../../api/adminPo";

export default function AdminQuotationDetailPage() {
  const { poId, quotationId } = useParams();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["admin-quotation-detail", poId, quotationId],
    queryFn: () => adminPoApi.quotationDetail(poId, quotationId),
  });

  const decideMut = useMutation({
    mutationFn: (action) =>
      adminPoApi.decideQuotation(poId, quotationId, action),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["admin-quotation-detail", poId, quotationId],
      });
      await qc.invalidateQueries({ queryKey: ["admin-po-detail", poId] });
      await qc.invalidateQueries({ queryKey: ["admin-po-quotations", poId] });
    },
  });

  const data = q.data;
  const items = data?.items || [];
  const status = (data?.status || "").toUpperCase();

  const canDecide = status === "SUBMITTED";

  return (
    <div className="space-y-4">
      {q.isLoading ? (
        <div className="text-sm text-muted">กำลังโหลดใบเสนอราคา...</div>
      ) : q.isError ? (
        <div className="text-sm text-rose-700">ไม่สามารถโหลดใบเสนอราคาได้</div>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">
                ใบเสนอราคา — {data.quotationNumber || `QT-${data.id}`}
              </div>
              <div className="text-xs text-muted">
                ใช้ได้จนถึง: {data.validUntil || "-"} • ซัพพลายเออร์:{" "}
                {data.supplierUser?.email || data.supplierUser?.name || "-"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                tone={
                  status === "ACCEPTED"
                    ? "green"
                    : status === "REJECTED"
                      ? "red"
                      : "yellow"
                }
              >
                {status || "UNKNOWN"}
              </Badge>

              <button
                disabled={!canDecide || decideMut.isPending}
                onClick={() => decideMut.mutate("ACCEPT")}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  canDecide
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                อนุมัติ
              </button>

              <button
                disabled={!canDecide || decideMut.isPending}
                onClick={() => decideMut.mutate("REJECT")}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  canDecide
                    ? "border border-line bg-white hover:bg-stone-50"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                ปฏิเสธ
              </button>

              <Link
                to={`/admin/import/from-quotation/${poId}/${quotationId}`}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  status === "ACCEPTED"
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                สร้างการนำเข้า
              </Link>

              <Link
                to={`/admin/po/${poId}`}
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
              >
                ย้อนกลับ
              </Link>
            </div>
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">รายการ</div>
                <div className="text-xs text-muted">
                  รายการที่ระบุในใบเสนอราคา
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
                    <th className="py-3 text-right font-medium">
                      ต้นทุนต่อหน่วยที่เสนอราคา
                    </th>
                    <th className="py-3 text-right font-medium">
                      ระยะเวลานำส่ง
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
                      <td className="py-3 text-right">{it.quotedUnitCost}</td>
                      <td className="py-3 text-right">
                        {it.leadTimeDays ?? "-"}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-sm text-muted"
                      >
                        ไม่มีรายการ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {decideMut.isError ? (
            <div className="text-sm text-rose-700">
              ระบบล้มเหลวโปรดตรวจสอบ backend endpoint
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
