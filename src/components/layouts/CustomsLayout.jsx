import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CustomsSidebar from "./CustomsSidebar";

export default function CustomsLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <button
          className="rounded-xl border border-line px-3 py-2 text-sm"
          onClick={() => setOpen(true)}
        >
          เมนู
        </button>
        <div className="text-sm font-semibold">ศุลกากร</div>
        <div className="w-10" />
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <CustomsSidebar />
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white border-r border-line">
              <CustomsSidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1">
          <div className="mx-auto max-w-7xl p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}