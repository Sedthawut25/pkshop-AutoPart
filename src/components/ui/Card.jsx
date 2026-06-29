import React from "react";
import { cn } from "./cn";

export default function Card({ className, children }) {
  return (
    <div className={cn("rounded-xl2 border border-line bg-white shadow-soft", className)}>
      {children}
    </div>
  );
}