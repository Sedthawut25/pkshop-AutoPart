import React, { useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminProductsApi } from "../../../api/adminProducts";
import { adminMasterApi } from "../../../api/adminMaster";

export default function AdminProductsPage() {
  const qc = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const size = 12;

  // product modal
  const [openProduct, setOpenProduct] = useState(false);
  const [editing, setEditing] = useState(null);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("0");
  const [importCostAvg, setImportCostAvg] = useState("0");
  const [imageUrl, setImageUrl] = useState(""); // ✅ NEW
  const [isActive, setIsActive] = useState(true);

  // fitment modal
  const [openFitment, setOpenFitment] = useState(false);
  const [fitProduct, setFitProduct] = useState(null);

  const params = useMemo(() => {
    const p = { page, size };
    if (keyword.trim()) p.keyword = keyword.trim();
    return p;
  }, [keyword, page]);

  const productsQ = useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => adminProductsApi.list(params),
  });

  const categoriesQ = useQuery({
    queryKey: ["admin-categories"],
    queryFn: adminMasterApi.listCategories,
  });

  const categories = categoriesQ.data || [];
  const pageData = productsQ.data;
  const rows = pageData?.content || [];
  const totalPages = pageData?.totalPages ?? 1;

  function resetForm() {
    setSku("");
    setName("");
    setCategoryId("");
    setPrice("0");
    setImportCostAvg("0");
    setImageUrl(""); // ✅ NEW
    setIsActive(true);
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setOpenProduct(true);
  }

  function openEdit(p) {
    setEditing(p);
    setSku(p.sku || "");
    setName(p.name || "");
    setCategoryId(p.category?.id ? String(p.category.id) : "");
    setPrice(String(p.price ?? "0"));
    setImportCostAvg(String(p.importCostAvg ?? "0"));
    setImageUrl(p.imageUrl || ""); // ✅ NEW
    setIsActive(p.isActive !== false);
    setOpenProduct(true);
  }

  const createMut = useMutation({
    mutationFn: () =>
      adminProductsApi.create({
        sku: sku.trim(),
        name: name.trim(),
        categoryId: categoryId ? Number(categoryId) : null,
        price: Number(price),
        importCostAvg: Number(importCostAvg),
        imageUrl: imageUrl.trim() || null, // ✅ NEW
        isActive,
      }),
    onSuccess: async () => {
      setOpenProduct(false);
      await qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      adminProductsApi.update(editing.id, {
        sku: sku.trim(),
        name: name.trim(),
        categoryId: categoryId ? Number(categoryId) : null,
        price: Number(price),
        importCostAvg: Number(importCostAvg),
        imageUrl: imageUrl.trim() || null, // ✅ NEW
        isActive,
      }),
    onSuccess: async () => {
      setOpenProduct(false);
      await qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminProductsApi.delete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const canSave =
    sku.trim().length > 0 &&
    name.trim().length > 0 &&
    price !== "" &&
    importCostAvg !== "" &&
    !(createMut.isPending || updateMut.isPending);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">สินค้า</div>
          <div className="text-xs text-muted">
            สต๊อกจะเพิ่มเฉพาะเมื่อ “รับเข้าโกดัง” จากการนำเข้าเท่านั้น (ถ้าไม่เคยนำเข้า = 0)
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            placeholder="ค้นหา ชื่อ/sku..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
          />
          <button
            className="rounded-xl bg-ink px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            onClick={openCreate}
          >
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      <Card className="p-5">
        {productsQ.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : productsQ.isError ? (
          <div className="text-sm text-rose-700">โหลดสินค้าไม่สำเร็จ</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">SKU</th>
                    <th className="py-3 text-left font-medium">ชื่อสินค้า</th>
                    <th className="py-3 text-left font-medium">หมวดหมู่</th>
                    <th className="py-3 text-right font-medium">ราคา</th>
                    <th className="py-3 text-right font-medium">ต้นทุนเฉลี่ย</th>
                    <th className="py-3 text-right font-medium">สต๊อก</th>
                    <th className="py-3 text-left font-medium">รูป</th>
                    <th className="py-3 text-left font-medium">สถานะ</th>
                    <th className="py-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-b border-line">
                      <td className="py-3">{p.sku || "-"}</td>
                      <td className="py-3">{p.name}</td>
                      <td className="py-3">{p.category?.name || "-"}</td>
                      <td className="py-3 text-right">{p.price ?? "-"}</td>
                      <td className="py-3 text-right">{p.importCostAvg ?? "-"}</td>
                      <td className="py-3 text-right">
                        <StockBadge qty={p.stockQty ?? 0} />
                      </td>

                      <td className="py-3">
                        {p.imageUrl ? (
                          <a className="text-xs underline" href={p.imageUrl} target="_blank" rel="noreferrer">
                            ดูรูป
                          </a>
                        ) : (
                          <span className="text-xs text-muted">ไม่มี</span>
                        )}
                      </td>

                      <td className="py-3">
                        {p.isActive === false ? (
                          <Badge tone="red">ปิดการขาย</Badge>
                        ) : (
                          <Badge tone="green">เปิดขาย</Badge>
                        )}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                            onClick={() => {
                              setFitProduct(p);
                              setOpenFitment(true);
                            }}
                          >
                            Fitment
                          </button>
                          <button
                            className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                            onClick={() => openEdit(p)}
                          >
                            แก้ไข
                          </button>
                          <button
                            className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                            onClick={() => deleteMut.mutate(p.id)}
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-sm text-muted">
                        ไม่พบสินค้า
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-muted">
                หน้า {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-50"
                  disabled={page <= 0}
                  onClick={() => setPage((x) => x - 1)}
                >
                  ก่อนหน้า
                </button>
                <button
                  className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-50"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((x) => x + 1)}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Product modal */}
      <Modal
        open={openProduct}
        title={editing ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
        onClose={() => setOpenProduct(false)}
      >
        <div className="space-y-3">
          <Field label="SKU">
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </Field>

          <Field label="ชื่อสินค้า">
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="หมวดหมู่">
            <select
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">- ไม่ระบุ -</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="ราคา">
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>

            <Field label="ต้นทุนเฉลี่ย">
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                value={importCostAvg}
                onChange={(e) => setImportCostAvg(e.target.value)}
              />
            </Field>
          </div>

          {/* ✅ NEW: Image URL */}
          <Field label="Image URL (ลิงก์รูปสินค้า)">
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://....jpg"
            />
            <div className="mt-1 text-xs text-muted">
              ใส่ URL ที่เปิดใน browser ได้ (http/https) เช่น รูปจาก CDN/Google Drive (แบบ public)
            </div>
          </Field>

          <Field label="สต๊อก (แก้ไม่ได้)">
            <input
              className="w-full rounded-xl border border-line bg-stone-50 px-3 py-2 text-sm"
              value={editing ? editing.stockQty ?? 0 : 0}
              readOnly
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            เปิดขาย
          </label>

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
              onClick={() => setOpenProduct(false)}
            >
              ยกเลิก
            </button>
          </div>

          {createMut.isError || updateMut.isError ? (
            <div className="text-sm text-rose-700">บันทึกไม่สำเร็จ (ตรวจ SKU ซ้ำ/ข้อมูลไม่ครบ)</div>
          ) : null}
        </div>
      </Modal>

      {/* Fitment modal */}
      <FitmentModal open={openFitment} product={fitProduct} onClose={() => setOpenFitment(false)} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StockBadge({ qty }) {
  const n = Number(qty || 0);
  if (n <= 0) return <Badge tone="red">0</Badge>;
  if (n <= 10) return <Badge tone="yellow">{n}</Badge>;
  return <Badge tone="green">{n}</Badge>;
}

function FitmentModal({ open, product, onClose }) {
  const qc = useQueryClient();

  const brandsQ = useQuery({
    queryKey: ["admin-car-brands"],
    queryFn: adminMasterApi.listBrands,
    enabled: open,
  });

  const [brandId, setBrandId] = useState("");
  const modelsQ = useQuery({
    queryKey: ["admin-car-models", brandId],
    queryFn: () => adminMasterApi.listModels(brandId ? Number(brandId) : null),
    enabled: open,
  });

  const fitQ = useQuery({
    queryKey: ["admin-product-fitments", product?.id],
    queryFn: () => adminProductsApi.fitments(product.id),
    enabled: open && !!product?.id,
  });

  const [editingFit, setEditingFit] = useState(null);
  const [modelId, setModelId] = useState("");
  const [yearFrom, setYearFrom] = useState("2000");
  const [yearTo, setYearTo] = useState("2026");

  function resetFitForm() {
    setEditingFit(null);
    setBrandId("");
    setModelId("");
    setYearFrom("2000");
    setYearTo("2026");
  }

  React.useEffect(() => {
    if (open) resetFitForm();
  }, [open]);

  const addMut = useMutation({
    mutationFn: () =>
      adminProductsApi.addFitment(product.id, {
        carModelId: Number(modelId),
        yearFrom: Number(yearFrom),
        yearTo: Number(yearTo),
      }),
    onSuccess: async () => {
      resetFitForm();
      await qc.invalidateQueries({ queryKey: ["admin-product-fitments", product.id] });
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      adminProductsApi.updateFitment(product.id, editingFit.id, {
        carModelId: Number(modelId),
        yearFrom: Number(yearFrom),
        yearTo: Number(yearTo),
      }),
    onSuccess: async () => {
      resetFitForm();
      await qc.invalidateQueries({ queryKey: ["admin-product-fitments", product.id] });
    },
  });

  const delMut = useMutation({
    mutationFn: (fitmentId) => adminProductsApi.deleteFitment(product.id, fitmentId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-product-fitments", product.id] });
    },
  });

  const brands = brandsQ.data || [];
  const models = modelsQ.data || [];
  const rows = fitQ.data || [];

  const canSaveFit =
    Number(modelId) > 0 &&
    Number(yearFrom) > 0 &&
    Number(yearTo) > 0 &&
    Number(yearFrom) <= Number(yearTo) &&
    !(addMut.isPending || updateMut.isPending);

  function startEdit(r) {
    setEditingFit(r);
    setBrandId(String(r.brandId));
    setModelId(String(r.modelId));
    setYearFrom(String(r.yearFrom));
    setYearTo(String(r.yearTo));
  }

  return (
    <Modal open={open} title={`Fitment ของสินค้า: ${product?.sku || ""}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-xs text-muted">
          กำหนดรุ่นรถ + ช่วงปีที่รองรับ (ตัวอย่าง: Civic 2016–2020)
        </div>

        {/* form */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="แบรนด์รถ">
            <select
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setModelId("");
              }}
            >
              <option value="">เลือกแบรนด์...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>

          <Field label="รุ่นรถ">
            <select
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            >
              <option value="">เลือกรุ่น...</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </Field>

          <Field label="ปีเริ่มต้น">
            <input type="number" className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                   value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
          </Field>

          <Field label="ปีสิ้นสุด">
            <input type="number" className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                   value={yearTo} onChange={(e) => setYearTo(e.target.value)} />
          </Field>
        </div>

        <div className="flex gap-2">
          <button
            disabled={!canSaveFit}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              canSaveFit ? "bg-ink text-white hover:opacity-95" : "bg-stone-200 text-stone-500 cursor-not-allowed"
            }`}
            onClick={() => (editingFit ? updateMut.mutate() : addMut.mutate())}
          >
            {editingFit ? "บันทึกการแก้ไข" : "เพิ่ม Fitment"}
          </button>

          {editingFit ? (
            <button
              className="rounded-xl border border-line bg-white px-4 py-2 text-sm hover:bg-stone-50"
              onClick={resetFitForm}
            >
              ยกเลิกแก้ไข
            </button>
          ) : null}
        </div>

        {/* list */}
        <Card className="p-4">
          <div className="text-sm font-semibold">รายการ Fitment</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="py-2 text-left font-medium">แบรนด์</th>
                  <th className="py-2 text-left font-medium">รุ่น</th>
                  <th className="py-2 text-right font-medium">ช่วงปี</th>
                  <th className="py-2 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line">
                    <td className="py-2">{r.brandName}</td>
                    <td className="py-2">{r.modelName}</td>
                    <td className="py-2 text-right">{r.yearFrom}–{r.yearTo}</td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                          onClick={() => startEdit(r)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="rounded-xl border border-line px-3 py-1.5 text-sm hover:bg-stone-50"
                          onClick={() => delMut.mutate(r.id)}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-sm text-muted">ยังไม่มี Fitment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {(addMut.isError || updateMut.isError) ? (
          <div className="text-sm text-rose-700">บันทึก Fitment ไม่สำเร็จ (ตรวจปี/ข้อมูลซ้ำ)</div>
        ) : null}
      </div>
    </Modal>
    
  );

}