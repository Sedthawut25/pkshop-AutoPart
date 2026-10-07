import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

const STAFF_LOGIN_ROLES = new Set(["ADMIN", "SUPPLIER", "CUSTOMS"]);

function normalizeRole(role) {
  return String(role || "").replace(/^ROLE_/i, "").toUpperCase();
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = email.trim() && password.trim() && !loading;

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.includes("@")) {
      setErrorMsg("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    if (password.length < 4) {
      setErrorMsg("รหัสผ่านสั้นเกินไป");
      return;
    }

    try {
      setLoading(true);

      const { token, role, roles, user } = await authApi.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (!token) throw new Error("Login response missing token");

      const availableRoles = Array.isArray(roles) ? roles : [];
      const roleCandidates = role ? [...availableRoles, role] : availableRoles;
      const normalizedRoles = [...new Set(roleCandidates.map(normalizeRole))];
      const loginRole = normalizedRoles.find((candidate) =>
        STAFF_LOGIN_ROLES.has(candidate),
      );

      if (!loginRole) {
        throw new Error("บัญชีนี้ไม่มีสิทธิ์เข้าสู่ระบบจัดการ กรุณาใช้หน้าลูกค้าแทน");
      }

      // ✅ เก็บให้ตรงกับ axios interceptor ของคุณ (อ่าน pk_token)
      localStorage.setItem("pk_token", token);
      localStorage.setItem("pk_role", loginRole);
      localStorage.setItem("pk_roles", JSON.stringify(normalizedRoles));
      localStorage.setItem("pk_user", JSON.stringify(user || null));

      // ถ้าคุณอยากใช้ authStorage ก็ใช้ได้ แต่ต้องมั่นใจว่า key ตรงกัน
      // authStorage.setAuth({ token, role, user });

      if (loginRole === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else if (loginRole === "SUPPLIER") navigate("/supplier", { replace: true });
      else navigate("/customs/documents", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msgFromApi =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (status === 401 || status === 403) {
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setErrorMsg(msgFromApi || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-6 sm:px-6 lg:px-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-line/80 bg-white shadow-lift lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[34px] border-brand/30" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border-[28px] border-coral/20" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-lg font-extrabold text-ink">PK</div>
              <div>
                <div className="text-lg font-extrabold tracking-tight">PKSHOP</div>
                <div className="text-xs text-white/60">Auto parts platform</div>
              </div>
            </div>
            <div className="mt-20 max-w-xs">
              <div className="text-sm font-semibold text-brand-soft">ยินดีต้อนรับกลับ</div>
              <div className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">จัดการทุกคำสั่งซื้อ ให้ไหลลื่นในที่เดียว</div>
              <div className="mt-5 text-sm leading-7 text-white/65">เข้าสู่ระบบเพื่อจัดการสินค้า สต็อก ออเดอร์ และการดำเนินงานของคุณ</div>
            </div>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck size={16} className="text-brand-soft" />
            ระบบจัดการที่ปลอดภัยสำหรับทีมของคุณ
          </div>
        </div>

        <div>
        <div className="border-b border-line p-6 sm:p-9">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-lg font-extrabold text-ink lg:hidden">
              PK
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-ink">เข้าสู่ระบบ</div>
              <div className="mt-1 text-xs text-muted">ลงชื่อเข้าใช้บัญชี PKSHOP ของคุณ</div>
            </div>
          </div>
        </div>

        <form className="space-y-5 p-6 sm:p-9" onSubmit={onSubmit}>
          {errorMsg ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMsg}
            </div>
          ) : null}

          <div>
            <label htmlFor="staff-email" className="text-xs font-semibold text-ink">อีเมล</label>
            <input
              id="staff-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@pkshop.com"
              className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <div>
            <label htmlFor="staff-password" className="text-xs font-semibold text-ink">รหัสผ่าน</label>
            <input
              id="staff-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-xl px-3 py-2 text-sm font-medium ${
              canSubmit
                ? "bg-brand text-white shadow-sm hover:bg-brand-dark"
                : "bg-stone-200 text-stone-500 cursor-not-allowed"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            {!loading && <ArrowRight size={17} />}
          </button>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-muted">
            <LockKeyhole size={14} />
            สำหรับโปรเจกต์จบ PKSHOP • Admin / Customer / Supplier / Customs
          </div>

          <Link
            to="/supplier/register"
            className="block w-full text-center text-sm font-semibold text-brand-dark hover:text-brand hover:underline"
          >
            สมัครเป็นซัพพลายเออร์
          </Link>
        </form>
        </div>
      </div>
    </div>
  );
}