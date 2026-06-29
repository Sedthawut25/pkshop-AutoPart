// src/pages/customer/auth/CustomerLoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth";

export default function CustomerLoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = email.trim() && password.trim() && !loading;

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);
      const { token, role, roles, user } = await authApi.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (!token || !(role || (roles || []).length)) throw new Error("Missing token/role");

      localStorage.setItem("pk_token", token);
      localStorage.setItem("pk_role", role || roles?.[0]);
      localStorage.setItem("pk_roles", JSON.stringify(roles || []));
      localStorage.setItem("pk_user", JSON.stringify(user || null));

      nav("/customer", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msgFromApi = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      if (status === 401 || status === 403) setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      else setErrorMsg(msgFromApi || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4"
      style={{ 
        backgroundImage: "url('https://4kwallpapers.com/images/walls/thumbs_3t/16569.jpg')" 
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 py-10 lg:grid-cols-2">
        
        <div className="hidden lg:block">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-md">
            <div className="text-3xl font-semibold text-white">PKSHOP</div>
            <div className="mt-2 text-sm text-stone-200">อะไหล่รถยนต์ • สั่งซื้อได้จากสต็อกจริง</div>
            
            <img 
              src="https://4kwallpapers.com/images/walls/thumbs_3t/26409.jpg" 
              alt="Car Parts" 
              className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="text-4xl font-semibold tracking-wide text-white">PKSHOP</div>
            <div className="mt-2 text-sm text-stone-200">เข้าสู่ระบบสำหรับลูกค้า</div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-md">
            {errorMsg ? (
              <div className="rounded-2xl border border-rose-500/50 bg-rose-500/20 px-3 py-2 text-sm text-rose-200">
                {errorMsg}
              </div>
            ) : null}

            <div>
              <label className="text-xs text-stone-300">Email</label>
              {/* ปรับ Input ให้โปร่งแสงนิดๆ เข้ากับธีม */}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-stone-400 outline-none transition-all focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white"
                placeholder="customer@pkshop.com"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-stone-400 outline-none transition-all focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white"
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={!canSubmit}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                canSubmit 
                  ? "bg-white text-black hover:bg-stone-200" 
                  : "bg-white/30 text-stone-300 cursor-not-allowed"
              }`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            <Link
              to="/customer/register"
              className="block w-full rounded-2xl border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              สมัครสมาชิก
            </Link>

            <div className="text-center text-xs text-stone-300">ซื้อสินค้าได้หลังสมัครสมาชิกและเข้าสู่ระบบ</div>
          </form>

          <div className="mt-4 text-center text-xs text-stone-200">
            กลับไปหน้าเข้าสู่ระบบรวม? <Link className="underline hover:text-white" to="/login">คลิกที่นี่</Link>
          </div>
        </div>
      </div>
    </div>
  );
}