// src/pages/customer/CustomerProductDetailPage.jsx
import React, { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customerProductsApi } from "../../api/customerProduct";
import ProductCard from "../../components/customer/ProductCard";
import { useCart } from "./cart/CartContext";
import { ArrowLeft, Check, Minus, Package, Plus, ShieldCheck } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { authStorage } from "../../utils/authStorage";

export default function CustomerProductDetailPage() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
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

  const relatedCategoryId = p?.category?.id ?? p?.categoryId;
  const relatedCategoryName = p?.category?.name ?? p?.categoryName;
  const relatedBrandId = p?.brandId ?? p?.productBrand?.id ?? p?.productBrandId;
  const recommendationParams = useMemo(() => {
    if (relatedCategoryId != null) {
      return { categoryId: Number(relatedCategoryId), page: 0, size: 8 };
    }
    if (relatedBrandId != null) {
      return { brandId: Number(relatedBrandId), page: 0, size: 8 };
    }
    if (relatedCategoryName) {
      return { page: 0, size: 1000 };
    }
    return null;
  }, [relatedCategoryId, relatedBrandId, relatedCategoryName]);

  const recommendationsQ = useQuery({
    queryKey: ["customer-product-recommendations", recommendationParams],
    queryFn: () => customerProductsApi.list(recommendationParams),
    enabled: !!recommendationParams,
  });

  const recommendations = (recommendationsQ.data?.content || recommendationsQ.data || [])
    .filter((product) => product.id !== p?.id)
    .filter((product) => {
      if (relatedCategoryId != null || relatedBrandId != null) return true;
      return product.categoryName === relatedCategoryName;
    })
    .slice(0, 4);

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

  if (isLoading) {
    return (
      <div className="grid min-h-[520px] place-items-center rounded-[2rem] border border-line bg-white">
        <div className="text-sm text-muted">กำลังโหลดรายละเอียดสินค้า...</div>
      </div>
    );
  }

  if (isError || !p) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center">
        <div className="text-sm font-semibold text-rose-700">โหลดสินค้าไม่สำเร็จ หรือไม่พบข้อมูล</div>
        <Link to="/customer/shop" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-800 hover:underline">
          <ArrowLeft size={16} /> กลับไปหน้าสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 sm:space-y-5">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden text-sm text-muted">
          <Link to="/customer" className="hover:text-ink">หน้าหลัก</Link>
          <span>/</span>
          <Link to="/customer/shop" className="hover:text-ink">สินค้า</Link>
          <span>/</span>
            <span className="truncate text-ink">รายละเอียด</span>
        </div>
        <Link
          to="/customer/shop"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-stone-50 sm:w-auto"
        >
          <ArrowLeft size={16} /> กลับ
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-[0_20px_60px_-35px_rgba(28,25,23,0.45)] sm:rounded-[2rem]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[290px] bg-stone-100 p-3 sm:min-h-[360px] sm:p-7 lg:min-h-[620px]">
            <div className="absolute left-5 top-5 z-10 inline-flex max-w-[calc(100%-2.5rem)] items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur sm:left-7 sm:top-7">
              <Package size={14} /> อะไหล่รถยนต์แท้คุณภาพ
            </div>
              <div className="flex h-full min-h-[260px] items-center justify-center overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white/70 p-3 sm:min-h-[330px] sm:rounded-[1.5rem] sm:p-8">
          <img
            src={
              p.imageUrl &&
              p.imageUrl !== "https://cloudinary.com" &&
              p.imageUrl !== "http://cloudinary.com" &&
              p.imageUrl !== "https://cloudinary.com/"
                ? p.imageUrl
                : "https://placehold.co/600x400?text=PKSHOP"
            }
            alt={p.name}
            className="max-h-[360px] w-full object-contain mix-blend-multiply transition duration-500 hover:scale-[1.02] sm:max-h-[540px]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
            }}
          />
            </div>
          </div>

          <div className="flex min-w-0 flex-col p-5 sm:p-9 lg:p-12">
              <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stock > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                {stock > 0 ? "มีสินค้า" : "สินค้าหมด"}
              </span>
              <span className="text-xs font-medium text-muted">SKU: {p.sku || "-"}</span>
            </div>

            <h1 className="mt-5 break-words text-2xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                {p.name || `สินค้า #${p.id}`}
            </h1>

            <div className="mt-6 border-y border-line py-5">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">ราคาสินค้า</div>
              <div className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                 ฿ {Number(p.price || 0).toLocaleString()}
              </div>
            </div>

            {p.description && (
              <div className="mt-6">
                <div className="mb-2 text-sm font-bold text-ink">รายละเอียดสินค้า</div>
                <div className="whitespace-pre-wrap text-sm leading-7 text-stone-600">
                  {p.description}
                </div>
              </div>
            )}

            <div className="mt-auto pt-8">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">จำนวนที่ต้องการ</span>
                <span className="text-muted">เหลือ {stock.toLocaleString()} ชิ้น</span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex h-12 w-full items-center justify-between rounded-2xl border border-line bg-stone-50 px-2 sm:w-36 sm:shrink-0">
                  <button
                    aria-label="ลดจำนวนสินค้า"
                    className="grid h-9 w-9 place-items-center rounded-xl text-stone-500 transition hover:bg-white hover:text-ink"
                    onClick={() => setQty((x) => Math.max(1, (Number(x) || 1) - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    value={qty}
                    onChange={handleQtyChange}
                    onBlur={handleQtyBlur}
                    aria-label="จำนวนสินค้า"
                    className="w-12 bg-transparent text-center text-sm font-bold outline-none"
                    type="number"
                    min={1}
                    max={stock || 1}
                  />
                  <button
                    aria-label="เพิ่มจำนวนสินค้า"
                    className="grid h-9 w-9 place-items-center rounded-xl text-stone-500 transition hover:bg-white hover:text-ink"
                    onClick={() => setQty((x) => Math.min(stock || 1, (Number(x) || 0) + 1))}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  disabled={!canAdd}
                  onClick={() => {
                    if (!authStorage.token() || authStorage.role() !== "CUSTOMER"){
                      setShowLoginPrompt(true);
                      return;
                    }
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
                  className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition ${
                    canAdd
                      ? "bg-ink text-white shadow-lg shadow-stone-900/15 hover:-translate-y-0.5 hover:bg-stone-700"
                      : "cursor-not-allowed bg-stone-200 text-stone-400"
                  }`}
                >
                  <Package size={18} />
                  {stock > 0 ? "เพิ่มเข้าตะกร้า" : "สินค้าหมด"}
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-line pt-5 text-xs text-muted sm:grid-cols-2">
                <div className="flex items-center gap-2"><Check size={15} className="text-emerald-600" /> สต็อกพร้อมส่ง</div>
                <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-600" /> สินค้าคุณภาพ</div>
            </div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="pt-3 sm:pt-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-ink sm:text-2xl">สินค้าแนะนำ</div>
              <div className="mt-1 text-sm text-muted">
                {relatedCategoryId || relatedCategoryName ? "สินค้าในหมวดหมู่เดียวกัน" : "สินค้าที่เกี่ยวข้องกับแบรนด์รถ"}
              </div>
            </div>
            <Link to="/customer/shop" className="shrink-0 text-sm font-semibold text-ink hover:underline">
              ดูสินค้าทั้งหมด
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((product) => (
              <ProductCard
                key={product.id}
                p={product}
                to={`/customer/product/${product.id}`}
              />
            ))}
          </div>
        </section>
      )}
      <Modal
        open = {showLoginPrompt}
        title="กรุณาสมัครสมาชิกก่อนซื้อสินค้า"
        onClose={() => setShowLoginPrompt(false)}
      >
        <p className="text-sm text-muted">
          กรุณาเข้าสู่ระบบหรือสมัคสมาชิกก่อนสั่งซื้อสินค้า
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/customer/login"
            className="rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white"
          >
            เข้าสู่ระบบ
          </Link>

          <Link
            to="/customer/register"
            className="rounded-xl border border-line px-4 py-3 text-center text-sm font-semibold text-ink"
          >
            สมัครสมาชิก

          </Link>
        </div>

      </Modal>
    </div>
  );
}