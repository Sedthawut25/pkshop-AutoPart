import React, { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useQuery } from "@tanstack/react-query";
import { customsDocsApi } from "../../api/customsDocs";
import { Link } from "react-router-dom";

export default function CustomsDocumentsPage() {
  const [status, setStatus] = useState("UNDER_REVIEW");

  const params = useMemo(() => ({ status }), [status]);

  const q = useQuery({
    queryKey: ["customs-docs", params],
    queryFn: () => customsDocsApi.list(params),
  });

  const docs = q.data || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">เอกสารนำเข้า</div>
          <div className="text-xs text-muted">ตรวจสอบและอนุมัติ/ปฏิเสธเอกสารนำเข้า</div>
        </div>

        <select
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="UNDER_REVIEW">รอตรวจสอบ</option>
          <option value="APPROVED">อนุมัติแล้ว</option>
          <option value="REJECTED">ปฏิเสธแล้ว</option>
        </select>
      </div>

      <Card className="p-5">
        {q.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : q.isError ? (
          <div className="text-sm text-rose-700">โหลดเอกสารไม่สำเร็จ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="py-3 text-left font-medium">เลขที่เอกสาร</th>
                  <th className="py-3 text-left font-medium">ประเภท</th>
                  <th className="py-3 text-left font-medium">สถานะ</th>
                  <th className="py-3 text-left font-medium">วันที่ส่ง</th>
                  <th className="py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-b border-line">
                    <td className="py-3">{d.docNumber || `DOC-${d.id}`}</td>
                    <td className="py-3">{d.docType}</td>
                    <td className="py-3"><DocStatusBadge status={d.status} /></td>
                    <td className="py-3">{d.submittedAt || "-"}</td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/customs/documents/${d.id}`}
                        className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                      >
                        เปิดดู
                      </Link>
                    </td>
                  </tr>
                ))}

                {docs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-muted">
                      ไม่พบเอกสาร
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function DocStatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  if (s === "UNDER_REVIEW") return <Badge tone="yellow">รอตรวจสอบ</Badge>;
  if (s === "APPROVED") return <Badge tone="green">อนุมัติ</Badge>;
  if (s === "REJECTED") return <Badge tone="red">ปฏิเสธ</Badge>;
  return <Badge tone="gray">{s || "UNKNOWN"}</Badge>;
}