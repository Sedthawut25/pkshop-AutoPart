import React from "react";

export default function Topbar() {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">แดชบอร์ด</div>
          <div className="text-xs text-muted">ภาพรวมการขายสินค้า, สินค้าคงคลังและผลการดำเนินงาน</div>
        </div>
        <div className="text-xs text-muted">
          {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}