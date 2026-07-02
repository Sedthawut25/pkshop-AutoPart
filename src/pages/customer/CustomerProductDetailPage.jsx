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

  // ดึงข้อมูลและแยก state ออกมาให้ชัดเจน
  const { data: p, isLoading, isError } = useQuery({
    queryKey: ["customer-product-detail", id],
    queryFn: () => customerProductsApi.detail(id),
    enabled: !!id,
  });

  const stock = Number(p?.stockQty || 0);

  const canAdd = useMemo(
    () => stock > 0 && qty > 0 && qty <= stock,
    [stock, qty]
  );

  // จัดการการพิมพ์ตัวเลขในช่องจำนวน
  const handleQtyChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setQty(val);
    } else {
      setQty(""); // ยอมให้ลบช่องว่างชั่วคราวได้
    }
  };

  // จัดการกรณีคลิกออกจากช่องกรอกจำนวน
  const handleQtyBlur = () => {
    if (qty === "" || qty < 1) setQty(1);
    if (qty > stock) setQty(stock);
  };

  // 1. จัดการหน้า Loading และ Error ให้จบตั้งแต่ตรงนี้ (โค้ดจะสะอาดขึ้นมาก)
  if (isLoading) return <div className="text-sm text-muted">กำลังโหลด...</div>;
  if (isError || !p) return <div className="text-sm text-rose-700">โหลดสินค้าไม่สำเร็จ หรือไม่พบข้อมูล</div>;

  // 2. Render หน้าสินค้าหลัก (ไม่ต้องใส่ ? หลัง p แล้วเพราะเช็กไปแล้วด้านบน)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">
            {p.name || `สินค้า #${p.id}`}
          </div>
          <div className="text-sm text-muted">
            SKU: {p.sku || "-"} • คงเหลือ: {stock}
          </div>
        </div>
        <Link
          to="/customer/shop"
          className="rounded-2xl border border-line bg-white px-4 py-2 text-sm hover:bg-stone-50 transition"
        >
          กลับ
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* คอลัมน์ซ้าย: รูปภาพ */}
        <div className="lg:col-span-6">
          <img
            src={p.imageUrl || "https://via.placeholder.com/900x675?text=PKSHOP"}
            alt={p.name || "Product Thumbnail"}
            className="h-auto w-full rounded-3xl object-cover bg-white border border-line"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/900x675?text=No+Image";
            }}
          />
        </div>

        {/* คอลัมน์ขวา: รายละเอียดและตะกร้า */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            
            {/* ส่วนราคา */}
            <div className="text-sm text-muted">ราคา</div>
            <div className="mt-1 text-3xl font-semibold text-ink">
              ฿ {Number(p.price || 0).toLocaleString()}
            </div>

            {/* 🟢 ส่วนรายละเอียดสินค้า (Description) ที่เพิ่มเข้ามาใหม่ */}
            {p.description && (
              <div className="mt-6 pt-5 border-t border-line">
                <div className="text-sm font-semibold text-ink mb-2">รายละเอียดสินค้า</div>
                {/* ใช้ whitespace-pre-wrap เพื่อให้แสดงการเคาะบรรทัด (Enter) จากหลังบ้านได้อย่างถูกต้อง */}
                <div className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
                  {p.description}
                </div>
              </div>
            )}

            {/* ส่วนเลือกจำนวนและปุ่มเพิ่มเข้าตะกร้า */}
            <div className="mt-6 pt-5 border-t border-line flex flex-col sm:flex-row sm:items-end gap-3">
              <div>
                <div className="text-xs text-muted mb-1.5">จำนวน</div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm hover:bg-stone-50 transition"
                    onClick={() => setQty((x) => Math.max(1, (Number(x) || 1) - 1))}
                  >
                    -
                  </button>
                  <input
                    value={qty}
                    onChange={handleQtyChange}
                    onBlur={handleQtyBlur}
                    className="w-20 rounded-xl border border-line px-3 py-2.5 text-center text-sm focus:outline-none focus:border-ink transition"
                    type="number"
                    min={1}
                    max={stock || 1}
                  />
                  <button
                    className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm hover:bg-stone-50 transition"
                    onClick={() => setQty((x) => Math.min(stock || 1, (Number(x) || 0) + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                disabled={!canAdd}
                onClick={() => {
                  add(
                    {
                      productId: p.id,
                      productName: p.name,
                      unitPrice: Number(p.price || 0),
                      stockQty: stock,
                      imageUrl: p.imageUrl,
                    },
                    Number(qty) || 1
                  );
                  nav("/customer/cart");
                }}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  canAdd
                    ? "bg-ink text-white hover:opacity-90 shadow-sm"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                {stock > 0 ? "เพิ่มเข้าตะกร้า" : "สินค้าหมด"}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}