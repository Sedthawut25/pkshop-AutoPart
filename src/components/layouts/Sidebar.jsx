import React, { Profiler } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BadgePercent,
  FileText,
  Truck,
  Tags,
  Car,
  CalendarClock,
  User,
  ClipboardList,
  Factory,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { authStorage } from "../../utils/authStorage";

const nav = [
  { to: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { to: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingBag },

  { to: "/admin/products", label: "สินค้า", icon: Package },

  { to: "/admin/categories", label: "หมวดหมู่สินค้า", icon: Tags },
  { to: "/admin/car-brands", label: "แบรนด์รถ", icon: Car },
  { to: "/admin/car-models", label: "รุ่นรถ", icon: Car },

  { to: "/admin/promotions", label: "โปรโมชัน", icon: BadgePercent },

  { to: "/admin/po", label: "ใบสั่งซื้อ", icon: FileText },
  { to: "/admin/import/lots", label: "นำเข้า", icon: Truck },
  { to: "/admin/member", label: "สมาชิกลูกค้า", icon: User },
  { to: "/admin/supplier", label: "ซัพพลายเออร์", icon: Factory },
  {
    to: "/admin/request",
    label: "รีเควสสินค้าจากลูกค้า",
    icon: ClipboardList,
  },
  {
    to: "/admin/claims",
    label: "รายการคืน/เคลมสินค้า",
    icon: RefreshCw,
  },
  {
    to: "/admin/reviews",
    label: "รีวิวสินค้า",
    icon: MessageSquare,
  },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-line bg-white">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-ink text-white flex items-center justify-center font-bold">
            PK
          </div>
          <div>
            <div className="text-sm font-semibold">PKSHOP</div>
            <div className="text-xs text-muted">Admin</div>
          </div>
        </div>
      </div>

      <nav className="px-3">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                isActive
                  ? "bg-stone-100 text-ink"
                  : "text-stone-600 hover:bg-stone-50",
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
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50"
          onClick={() => {
            authStorage.clear();
            window.location.href = "/login";
          }}
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
