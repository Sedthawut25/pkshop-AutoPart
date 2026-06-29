import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import { adminPoApi } from "../../../api/adminPo";

export default function AdminPoListPage() {
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");

  const params = useMemo(() => {
    const buildParams = {};
    if (status.trim()) buildParams.status = status.trim();
    if (keyword.trim()) buildParams.keyword = keyword.trim();
    return buildParams;
  }, [status, keyword]);

  const poListQuery = useQuery({
    queryKey: ["admin-po-list", params],
    queryFn: () => adminPoApi.list(params),
    staleTime: 10_000,
  });

  const rows = poListQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">ใบสั่งซื้อ</div>
          <div className="text-xs text-muted">
            จัดการวงจรใบสั่งซื้อ: สร้าง → เพิ่มรายการ → ส่ง → รับใบเสนอราคา
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">ทุกสถานะ</option>
            <option value="SENT">ส่งแล้ว</option>
            <option value="DRAFT">ฉบับร่าง</option>
            <option value="QUOTED">ได้รับใบเสนอราคา</option>
            <option value="CONFIRMED">ได้รับการอนุมัติ</option>
          </select>

          <input
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            placeholder="ค้นหาหมายเลขใบสั่งซื้อ"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Link
            to="/admin/po/new"
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
          >
            สร้างใบสั่งซื้อ
          </Link>
        </div>
      </div>

      <Card className="p-5">
        {poListQuery.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : poListQuery.isError ? (
          <div className="text-sm text-rose-700">
            โหลดรายการสั่งซื้อไม่สำเร็จ{" "}
            <span className="text-muted">
              ({poListQuery.error?.message || "unknown error"})
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="py-3 text-left font-medium">
                    หมายเลขใบสั่งซื้อ
                  </th>
                  <th className="py-3 text-left font-medium">ซัพพลายเออร์</th>
                  <th className="py-3 text-left font-medium">สถานะ</th>
                  <th className="py-3 text-right font-medium">รายการ</th>
                  <th className="py-3 text-right font-medium">การดำเนินการ</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((po) => (
                  <tr key={po.id} className="border-b border-line">
                    <td className="py-3">{po.poNumber || `PO-${po.id}`}</td>

                    <td className="py-3">
                      {po.supplierUser?.email ||
                        po.supplierUser?.fullName ||
                        po.supplierUser?.name ||
                        "-"}
                    </td>

                    <td className="py-3">
                      <StatusBadge status={po.status} />
                    </td>

                    <td className="py-3 text-right">
                      {po.totalItems ?? po.itemsCount ?? "-"}
                    </td>

                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/po/${po.id}`}
                        className="inline-flex rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-sm text-muted"
                    >
                      ไม่พบใบสั่งซื้อ
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

function Badge({ tone = "gray", children }) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : tone === "yellow"
        ? "bg-yellow-50 text-yellow-800 border-yellow-200"
        : tone === "green"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-stone-50 text-stone-700 border-stone-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${toneClass}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();

  if (s === "DRAFT") return <Badge tone="gray">ฉบับร่าง</Badge>;
  if (s === "SENT") return <Badge tone="blue">ส่งแล้ว</Badge>;
  if (s === "QUOTED") return <Badge tone="yellow">เสนอราคาแล้ว</Badge>;
  if (s === "CONFIRMED") return <Badge tone="green">ได้รับการอนุมัติ</Badge>;

  return <Badge tone="gray">{status || "UNKNOWN"}</Badge>;
}
