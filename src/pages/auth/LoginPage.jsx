import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { authStorage } from "../../utils/authStorage";

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

      if (!token || !role) {
        throw new Error("Login response missing token/role");
      }

      // ✅ เก็บให้ตรงกับ axios interceptor ของคุณ (อ่าน pk_token)
      localStorage.setItem("pk_token", token);
      localStorage.setItem("pk_role", role);
      localStorage.setItem("pk_roles", JSON.stringify(roles || []));
      localStorage.setItem("pk_user", JSON.stringify(user || null));

      // ถ้าคุณอยากใช้ authStorage ก็ใช้ได้ แต่ต้องมั่นใจว่า key ตรงกัน
      // authStorage.setAuth({ token, role, user });

      if (role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else if (role === "CUSTOMER") navigate("/", { replace: true });
      else if (role === "SUPPLIER") navigate("/supplier", { replace: true });
      else if (role === "CUSTOMS") navigate("/customs", { replace: true });
      else navigate("/", { replace: true });
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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl2 border border-line bg-white shadow-soft">
        <div className="p-6 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-ink text-white flex items-center justify-center font-bold">
              PK
            </div>
            <div>
              <div className="text-lg font-semibold">PKSHOP</div>
              <div className="text-xs text-muted">Sign in to your account</div>
            </div>
          </div>
        </div>

        <form className="p-6 space-y-4" onSubmit={onSubmit}>
          {errorMsg ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMsg}
            </div>
          ) : null}

          <div>
            <label className="text-xs text-muted">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@pkshop.com"
              className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-200"
            />
          </div>

          <div>
            <label className="text-xs text-muted">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-200"
            />
          </div>

          <button
            disabled={!canSubmit}
            className={`w-full rounded-xl px-3 py-2 text-sm font-medium ${
              canSubmit
                ? "bg-ink text-white hover:opacity-95"
                : "bg-stone-200 text-stone-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-xs text-muted text-center">
            สำหรับโปรเจกต์จบ PKSHOP • Admin / Customer / Supplier / Customs
          </div>

          <Link
            to="/supplier/register"
            className="block w-full text-center text-sm font-semibold hover:underline"
          >
            สมัครเป็นซัพพลายเออร์
          </Link>
        </form>
      </div>
    </div>
  );
}