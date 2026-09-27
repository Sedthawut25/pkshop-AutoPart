import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ p, to }) {
  const defaultPlaceholder = "https://placehold.co/600x400?text=PKSHOP";
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (trimmed === "https://cloudinary.com" || trimmed === "http://cloudinary.com" || trimmed === "https://cloudinary.com/") {
      return false;
    }
    return true;
  };

  const initialImg = isValidImageUrl(p?.imageUrl) ? p.imageUrl : defaultPlaceholder;
  const [img, setImg] = useState(initialImg);

  React.useEffect(() => {
    setImg(isValidImageUrl(p?.imageUrl) ? p.imageUrl : defaultPlaceholder);
  }, [p?.imageUrl]);

  return (
    <Link
      to={to}
      className="group block overflow-hidden rounded-3xl border border-line/80 bg-white p-4 shadow-[0_5px_18px_rgba(23,33,31,0.035)] hover:-translate-y-1 hover:border-brand/30 hover:shadow-lift"
    >
      <img
        src={img}
        alt={p?.name || "product"}
        className="h-44 w-full rounded-2xl bg-stone-50 object-cover transition duration-500 group-hover:scale-[1.025]"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          setImg("https://placehold.co/600x400?text=No+Image");
        }}
      />

      <div className="mt-4 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink">
        {p?.name || `#${p?.id}`}
      </div>

      <div className="mt-1 text-xs text-muted">
        คงเหลือ: {p?.stockQty ?? "-"} • SKU: {p?.sku || "-"}
      </div>

      <div className="mt-3 text-base font-bold text-brand-dark">
        ฿ {Number(p?.price || 0).toLocaleString()}
      </div>
    </Link>
  );
}