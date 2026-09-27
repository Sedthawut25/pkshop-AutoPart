import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FileText, Menu, RotateCcw, X } from "lucide-react";

export default function SupplierLayout() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem("pk_token");
    localStorage.removeItem("pk_role");
    localStorage.removeItem("pk_roles");
    localStorage.removeItem("pk_user");
    nav("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* ✅ Mobile Topbar */}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/90 shadow-sm backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-ink">PK</div>
            <div>
              <div className="text-sm font-extrabold tracking-tight">PKSHOP</div>
              <div className="text-xs text-muted">ซัพพลายเออร์</div>
            </div>
          </div>
          <button
            aria-label="เปิดเมนูซัพพลายเออร์"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-muted hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
            onClick={() => setOpen(true)}
          >
            <Menu size={19} />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* ✅ Backdrop (mobile) */}
        {open && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* ✅ Sidebar */}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 w-[min(19rem,calc(100vw-2rem))] border-r border-line/80 bg-white shadow-lift md:static md:z-auto md:block md:w-72 md:shadow-none",
            open ? "block" : "hidden md:block",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            {/* Brand */}
            <div className="flex items-center justify-between border-b border-line/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand font-bold text-ink shadow-[0_8px_18px_rgba(15,118,110,0.2)]">
                  PK
                </div>
                <div>
                  <div className="text-sm font-semibold">PKSHOP</div>
                  <div className="text-xs text-muted">Supplier Console</div>
                </div>
              </div>

              <button
                aria-label="ปิดเมนูซัพพลายเออร์"
                className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted hover:bg-brand-soft hover:text-brand md:hidden"
                onClick={() => setOpen(false)}
              >
                <X size={17} />
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-3">
              <div className="space-y-1">
                <SideLink
                  to="/supplier/po"
                  label="ใบสั่งซื้อที่ได้รับ"
                  icon={FileText}
                  onClick={() => setOpen(false)}
                />
                <SideLink
                  to="/supplier/claims"
                  label="เคลมจากแอดมิน"
                  icon={RotateCcw}
                  onClick={() => setOpen(false)}
                />
              </div>
            </nav>

            {/* Footer actions */}
            <div className="border-t border-line p-3">
              <button
                onClick={logout}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </aside>

        {/* ✅ Content */}
        <main className="flex-1">
          {/* Desktop header (เหมือน admin/customs มีหัวข้างบน) */}
          <div className="hidden border-b border-line/80 bg-white/85 shadow-sm md:block">
            <div className="flex items-center justify-between border-l-2 border-brand px-6 py-5">
              <div>
                <div className="text-lg font-semibold">ซัพพลายเออร์</div>
                <div className="text-xs text-muted">
                  จัดการใบสั่งซื้อ ใบเสนอราคา และเคลมจากแอดมิน
                </div>
              </div>
            </div>
          </div>

          {/* Page container */}
          <div className="mx-auto w-full max-w-[92rem] p-4 sm:p-5 md:p-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SideLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all",
          isActive ? "bg-brand-soft text-brand-dark shadow-sm" : "text-muted hover:bg-paper hover:text-ink",
        ].join(" ")
      }
    >
      {Icon ? <Icon size={16} /> : null}
      {label}
    </NavLink>
  );
}
