// src/pages/customer/CustomerShopPage.jsx
import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customerProductsApi } from "../../api/customerProduct";
import ProductCard from "../../components/customer/ProductCard";

export default function CustomerShopPage() {
  const [sp] = useSearchParams();

  const keyword = sp.get("q") || sp.get("keyword") || "";

  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [modelId, setModelId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [page, setPage] = useState(0);
  const size = 12;

   const filtersQ = useQuery({
    queryKey: ["shop-filters"],
    queryFn: () => customerProductsApi.filters(),
  });

  const params = useMemo(() => {
    const p = { page, size };

    if (keyword) p.keyword = keyword;
    if (brandId !== "") p.brandId = Number(brandId);
    if (categoryId !== "") p.categoryId = Number(categoryId);
    if (modelId !== "") p.modelId = Number(modelId);
    if (minPrice !== "") p.minPrice = Number(minPrice);
    if (maxPrice !== "") p.maxPrice = Number(maxPrice);
    return p;
  }, [keyword, brandId, categoryId, modelId, minPrice, maxPrice, page]);

  const availableModels = useMemo(() => {
    const allModels = filtersQ.data?.models ||  [];
    if(!brandId) return allModels;
    return allModels.filter((m) => m.brandId === Number(brandId));
  }, [filtersQ.data?.models,brandId]);

  const productsQ = useQuery({
    queryKey: ["customer-products", params],
    queryFn: () => customerProductsApi.list(params),
    keepPreviousData: true,
  });

  const pageData = productsQ.data;
  const rows = pageData?.content || [];
  const totalPages = pageData?.totalPages ?? 1;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left filters */}
      <aside className="lg:col-span-3">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="text-lg font-semibold">กรองสินค้า</div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-muted">หมวดหมู่สินค้า</label>
              <select 
                className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-2 text-sm"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(0);
                }}
              >
                  <option value="">ทั้งหมด</option>
                  {filtersQ.data?.categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
            </div>
            
            <div>
              <label className="text-xs text-muted">แบรนด์</label>
              <select
                className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-2 text-sm"
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setModelId("");
                  setPage(0);
                }}
              >
                <option value="">ทั้งหมด</option>
                {filtersQ.data?.brands?.map((b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                )))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted">รุ่นรถ</label>
              <select 
                className="mt-1 w-full rounded-2xl border border-line bg-white px-3 py-2 text-sm"
                value={modelId}
                onChange={(e) => {
                  setModelId(e.target.value);
                  setPage(0);
                }}
                disabled = {!brandId}
              >
                <option value="">ทั้งหมด</option>
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted">ช่วงราคา</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(0);
                  }}
                  placeholder="ต่ำสุด"
                  className="w-full rounded-2xl border border-line px-3 py-2 text-sm"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(0);
                  }}
                  placeholder="สูงสุด"
                  className="w-full rounded-2xl border border-line px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right products */}
      <section className="lg:col-span-9">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-semibold">สินค้า</div>
            <div className="text-sm text-muted">
              {keyword ? (
                <>
                  ผลการค้นหา: <span className="font-semibold">{keyword}</span>
                </>
              ) : (
                "เลือกสินค้าแล้วเพิ่มเข้าตะกร้า"
              )}
            </div>
          </div>
          <div className="text-sm text-muted">
            {pageData?.totalElements ?? rows.length} รายการ
          </div>
        </div>

        <div className="mt-5">
          {productsQ.isLoading ? (
            <div className="text-sm text-muted">กำลังโหลด...</div>
          ) : productsQ.isError ? (
            <div className="text-sm text-rose-700">
              โหลดสินค้าไม่สำเร็จ
              <div className="mt-1 text-xs text-muted">
                เปิด DevTools → Network ดูว่าเรียก /api/customer/shop/products
                ได้ 200 ไหม
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    to={`/customer/product/${p.id}`}
                  />
                ))}

                {rows.length === 0 ? (
                  <div className="col-span-full rounded-3xl border border-line bg-white p-8 text-center text-sm text-muted">
                    ไม่พบสินค้า
                  </div>
                ) : null}
              </div>

              {/* pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-muted">
                  หน้า {page + 1} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-50"
                    disabled={page <= 0}
                    onClick={() => setPage((x) => x - 1)}
                  >
                    ก่อนหน้า
                  </button>
                  <button
                    className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-50"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((x) => x + 1)}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
