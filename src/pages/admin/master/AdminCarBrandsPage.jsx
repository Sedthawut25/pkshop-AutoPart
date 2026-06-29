import React, { useState } from "react";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminMasterApi } from "../../../api/adminMaster";

export default function AdminCarBrandsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const q = useQuery({
    queryKey: ["admin-car-brands"],
    queryFn: adminMasterApi.listBrands,
  });

  const createMut = useMutation({
    mutationFn: () => adminMasterApi.createBrand(name.trim()),
    onSuccess: async () => {
      setOpen(false);
      setName("");
      await qc.invalidateQueries({ queryKey: ["admin-car-brands"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: () => adminMasterApi.updateBrand(editing.id, name.trim()),
    onSuccess: async () => {
      setOpen(false);
      setEditing(null);
      setName("");
      await qc.invalidateQueries({ queryKey: ["admin-car-brands"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminMasterApi.deleteBrand(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-car-brands"] });
    },
  });

  const rows = q.data || [];
  const canSave = name.trim().length > 0 && !(createMut.isPending || updateMut.isPending);

  function openCreate() {
    setEditing(null);
    setName("");
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setName(row.name);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">แบรนด์รถ</div>
          <div className="text-xs text-muted">จัดการรายชื่อแบรนด์รถ (เช่น BMW, Toyota)</div>
        </div>

        <button
          className="rounded-xl bg-ink px-3 py-2 text-sm font-medium text-white hover:opacity-95"
          onClick={openCreate}
        >
          เพิ่มแบรนด์
        </button>
      </div>

      <Card className="p-5">
        {q.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : q.isError ? (
          <div className="text-sm text-rose-700">โหลดไม่สำเร็จ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="py-3 text-left font-medium">ชื่อแบรนด์</th>
                  <th className="py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line">
                    <td className="py-3">{r.name}</td>
                    <td className="py-3 text-right flex justify-end gap-2">
                      <button
                        className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                        onClick={() => openEdit(r)}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                        onClick={() => deleteMut.mutate(r.id)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-sm text-muted">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={open}
        title={editing ? "แก้ไขแบรนด์รถ" : "เพิ่มแบรนด์รถ"}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted">ชื่อแบรนด์</label>
            <input
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น BMW"
            />
          </div>

          <div className="flex gap-2">
            <button
              disabled={!canSave}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                canSave ? "bg-ink text-white hover:opacity-95" : "bg-stone-200 text-stone-500 cursor-not-allowed"
              }`}
              onClick={() => (editing ? updateMut.mutate() : createMut.mutate())}
            >
              บันทึก
            </button>
            <button
              className="rounded-xl border border-line bg-white px-4 py-2 text-sm hover:bg-stone-50"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}