import React from "react";

export default function Topbar() {
  return (
    <div className="border-b border-line/80 bg-white/85 shadow-[0_1px_0_rgba(23,33,31,0.02)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-1 border-l-2 border-brand px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <div className="truncate text-base font-bold tracking-tight text-ink sm:text-lg">แดชบอร์ด</div>
          <div className="truncate text-xs text-muted">ภาพรวมการขายสินค้า, สินค้าคงคลังและผลการดำเนินงาน</div>
        </div>
        <div className="shrink-0 text-[11px] text-muted sm:text-xs">
          {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}