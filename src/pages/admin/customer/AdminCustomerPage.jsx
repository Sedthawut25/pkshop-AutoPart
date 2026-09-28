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
        {/* 📱 Mobile Card View */}
        <div className="md:hidden divide-y divide-line">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted">กำลังโหลด...</div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">ไม่มีข้อมูลลูกค้า</div>
          ) : (
            customers.map((c) => (
              <div key={c.userId} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-sm text-ink">{c.fullName || "-"}</div>
                    <div className="text-xs text-muted mt-0.5">{c.email}</div>
                  </div>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700">
                    {c.status || "ACTIVE"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <div><span className="text-muted">เบอร์โทร:</span> <span className="font-medium text-ink">{c.phone || "-"}</span></div>
                  <div><span className="text-muted">แต้มสะสม:</span> <span className="font-semibold text-brand-dark">{c.points || 0}</span></div>
                </div>

                <div className="text-[11px] text-stone-400 flex justify-between pt-1">
                  <span>ID: #{c.userId}</span>
                  <span>สมัครเมื่อ: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 💻 Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs text-muted">
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
                  <td colSpan="8" className="px-4 py-6 text-center text-muted">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-muted">
                    ไม่มีข้อมูลลูกค้า
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.userId} className="border-t border-line hover:bg-stone-50/50">
                    <td className="px-4 py-3.5">{c.userId}</td>
                    <td className="px-4 py-3.5 font-medium text-ink">{c.fullName}</td>
                    <td className="px-4 py-3.5">{c.email}</td>
                    <td className="px-4 py-3.5">{c.phone || "-"}</td>
                    <td className="px-4 py-3.5 font-semibold text-brand-dark">{c.points || 0}</td>
                    <td className="px-4 py-3.5">{c.status}</td>
                    <td className="px-4 py-3.5 text-stone-500 text-xs">
                      {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-stone-500 text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
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