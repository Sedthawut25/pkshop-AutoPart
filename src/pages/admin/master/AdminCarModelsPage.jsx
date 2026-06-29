import React, { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminMasterApi } from "../../../api/adminMaster";

export default function AdminCarModelsPage() {
  const qc = useQueryClient();

  // filter
  const [brandId, setBrandId] = useState("");

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [editBrandId, setEditBrandId] = useState("");

  const brandsQ = useQuery({
    queryKey: ["admin-car-brands"],
    queryFn: adminMasterApi.listBrands,
  });

  const modelsQ = useQuery({
    queryKey: ["admin-car-models", brandId],
    queryFn: () => adminMasterApi.listModels(brandId ? Number(brandId) : null),
  });

  const createMut = useMutation({
    mutationFn: () =>
      adminMasterApi.createModel({
        brandId: Number(editBrandId),
        name: name.trim(),
      }),
    onSuccess: async () => {
      setOpen(false);
      setName("");
      setEditBrandId("");
      await qc.invalidateQueries({ queryKey: ["admin-car-models", brandId] });
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      adminMasterApi.updateModel(editing.id, {
        brandId: Number(editBrandId),
        name: name.trim(),
      }),
    onSuccess: async () => {
      setOpen(false);
      setEditing(null);
      setName("");
      setEditBrandId("");
      await qc.invalidateQueries({ queryKey: ["admin-car-models", brandId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminMasterApi.deleteModel(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-car-models", brandId] });
    },
  });

  const brands = brandsQ.data || [];
  const models = modelsQ.data || [];

  const canSave = useMemo(() => {
    return name.trim().length > 0 && Number(editBrandId) > 0 && !(createMut.isPending || updateMut.isPending);
  }, [name, editBrandId, createMut.isPending, updateMut.isPending]);

  function openCreate() {
    setEditing(null);
    setName("");
    setEditBrandId(brandId || "");
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setName(row.name);
    setEditBrandId(String(row.brand?.id || ""));
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">รุ่นรถ</div>
          <div className="text-xs text-muted">เลือกแบรนด์เพื่อดู/จัดการรุ่นรถ</div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
            <option value="">ทุกแบรนด์</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            className="rounded-xl bg-ink px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            onClick={openCreate}
          >
            เพิ่มรุ่นรถ
          </button>
        </div>
      </div>

      <Card className="p-5">
        {modelsQ.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : modelsQ.isError ? (
          <div className="text-sm text-rose-700">โหลดไม่สำเร็จ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="py-3 text-left font-medium">แบรนด์</th>
                  <th className="py-3 text-left font-medium">รุ่น</th>
                  <th className="py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id} className="border-b border-line">
                    <td className="py-3">{m.brand?.name || "-"}</td>
                    <td className="py-3">{m.name}</td>
                    <td className="py-3 text-right flex justify-end gap-2">
                      <button
                        className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                        onClick={() => openEdit(m)}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                        onClick={() => deleteMut.mutate(m.id)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
                {models.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-muted">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} title={editing ? "แก้ไขรุ่นรถ" : "เพิ่มรุ่นรถ"} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted">แบรนด์รถ</label>
            <select
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={editBrandId}
              onChange={(e) => setEditBrandId(e.target.value)}
            >
              <option value="">เลือกแบรนด์...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted">ชื่อรุ่น</label>
            <input
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Civic, Camry"
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