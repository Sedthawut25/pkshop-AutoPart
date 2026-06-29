import React, { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SalesLineChart from "../../components/charts/SalesLineChart";
import { dashboardApi } from "../../api/adminDashboard";
import { useQuery } from "@tanstack/react-query";
import { formatMoney } from "../../utils/money";

export default function DashboardPage() {
  // 1. สร้าง State สำหรับเก็บวันที่ (ถ้าค่าว่าง Backend จะใช้ Default ย้อนหลัง 30 วันที่เพิ่งเขียนไป)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [granularity, setGranularity] = useState("DAILY");

  // 2. จัดกลุ่ม Params ให้ง่ายเวลาส่งเข้า API
  const dateParams = useMemo(() => {
    const params = {};
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    return params;
  }, [fromDate, toDate]);

  const seriesParams = useMemo(() => {
    return { ...dateParams, granularity };
  }, [dateParams, granularity]);

  // 3. ผูก params เข้ากับ queryKey เพื่อให้ React Query ยิง API ใหม่เวลามีการเปลี่ยนวันที่
  const summaryQ = useQuery({
    queryKey: ["dash-summary", dateParams],
    queryFn: () => dashboardApi.summary(dateParams),
  });

  const seriesQ = useQuery({
    queryKey: ["dash-series", seriesParams],
    queryFn: () => dashboardApi.salesSeries(seriesParams),
  });

  const bestQ = useQuery({
    queryKey: ["dash-best", dateParams],
    queryFn: () =>
      dashboardApi.bestSellers({
        ...dateParams,
        limit: 8,
      }),
  });

  // สินค้าคงค้าง (Dead Stock) ไม่เกี่ยวกับวันที่เริ่ม-สิ้นสุด เลยไม่ต้องแนบ dateParams ไปครับ
  const deadQ = useQuery({
    queryKey: ["dash-dead"],
    queryFn: () =>
      dashboardApi.deadStock({
        days: 60,
        limit: 8,
      }),
  });

  const summary = summaryQ.data?.data;
  const series = seriesQ.data?.data;
  const best = bestQ.data?.data || [];
  const dead = deadQ.data?.data || [];

  return (
    <div className="space-y-6">
      {/* 4. ปรับ UI ด้านบนให้มีช่องเลือกวันที่ (Date Picker) */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="text-lg font-bold">แดชบอร์ด</div>

        <div className="flex flex-wrap items-center gap-3">
          {/* ตัวกรองวันที่ (Date Picker) */}
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 text-sm shadow-sm">
            <span className="text-muted">ตั้งแต่</span>
            <input
              type="date"
              className="bg-transparent text-stone-700 outline-none"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <span className="text-muted">ถึง</span>
            <input
              type="date"
              className="bg-transparent text-stone-700 outline-none"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            {/* ปุ่มเคลียร์วันที่กลับไปเป็นค่าเริ่มต้น (30 วัน) */}
            {(fromDate || toDate) && (
              <button
                className="ml-2 text-xs text-rose-500 hover:text-rose-700"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                ล้างค่า
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-line hidden xl:block"></div>

          {/* ปุ่มรายวัน / รายเดือน (คงเดิม) */}
          <div className="flex items-center gap-2">
            <button
              className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                granularity === "DAILY"
                  ? "border-line bg-stone-100 font-medium"
                  : "border-line bg-white text-muted hover:bg-stone-50"
              }`}
              onClick={() => setGranularity("DAILY")}
            >
              รายวัน
            </button>

            <button
              className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                granularity === "MONTHLY"
                  ? "border-line bg-stone-100 font-medium"
                  : "border-line bg-white text-muted hover:bg-stone-50"
              }`}
              onClick={() => setGranularity("MONTHLY")}
            >
              รายเดือน
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="รายได้ (Revenue)"
          value={formatMoney(summary?.revenueTotal || 0)}
        />

        <StatCard
          title="รายจ่ายนำเข้า"
          value={formatMoney(summary?.importExpenseTotal || 0)}
          badge="ซื้อสินค้าเข้า"
        />

        <StatCard
          title="ต้นทุนขาย (COGS)"
          value={formatMoney(summary?.cogsTotal || 0)}
        />

        <StatCard
          title="กำไรขั้นต้น"
          value={formatMoney(summary?.grossProfit || 0)}
        />

        <StatCard
          title="รอจัดส่ง"
          value={summary?.ordersPendingShipmentCount || 0}
          badge="คำสั่งซื้อ"
        />
      </div>

      {/* IMPORT STATUS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="เอกสารรอตรวจศุลกากร"
          value={summary?.customsDocsUnderReviewCount || 0}
          badge="แจ้งเตือน"
        />

        <StatCard
          title="เอกสารถูกปฏิเสธ"
          value={summary?.customsDocsRejectedCount || 0}
          badge="ตรวจสอบ"
        />

        <StatCard
          title="ล็อตพร้อมรับเข้าโกดัง"
          value={summary?.lotsReadyToReceiveCount || 0}
          badge="ดำเนินการ"
        />
      </div>

      {/* CHART + BEST SELLERS */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* CHART */}
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">
                แนวโน้มการขาย
              </div>

              <div className="text-xs text-muted">
                รายได้ตามช่วงเวลาที่เลือก
              </div>
            </div>

            <Badge tone="blue">{granularity}</Badge>
          </div>

          <div className="mt-4">
            <SalesLineChart points={series?.points || []} />
          </div>
        </Card>

        {/* BEST SELLERS */}
        <Card className="p-5">
          <div className="text-sm font-semibold">
            สินค้าขายดี
          </div>

          <div className="text-xs text-muted">
            สินค้าขายดีอันดับต้นๆ (ตามช่วงเวลา)
          </div>

          <div className="mt-4 space-y-3">
            {best.map((x) => (
              <div
                key={x.productId}
                className="flex items-start justify-between"
              >
                <div>
                  <div className="text-sm font-medium">
                    {x.productName}
                  </div>

                  <div className="text-xs text-muted">
                    จำนวนที่ขายออก: {x.qtySold} ชิ้น
                  </div>
                </div>

                <div className="text-sm">
                  {formatMoney(x.revenue)}
                </div>
              </div>
            ))}

            {best.length === 0 && (
              <div className="text-sm text-muted">
                ไม่มีข้อมูลในช่วงเวลานี้
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* DEAD STOCK */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">
              สินค้าค้างจำหน่าย
            </div>

            <div className="text-xs text-muted">
              สินค้าที่ไม่มีการขายนาน
            </div>
          </div>

          <Badge tone="yellow">60+ days</Badge>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-3 text-left font-medium">
                  สินค้า
                </th>

                <th className="py-3 text-right font-medium">
                  สต็อก
                </th>

                <th className="py-3 text-right font-medium">
                  จำนวนวันตั้งแต่ขายล่าสุด
                </th>
              </tr>
            </thead>

            <tbody>
              {dead.map((x) => (
                <tr
                  key={x.productId}
                  className="border-b border-line"
                >
                  <td className="py-3">
                    {x.productName}
                  </td>

                  <td className="py-3 text-right">
                    {x.stockQty}
                  </td>

                  <td className="py-3 text-right">
                    {x.daysSinceLastSale === -1
                      ? <span className="text-rose-500">ไม่มีการขาย</span>
                      : `${x.daysSinceLastSale} วัน`
                    } 
                  </td>
                </tr>
              ))}

              {dead.length === 0 && (
                <tr>
                  <td
                    className="py-4 text-muted"
                    colSpan={3}
                  >
                    ไม่พบสินค้าคงค้าง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LOADING */}
      {(summaryQ.isLoading ||
        seriesQ.isLoading ||
        bestQ.isLoading ||
        deadQ.isLoading) && (
        <div className="text-sm text-muted">
          กำลังโหลดข้อมูลแดชบอร์ด...
        </div>
      )}

      {/* ERROR */}
      {(summaryQ.isError ||
        seriesQ.isError ||
        bestQ.isError ||
        deadQ.isError) && (
        <div className="text-sm text-rose-700">
          พบข้อผิดพลาดในการโหลดข้อมูล
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, badge }) {
  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted">
          {title}
        </div>

        {badge ? (
          <Badge tone="gray">
            {badge}
          </Badge>
        ) : null}
      </div>

      <div className="mt-2 text-xl font-semibold break-words">
        {value}
      </div>
    </Card>
  );
}