import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ p, to }) {
  const [img, setImg] = useState(
    p?.imageUrl || "https://via.placeholder.com/600x400?text=PKSHOP"
  );

  return (
    <Link
      to={to}
      className="rounded-3xl border border-line bg-white p-4 hover:shadow-soft"
    >
      <img
        src={img}
        alt={p?.name || "product"}
        className="h-44 w-full rounded-2xl object-cover bg-stone-50"
        loading="lazy"
        onError={() =>
          setImg("https://via.placeholder.com/600x400?text=No+Image")
        }
      />

      <div className="mt-3 text-sm font-semibold">
        {p?.name || `#${p?.id}`}
      </div>

      <div className="mt-1 text-xs text-muted">
        คงเหลือ: {p?.stockQty ?? "-"} • SKU: {p?.sku || "-"}
      </div>

      <div className="mt-3 text-base font-semibold">
        ฿ {Number(p?.price || 0).toLocaleString()}
      </div>
    </Link>
  );
}