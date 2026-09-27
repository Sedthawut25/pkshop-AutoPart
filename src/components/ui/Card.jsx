import React from "react";
import { cn } from "./cn";

export default function Card({ className, children }) {
  return (
    <div className={cn("rounded-2xl border border-line/80 bg-white shadow-soft", className)}>
      {children}
    </div>
  );
}