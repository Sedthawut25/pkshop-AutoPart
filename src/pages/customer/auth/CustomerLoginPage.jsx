// src/pages/customer/auth/CustomerLoginPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth";
import { useUser, useAuth, SignInButton } from "@clerk/clerk-react";

function normalizeRole(role) {
  return String(role || "").replace(/^ROLE_/i, "").toUpperCase();
}

export default function CustomerLoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken, signOut } = useAuth();
  const isProcessingGoogle = useRef(false);

  const canSubmit = email.trim() && password.trim() && !loading;

  useEffect(() => {
    const handleGoogleSync = async () => {
      if (isLoaded && isSignedIn && user && !isProcessingGoogle.current) {
        isProcessingGoogle.current = true;
        setLoading(true);
        setErrorMsg("");

        try {
          console.log("🚀 กำลังส่ง Token ไปยืนยันที่ Spring Boot...");
          const clerkToken = await getToken();
          const googleEmail = user.primaryEmailAddress?.emailAddress;
          const fullName = user.fullName || "Google User";

          const res = await authApi.googleLogin({
            email: googleEmail,
            fullName: fullName,
            clerkToken: clerkToken,
          });

          console.log("✅ ตอบกลับจาก Spring Boot:", res);

          const pkToken = res.accessToken || res.token;
          const pkRoles = Array.isArray(res.roles) ? res.roles : [];
          const hasCustomerRole = [res.role, ...pkRoles]
            .map(normalizeRole)
            .includes("CUSTOMER");
          const pkUser = {
            id: res.userId,
            email: res.email,
            fullName: res.fullName,
          };

          if (!pkToken) throw new Error("ไม่พบ Token จากระบบ");
          if (!hasCustomerRole) {
            setErrorMsg("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานหน้าลูกค้า กรุณาใช้หน้าเข้าสู่ระบบที่ตรงกับบัญชี");
            await signOut();
            return;
          }

          localStorage.setItem("pk_token", pkToken);
          localStorage.setItem("pk_role", "CUSTOMER");
          localStorage.setItem("pk_roles", JSON.stringify(pkRoles.map(normalizeRole)));
          localStorage.setItem("pk_user", JSON.stringify(pkUser));

          console.log("🎉 ล็อกอินสำเร็จ! กำลังพาไปหน้า /customer");

          nav("/customer", { replace: true });
        } catch (err) {
          console.error("Google Login Error: ", err);
          setErrorMsg("ไม่สามารถเข้าสู่ระบบด้วย Google ได้โปรดลองอีกครั้ง");
        } finally {
          setLoading(false);
          isProcessingGoogle.current = false;
        }
      }
    };
    void handleGoogleSync();
  }, [isLoaded, isSignedIn, user, getToken, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);
          const { token, role, roles, user } = await authApi.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (!token) throw new Error("Missing token");

      const availableRoles = [role, ...(Array.isArray(roles) ? roles : [])]
        .map(normalizeRole);
      if (!availableRoles.includes("CUSTOMER")) {
        setErrorMsg("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานหน้าลูกค้า กรุณาใช้หน้าเข้าสู่ระบบที่ตรงกับบัญชี");
        return;
      }

      localStorage.setItem("pk_token", token);
      localStorage.setItem("pk_role", "CUSTOMER");
      localStorage.setItem("pk_roles", JSON.stringify(availableRoles));
      localStorage.setItem("pk_user", JSON.stringify(user || null));

      nav("/customer", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msgFromApi =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message;
      if (status === 401 || status === 403)
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      else setErrorMsg(msgFromApi || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
      <div
          className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4"
          style={{
            backgroundImage:
                "url('https://4kwallpapers.com/images/walls/thumbs_3t/16569.jpg')",
          }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 py-10 lg:grid-cols-2">
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-md">
              <div className="text-3xl font-semibold text-white">PKSHOP</div>
              <div className="mt-2 text-sm text-stone-200">
                อะไหล่รถยนต์ • สั่งซื้อได้จากสต็อกจริง
              </div>

              <img
                  src="https://4kwallpapers.com/images/walls/thumbs_3t/26409.jpg"
                  alt="Car Parts"
                  className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-lg"
              />
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center">
              <div className="text-4xl font-semibold tracking-wide text-white">
                PKSHOP
              </div>
              <div className="mt-2 text-sm text-stone-200">
                เข้าสู่ระบบสำหรับลูกค้า
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-md">
              <form onSubmit={onSubmit} className="space-y-4">
                {errorMsg ? (
                    <div className="rounded-2xl border border-rose-500/50 bg-rose-500/20 px-3 py-2 text-sm text-rose-200">
                      {errorMsg}
                    </div>
                ) : null}

                <div>
                    <label htmlFor="customer-email" className="text-xs text-stone-300">Email</label>
                  <input
                      id="customer-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-stone-400 outline-none transition-all focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white"
                      placeholder="customer@pkshop.com"
                  />
                </div>

                <div>
                    <label htmlFor="customer-password" className="text-xs text-stone-300">Password</label>
                  <input
                      id="customer-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-stone-400 outline-none transition-all focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white"
                      placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                    disabled={!canSubmit}
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                        canSubmit
                            ? "bg-white text-black hover:bg-stone-200"
                            : "bg-white/30 text-stone-300 cursor-not-allowed"
                    }`}
                >
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </button>
              </form>

              <div className="flex items-center py-2 before:flex-1 before:border-t before:border-white/20 before:mr-3 after:flex-1 after:border-t after:border-white/20 after:ml-3">
                <span className="text-xs text-stone-400">หรือ</span>
              </div>

              {/* ปุ่มเข้าสู่ระบบ Google ใช้งานผ่าน Component ของ Clerk ตรงๆ */}
              <SignInButton mode="modal" forceRedirectUrl="/customer/login">
                <button
                    type="button"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/30 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.1-1.92 3.31-4.74 3.31-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.58-2.77c-.98.66-2.23 1.06-3.7 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {loading ? "กำลังเชื่อมต่อ..." : "เข้าสู่ระบบด้วย Google"}
                </button>
              </SignInButton>

              <Link
                  to="/customer/register"
                  className="block w-full rounded-2xl border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-white/10 mt-4"
              >
                สมัครสมาชิก
              </Link>

              <div className="text-center text-xs text-stone-300 pt-2">
                ซื้อสินค้าได้หลังสมัครสมาชิกและเข้าสู่ระบบ
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-stone-200">
              กลับไปหน้าเข้าสู่ระบบรวม?{" "}
              <Link className="underline hover:text-white" to="/login">
                คลิกที่นี่
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}