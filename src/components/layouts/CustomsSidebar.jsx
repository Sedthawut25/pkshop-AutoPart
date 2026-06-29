import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FileCheck2, LogOut } from "lucide-react";
import { authStorage } from "../../utils/authStorage";

export default function CustomsSidebar({ onNavigate }) {
  const nav = useNavigate();

  const items = [
    { to: "/customs/documents", label: "เอกสารนำเข้า", icon: FileCheck2 },
  ];

  function logout() {
    authStorage.clear();
    nav("/customs/login", { replace: true });
    onNavigate?.();
  }

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-line bg-white">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-ink text-white flex items-center justify-center font-bold">
            C
          </div>
          <div>
            <div className="text-sm font-semibold">ศุลกากร</div>
            <div className="text-xs text-muted">Customs Console</div>
          </div>
        </div>
      </div>

      <nav className="px-3">
        {items.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                isActive ? "bg-stone-100 text-ink" : "text-stone-600 hover:bg-stone-50",
              ].join(" ")
            }
          >
            <n.icon size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-5 py-5">
        <button
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50 flex items-center justify-center gap-2"
          onClick={logout}
        >
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}