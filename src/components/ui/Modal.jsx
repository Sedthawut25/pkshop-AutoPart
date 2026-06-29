import React from "react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl2 border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="text-sm font-semibold">{title}</div>
          <button
            className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}