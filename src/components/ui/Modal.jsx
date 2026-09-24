import React from "react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/35 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-line bg-paper/70 px-5 py-4">
          <div className="text-base font-bold text-ink">{title}</div>
          <button
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm font-medium text-muted hover:border-brand/30 hover:bg-brand-soft hover:text-brand-dark"
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