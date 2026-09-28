import { useEffect, useState } from "react";

export default function AdminSupplierPage() {
  const [supplier, setSupplier] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyWord] = useState("");

  const token = localStorage.getItem("pk_token");

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/suppliers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      console.log(json);

      setSupplier(json?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-semibold">จัดการซัพพลายเออร์</div>
        <div className="text-sm text-muted mt-1">รายชื่อบริษัทซัพพลายเออร์</div>
      </div>

      {/* SEARCH */}
      <div className="rounded-3xl border border-line bg-white p-4">
        <input
          className="w-full rounded-2xl border px-3 py-3 text-sm"
          placeholder="ค้นหาชื่อบริษัทหรืออีเมล"
          value={keyword}
          onChange={(e) => setKeyWord(e.target.value)}
        />
      </div>

      <div className="rounded-3xl border border-line bg-white overflow-hidden">
        {/* 📱 Mobile Card View */}
        <div className="md:hidden divide-y divide-line">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted">กำลังโหลด...</div>
          ) : supplier.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">ไม่มีข้อมูลซัพพลายเออร์</div>
          ) : (
            supplier.map((s) => (
              <div key={s.supplierId} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-bold text-sm text-ink">{s.companyName}</div>
                    <div className="text-xs text-muted mt-0.5">ผู้ติดต่อ: {s.contactName}</div>
                  </div>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700">
                    {s.country || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <div><span className="text-muted">อีเมล:</span> <span className="font-medium text-ink block truncate">{s.contactEmail}</span></div>
                  <div><span className="text-muted">เบอร์โทร:</span> <span className="font-medium text-ink block">{s.contactPhone || "-"}</span></div>
                </div>

                <div className="text-[11px] text-stone-400 flex justify-end pt-1">
                  <span>วันที่สร้าง: {new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 💻 Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs text-muted">
                <th className="px-4 py-3">บริษัท</th>
                <th className="px-4 py-3">ชื่อผู้ติดต่อ</th>
                <th className="px-4 py-3">อีเมล</th>
                <th className="px-4 py-3">ประเทศ</th>
                <th className="px-4 py-3">เบอร์โทร</th>
                <th className="px-4 py-3">วันที่สร้าง</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-muted">
                    กำลังโหลด....
                  </td>
                </tr>
              ) : supplier.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-muted">
                    ไม่มีข้อมูลซัพพลายเออร์
                  </td>
                </tr>
              ) : (
                supplier.map((s) => (
                  <tr key={s.supplierId} className="border-t border-line hover:bg-stone-50/50">
                    <td className="px-4 py-3.5 font-medium text-ink">{s.companyName}</td>
                    <td className="px-4 py-3.5 font-medium">{s.contactName}</td>
                    <td className="px-4 py-3.5 text-stone-600">{s.contactEmail}</td>
                    <td className="px-4 py-3.5">{s.country || "-"}</td>
                    <td className="px-4 py-3.5">{s.contactPhone || "-"}</td>
                    <td className="px-4 py-3.5 text-stone-500 text-xs">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
