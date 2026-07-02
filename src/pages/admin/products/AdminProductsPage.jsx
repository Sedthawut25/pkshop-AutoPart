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
  const [imageUrl, setImageUrl] = useState(""); 
  const [description, setDescription] = useState(""); // 🟢 NEW: State สำหรับเก็บรายละเอียดสินค้า
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
    setImageUrl(""); 
    setDescription(""); // 🟢 NEW: รีเซ็ตค่า Description
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
    setImageUrl(p.imageUrl || ""); 
    setDescription(p.description || ""); // 🟢 NEW: ดึง Description มาโชว์ตอนแก้ไข
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
        imageUrl: imageUrl.trim() || null, 
        description: description.trim() || null, // 🟢 NEW: ส่ง Description ไปเซฟ
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
        imageUrl: imageUrl.trim() || null, 
        description: description.trim() || null, // 🟢 NEW: ส่ง Description ไปอัปเดต
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
            className="w-full md:w-auto rounded-xl border border-line bg-white px-3 py-2 text-sm"
            placeholder="ค้นหา ชื่อ/sku..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
          />
          <button
            className="w-full md:w-auto rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-95"
            onClick={openCreate}
          >
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      <Card className="p-0 md:p-5 overflow-hidden">
        {productsQ.isLoading ? (
          <div className="p-5 text-sm text-muted">กำลังโหลด...</div>
        ) : productsQ.isError ? (
          <div className="p-5 text-sm text-rose-700">โหลดสินค้าไม่สำเร็จ</div>
        ) : (
          <>
            {/* 📱 1. LAYOUT FOR MOBILE (Card View) */}
            <div className="md:hidden divide-y divide-line">
              {rows.map((p) => (
                <div key={p.id} className="p-4 space-y-3 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      {/* Thumbnail เล็กๆ */}
                      <div className="w-14 h-14 rounded-lg bg-stone-100 flex-shrink-0 border border-stone-200 overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">No Img</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-ink break-words">{p.name}</div>
                        <div className="text-xs text-muted mt-0.5">SKU: {p.sku || "-"}</div>
                        <div className="text-[11px] text-stone-500 mt-1">{p.category?.name || "ไม่ระบุหมวดหมู่"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div><span className="text-muted">ราคา:</span> <span className="font-semibold text-ink">฿{p.price ?? "-"}</span></div>
                    <div><span className="text-muted">สต๊อก:</span> <StockBadge qty={p.stockQty ?? 0} /></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {p.isActive === false ? (
                        <Badge tone="red">ปิดการขาย</Badge>
                      ) : (
                        <Badge tone="green">เปิดขาย</Badge>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button className="px-2.5 py-1.5 rounded-lg border border-line text-xs font-medium bg-white" onClick={() => { setFitProduct(p); setOpenFitment(true); }}>Fit</button>
                      <button className="px-2.5 py-1.5 rounded-lg border border-line text-xs font-medium bg-white" onClick={() => openEdit(p)}>แก้</button>
                      <button className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-medium bg-rose-50" onClick={() => { if(window.confirm('ลบสินค้านี้?')) deleteMut.mutate(p.id) }}>ลบ</button>
                    </div>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="py-8 text-center text-sm text-muted">ไม่พบสินค้า</div>
              )}
            </div>

            {/* 💻 2. LAYOUT FOR DESKTOP (Table View) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 px-2 text-left font-medium whitespace-nowrap">SKU</th>
                    <th className="py-3 px-2 text-left font-medium min-w-[200px]">ชื่อสินค้า</th>
                    <th className="py-3 px-2 text-left font-medium">หมวดหมู่</th>
                    <th className="py-3 px-2 text-right font-medium">ราคา</th>
                    <th className="py-3 px-2 text-right font-medium">ต้นทุนเฉลี่ย</th>
                    <th className="py-3 px-2 text-right font-medium">สต๊อก</th>
                    <th className="py-3 px-2 text-left font-medium">รูป</th>
                    <th className="py-3 px-2 text-left font-medium">สถานะ</th>
                    <th className="py-3 px-2 text-right font-medium min-w-[220px]">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-b border-line hover:bg-stone-50/50">
                      <td className="py-3 px-2">{p.sku || "-"}</td>
                      <td className="py-3 px-2 font-medium text-ink">{p.name}</td>
                      <td className="py-3 px-2">{p.category?.name || "-"}</td>
                      <td className="py-3 px-2 text-right">{p.price ?? "-"}</td>
                      <td className="py-3 px-2 text-right text-stone-400">{p.importCostAvg ?? "-"}</td>
                      <td className="py-3 px-2 text-right">
                        <StockBadge qty={p.stockQty ?? 0} />
                      </td>

                      <td className="py-3 px-2">
                        {p.imageUrl ? (
                          <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href={p.imageUrl} target="_blank" rel="noreferrer">
                            ดูรูป
                          </a>
                        ) : (
                          <span className="text-xs text-muted">ไม่มี</span>
                        )}
                      </td>

                      <td className="py-3 px-2">
                        {p.isActive === false ? (
                          <Badge tone="red">ปิด</Badge>
                        ) : (
                          <Badge tone="green">เปิด</Badge>
                        )}
                      </td>

                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            className="rounded-xl border border-line px-3 py-1.5 text-xs hover:bg-stone-100 transition"
                            onClick={() => {
                              setFitProduct(p);
                              setOpenFitment(true);
                            }}
                          >
                            Fitment
                          </button>
                          <button
                            className="rounded-xl border border-line px-3 py-1.5 text-xs hover:bg-stone-100 transition"
                            onClick={() => openEdit(p)}
                          >
                            แก้ไข
                          </button>
                          <button
                            className="rounded-xl border border-rose-200 bg-rose-50 text-rose-600 px-3 py-1.5 text-xs hover:bg-rose-100 transition"
                            onClick={() => { if(window.confirm('ยืนยันการลบสินค้า?')) deleteMut.mutate(p.id) }}
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-sm text-muted">
                        ไม่พบสินค้าในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 mt-1 border-t border-line flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-stone-50/50">
              <div className="text-xs text-muted text-center md:text-left">
                แสดงหน้า {page + 1} จากทั้งหมด {totalPages}
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  className="rounded-xl border border-line bg-white px-4 py-1.5 text-sm font-medium hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition"
                  disabled={page <= 0}
                  onClick={() => setPage((x) => x - 1)}
                >
                  ก่อนหน้า
                </button>
                <button
                  className="rounded-xl border border-line bg-white px-4 py-1.5 text-sm font-medium hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition"
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

      {/* Product modal - Responsive & Description Field Added */}
      <Modal
        open={openProduct}
        title={editing ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
        onClose={() => setOpenProduct(false)}
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1 pb-4">
          <Field label="SKU">
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="รหัสสินค้า"
            />
          </Field>

          <Field label="ชื่อสินค้า">
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อสินค้า..."
            />
          </Field>
          
          {/* 🟢 NEW: กล่องใส่ Description กรอกข้อความยาวๆ ได้ */}
          <Field label="รายละเอียดสินค้า">
            <textarea
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition resize-y min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="กรอกรายละเอียด, คุณสมบัติ หรือสเปคของสินค้า..."
              rows={4}
            />
          </Field>

          <Field label="หมวดหมู่">
            <select
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="ราคา (บาท)">
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>

            <Field label="ต้นทุนเฉลี่ย">
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
                value={importCostAvg}
                onChange={(e) => setImportCostAvg(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Image URL (ลิงก์รูปสินค้า)">
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://....jpg"
            />
            <div className="mt-1.5 text-[11px] text-muted">
              ใส่ URL ที่เปิดใน browser ได้ (เช่น รูปจาก CDN/Google Drive แบบ public)
            </div>
          </Field>

          <Field label="สต๊อก (เพิ่มผ่านการนำเข้าเท่านั้น)">
            <input
              className="w-full rounded-xl border border-line bg-stone-100 text-stone-500 px-3 py-2.5 text-sm cursor-not-allowed"
              value={editing ? editing.stockQty ?? 0 : 0}
              readOnly
            />
          </Field>

          <label className="flex items-center gap-2.5 text-sm font-medium bg-stone-50 p-3 rounded-xl border border-stone-100 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isActive} 
              onChange={(e) => setIsActive(e.target.checked)} 
              className="w-4 h-4 rounded border-gray-300 text-ink focus:ring-ink cursor-pointer"
            />
            เปิดให้ลูกค้าสามารถสั่งซื้อสินค้านี้ได้ (Active)
          </label>

          <div className="flex gap-2 pt-2">
            <button
              disabled={!canSave}
              className={`flex-1 md:flex-none rounded-xl px-6 py-2.5 text-sm font-medium transition ${
                canSave ? "bg-ink text-white hover:opacity-90 shadow-sm" : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
              onClick={() => (editing ? updateMut.mutate() : createMut.mutate())}
            >
              {createMut.isPending || updateMut.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
            <button
              className="flex-1 md:flex-none rounded-xl border border-line bg-white px-6 py-2.5 text-sm font-medium hover:bg-stone-50 transition"
              onClick={() => setOpenProduct(false)}
            >
              ยกเลิก
            </button>
          </div>

          {createMut.isError || updateMut.isError ? (
            <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200">
              ❌ บันทึกไม่สำเร็จ กรุณาตรวจสอบ SKU ซ้ำ หรือกรอกข้อมูลให้ครบถ้วน
            </div>
          ) : null}
        </div>
      </Modal>

      {/* Fitment modal (เก็บของเดิมไว้) */}
      <FitmentModal open={openFitment} product={fitProduct} onClose={() => setOpenFitment(false)} />
    </div>
  );
}

// ... โค้ดส่วนล่าง (Field, StockBadge, FitmentModal) ใช้ตัวเดิมของพี่ได้เลยครับ ...

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs font-medium text-stone-600 mb-1">{label}</div>
      <div>{children}</div>
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
      <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
        <div className="text-xs text-muted">
          กำหนดรุ่นรถ + ช่วงปีที่รองรับ (ตัวอย่าง: Civic 2016–2020)
        </div>

        {/* form */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="แบรนด์รถ">
            <select
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
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
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
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
            <input type="number" className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
                   value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
          </Field>

          <Field label="ปีสิ้นสุด">
            <input type="number" className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition"
                   value={yearTo} onChange={(e) => setYearTo(e.target.value)} />
          </Field>
        </div>

        <div className="flex gap-2">
          <button
            disabled={!canSaveFit}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              canSaveFit ? "bg-ink text-white hover:opacity-90" : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
            onClick={() => (editingFit ? updateMut.mutate() : addMut.mutate())}
          >
            {editingFit ? "บันทึกการแก้ไข" : "เพิ่ม Fitment"}
          </button>

          {editingFit ? (
            <button
              className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium hover:bg-stone-50 transition"
              onClick={resetFitForm}
            >
              ยกเลิกแก้ไข
            </button>
          ) : null}
        </div>

        {/* list */}
        <div className="rounded-xl border border-line overflow-hidden mt-4">
          <div className="bg-stone-50 py-2.5 px-4 text-sm font-semibold border-b border-line">รายการ Fitment ที่มีอยู่</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted bg-white">
                <tr className="border-b border-line">
                  <th className="py-2.5 px-4 text-left font-medium">แบรนด์/รุ่น</th>
                  <th className="py-2.5 px-4 text-center font-medium">ช่วงปี</th>
                  <th className="py-2.5 px-4 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-4 font-medium text-ink">{r.brandName} <span className="text-muted font-normal">{r.modelName}</span></td>
                    <td className="py-2.5 px-4 text-center">{r.yearFrom} – {r.yearTo}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          className="rounded-lg border border-line px-2.5 py-1 text-xs hover:bg-stone-100"
                          onClick={() => startEdit(r)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="rounded-lg border border-rose-200 text-rose-600 bg-rose-50 px-2.5 py-1 text-xs hover:bg-rose-100"
                          onClick={() => { if(window.confirm('ลบ Fitment นี้?')) delMut.mutate(r.id) }}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-muted">ยังไม่มี Fitment สำหรับสินค้านี้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(addMut.isError || updateMut.isError) ? (
          <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200 mt-2">
            ❌ บันทึก Fitment ไม่สำเร็จ (โปรดตรวจสอบช่วงปีหรือข้อมูลอาจซ้ำ)
          </div>
        ) : null}
      </div>
    </Modal>
  );
}