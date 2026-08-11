import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";

// 1. นำเข้า useAuth จาก Clerk
import { useAuth } from "@clerk/clerk-react"; 

export default function CustomerLayout() {
  return <Shell />;
}

function Shell() {
  const nav = useNavigate();
  // 2. เรียกใช้ฟังก์ชัน signOut จาก hook ของ Clerk
  const { signOut } = useAuth(); 

  const [q, setQ] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState({ fullName: "ลูกค้า", email: ""});

  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("pk_user");
      if(storedUser){
        const parsed = storedUser.startsWith("{") ? JSON.parse(storedUser) : {fullName: storedUser};
        setUser(parsed);
      }
    }
    catch (error) {
      console.error("Error parsing user data", error);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if(dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function logout() {
    try {
      localStorage.removeItem("pk_token");
      localStorage.removeItem("pk_role");
      localStorage.removeItem("pk_roles");
      localStorage.removeItem("pk_user");
      
      await signOut({ redirectUrl: "/customer/login" }); 
      
    } catch (error) {
      console.error("Clerk logout error:", error);
      nav("/customer/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          
          <div className="flex items-center gap-4 lg:gap-6">
            
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

            {/* ProfileDropdown */}
            <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-stone-200 p-1 pr-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition focus:outline-none shadow-sm"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white uppercase">
                      {user.fullName ? user.fullName.charAt(0) : "U"}
                    </div>
                    <span className="max-w-[100px] truncate text-xs font-semibold">{user.fullName || "บัญชีของฉัน"}</span>
                    <svg className={`h-4 w-4 text-stone-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {/* เมนูกด profile*/}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-stone-100 py-2 shadow-xl z-50">
                      <div className="px-4 py-2 border-b border-stone-100 mb-1">
                        <p className="text-[10px] font-semibold text-stone-800 uppercase tracking-widest">เข้าสู่ระบบโดย</p>
                        <p className="text-sm font-bold text-stone-800 truncate">{user.email}</p>
                        {user.email && <p className="text-xs text-stone-500 truncate">{user.email}</p>}
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          nav("/customer/profile"); 
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                      >
                          จัดการบัญชีของฉัน
                      </button>
                      <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
            </div>
          </div>
        </div>

        {/* 🟢 Mobile Menu Dropdown (แสดงเฉพาะตอนกดปุ่ม Hamburger) */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-[500px] border-t border-stone-100 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1 px-4 py-3 bg-white shadow-inner">
            {/* โปรไฟล์ย่อสำหรับมือถือ */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-stone-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white uppercase">
                  {user.fullName ? user.fullName.charAt(0) : "U"}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{user.fullName || "ลูกค้า"}</p>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); nav("/customer/profile"); }}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    จัดการบัญชีของฉัน
                  </button>
                </div>
            </div>

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