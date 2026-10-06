import { useEffect, useState } from "react";
import { adminCommonApi } from "../../../api/adminCommon";
import api from "../../../api/axios";

export default function AdminSupplierPage() {
  const [supplier, setSupplier] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    void fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const [accounts, profilesResponse] = await Promise.all([
        adminCommonApi.suppliers(),
        api.get("/api/admin/suppliers", { params: { page: 0, size: 1000 } })
          .catch((error) => {
            console.error("Unable to load supplier profiles:", error);
            return null;
          }),
      ]);

      const profilePage = profilesResponse?.data?.content
        ? profilesResponse.data
        : profilesResponse?.data?.data;
      const profiles = profilePage?.content || [];
      const profilesByUserId = new Map(
        profiles.map((profile) => [Number(profile.supplierId), profile]),
      );

      setSupplier(
        accounts.map((account) => {
          const profile = profilesByUserId.get(Number(account.id));
          return {
            supplierId: account.id,
            companyName: profile?.companyName || account.fullName || account.email || "-",
            contactName: profile?.contactName || account.fullName || "-",
            contactEmail: profile?.contactEmail || account.email || "-",
            contactPhone: profile?.contactPhone || account.phone || "-",
          };
        }),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchTerm = keyword.trim().toLocaleLowerCase();
  const filteredSuppliers = supplier.filter((item) =>
    [item.companyName, item.contactName, item.contactEmail, item.contactPhone]
      .some((value) => String(value || "").toLocaleLowerCase().includes(searchTerm)),
  );
  const emptyMessage = supplier.length === 0
    ? "ไม่มีข้อมูลซัพพลายเออร์"
    : "ไม่พบซัพพลายเออร์ที่ตรงกับคำค้นหา";

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-semibold">จัดการซัพพลายเออร์</div>
        <div className="mt-1 text-sm text-muted">รายชื่อบริษัทซัพพลายเออร์</div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-4">
        <input
          className="w-full rounded-2xl border px-3 py-3 text-sm"
          placeholder="ค้นหาชื่อบริษัทหรืออีเมล"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="divide-y divide-line md:hidden">
          {loading && (
            <div className="p-6 text-center text-sm text-muted">กำลังโหลด...</div>
          )}
          {!loading && filteredSuppliers.length === 0 && (
            <div className="p-6 text-center text-sm text-muted">{emptyMessage}</div>
          )}
          {!loading && filteredSuppliers.length > 0 &&
            filteredSuppliers.map((s) => (
              <div key={s.supplierId} className="space-y-2 p-4">
                <div>
                  <div className="text-sm font-bold text-ink">{s.companyName}</div>
                  <div className="mt-0.5 text-xs text-muted">ผู้ติดต่อ: {s.contactName}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-stone-50 p-2.5 text-xs">
                  <div>
                    <span className="text-muted">อีเมล:</span>
                    <span className="block truncate font-medium text-ink">{s.contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted">เบอร์โทร:</span>
                    <span className="block font-medium text-ink">{s.contactPhone || "-"}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs text-muted">
                <th className="px-4 py-3">บริษัท</th>
                <th className="px-4 py-3">ชื่อผู้ติดต่อ</th>
                <th className="px-4 py-3">อีเมล</th>
                <th className="px-4 py-3">เบอร์โทร</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-muted">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {!loading && filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-muted">
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {!loading && filteredSuppliers.length > 0 &&
                filteredSuppliers.map((s) => (
                  <tr key={s.supplierId} className="border-t border-line hover:bg-stone-50/50">
                    <td className="px-4 py-3.5 font-medium text-ink">{s.companyName}</td>
                    <td className="px-4 py-3.5 font-medium">{s.contactName}</td>
                    <td className="px-4 py-3.5 text-stone-600">{s.contactEmail}</td>
                    <td className="px-4 py-3.5">{s.contactPhone || "-"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
