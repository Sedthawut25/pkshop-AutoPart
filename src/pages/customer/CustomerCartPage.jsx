// src/pages/customer/CustomerCartPage.jsx
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";

export default function CustomerCartPage() {
  const nav = useNavigate();
  const { items, setQty, remove, summary } = useCart();

  const rows = Array.isArray(items) ? items : [];
  const subtotal = summary?.subtotal || 0;

  const canCheckout = useMemo(() => rows.length > 0, [rows.length]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-semibold">ตะกร้าสินค้า</div>
        <div className="mt-2 text-sm text-muted">ตรวจสอบจำนวนและยอดรวมก่อนชำระเงิน</div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        {rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted">
            ตะกร้าว่าง • <Link className="underline" to="/customer/shop">ไปเลือกสินค้า</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="py-3 text-left font-medium">สินค้า</th>
                  <th className="py-3 text-right font-medium">ราคา</th>
                  <th className="py-3 text-right font-medium">จำนวน</th>
                  <th className="py-3 text-right font-medium">รวม</th>
                  <th className="py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((it) => {
                  // 🟢 ดักจับชื่อตัวแปรเผื่อใช้ของเก่า (name, price) หรือของใหม่จาก Backend (productName, unitPrice)
                  const currentName = it.productName || it.name || "ไม่มีชื่อสินค้า";
                  const currentPrice = Number(it.unitPrice || it.price || 0);
                  const line = currentPrice * Number(it.qty || 0);

                  return (
                    <tr key={it.productId} className="border-b border-line">
                      <td className="py-3">
                        <div className="font-semibold">{currentName}</div>
                        <div className="text-xs text-muted">#{it.productId}</div>
                      </td>
                      <td className="py-3 text-right">฿ {currentPrice.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          min={1}
                          className="w-24 rounded-xl border border-line px-2 py-1 text-right text-sm"
                          value={it.qty}
                          onChange={(e) => setQty(it.productId, e.target.value)}
                        />
                      </td>
                      <td className="py-3 text-right">฿ {line.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <button
                          className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                          onClick={() => remove(it.productId)}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <div className="text-right">
                <div className="text-sm text-muted">Subtotal</div>
                <div className="text-2xl font-semibold">฿ {subtotal.toLocaleString()}</div>
              </div>

              <button
                disabled={!canCheckout}
                onClick={() => nav("/customer/checkout")}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
                  canCheckout ? "bg-black text-white hover:opacity-95" : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                ไปชำระเงิน
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}