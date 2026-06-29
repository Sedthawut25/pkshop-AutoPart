import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-stone-50">
      {/* ✅ Mobile Topbar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-semibold">PKSHOP</div>
            <div className="text-xs text-muted">ซัพพลายเออร์</div>
          </div>
          <button
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm"
            onClick={() => setOpen(true)}
          >
            เมนู
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
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-line bg-white md:static md:z-auto md:block md:w-64",
            open ? "block" : "hidden md:block",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            {/* Brand */}
            <div className="flex items-center justify-between border-b border-line p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-ink text-white flex items-center justify-center font-bold">
                  PK
                </div>
                <div>
                  <div className="text-sm font-semibold">PKSHOP</div>
                  <div className="text-xs text-muted">Supplier Console</div>
                </div>
              </div>

              <button
                className="rounded-xl border border-line px-3 py-1.5 text-sm md:hidden"
                onClick={() => setOpen(false)}
              >
                ปิด
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-3">
              <div className="space-y-1">
                <SideLink
                  to="/supplier/po"
                  label="ใบสั่งซื้อที่ได้รับ"
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
          <div className="hidden border-b border-line bg-white md:block">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="text-lg font-semibold">ซัพพลายเออร์</div>
                <div className="text-xs text-muted">
                  จัดการใบสั่งซื้อและทำใบเสนอราคา
                </div>
              </div>
            </div>
          </div>

          {/* Page container */}
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SideLink({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
          isActive ? "bg-stone-100 font-semibold" : "hover:bg-stone-50",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}