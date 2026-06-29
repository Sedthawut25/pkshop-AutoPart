// src/pages/customer/auth/CustomerRegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth";

export default function CustomerRegisterPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = fullName.trim() && email.trim() && password.trim() && !loading;

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);

      // ✅ ปรับ field ให้ตรง backend ของคุณ
      await authApi.registerCustomer?.({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        role: "CUSTOMER",
      });

      nav("/customer/login", { replace: true });
    } catch (err) {
      const msgFromApi = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setErrorMsg(msgFromApi || "Register failed");
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
      {/* แผ่นกรองสีดำโปร่งแสง (Overlay) เพื่อให้เห็นฟอร์มชัดขึ้น */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content Container */}
      <div className="relative mx-auto flex min-h-screen max-w-md items-center py-10">
        <div className="w-full">
          <div className="mb-6 text-center">
            <div className="text-4xl font-semibold tracking-wide text-white">PKSHOP</div>
            <div className="mt-2 text-sm text-stone-200">สมัครสมาชิกสำหรับลูกค้า</div>
          </div>

          {/* 🧊 ตัวฟอร์มแบบกระจกฝ้า (Glassmorphism) สวยงามเหมือนหน้า Login */}
          <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-md">
            {errorMsg ? (
              <div className="rounded-2xl border border-rose-500/50 bg-rose-500/20 px-3 py-2 text-sm text-rose-200">
                {errorMsg}
              </div>
            ) : null}

            <div>
              <label className="text-xs text-stone-300">ชื่อ-นามสกุล</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-stone-400 outline-none transition-all focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white"
                placeholder="เช่น เสฎฐวุฒิ แก้วก่า"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300">Email</label>
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
                placeholder="อย่างน้อย 4 ตัว"
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
              {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
            </button>

            <div className="text-center text-sm text-stone-300">
              มีบัญชีแล้ว?{" "}
              <Link to="/customer/login" className="font-semibold text-white underline hover:text-stone-200">
                เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}