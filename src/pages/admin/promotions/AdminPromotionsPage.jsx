import React, { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import MultiSelectSearch from "../../../components/ui/MultiSelectSearch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPromotionsApi } from "../../../api/adminPromotions";
import { adminMasterApi } from "../../../api/adminMaster";
import { adminProductsApi } from "../../../api/adminProducts";

export default function AdminPromotionsPage() {
  const qc = useQueryClient();

  // list promotions
  const promosQ = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: adminPromotionsApi.list,
  });

  // categories for target
  const catsQ = useQuery({
    queryKey: ["admin-categories"],
    queryFn: adminMasterApi.listCategories,
  });

  // products for target (โหลด 200 ชิ้นแรกก่อน)
  const productsQ = useQuery({
    queryKey: ["admin-products-for-promo"],
    queryFn: () => adminProductsApi.list({ page: 0, size: 200 }),
  });

  const promos = promosQ.data || [];
  const categories = (catsQ.data || []).map((c) => ({ id: c.id, name: c.name }));

  const productRows = Array.isArray(productsQ.data)
    ? productsQ.data
    : (productsQ.data?.content || []);
  const products = productRows.map((p) => ({ id: p.id, name: `${p.sku} - ${p.name}` }));

  // modal states
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // fields
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [promoType, setPromoType] = useState("PERCENT");
  const [value, setValue] = useState("10");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [active, setActive] = useState(true);
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");
  const [appliesTo, setAppliesTo] = useState("ORDER");

  // targets
  const [productIds, setProductIds] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);

  function resetForm() {
    setCode("");
    setName("");
    setPromoType("PERCENT");
    setValue("10");
    setMaxDiscount("");
    setMinOrderAmount("");
    setStartAt("");
    setEndAt("");
    setActive(true);
    setUsageLimit("");
    setPerUserLimit("");
    setAppliesTo("ORDER");
    setProductIds([]);
    setCategoryIds([]);
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setOpen(true);
  }

  async function openEdit(p) {
    setEditing(p);
    setCode(p.code || "");
    setName(p.name || "");
    setPromoType(p.promoType || "PERCENT");
    setValue(String(p.value ?? "10"));
    setMaxDiscount(p.maxDiscount == null ? "" : String(p.maxDiscount));
    setMinOrderAmount(p.minOrderAmount == null ? "" : String(p.minOrderAmount));
    setStartAt(p.startAt ? toLocalInput(p.startAt) : "");
    setEndAt(p.endAt ? toLocalInput(p.endAt) : "");
    setActive(!!p.active);
    setUsageLimit(p.usageLimit == null ? "" : String(p.usageLimit));
    setPerUserLimit(p.perUserLimit == null ? "" : String(p.perUserLimit));
    setAppliesTo(p.appliesTo || "ORDER");
    setProductIds(p.productIds || p.targetProductIds || []);
    setCategoryIds(p.categoryIds || p.targetCategoryIds || []);
    setOpen(true);

    try {
      const full = await adminPromotionsApi.get(p.id);
      if (full) {
        setEditing(full);
        setCode(full.code || p.code || "");
        setName(full.name || p.name || "");
        setPromoType(full.promoType || p.promoType || "PERCENT");
        setValue(String(full.value ?? p.value ?? "10"));
        setMaxDiscount(full.maxDiscount == null ? "" : String(full.maxDiscount));
        setMinOrderAmount(full.minOrderAmount == null ? "" : String(full.minOrderAmount));
        setStartAt(full.startAt ? toLocalInput(full.startAt) : (p.startAt ? toLocalInput(p.startAt) : ""));
        setEndAt(full.endAt ? toLocalInput(full.endAt) : (p.endAt ? toLocalInput(p.endAt) : ""));
        setActive(full.active != null ? !!full.active : !!p.active);
        setUsageLimit(full.usageLimit == null ? "" : String(full.usageLimit));
        setPerUserLimit(full.perUserLimit == null ? "" : String(full.perUserLimit));
        setAppliesTo(full.appliesTo || p.appliesTo || "ORDER");

        const pIds = full.productIds || full.targetProductIds || (full.products ? full.products.map(x => x.id) : []);
        const cIds = full.categoryIds || full.targetCategoryIds || (full.categories ? full.categories.map(x => x.id) : []);
        setProductIds(pIds);
        setCategoryIds(cIds);
      }
    } catch (err) {
      console.error("Error fetching full promotion detail:", err);
    }
  }

  const createMut = useMutation({
    mutationFn: () =>
      adminPromotionsApi.create({
        code: code.trim(),
        name: name.trim(),
        description: null,
        promoType,
        value: Number(value),
        maxDiscount: maxDiscount === "" ? null : Number(maxDiscount),
        minOrderAmount: minOrderAmount === "" ? null : Number(minOrderAmount),
        startAt: fromLocalInput(startAt),
        endAt: fromLocalInput(endAt),
        active,
        usageLimit: usageLimit === "" ? null : Number(usageLimit),
        perUserLimit: perUserLimit === "" ? null : Number(perUserLimit),
        appliesTo,
      }),
    onSuccess: async (created) => {
      await saveTargetsIfNeeded(created.id, appliesTo, productIds, categoryIds);
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      adminPromotionsApi.update(editing.id, {
        code: code.trim(),
        name: name.trim(),
        description: null,
        promoType,
        value: Number(value),
        maxDiscount: maxDiscount === "" ? null : Number(maxDiscount),
        minOrderAmount: minOrderAmount === "" ? null : Number(minOrderAmount),
        startAt: fromLocalInput(startAt),
        endAt: fromLocalInput(endAt),
        active,
        usageLimit: usageLimit === "" ? null : Number(usageLimit),
        perUserLimit: perUserLimit === "" ? null : Number(perUserLimit),
        appliesTo,
      }),
    onSuccess: async () => {
      await saveTargetsIfNeeded(editing.id, appliesTo, productIds, categoryIds);
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminPromotionsApi.delete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
  });

  async function saveTargetsIfNeeded(promoId, applies, pIds, cIds) {
    if (applies === "PRODUCT") {
      await adminPromotionsApi.setTargets(promoId, { productIds: pIds, categoryIds: [] });
    } else if (applies === "CATEGORY") {
      await adminPromotionsApi.setTargets(promoId, { productIds: [], categoryIds: cIds });
    } else {
      await adminPromotionsApi.setTargets(promoId, { productIds: [], categoryIds: [] });
    }
  }

  const canSave =
    code.trim().length > 0 &&
    name.trim().length > 0 &&
    value !== "" &&
    startAt !== "" &&
    endAt !== "" &&
    !(createMut.isPending || updateMut.isPending);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">โปรโมชัน</div>
          <div className="text-xs text-muted">สร้าง/แก้ไขโปรฯ และกำหนดเป้าหมายสินค้า/หมวดหมู่</div>
        </div>
        <button
          className="rounded-xl bg-ink px-3 py-2 text-sm font-medium text-white hover:opacity-95"
          onClick={openCreate}
        >
          เพิ่มโปรโมชัน
        </button>
      </div>

      <Card className="p-5">
        {promosQ.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : promosQ.isError ? (
          <div className="text-sm text-rose-700">โหลดโปรโมชันไม่สำเร็จ</div>
        ) : (
          <>
            {/* 📱 Mobile Card View */}
            <div className="md:hidden divide-y divide-line">
              {promos.map((p) => (
                <div key={p.id} className="py-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-ink font-mono">{p.code}</div>
                      <div className="text-xs text-muted mt-0.5">{p.name}</div>
                    </div>
                    {p.active ? <Badge tone="green">เปิด</Badge> : <Badge tone="red">ปิด</Badge>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div><span className="text-muted">ประเภท:</span> <span className="font-medium">{p.promoType}</span></div>
                    <div><span className="text-muted">ใช้กับ:</span> <span className="font-medium">{p.appliesTo}</span></div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 rounded-xl border border-line px-3 py-2 text-xs font-medium hover:bg-stone-50 transition"
                      onClick={() => openEdit(p)}
                    >
                      แก้ไข/ตั้งค่า
                    </button>
                    <button
                      className="flex-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-100 transition"
                      onClick={() => deleteMut.mutate(p.id)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
              {promos.length === 0 && (
                <div className="py-8 text-center text-sm text-muted">ไม่พบโปรโมชัน</div>
              )}
            </div>

            {/* 💻 Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">โค้ด</th>
                    <th className="py-3 text-left font-medium">ชื่อ</th>
                    <th className="py-3 text-left font-medium">ประเภท</th>
                    <th className="py-3 text-left font-medium">ใช้กับ</th>
                    <th className="py-3 text-left font-medium">สถานะ</th>
                    <th className="py-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr key={p.id} className="border-b border-line hover:bg-stone-50/50">
                      <td className="py-3 font-mono font-medium">{p.code}</td>
                      <td className="py-3">{p.name}</td>
                      <td className="py-3">{p.promoType}</td>
                      <td className="py-3">{p.appliesTo}</td>
                      <td className="py-3">
                        {p.active ? <Badge tone="green">เปิด</Badge> : <Badge tone="red">ปิด</Badge>}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50 transition"
                            onClick={() => openEdit(p)}
                          >
                            แก้ไข/ตั้งค่า
                          </button>
                          <button
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-100 transition"
                            onClick={() => deleteMut.mutate(p.id)}
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {promos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-muted">
                        ไม่พบโปรโมชัน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Modal open={open} title={editing ? "แก้ไขโปรโมชัน" : "เพิ่มโปรโมชัน"} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="โค้ดโปรโมชัน">
              <input
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น SPRING30"
              />
            </Field>

            <Field label="ชื่อโปรโมชัน">
              <input
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Spring Sale"
              />
            </Field>

            <Field label="ประเภทส่วนลด">
              <select
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={promoType}
                onChange={(e) => setPromoType(e.target.value)}
              >
                <option value="PERCENT">PERCENT</option>
                <option value="FIXED">FIXED</option>
              </select>
            </Field>

            <Field label="ใช้กับ">
              <select
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value)}
              >
                <option value="ORDER">ORDER</option>
                <option value="PRODUCT">PRODUCT</option>
                <option value="CATEGORY">CATEGORY</option>
              </select>
            </Field>

            <Field label="ค่า (เปอร์เซ็นต์/จำนวนเงิน)">
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </Field>

            <Field label="ส่วนลดสูงสุด (ถ้ามี)">
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="ปล่อยว่างได้"
              />
            </Field>

            <Field label="ขั้นต่ำยอดสั่งซื้อ (ถ้ามี)">
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="ปล่อยว่างได้"
              />
            </Field>

            <Field label="จำกัดจำนวนใช้ทั้งระบบ (ถ้ามี)">
              <input
                type="number"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="ปล่อยว่างได้"
              />
            </Field>

            <Field label="จำกัดต่อผู้ใช้ (ถ้ามี)">
              <input
                type="number"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                placeholder="ปล่อยว่างได้"
              />
            </Field>

            <Field label="เริ่มต้น">
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </Field>

            <Field label="สิ้นสุด">
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <div className="text-sm">เปิดใช้งาน</div>
          </div>

          {/* Targets */}
          {appliesTo === "PRODUCT" ? (
            <div>
              <div className="text-sm font-semibold">เลือกสินค้าเป้าหมาย</div>
              <div className="text-xs text-muted">ค้นหาและเลือกได้หลายรายการ</div>
              <div className="mt-2">
                <MultiSelectSearch
                  items={products}
                  selectedIds={productIds}
                  onChange={setProductIds}
                  placeholder="ค้นหาสินค้า..."
                />
              </div>
            </div>
          ) : null}

          {appliesTo === "CATEGORY" ? (
            <div>
              <div className="text-sm font-semibold">เลือกหมวดหมู่เป้าหมาย</div>
              <div className="text-xs text-muted">ค้นหาและเลือกได้หลายรายการ</div>
              <div className="mt-2">
                <MultiSelectSearch
                  items={categories}
                  selectedIds={categoryIds}
                  onChange={setCategoryIds}
                  placeholder="ค้นหาหมวดหมู่..."
                />
              </div>
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              disabled={!canSave}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${canSave ? "bg-ink text-white hover:opacity-95" : "bg-stone-200 text-stone-500 cursor-not-allowed"
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

          {(createMut.isError || updateMut.isError) ? (
            <div className="text-sm text-rose-700">
              บันทึกไม่สำเร็จ (
              {createMut.error?.response?.data?.message ||
                updateMut.error?.response?.data?.message ||
                createMut.error?.message ||
                updateMut.error?.message ||
                "ตรวจสอบข้อมูล/เวลาเริ่ม-สิ้นสุด"}
              )
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function toLocalInput(iso) {
  if (!iso) return "";
  if (Array.isArray(iso)) {
    const [y, m, d, hh = 0, mm = 0] = iso;
    const pad = (n) => String(n).padStart(2, "0");
    return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}`;
  }
  return String(iso).slice(0, 16);
}

function fromLocalInput(v) {
  if (!v) return null;
  return v.length === 16 ? `${v}:00` : v;
}