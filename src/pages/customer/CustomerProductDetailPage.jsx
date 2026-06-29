// src/pages/customer/CustomerProductDetailPage.jsx
import React, { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customerProductsApi } from "../../api/customerProduct";
import { useCart } from "./cart/CartContext";

export default function CustomerProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const q = useQuery({
    queryKey: ["customer-product-detail", id],
    queryFn: () => customerProductsApi.detail(id),
    enabled: !!id,
  });

  const p = q.data ?? {};
  const stock = Number(p.stockQty ?? 0);
  const canAdd = useMemo(
    () => stock > 0 && qty > 0 && qty <= stock,
    [stock, qty],
  );

  return (
    <div className="space-y-4">
      {q.isLoading ? (
        <div className="text-sm text-muted">กำลังโหลด...</div>
      ) : q.isError ? (
        <div className="text-sm text-rose-700">โหลดสินค้าไม่สำเร็จ</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold">
                {p?.name || `สินค้า #${p?.id}`}
              </div>
              <div className="text-sm text-muted">
                SKU: {p?.sku || "-"} • คงเหลือ: {stock}
              </div>
            </div>
            <Link
              to="/customer/shop"
              className="rounded-2xl border border-line bg-white px-4 py-2 text-sm hover:bg-stone-50"
            >
              กลับ
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <img
                src={
                  p?.imageUrl ||
                  "https://via.placeholder.com/900x675?text=PKSHOP"
                }
                alt={p?.name || "product"}
                className="h-auto w-full rounded-3xl object-cover bg-stone-50"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/900x675?text=No+Image";
                }}
              />
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-line bg-white p-6">
                <div className="text-sm text-muted">ราคา</div>
                <div className="mt-1 text-3xl font-semibold">
                  ฿ {Number(p?.price || 0).toLocaleString()}
                </div>

                <div className="mt-6 flex items-end gap-3">
                  <div>
                    <div className="text-xs text-muted">จำนวน</div>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        className="rounded-xl border border-line px-3 py-2 text-sm hover:bg-stone-50"
                        onClick={() => setQty((x) => Math.max(1, x - 1))}
                      >
                        -
                      </button>
                      <input
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value || 1))}
                        className="w-20 rounded-xl border border-line px-3 py-2 text-center text-sm"
                        type="number"
                        min={1}
                        max={stock || 1}
                      />
                      <button
                        className="rounded-xl border border-line px-3 py-2 text-sm hover:bg-stone-50"
                        onClick={() =>
                          setQty((x) => Math.min(stock || x + 1, x + 1))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    disabled={!canAdd}
                    onClick={() => {
                      // 🟢 แก้ไข: เปลี่ยนชื่อ Key ให้ตรงกับที่ตะกร้าต้องการ (ตรงกับ Backend ด้วย)
                      add(
                        {
                          productId: p.id,
                          productName: p.name, 
                          unitPrice: Number(p.price || 0), 
                          stockQty: stock,
                          imageUrl: p.imageUrl,
                        },
                        qty,
                      );
                      nav("/customer/cart");
                    }}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${
                      canAdd
                        ? "bg-black text-white hover:opacity-95"
                        : "bg-stone-200 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    เพิ่มเข้าตะกร้า
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}