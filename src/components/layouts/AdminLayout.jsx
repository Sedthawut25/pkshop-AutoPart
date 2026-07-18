import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper flex">
      {/* 💻 Sidebar สำหรับหน้าจอ Desktop (ซ่อนบนมือถือ, แสดงบนจอ lg ขึ้นไป) */}
      <div className="hidden lg:block w-64 shrink-0">
        <Sidebar />
      </div>

      {/* 📱 Sidebar ดึงจากขอบ (Drawer) สำหรับหน้าจอมือถือ */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* พื้นหลังสีดำโปร่งแสง (กดเพื่อปิดเมนู) */}
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          {/* ตัว Sidebar สไลด์จากซ้าย */}
          <div className="relative flex w-64 max-w-xs flex-col bg-white shadow-xl transition-transform">
            {/* ปุ่มกากบาทปิดเมนู */}
            <div className="absolute right-0 top-0 -mr-12 pt-4">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-white focus:outline-none"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Sidebar onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* 📦 พื้นที่เนื้อหาหลัก (Main Content) */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* 📱 Header สำหรับมือถือ (แสดงเฉพาะหน้าจอเล็ก เพื่อโชว์ปุ่ม Hamburger) */}
        <div className="sticky top-0 z-40 flex items-center gap-x-4 bg-white px-4 py-3 border-b border-line shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-stone-700 hover:text-ink focus:outline-none"
            onClick={() => setIsMobileOpen(true)}
          >
            <span className="sr-only">เปิดเมนู</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-bold text-ink">
            PKSHOP Admin
          </div>
        </div>

        <Topbar />
        
        {/* คอนเทนต์ของแต่ละหน้า */}
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}