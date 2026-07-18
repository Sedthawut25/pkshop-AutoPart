import React from "react";
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
  { to: "/admin/request", label: "รีเควสสินค้า", icon: ClipboardList },
  { to: "/admin/claims", label: "รายการเคลม", icon: RefreshCw },
  { to: "/admin/reviews", label: "รีวิวสินค้า", icon: MessageSquare },
];

export default function Sidebar({ onClose }) {
  return (
    <aside className="flex h-full min-h-screen w-full flex-col border-r border-line bg-white sticky top-0">
      {/* โลโก้ */}
      <div className="px-5 py-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-ink text-white flex items-center justify-center font-bold text-lg shadow-sm">
            PK
          </div>
          <div>
            <div className="text-sm font-bold text-ink">PKSHOP</div>
            <div className="text-xs text-stone-500 font-medium">Admin Panel</div>
          </div>
        </div>
      </div>

  
      {/* เมนูนำทาง (ไถเลื่อนได้ถ้าจอเล็ก) */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={() => {
              if (onClose) onClose(); // กดเลือกปุ๊บ สั่งปิดเมนูมือถือปั๊บ
            }}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 font-medium",
                isActive
                  ? "bg-stone-100 text-ink"
                  : "text-stone-500 hover:bg-stone-50 hover:text-ink",
              ].join(" ")
            }
          >
            <n.icon size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* ปุ่มออกจากระบบ */}
      <div className="mt-auto p-4 shrink-0 border-t border-stone-100">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-100"
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