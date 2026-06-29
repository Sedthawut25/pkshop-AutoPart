// src/pages/customer/CustomerLayout.jsx
import React, { useMemo, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";

export default function CustomerLayout() {
  return <Shell />;
}

function Shell() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 🟢 State สำหรับเปิด/ปิดเมนูมือถือ

  function logout() {
    localStorage.removeItem("pk_token");
    localStorage.removeItem("pk_role");
    localStorage.removeItem("pk_roles");
    localStorage.removeItem("pk_user");
    nav("/customer/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          
          {/* ฝั่งซ้าย: โลโก้ และ เมนูหลัก (Desktop) */}
          <div className="flex items-center gap-4 lg:gap-6">
            
            {/* 🟢 ปุ่ม Hamburger สำหรับมือถือ (แสดงเฉพาะหน้าจอเล็กกว่า md) */}
            <button 
              className="md:hidden p-1 text-stone-600 hover:text-stone-900 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <div
              className="cursor-pointer select-none text-xl font-extrabold tracking-tight text-stone-900"
              onClick={() => nav("/customer", { replace: false })}
            >
              PKSHOP
            </div>

            {/* 🟢 เมนู Desktop (ซ่อนในมือถือ, แสดงใน md ขึ้นไป) */}
            <nav className="hidden md:flex items-center gap-1 xl:gap-2">
              <TopLink to="/customer" label="หน้าหลัก" />
              <TopLink to="/customer/shop" label="สินค้า" />
              <TopLink to="/customer/requests" label="รีเควสสินค้า" />
              <TopLink to="/customer/orders" label="คำสั่งซื้อ"/>
              <TopLink to="/customer/history" label="ประวัติสั่งซื้อ" />
              <TopLink to="/customer/claims" label="คืน/เคลมสินค้า" />
            </nav>
          </div>

          {/* ฝั่งขวา: ค้นหา, ตะกร้า, ออกจากระบบ */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 🟢 ช่องค้นหา Responsive (ยืดหยุ่นตามหน้าจอ lg และ xl) */}
            <div className="hidden lg:block">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") nav(`/customer/shop?q=${encodeURIComponent(q)}`);
                  }}
                  placeholder="ค้นหาสินค้า..."
                  className="w-48 lg:w-56 xl:w-64 rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5 text-xs outline-none focus:border-stone-400 focus:bg-white transition"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  onClick={() => nav(`/customer/shop?q=${encodeURIComponent(q)}`)}
                >
                  🔍
                </button>
              </div>
            </div>

            <CartButton />
            <button
              className="hidden sm:block rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
              onClick={logout}
              title="ออกจากระบบ"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* 🟢 Mobile Menu Dropdown (แสดงเฉพาะตอนกดปุ่ม Hamburger) */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 border-t border-stone-100 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1 px-4 py-3 bg-white shadow-inner">
            {/* ช่องค้นหาสำหรับมือถือ */}
            <div className="relative mb-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    nav(`/customer/shop?q=${encodeURIComponent(q)}`);
                    setIsMobileMenuOpen(false);
                  }
                }}
                placeholder="ค้นหาสินค้า..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-stone-400 focus:bg-white"
              />
            </div>
            
            <MobileLink to="/customer" label="หน้าหลัก" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileLink to="/customer/shop" label="สินค้า" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileLink to="/customer/requests" label="รีเควสสินค้า" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileLink to="/customer/orders" label="คำสั่งซื้อ" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileLink to="/customer/history" label="ประวัติสั่งซื้อ" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileLink to="/customer/claims" label="คืน/เคลมสินค้า" onClick={() => setIsMobileMenuOpen(false)} />
            
            <button
              className="mt-2 w-full rounded-xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-200 text-left"
              onClick={logout}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

// Component สำหรับเมนู Desktop (แนวนอน)
function TopLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-2.5 py-1.5 text-xs lg:text-sm font-medium transition-all ${
          isActive ? "bg-stone-900 text-white font-semibold shadow-sm" : "text-stone-600 hover:bg-stone-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

// 🟢 Component สำหรับเมนู Mobile (แนวตั้ง)
function MobileLink({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block rounded-xl px-4 py-2 text-sm font-medium transition-all ${
          isActive ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function CartButton() {
  const nav = useNavigate();
  const { summary } = useCart();
  const badge = useMemo(() => summary.count || 0, [summary.count]);

  return (
    <button
      className="relative rounded-full border border-stone-200 p-2 text-sm hover:bg-stone-50 transition"
      onClick={() => nav("/customer/cart")}
      title="ตะกร้าสินค้า"
    >
      🛒
      {badge > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}