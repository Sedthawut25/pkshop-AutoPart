import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  FileImage,
  Plus,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import Card from "../../../components/ui/Card";
import { adminPoApi } from "../../../api/adminPo";
import { supplierClaimsApi } from "../../../api/supplierClaims";
import {
  CLAIM_STATUSES,
  CLAIM_TYPES,
  ClaimStatusBadge,
  claimTypeLabel,
  formatClaimMoney,
  formatDateTime,
  getApiErrorMessage,
  getAttachmentUrls,
  pageContent,
  poDetailItems,
  poDisplayName,
  poRows,
  supplierDisplayName,
} from "../../../features/supplierClaims/supplierClaimHelpers";

const initialForm = {
  purchaseOrderId: "",
  productId: "",
  quantity: 1,
  claimType: "RETURN_REFUND",
  refundAmount: "",
  description: "",
};

export default function AdminSupplierClaimsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [attachmentUrls, setAttachmentUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState(null);

  const claimsQuery = useQuery({
    queryKey: ["admin-supplier-claims", status, page],
    queryFn: () => supplierClaimsApi.adminList({ status, page, size: 12 }),
    staleTime: 10_000,
  });

  const poQuery = useQuery({
    queryKey: ["admin-po-list-for-supplier-claims"],
    queryFn: () => adminPoApi.list({}),
    enabled: openCreate,
    staleTime: 20_000,
  });

  const poDetailQuery = useQuery({
    queryKey: ["admin-po-detail-for-supplier-claim", form.purchaseOrderId],
    queryFn: () => adminPoApi.get(form.purchaseOrderId),
    enabled: openCreate && Number(form.purchaseOrderId) > 0,
  });

  const selectedItems = poDetailItems(poDetailQuery.data);
  const selectedItem = useMemo(
    () =>
      selectedItems.find(
        (item) => Number(item?.product?.id) === Number(form.productId),
      ),
    [selectedItems, form.productId],
  );

  const handleImageUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const urls = await Promise.all(
        selectedFiles.map((file) => supplierClaimsApi.uploadAttachment(file))
      );
      const validUrls = urls.filter(Boolean);
      setAttachmentUrls((prev) => [...prev, ...validUrls]);
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setNotice({ type: "error", text: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพขึ้น Cloudinary" });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const createMut = useMutation({
    mutationFn: async () => {
      return supplierClaimsApi.create({
        purchaseOrderId: Number(form.purchaseOrderId),
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        claimType: form.claimType,
        description: form.description.trim(),
        refundAmount: form.refundAmount === "" ? null : Number(form.refundAmount),
        attachmentUrls,
      });
    },
    onSuccess: async () => {
      setOpenCreate(false);
      setForm(initialForm);
      setAttachmentUrls([]);
      setNotice({ type: "success", text: "สร้างเคลมซัพพลายเออร์สำเร็จ" });
      await qc.invalidateQueries({ queryKey: ["admin-supplier-claims"] });
    },
    onError: (error) => {
      setNotice({ type: "error", text: getApiErrorMessage(error) });
    },
  });

  const cancelMut = useMutation({
    mutationFn: (claimId) => supplierClaimsApi.cancel(claimId),
    onSuccess: async (claim) => {
      setSelectedClaim(claim);
      setNotice({ type: "success", text: "ยกเลิกเคลมและคืนสต็อกแล้ว" });
      await qc.invalidateQueries({ queryKey: ["admin-supplier-claims"] });
    },
    onError: (error) => setNotice({ type: "error", text: getApiErrorMessage(error) }),
  });

  const receiveMut = useMutation({
    mutationFn: (claimId) => supplierClaimsApi.receiveReplacement(claimId),
    onSuccess: async (claim) => {
      setSelectedClaim(claim);
      setNotice({ type: "success", text: "รับสินค้าเปลี่ยนเข้าสต็อกแล้ว" });
      await qc.invalidateQueries({ queryKey: ["admin-supplier-claims"] });
    },
    onError: (error) => setNotice({ type: "error", text: getApiErrorMessage(error) }),
  });

  const rows = pageContent(claimsQuery.data);
  const totalPages = claimsQuery.data?.totalPages ?? 1;
  const totalElements = claimsQuery.data?.totalElements ?? rows.length;
  const canSubmit =
    Number(form.purchaseOrderId) > 0 &&
    Number(form.productId) > 0 &&
    Number(form.quantity) > 0 &&
    form.description.trim().length > 0 &&
    !isUploading &&
    !createMut.isPending;

  function updateForm(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openCreateModal() {
    setNotice(null);
    setForm(initialForm);
    setAttachmentUrls([]);
    setOpenCreate(true);
  }

  function handleCancelClaim(claim) {
    const ok = window.confirm(
      `ยืนยันยกเลิกเคลม #${claim.id}? ระบบจะคืนสต็อกกลับตาม backend`,
    );
    if (ok) cancelMut.mutate(claim.id);
  }

  function handleReceiveReplacement(claim) {
    const ok = window.confirm(
      `ยืนยันรับสินค้าเปลี่ยนจากซัพพลายเออร์สำหรับเคลม #${claim.id}?`,
    );
    if (ok) receiveMut.mutate(claim.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">เคลมซัพพลายเออร์</div>
          <div className="text-xs text-muted">
            สร้างใบส่งคืน ขอเงินคืน หรือรอรับสินค้าเปลี่ยนจากซัพพลายเออร์
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            {CLAIM_STATUSES.map((item) => (
              <option key={item.value || "ALL"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            <Plus size={16} />
            สร้างเคลม
          </button>
        </div>
      </div>

      {notice ? (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-sm",
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
        >
          {notice.text}
        </div>
      ) : null}

      <Card className="p-5">
        {claimsQuery.isLoading ? (
          <div className="text-sm text-muted">กำลังโหลด...</div>
        ) : claimsQuery.isError ? (
          <div className="text-sm text-rose-700">
            โหลดรายการเคลมไม่สำเร็จ ({getApiErrorMessage(claimsQuery.error)})
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-xs text-muted">
              <span>{totalElements} รายการ</span>
              <span>
                หน้า {page + 1} / {Math.max(totalPages, 1)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-3 text-left font-medium">เลขเคลม</th>
                    <th className="py-3 text-left font-medium">สินค้า</th>
                    <th className="py-3 text-left font-medium">PO / Supplier</th>
                    <th className="py-3 text-right font-medium">จำนวน</th>
                    <th className="py-3 text-right font-medium">ยอดเงิน</th>
                    <th className="py-3 text-left font-medium">สถานะ</th>
                    <th className="py-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((claim) => (
                    <tr key={claim.id} className="border-b border-line align-top">
                      <td className="py-3">
                        <div className="font-medium">#{claim.id}</div>
                        <div className="text-xs text-muted">
                          {formatDateTime(claim.createdAt)}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{claim.productName || "-"}</div>
                        <div className="text-xs text-muted">
                          {claimTypeLabel(claim.claimType)}
                        </div>
                      </td>
                      <td className="py-3">
                        <div>{claim.poNumber || `PO-${claim.purchaseOrderId}`}</div>
                        <div className="text-xs text-muted">
                          {supplierDisplayName(claim.supplier)}
                        </div>
                      </td>
                      <td className="py-3 text-right">{claim.quantity ?? "-"}</td>
                      <td className="py-3 text-right">
                        {formatClaimMoney(claim.refundAmount)}
                      </td>
                      <td className="py-3">
                        <ClaimStatusBadge status={claim.status} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedClaim(claim)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                        >
                          <Eye size={15} />
                          รายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-muted">
                        ไม่พบรายการเคลมซัพพลายเออร์
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          </>
        )}
      </Card>

      {openCreate ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="w-full max-w-4xl rounded-xl border border-line bg-white shadow-soft">
            <div className="flex items-start justify-between border-b border-line p-5">
              <div>
                <div className="text-base font-semibold">สร้างเคลมซัพพลายเออร์</div>
                <div className="text-xs text-muted">
                  เมื่อสร้างสำเร็จ backend จะตัดสต็อกออกทันทีตามจำนวนเคลม
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="rounded-xl border border-line p-2 hover:bg-stone-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium">ใบสั่งซื้อ</span>
                  <select
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    value={form.purchaseOrderId}
                    onChange={(event) => {
                      updateForm("purchaseOrderId", event.target.value);
                      updateForm("productId", "");
                    }}
                  >
                    <option value="">เลือก PO</option>
                    {poRows(poQuery.data).map((po) => (
                      <option key={po.id} value={po.id}>
                        {poDisplayName(po)} - {supplierDisplayName(po.supplierUser || po.supplier)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium">สินค้าใน PO</span>
                  <select
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    value={form.productId}
                    disabled={!form.purchaseOrderId || poDetailQuery.isLoading}
                    onChange={(event) => updateForm("productId", event.target.value)}
                  >
                    <option value="">
                      {poDetailQuery.isLoading ? "กำลังโหลดสินค้า..." : "เลือกสินค้า"}
                    </option>
                    {selectedItems.map((item) => (
                      <option key={item.id} value={item.product?.id || ""}>
                        {item.product?.name || `สินค้า #${item.product?.id}`} / สั่งซื้อ{" "}
                        {item.qty} ชิ้น
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium">ประเภทเคลม</span>
                  <select
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    value={form.claimType}
                    onChange={(event) => updateForm("claimType", event.target.value)}
                  >
                    {CLAIM_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium">จำนวนที่เคลม</span>
                  <input
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    type="number"
                    min="1"
                    max={selectedItem?.qty || undefined}
                    value={form.quantity}
                    onChange={(event) => updateForm("quantity", event.target.value)}
                  />
                  {selectedItem ? (
                    <span className="text-xs text-muted">
                      จำนวนใน PO: {selectedItem.qty} ชิ้น, ต้นทุนต่อหน่วย:{" "}
                      {formatClaimMoney(selectedItem.targetUnitCost)}
                    </span>
                  ) : null}
                </label>

                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="font-medium">ยอดเงินคืน</span>
                  <input
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="เว้นว่างเพื่อให้ backend คำนวณจากต้นทุนใน PO"
                    value={form.refundAmount}
                    onChange={(event) => updateForm("refundAmount", event.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="font-medium">รายละเอียดปัญหา</span>
                  <textarea
                    className="min-h-28 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    placeholder="ระบุเหตุผล สภาพสินค้า จำนวน และเงื่อนไขที่ต้องการให้ซัพพลายเออร์พิจารณา"
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                  />
                </label>
              </div>

              <div className="rounded-xl border border-dashed border-line p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-medium">หลักฐานแนบ (รูปภาพ)</div>
                    <div className="text-xs text-muted">
                      อัปโหลดรูปภาพขึ้น Cloudinary ทันทีเมื่อเลือกไฟล์
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50">
                    <Upload size={16} />
                    {isUploading ? "กำลังอัปโหลด..." : "เลือกรูปภาพ"}
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading}
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {isUploading && (
                  <div className="mt-2 text-xs font-semibold text-blue-600 animate-pulse">
                    กำลังอัปโหลดรูปภาพขึ้น Cloudinary...
                  </div>
                )}

                {attachmentUrls.length > 0 ? (
                  <div className="mt-3 grid gap-3 grid-cols-2 md:grid-cols-4">
                    {attachmentUrls.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="group relative rounded-xl border border-line overflow-hidden bg-stone-50 shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`Uploaded evidence ${index + 1}`}
                          className="h-24 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAttachmentUrls((current) =>
                              current.filter((_, i) => i !== index),
                            )
                          }
                          className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-black transition shadow"
                          title="ลบรูปนี้"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-line p-5">
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-sm hover:bg-stone-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => createMut.mutate()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMut.isPending ? (
                  "กำลังสร้าง..."
                ) : (
                  <>
                    <Plus size={16} />
                    สร้างเคลม
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedClaim ? (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onCancel={handleCancelClaim}
          onReceiveReplacement={handleReceiveReplacement}
          onOpenImage={(url) => setSelectedImage(url)}
          isWorking={cancelMut.isPending || receiveMut.isPending}
        />
      ) : null}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 rounded-full bg-white/10 p-2 text-white shadow-lg backdrop-blur-md hover:bg-white/20 md:top-0 md:-right-12"
            >
              <X className="h-6 w-6 md:h-8 md:w-8" />
            </button>
            <div className="flex w-full justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-2xl">
              <img
                src={selectedImage}
                alt="หลักฐานเคลมรูปใหญ่"
                className="h-auto max-h-[75vh] w-auto max-w-full rounded-xl object-contain md:max-h-[85vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimDetailModal({
  claim,
  onClose,
  onCancel,
  onReceiveReplacement,
  onOpenImage,
  isWorking,
}) {
  const canCancel = claim.status === "PENDING";
  const canReceive =
    claim.status === "APPROVED" && claim.claimType === "REPLACEMENT";
  const attachments = getAttachmentUrls(claim);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-3xl rounded-xl border border-line bg-white shadow-soft">
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <div className="text-base font-semibold">เคลม #{claim.id}</div>
            <div className="text-xs text-muted">
              {claim.poNumber || `PO-${claim.purchaseOrderId}`} /{" "}
              {formatDateTime(claim.createdAt)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line p-2 hover:bg-stone-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <InfoBox label="สถานะ" value={<ClaimStatusBadge status={claim.status} />} />
            <InfoBox label="ประเภท" value={claimTypeLabel(claim.claimType)} />
            <InfoBox label="จำนวน" value={`${claim.quantity ?? "-"} ชิ้น`} />
            <InfoBox label="ยอดเงิน" value={formatClaimMoney(claim.refundAmount)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock title="สินค้า" lines={[claim.productName || "-", `ID: ${claim.productId || "-"}`]} />
            <InfoBlock
              title="ซัพพลายเออร์"
              lines={[
                supplierDisplayName(claim.supplier),
                claim.supplier?.email || "",
              ]}
            />
          </div>

          <TextBlock title="รายละเอียดจากแอดมิน" value={claim.description} />
          <TextBlock title="คำตอบจากซัพพลายเออร์" value={claim.supplierResponse || "-"} />

          {attachments.length > 0 ? (
            <div>
              <div className="mb-2 text-sm font-semibold">หลักฐานแนบ ({attachments.length} รูป)</div>
              <div className="grid gap-3 md:grid-cols-3">
                {attachments.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => onOpenImage(url)}
                    className="group relative block h-36 w-full overflow-hidden rounded-xl border border-line bg-stone-50 text-left transition hover:shadow-md"
                  >
                    <img
                      src={url}
                      alt={`claim attachment ${idx + 1}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition duration-200 group-hover:opacity-100">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-line p-5 md:flex-row md:justify-end">
          {canCancel ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => onCancel(claim)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 disabled:opacity-50"
            >
              <RotateCcw size={16} />
              ยกเลิกและคืนสต็อก
            </button>
          ) : null}
          {canReceive ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => onReceiveReplacement(claim)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              รับสินค้าเปลี่ยนเข้าสต็อก
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm hover:bg-stone-50"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function InfoBlock({ title, lines }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 space-y-1 text-sm text-muted">
        {lines.filter(Boolean).map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function TextBlock({ title, value }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="whitespace-pre-wrap rounded-xl border border-line bg-stone-50 p-4 text-sm">
        {value || "-"}
      </div>
    </div>
  );
}
