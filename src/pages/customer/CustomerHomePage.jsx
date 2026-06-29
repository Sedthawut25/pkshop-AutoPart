// src/pages/customer/CustomerHomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function CustomerHomePage() {
  return (
    <div className="space-y-10">
      {/* Section 1: hero */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-line bg-white p-6 md:col-span-1">
          <div className="text-lg font-semibold">อะไหล่รถเข้าใหม่</div>
          <div className="mt-1 text-sm text-muted">
            สินค้ามีคุณภาพทุกชิ้นไม่มีที่ติ
          </div>
          <Link
            to="/customer/shop"
            className="mt-6 inline-block rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            ซื้อเลย
          </Link>
          <div className="mt-6">
            <img
              src="https://img.icarcdn.com/autospinn/body/000000881562_d9faa514_1d40_4000_9a36_5246cd47d0b4.jpg"
              className="w-full h-64 rounded-2xl object-cover"
              alt="banner"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-6 md:col-span-2">
          <div className="text-5xl font-semibold leading-tight">
            ULTIMATE <span className="text-stone-300">SALE</span>
          </div>
          <div className="mt-2 text-sm text-muted">NEW COLLECTION</div>
          <div className="mt-6 flex gap-3">
            <Link
              to="/customer/shop"
              className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              ซื้อตอนนี้
            </Link>
            <Link
              to="/customer/shop?sort=latest"
              className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold hover:bg-stone-50"
            >
              ดูสินค้าเข้าใหม่
            </Link>
          </div>

          {/* placeholder image area */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <img
              src="https://ci.lnwfile.com/_webp_max_images/1024/1024/97/mr/86.webp"
              className="aspect-[4/3] rounded-2xl object-cover"
              alt="banner"
            />
            <img
              src="https://srisiamonline.com/pub/media/catalog/product/cache/964d5d8e83d07016bd3da81940f632de/4/8/48928304b.jpg"
              className="aspect-[4/3] rounded-2xl object-cover"
              alt="banner"
            />
            <img
              src="https://srisiamonline.com/pub/media/catalog/product/cache/964d5d8e83d07016bd3da81940f632de/1/2/12x55424776b.jpg"
              className="aspect-[4/3] rounded-2xl object-cover"
              alt="banner"
            />
          </div>
        </div>
      </section>

      {/* Section 2: big banner */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-8">
          <div className="text-3xl font-semibold">ดีลลดแรง ประจำเดือนสูงสุด 50%!! <br />เพียงใส่โค้ด RAIN50</div>
          <div className="mt-2 text-sm text-muted">
            เลือกซื้อสินค้ากันเลยยย
          </div>
          <Link
            to="/customer/shop?promo=1"
            className="mt-6 inline-block rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            ซื้อเลย
          </Link>
        </div>
        <div className="rounded-3xl p-8">
          <div className="mt-6">
            <img
              src="https://cdn.carsome.co.th/news/shock2-1024x577.jpg"
              className="w-full h-64 rounded-2xl object-cover"
              alt="banner"
            />
          </div>
          <div className="mt-6 text-xs text-muted"></div>
        </div>
      </section>

      {/* Section 3: brands row */}
      <section className="rounded-3xl border border-line bg-white p-6">
        <div className="text-sm font-semibold">แบรนด์ที่รองรับ</div>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8">
          {[
            "BMW",
            "Honda",
            "Benz",
            "Ford",
            "Toyota",
            "Mazda",
            "Audi",
            "Nissan",
          ].map((b) => (
            <div
              key={b}
              className="rounded-2xl bg-stone-50 px-3 py-4 text-center text-xs font-semibold"
            >
              {b}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
