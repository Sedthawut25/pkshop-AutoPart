import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { authStorage } from "../../utils/authStorage";

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
    } catch (e2) {
      const status = e2?.response?.status;
      if (status === 401 || status === 403) setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      else setErr(e2?.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur border border-white/15 shadow-soft">
        <div className="p-6 border-b border-white/10">
          <div className="text-white text-lg font-semibold">ระบบศุลกากร (Customs)</div>
          <div className="text-white/70 text-xs">ลงชื่อเข้าใช้เพื่อพิจารณาเอกสารนำเข้า</div>
        </div>

        <form className="p-6 space-y-4" onSubmit={onSubmit}>
          {err ? (
            <div className="rounded-xl border border-rose-200/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {err}
            </div>
          ) : null}

          <div>
            <label className="text-xs text-white/70">อีเมล</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
              placeholder="customs@pkshop.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-white/70">รหัสผ่าน</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className={`w-full rounded-xl px-3 py-2 text-sm font-medium ${
              loading ? "bg-white/20 text-white/60" : "bg-white text-stone-900 hover:opacity-95"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบศุลกากร"}
          </button>

          <div className="text-xs text-white/60 text-center">
            เฉพาะเจ้าหน้าที่ศุลกากรเท่านั้น
          </div>
        </form>
      </div>
    </div>
  );
}