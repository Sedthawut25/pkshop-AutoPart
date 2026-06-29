import React from "react";
import { cn } from "./cn";

export default function Badge({ tone = "gray", children }) {
  const map = {
    gray: "bg-stone-100 text-stone-700 border-stone-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs", map[tone])}>
      {children}
    </span>
  );
}