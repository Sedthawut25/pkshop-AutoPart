import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { authStorage } from "../../utils/authStorage";
import { FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

export default function CustomsLoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      setLoading(true);
      const res = await authApi.login({ email: email.trim(), password: password.trim() });
      const payload = res?.data ?? res;

      const token = payload?.token;
      const role = payload?.role;
      const user = payload?.user;

      if (!token || !role) throw new Error("Missing token/role");

      // ✅ เช็ค role ตามสเต็ป: ต้องเป็น CUSTOMS เท่านั้น
      if (role !== "CUSTOMS") {
        authStorage.clear();
        setErr("บัญชีนี้ไม่ใช่เจ้าหน้าที่ศุลกากร (CUSTOMS)");
        return;
      }

      authStorage.setAuth({ token, role, user });
      nav("/customs/documents", { replace: true });
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      else setErr(error?.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-6 sm:px-6 lg:px-10">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-lift backdrop-blur-xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full border-[34px] border-brand/20" />
        <div className="relative grid lg:grid-cols-[1fr_0.9fr]">
          <div className="hidden p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-ink shadow-[0_10px_25px_rgba(15,118,110,0.3)]">
                <FileCheck2 size={27} />
              </div>
              <div className="mt-14 max-w-sm text-4xl font-extrabold leading-tight tracking-tight text-white">ตรวจสอบเอกสารนำเข้าอย่างมั่นใจ</div>
              <div className="mt-5 max-w-sm text-sm leading-7 text-white/60">ศูนย์ปฏิบัติงานสำหรับเจ้าหน้าที่ศุลกากร ตรวจสอบข้อมูล อนุมัติ และติดตามเอกสารได้ในที่เดียว</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/55"><ShieldCheck size={16} className="text-brand" /> ระบบเฉพาะเจ้าหน้าที่ศุลกากร</div>
          </div>

          <div className="bg-white p-6 sm:p-9 lg:my-5 lg:mr-5 lg:rounded-[1.5rem]">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-ink lg:hidden"><FileCheck2 size={22} /></div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-ink">เข้าสู่ระบบศุลกากร</div>
              <div className="mt-1 text-xs text-muted">ลงชื่อเข้าใช้เพื่อพิจารณาเอกสารนำเข้า</div>
            </div>
          </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          {err ? (
            <div className="rounded-xl border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-800">
              {err}
            </div>
          ) : null}

          <div>
            <label htmlFor="customs-email" className="text-xs font-semibold text-ink">อีเมล</label>
            <input
              id="customs-email"
              className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
              placeholder="customs@pkshop.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="customs-password" className="text-xs font-semibold text-ink">รหัสผ่าน</label>
            <input
              id="customs-password"
              type="password"
              className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-medium ${
              loading ? "cursor-not-allowed bg-stone-200 text-stone-500" : "bg-brand text-white shadow-sm hover:bg-brand-dark"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบศุลกากร"}
          </button>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-muted">
            <LockKeyhole size={14} /> เฉพาะเจ้าหน้าที่ศุลกากรเท่านั้น
          </div>
        </form>
        </div>
        </div>
      </div>
    </div>
  );
}