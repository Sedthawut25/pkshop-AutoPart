import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminImportApi } from "../../../api/adminImport";

export default function AdminImportLotDetailPage() {
  const { lotId } = useParams();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["admin-import-lot-detail", lotId],
    queryFn: () => adminImportApi.getLotDetail(lotId),
    enabled: !!lotId,
  });

  const detail = q.data; // { lot, items, documents }
  const lot = detail?.lot;
  const items = detail?.items || [];
  const docs = detail?.documents || [];

  const status = (lot?.status || "").toUpperCase();

  // ✅ รวมค่าสินค้าในล็อต (sum lineCost)
  const goodsTotal = useMemo(() => {
    return (items || []).reduce((sum, it) => sum + Number(it?.lineCost || 0), 0);
  }, [items]);

  // receive
  const [arrivalDate, setArrivalDate] = useState("");

  const receiveMut = useMutation({
    mutationFn: () =>
      adminImportApi.receiveLot(lotId, {
        arrivalDate,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-import-lot-detail", lotId] });
      await qc.invalidateQueries({ queryKey: ["admin-import-lots"] });
    },
  });

  const canReceive = useMemo(() => {
    return status === "CUSTOMS_APPROVED" && arrivalDate && !receiveMut.isPending;
  }, [status, arrivalDate, receiveMut.isPending]);

  // ✅ Total import cost จาก backend (ถ้ามี)
  const totalImportCost =
    lot?.totalImportCost != null ? Number(lot.totalImportCost) : null;

  return (
    <div className="space-y-4">
      {q.isLoading ? (
        <div className="text-sm text-muted">กำลังโหลด...</div>
      ) : q.isError ? (
        <div className="text-sm text-rose-700">โหลดรายละเอียดล็อตไม่สำเร็จ</div>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">
                รายละเอียดล็อต — {lot?.lotNumber || `LOT-${lot?.id}`}
              </div>
              <div className="text-xs text-muted">
                PO: {lot?.purchaseOrder?.poNumber || `PO-${lot?.purchaseOrder?.id || "-"}`} •
                Shipping: {lot?.shippingMethod || "-"} • Origin: {lot?.originCountry || "-"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={status} />
              <Link
                to="/admin/import/lots"
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
              >
                กลับไปหน้ารายการ
              </Link>
            </div>
          </div>

          {/* Lot Cost Summary */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">ต้นทุนการนำเข้า</div>
                <div className="text-xs text-muted">สรุปค่าใช้จ่ายของล็อตนี้</div>
              </div>

              <div className="flex items-center gap-2">
                <Badge tone="blue">รวมค่าสินค้า: {goodsTotal.toLocaleString()}</Badge>
                <Badge tone="gray">
                  Total Import: {totalImportCost != null ? totalImportCost.toLocaleString() : "-"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <Info label="Freight" value={lot?.freightCost} />
              <Info label="Insurance" value={lot?.insuranceCost} />
              <Info label="Customs Duty" value={lot?.customsDutyCost} />
              <Info label="Other" value={lot?.otherCost} />
            </div>
          </Card>

          {/* Items */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">รายการสินค้าในล็อต</div>
                <div className="text-xs text-muted">จำนวนและต้นทุนต่อหน่วย</div>
              </div>
              <Badge tone="blue">{items.length} รายการ</Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">สินค้า</th>
                    <th className="py-3 text-right font-medium">จำนวน</th>
                    <th className="py-3 text-right font-medium">ต้นทุน/หน่วย</th>
                    <th className="py-3 text-right font-medium">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-line">
                      <td className="py-3">{it.product?.name || `#${it.product?.id || "-"}`}</td>
                      <td className="py-3 text-right">{it.qty}</td>
                      <td className="py-3 text-right">{Number(it.unitCost || 0).toLocaleString()}</td>
                      <td className="py-3 text-right">{Number(it.lineCost || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted">
                        ไม่มีรายการสินค้า
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* ✅ footer รวม */}
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-3 text-right text-sm font-semibold">
                      รวมค่าสินค้าในล็อต
                    </td>
                    <td className="py-3 text-right text-sm font-semibold">
                      {goodsTotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">เอกสารนำเข้า</div>
                <div className="text-xs text-muted">สถานะเอกสารที่ส่งศุลกากร</div>
              </div>
              <Badge tone="gray">{docs.length} เอกสาร</Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">Doc No.</th>
                    <th className="py-3 text-left font-medium">Type</th>
                    <th className="py-3 text-left font-medium">Status</th>
                    <th className="py-3 text-left font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-b border-line">
                      <td className="py-3">{d.docNumber || `DOC-${d.id}`}</td>
                      <td className="py-3">{d.docType}</td>
                      <td className="py-3">{d.status}</td>
                      <td className="py-3">{d.submittedAt || "-"}</td>
                    </tr>
                  ))}
                  {docs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted">
                        ยังไม่มีเอกสาร
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Receive Lot */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">รับสินค้าเข้าโกดัง</div>
                <div className="text-xs text-muted">
                  ทำได้เมื่อศุลกากรอนุมัติ (CUSTOMS_APPROVED) แล้วเท่านั้น
                </div>
              </div>
              <Badge tone={status === "CUSTOMS_APPROVED" ? "green" : "gray"}>
                {status === "CUSTOMS_APPROVED" ? "พร้อมรับเข้า" : "รออนุมัติ"}
              </Badge>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div>
                <label className="text-xs text-muted">Arrival Date</label>
                <input
                  type="date"
                  className="mt-1 rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                />
              </div>

              <button
                disabled={!canReceive}
                onClick={() => receiveMut.mutate()}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  canReceive
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {receiveMut.isPending ? "กำลังรับเข้า..." : "รับเข้าโกดัง"}
              </button>

              {receiveMut.isError ? (
                <div className="text-sm text-rose-700">
                  รับเข้าไม่สำเร็จ — ตรวจสอบว่า status เป็น CUSTOMS_APPROVED หรือไม่
                </div>
              ) : null}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-sm font-semibold">{value ?? "-"}</div>
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