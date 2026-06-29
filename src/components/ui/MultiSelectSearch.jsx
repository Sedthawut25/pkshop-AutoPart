import React, { useMemo, useState } from "react";
import Badge from "./Badge";

export default function MultiSelectSearch({
  items = [],        // [{id,name}]
  selectedIds = [],  // [id]
  onChange,
  placeholder = "ค้นหา...",
  emptyText = "ไม่พบข้อมูล",
}) {
  const [q, setQ] = useState("");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items.slice(0, 20);
    return items
      .filter((x) => (x.name || "").toLowerCase().includes(qq))
      .slice(0, 30);
  }, [items, q]);

  function toggle(id) {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  }

  const selectedItems = useMemo(
    () => items.filter((x) => selectedSet.has(x.id)),
    [items, selectedSet]
  );

  return (
    <div className="space-y-2">
      <input
        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* Selected */}
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((x) => (
          <button
            key={x.id}
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => toggle(x.id)}
          >
            <Badge tone="blue">{x.name}</Badge>
          </button>
        ))}
        {selectedItems.length === 0 ? (
          <div className="text-xs text-muted">ยังไม่ได้เลือก</div>
        ) : null}
      </div>

      {/* Results */}
      <div className="max-h-56 overflow-auto rounded-xl border border-line">
        {filtered.length === 0 ? (
          <div className="p-3 text-sm text-muted">{emptyText}</div>
        ) : (
          filtered.map((x) => {
            const active = selectedSet.has(x.id);
            return (
              <button
                type="button"
                key={x.id}
                className={`w-full px-3 py-2 text-left text-sm border-b border-line last:border-b-0 ${
                  active ? "bg-stone-100" : "bg-white hover:bg-stone-50"
                }`}
                onClick={() => toggle(x.id)}
              >
                {x.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}