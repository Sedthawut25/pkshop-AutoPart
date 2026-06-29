import React, { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminCommonApi } from "../../../api/adminCommon";
import { adminPoApi } from "../../../api/adminPo";
import { useNavigate } from "react-router-dom";

export default function AdminPoCreatePage() {
  const nav = useNavigate();

  const [supplierId, setSupplierId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");

  const [keyword, setKeyword] = useState("");
  const [poCart, setPoCart] = useState([]);

  const suppliersQ = useQuery({
    queryKey: ["admin-suppliers"],
    queryFn: () => adminCommonApi.suppliers(),
  });

  const productsQ = useQuery({
    queryKey: ["admin-products", keyword],
    queryFn: () => adminCommonApi.products(keyword),
    enabled: keyword.trim().length >= 2,
  });

  const createPoMut = useMutation({
    mutationFn: async () => {

        const po = await adminPoApi.create({
        supplierUserId: Number(supplierId),
        currency: (currency || "USD").trim(),
        notes: notes?.trim() || null,
      });

      for (const it of poCart) {
        await adminPoApi.addItem(po.id, {
          productId: it.productId,
          qty: it.qty,
          targetUnitCost: it.targetUnitCost === "" ? null : Number(it.targetUnitCost),
        });
      }

      return po;
    },
    onSuccess: (po) => {
      nav(`/admin/po/${po.id}`);
    },
  });

  const supplierList = suppliersQ.data || [];
  const productList = productsQ.data || [];

  const canCreate = useMemo(() => {
    return Number(supplierId) > 0 && poCart.length > 0 && !createPoMut.isPending;
  }, [supplierId, poCart, createPoMut.isPending]);

  function addToCart(prod) {
    setPoCart((prev) => {
      const exist = prev.find((x) => x.productId === prod.id);
      if (exist) {
        return prev.map((x) =>
          x.productId === prod.id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { productId: prod.id, name: prod.name, qty: 1, targetUnitCost: "" }];
    });
  }

  function updateCart(productId, patch) {
    setPoCart((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, ...patch } : x))
    );
  }

  function removeCart(productId) {
    setPoCart((prev) => prev.filter((x) => x.productId !== productId));
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">สร้างใบสั่งซื้อ</div>
        <div className="text-xs text-muted">
          เลือกซัพพลายเออร์ → เลือกสินค้า → สร้างใบสั่งซื้อ
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">1) ซัพพลายเออร์</div>
            <div className="text-xs text-muted">เลือกซัพพลายเออร์ที่จะได้รับใบสั่งซื้อนี้</div>
          </div>
          <Badge tone="gray">จำเป็นต้องกรอก</Badge>
        </div>

        <div className="mt-4">
          {suppliersQ.isLoading ? (
            <div className="text-sm text-muted">โหลดซัพพลายเออร์...</div>
          ) : suppliersQ.isError ? (
            <div className="text-sm text-rose-700">ไม่สามรถโหลดซัพพลายยเออร์ได้</div>
          ) : (
            <select
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">เลือกซัพพลายเออร์...</option>
              {supplierList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.email} (#{s.id})
                </option>
              ))}
            </select>
          )}

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">สหรัฐอเมริกา</option>
              <option value="THB">ไทย</option>
              <option value="CNY">จีน</option>
              <option value="JPY">ญี่ปุ่น</option>
            </select>

            <input
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm md:col-span-2"
              placeholder="หมายเหตุ"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Step 2 Products search */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">2) เพิ่มสินค้า</div>
            <div className="text-xs text-muted">ค้นหาและเพิ่มรายการลงใบสั่งซื้อ</div>
          </div>
          <Badge tone="blue">{poCart.length} เลือก</Badge>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm"
            placeholder="ค้นหาสินค้า..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <div className="text-xs text-muted">เคล็ดลับ: ค้นหาโดย ชื่อ / หน่วยสินค้า / แบรนด์</div>
        </div>

        <div className="mt-4">
          {keyword.trim().length < 2 ? (
            <div className="text-sm text-muted">พิมพ์อย่างน้อย 2 ตัวอักษร</div>
          ) : productsQ.isLoading ? (
            <div className="text-sm text-muted">กำลังค้นหา...</div>
          ) : productsQ.isError ? (
            <div className="text-sm text-rose-700">ไม่สารมารถค้นหาได้</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {productList.map((p) => (
                <div key={p.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="text-sm font-semibold line-clamp-1">{p.name}</div>
                  <div className="mt-1 text-xs text-muted">
                    Stock: {p.stockQty ?? "-"} • Price: {p.price ?? "-"}
                  </div>
                  <button
                    className="mt-3 w-full rounded-xl border border-line px-3 py-2 text-sm hover:bg-stone-50"
                    onClick={() => addToCart(p)}
                  >
                    เพิ่มใบสั่งซื้อ
                  </button>
                </div>
              ))}
              {productList.length === 0 && (
                <div className="text-sm text-muted">ไม่มีสินค้าใดๆ</div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Step 3 PO Cart */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">3) ตะกร้าใบสั่งซื้อ</div>
            <div className="text-xs text-muted">ตรวจสอบปรืมาณและต้นทุนเป้าหมายก่อนสร้าง</div>
          </div>
          <Badge tone="gray">ฉบับร่าง</Badge>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-3 text-left font-medium">สินค้า</th>
                <th className="py-3 text-right font-medium">จำนวน</th>
                <th className="py-3 text-right font-medium">ต้นทุนต่อหน่วย</th>
                <th className="py-3 text-right font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {poCart.map((it) => (
                <tr key={it.productId} className="border-b border-line">
                  <td className="py-3">
                    {it.name} (#{it.productId})
                  </td>
                  <td className="py-3 text-right">
                    <input
                      type="number"
                      min={1}
                      className="w-20 rounded-xl border border-line bg-white px-2 py-1 text-sm text-right"
                      value={it.qty}
                      onChange={(e) =>
                        updateCart(it.productId, { qty: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="py-3 text-right">
                    <input
                      type="number"
                      step="0.01"
                      className="w-32 rounded-xl border border-line bg-white px-2 py-1 text-sm text-right"
                      placeholder="optional"
                      value={it.targetUnitCost}
                      onChange={(e) =>
                        updateCart(it.productId, { targetUnitCost: e.target.value })
                      }
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                      onClick={() => removeCart(it.productId)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}

              {poCart.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-muted">
                    ไม่มีใบสั่งซื้อสินค้าในตระกร้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create Button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            disabled={!canCreate}
            onClick={() => createPoMut.mutate()}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              canCreate
                ? "bg-ink text-white hover:opacity-95"
                : "bg-stone-200 text-stone-500 cursor-not-allowed"
            }`}
          >
            {createPoMut.isPending ? "Creating..." : "สร้างใบสั่งซื้อ"}
          </button>

          {createPoMut.isError ? (
            <div className="text-sm text-rose-700">
              สร้างใบสั่งซื้อไม่สำเร็จ
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}