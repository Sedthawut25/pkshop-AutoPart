import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminPoApi } from "../../../api/adminPo";
import { adminImportApi } from "../../../api/adminImport";

export default function AdminImportFromQuotationPage() {
  const { poId, quotationId } = useParams();
  const nav = useNavigate();

  const quotationQ = useQuery({
    queryKey: ["admin-quotation-detail", poId, quotationId],
    queryFn: () => adminPoApi.quotationDetail(poId, quotationId),
    enabled: !!poId && !!quotationId,
  });

  const quotation = quotationQ.data;
  const items = quotation?.items || [];

  // ✅ รวมค่าสินค้า (จากใบเสนอราคา)
  const goodsTotal = useMemo(() => {
    return (items || []).reduce((sum, it) => {
      const unit = Number(it?.quotedUnitCost || 0);
      const qty = Number(it?.qty || 0);
      return sum + unit * qty;
    }, 0);
  }, [items]);

  // form
  const [originCountry, setOriginCountry] = useState("Thailand");
  const [shippingMethod, setShippingMethod] = useState("SEA");
  const [freightCost, setFreightCost] = useState("0");
  const [insuranceCost, setInsuranceCost] = useState("0");
  const [customsDutyCost, setCustomsDutyCost] = useState("0");
  const [otherCost, setOtherCost] = useState("0");

  // ✅ รวมต้นทุนทั้งหมด (ค่าสินค้า + ค่าใช้จ่าย)
  const importTotal = useMemo(() => {
    const f = Number(freightCost || 0);
    const ins = Number(insuranceCost || 0);
    const duty = Number(customsDutyCost || 0);
    const other = Number(otherCost || 0);
    return goodsTotal + f + ins + duty + other;
  }, [goodsTotal, freightCost, insuranceCost, customsDutyCost, otherCost]);

  const createFlowMut = useMutation({
    mutationFn: async () => {
      const lot = await adminImportApi.createLot({
        purchaseOrderId: Number(poId),
        supplierQuotationId: Number(quotationId),
        originCountry: originCountry?.trim() || null,
        shippingMethod: shippingMethod,
        freightCost: Number(freightCost || 0),
        insuranceCost: Number(insuranceCost || 0),
        customsDutyCost: Number(customsDutyCost || 0),
        otherCost: Number(otherCost || 0),
      });

      for (const it of items) {
        await adminImportApi.addLotItem(lot.id, {
          productId: it.product?.id,
          qty: it.qty,
          unitCost: Number(it.quotedUnitCost),
        });
      }

      const doc = await adminImportApi.createDoc(lot.id, { docType: "E_IMPORT" });
      await adminImportApi.submitDoc(doc.id);

      return { lot, doc };
    },
    onSuccess: ({ lot }) => {
      // ✅ แนะนำพากลับไป lot detail เลย จะเห็นยอดรวม
      nav(`/admin/import/lots/${lot.id}`, { replace: true });
    },
  });

  const canCreate = useMemo(() => {
    return (
      items.length > 0 &&
      !createFlowMut.isPending &&
      shippingMethod &&
      freightCost !== "" &&
      insuranceCost !== "" &&
      customsDutyCost !== "" &&
      otherCost !== ""
    );
  }, [
    items.length,
    createFlowMut.isPending,
    shippingMethod,
    freightCost,
    insuranceCost,
    customsDutyCost,
    otherCost,
  ]);

  const status = (quotation?.status || "").toUpperCase();

  return (
    <div className="space-y-4">
      {quotationQ.isLoading ? (
        <div className="text-sm text-muted">กำลังโหลดใบเสนอราคา...</div>
      ) : quotationQ.isError ? (
        <div className="text-sm text-rose-700">ไม่สามารถโหลดใบเสนอราคาได้</div>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">สร้างการนำเข้า</div>
              <div className="text-xs text-muted">
                จากใบเสนอราคา: {quotation?.quotationNumber || `QT-${quotation?.id}`} • PO #{poId}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone={status === "ACCEPTED" ? "green" : "yellow"}>{status || "UNKNOWN"}</Badge>

              <Link
                to={`/admin/po/${poId}/quotations/${quotationId}`}
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
              >
                กลับ
              </Link>
            </div>
          </div>

          {status !== "ACCEPTED" ? (
            <Card className="p-5">
              <div className="text-sm text-rose-700">ต้องยอมรับใบเสนอราคาก่อน</div>
            </Card>
          ) : null}

          {/* Items preview */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">รายการ (จากใบเสนอราคา)</div>
                <div className="text-xs text-muted">รวมค่าสินค้าเพื่อใช้คำนวณค่าขนส่ง/ภาษี</div>
              </div>

              <div className="flex items-center gap-2">
                <Badge tone="gray">{items.length} รายการ</Badge>
                <Badge tone="blue">รวมค่าสินค้า: {goodsTotal.toLocaleString()}</Badge>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">สินค้า</th>
                    <th className="py-3 text-right font-medium">จำนวน</th>
                    <th className="py-3 text-right font-medium">ต้นทุนต่อหน่วย</th>
                    <th className="py-3 text-right font-medium">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const unit = Number(it?.quotedUnitCost || 0);
                    const qty = Number(it?.qty || 0);
                    const line = unit * qty;
                    const key = it?.id ?? it?.product?.id ?? idx;

                    return (
                      <tr key={key} className="border-b border-line">
                        <td className="py-3">{it.product?.name || `#${it.product?.id || "-"}`}</td>
                        <td className="py-3 text-right">{qty}</td>
                        <td className="py-3 text-right">{unit.toLocaleString()}</td>
                        <td className="py-3 text-right">{line.toLocaleString()}</td>
                      </tr>
                    );
                  })}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted">
                        ไม่มีรายการ
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-3 text-right text-sm font-semibold">
                      รวมค่าสินค้าทั้งหมด
                    </td>
                    <td className="py-3 text-right text-sm font-semibold">
                      {goodsTotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Import cost form */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">ค่าใช้จ่ายในการนำเข้าและขนส่ง</div>
                <div className="text-xs text-muted">ระบบคำนวณ “รวมต้นทุนนำเข้า” ให้อัตโนมัติ</div>
              </div>
              <Badge tone="green">รวมต้นทุนนำเข้า: {importTotal.toLocaleString()}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="text-xs text-muted">ประเทศต้นทาง</label>
                <input
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted">วิธีการจัดส่ง</label>
                <select
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                >
                  <option value="SEA">เรือ</option>
                  <option value="AIR">เครื่องบิน</option>
                  <option value="LAND">พื้นดิน</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted">ค่าขนส่ง</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={freightCost}
                  onChange={(e) => setFreightCost(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted">ค่าประกันภัย</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={insuranceCost}
                  onChange={(e) => setInsuranceCost(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted">ภาษีศุลกากร</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={customsDutyCost}
                  onChange={(e) => setCustomsDutyCost(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted">ค่าใช้จ่ายอื่นๆ</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                disabled={!canCreate || status !== "ACCEPTED"}
                onClick={() => createFlowMut.mutate()}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  canCreate && status === "ACCEPTED"
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {createFlowMut.isPending ? "Creating..." : "Create Lot + Submit to Customs"}
              </button>

              {createFlowMut.isError ? (
                <div className="text-sm text-rose-700">
                  Create failed — ตรวจสอบ backend endpoints, token/role, และ DTO
                </div>
              ) : null}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}