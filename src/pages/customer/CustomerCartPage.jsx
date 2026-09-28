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
          <>
            <div>
              {/* 📱 Mobile Item List */}
              <div className="md:hidden divide-y divide-line">
                {rows.map((it) => {
                  const currentName = it.productName || it.name || "ไม่มีชื่อสินค้า";
                  const currentPrice = Number(it.unitPrice || it.price || 0);
                  const line = currentPrice * Number(it.qty || 0);

                  return (
                    <div key={it.productId} className="py-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm text-ink">{currentName}</div>
                          <div className="text-xs text-muted">SKU/ID: #{it.productId}</div>
                          <div className="text-xs font-medium text-stone-600 mt-1">฿ {currentPrice.toLocaleString()} / ชิ้น</div>
                        </div>
                        <button
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-100"
                          onClick={() => remove(it.productId)}
                        >
                          ลบ
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">จำนวน:</span>
                          <input
                            type="number"
                            min={1}
                            className="w-16 rounded-lg border border-line bg-white px-2 py-1 text-center text-sm font-semibold"
                            value={it.qty}
                            onChange={(e) => setQty(it.productId, e.target.value)}
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted block">รวม</span>
                          <span className="text-sm font-bold text-ink">฿ {line.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 💻 Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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
                      const currentName = it.productName || it.name || "ไม่มีชื่อสินค้า";
                      const currentPrice = Number(it.unitPrice || it.price || 0);
                      const line = currentPrice * Number(it.qty || 0);

                      return (
                        <tr key={it.productId} className="border-b border-line hover:bg-stone-50/50">
                          <td className="py-3">
                            <div className="font-semibold text-ink">{currentName}</div>
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
                          <td className="py-3 text-right font-semibold">฿ {line.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <button
                              className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50 text-rose-600 transition"
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
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <div className="text-right">
                <div className="text-sm text-muted">Subtotal</div>
                <div className="text-2xl font-semibold">฿ {subtotal.toLocaleString()}</div>
              </div>

              <button
                disabled={!canCheckout}
                onClick={() => nav("/customer/checkout")}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold ${canCheckout ? "bg-black text-white hover:opacity-95" : "bg-stone-200 text-stone-500 cursor-not-allowed"
                  }`}
              >
                ไปชำระเงิน
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}