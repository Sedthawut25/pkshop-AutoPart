import { useEffect, useState } from "react";

export default function AdminCustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const token = localStorage.getItem("pk_token");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/customers?keyword=${keyword}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      console.log(json);

      setCustomers(json.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <div className="text-3xl font-semibold">สมาชิกลูกค้า</div>

        <div className="mt-1 text-sm text-muted">
          รายชื่อลูกค้าที่สมัครสมาชิก
        </div>
      </div>

      {/* SEARCH */}
      <div className="rounded-3xl border border-line bg-white p-4">
        <div className="flex gap-3">
          <input
            className="w-full rounded-2xl border px-3 py-3 text-sm"
            placeholder="ค้นหาชื่อลูกค้าหรืออีเมล"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <button
            onClick={fetchCustomers}
            className="rounded-2xl bg-black px-5 py-3 text-sm text-white"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50">
            <tr className="text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">ชื่อลูกค้า</th>
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">เบอร์โทร</th>
              <th className="px-4 py-3">แต้ม</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">เข้าใช้ล่าสุด</th>
              <th className="px-4 py-3">สมัครเมื่อ</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center">
                  กำลังโหลด...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center">
                  ไม่มีข้อมูลลูกค้า
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.userId} className="border-t">
                  <td className="px-4 py-4">{c.userId}</td>

                  <td className="px-4 py-4 font-medium">
                    {c.fullName}
                  </td>

                  <td className="px-4 py-4">{c.email}</td>

                  <td className="px-4 py-4">
                    {c.phone || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {c.points || 0}
                  </td>

                  <td className="px-4 py-4">
                    {c.status}
                  </td>

                  <td className="px-4 py-4">
                    {c.lastLoginAt
                      ? new Date(c.lastLoginAt).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-4 py-4">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : "-"}
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