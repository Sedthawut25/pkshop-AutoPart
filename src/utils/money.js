export function formatMoney(n) {
  if (n === null || n === undefined) return "-";
  const num = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(num);
}