import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CustomsSidebar from "./CustomsSidebar";
import { Menu, X } from "lucide-react";

export default function CustomsLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line/80 bg-white/90 px-4 py-3.5 shadow-sm backdrop-blur-md md:hidden">
        <button
          aria-label="เปิดเมนูศุลกากร"
          className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
          onClick={() => setOpen(true)}
        >
          <Menu size={19} />
        </button>
        <div className="text-sm font-extrabold tracking-tight">ศุลกากร</div>
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
            <div className="absolute left-0 top-0 h-full w-[min(19rem,calc(100vw-2rem))] border-r border-line bg-white shadow-lift">
              <button
                aria-label="ปิดเมนูศุลกากร"
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-muted hover:bg-brand-soft hover:text-brand"
                onClick={() => setOpen(false)}
              >
                <X size={17} />
              </button>
              <CustomsSidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[92rem] p-4 sm:p-5 md:p-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}