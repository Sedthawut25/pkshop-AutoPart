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
        <table className="w-full text-sm">
          <thead className="bg-stone-50">
            <tr className="text-left">
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
                <td colSpan="5" className="px-4 py-6 text-center">
                  กำลังโหลด....
                </td>
              </tr>
            ) : supplier.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center">
                  ไม่มีข้อมูลซัพพลายเออร์
                </td>
              </tr>
            ) : (
              supplier.map((s) => (
                <tr key={s.supplierId} className="border-t">
                  <td className="px-4 py-4 font-medium">{s.companyName}</td>

                  <td className="px-4 py-4 font-medium">{s.contactName}</td>

                  <td className="px-4 py-4 font-medium">{s.contactEmail}</td>

                  <td className="px-4 py-4 font-medium">{s.country}</td>

                  <td className="px-4 py-4 font-medium">{s.contactPhone}</td>

                  <td className="px-4 py-4 font-medium">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
