import React, { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import { authApi } from "../../api/auth";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

export default function SupplierRegisterPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const canSubmit = useMemo(() => {
    if (!email.trim() || !fullName.trim() || !password) return false;
    if (password.length < 8) return false;
    if (password !== confirm) return false;
    return true;
  }, [email, fullName, password, confirm]);

  const mut = useMutation({
    mutationFn: () =>
      authApi.registerSupplier({
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        password,
        role: "SUPPLIER", // ✅ สำคัญ
      }),
    onSuccess: () => {
      alert("สมัครสมาชิกซัพพลายเออร์สำเร็จ ✅ กรุณาเข้าสู่ระบบ");
      nav("/login");
    },
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left info */}
          <div className="hidden md:flex flex-col justify-center">
            <div className="text-3xl font-semibold leading-tight">
              สมัครสมาชิก <span className="text-stone-500">ซัพพลายเออร์</span>
            </div>
            <div className="mt-3 text-sm text-muted">
              สมัครเพื่อรับใบสั่งซื้อ (PO) จากแอดมิน และส่งใบเสนอราคา (Quotation) กลับเข้าระบบ PKSHOP
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-white p-5 text-sm">
              <div className="font-semibold">เงื่อนไขการใช้งาน</div>
              <ul className="mt-2 list-disc pl-5 text-muted">
                <li>ต้องเป็นสมาชิกก่อนจึงจะถูกเลือกเป็นซัพพลายเออร์ได้</li>
                <li>รับ PO และส่ง Quotation ผ่านระบบ</li>
                <li>รองรับมือถือ/แท็บเล็ต</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <Card className="p-6 md:p-8">
            <div className="text-lg font-semibold">สมัครสมาชิกซัพพลายเออร์</div>
            <div className="text-xs text-muted">กรอกข้อมูลให้ครบเพื่อสร้างบัญชี</div>

            <div className="mt-5 space-y-3">
              <Field label="อีเมล">
                <input
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  placeholder="supplier@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field label="ชื่อบริษัท/ชื่อผู้ติดต่อ">
                <input
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  placeholder="Supplier Co.,Ltd."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>

              <Field label="เบอร์โทร (ไม่บังคับ)">
                <input
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  placeholder="0xx-xxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="รหัสผ่าน (อย่างน้อย 8 ตัว)">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>

                <Field label="ยืนยันรหัสผ่าน">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </Field>
              </div>

              {password && confirm && password !== confirm ? (
                <div className="text-sm text-rose-700">รหัสผ่านไม่ตรงกัน</div>
              ) : null}

              <button
                disabled={!canSubmit || mut.isPending}
                onClick={() => mut.mutate()}
                className={`w-full rounded-xl px-4 py-2 text-sm font-medium ${
                  canSubmit
                    ? "bg-ink text-white hover:opacity-95"
                    : "bg-stone-200 text-stone-500 cursor-not-allowed"
                }`}
              >
                {mut.isPending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
              </button>

              {mut.isError ? (
                <div className="text-sm text-rose-700">
                  สมัครไม่สำเร็จ (อีเมลซ้ำ/ข้อมูลไม่ถูกต้อง/ตรวจ backend response)
                </div>
              ) : null}

              <div className="pt-2 text-center text-sm">
                มีบัญชีแล้ว?{" "}
                <Link to="/login" className="font-semibold hover:underline">
                  เข้าสู่ระบบ
                </Link>
              </div>

              <div className="text-center text-xs text-muted">
                สมัครเป็นลูกค้า?{" "}
                <Link to="/register" className="hover:underline">
                  ไปหน้าสมัครลูกค้า
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
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