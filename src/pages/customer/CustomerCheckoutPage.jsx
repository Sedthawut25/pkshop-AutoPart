// src/pages/customer/CustomerCheckoutPage.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./cart/CartContext";
import axios from "axios";

export default function CustomerCheckoutPage() {
  const { items, summary } = useCart();

  const rows = Array.isArray(items) ? items : [];
  const subtotal = summary.subtotal;

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [shippingFee, setShippingFee] = useState(1500);

  const token = localStorage.getItem("pk_token");

  const canPay = useMemo(() => {
    return rows.length > 0 && email && firstName && lastName && address && city;
  }, [rows.length, email, firstName, lastName, address, city]);

  const applyPromo = async () => {
    if (!promoCode) return;

    try {
      setLoadingPromo(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/promotions/apply?code=${promoCode}&subtotal=${subtotal}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await response.json();
      if (!response.ok) throw new Error(json.message);

      setDiscount(json.data);
      setPromoSuccess("ใช้โค้ดสำเร็จ");
      setPromoError("");
    } catch (err) {
      setDiscount(0);
      setPromoSuccess("");
      setPromoError(err.message);
    } finally {
      setLoadingPromo(false);
    }
  };

  const total = Math.max(0, subtotal + shippingFee - discount);

  const handleCheckout = async () => {
    if (!canPay) {
      alert("กรอกข้อมูลไม่ครบ");
      return;
    }

    if (!token) {
      alert("กรุณา login ก่อน");
      return;
    }

    try {
      console.log("TOKEN:", token);

      const orderRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            promotionCode: promoCode || null,
            shippingAddress: `${firstName} ${lastName} ${address} ${city} ${postal}`,
            items: rows.map((it) => ({
              productId: it.productId,
              qty: it.qty,
            })),
          }),
        },
      );

      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.message || "สร้างออเดอร์ไม่สำเร็จ");

      const stripeUrl = orderJson.data?.checkoutUrl;

      if (stripeUrl) {
        console.log("กำลังเดินทางไปหน้าชำระเงินของ Stripe...");
        window.location.href = stripeUrl; 
      } else {
        throw new Error("สร้างออเดอร์สำเร็จ แต่ระบบไม่ได้รับ URL ชำระเงิน");
      }

    } catch (err) {
      console.error("Checkout Error:", err);
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="text-3xl font-semibold">ชำระเงิน</div>
        <div className="mt-2 text-sm text-muted">
          กรอกข้อมูล • ใช้โค้ดส่วนลด • ชำระเงิน
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <div className="lg:col-span-6 space-y-6">
          {/* ข้อมูลติดต่อ */}
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="text-xl font-semibold">ข้อมูลติดต่อ</div>

            <input
              className="mt-3 w-full rounded-2xl border px-4 py-3 text-sm"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* ที่อยู่จัดส่ง */}
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="text-xl font-semibold">ที่อยู่จัดส่ง</div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                placeholder="ชื่อ"
                className="rounded-2xl border px-4 py-3 text-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                placeholder="นามสกุล"
                className="rounded-2xl border px-4 py-3 text-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />

              <input
                className="col-span-2 rounded-2xl border px-4 py-3 text-sm"
                placeholder="ที่อยู่"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <input
                placeholder="จังหวัด / เมือง"
                className="rounded-2xl border px-4 py-3 text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                placeholder="รหัสไปรษณีย์"
                className="rounded-2xl border px-4 py-3 text-sm"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
              />
            </div>
          </div>

          {/* 🎯 PROMO CODE */}
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="text-lg font-semibold">โค้ดส่วนลด</div>

            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-2xl border px-4 py-3 text-sm"
                placeholder="ใส่โค้ด เช่น SAVE10"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />

              <button
                onClick={applyPromo}
                disabled={!promoCode || loadingPromo}
                className={`px-4 py-3 rounded-2xl text-sm font-semibold ${
                  promoCode
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loadingPromo ? "กำลังใช้..." : "ใช้โค้ด"}
              </button>
            </div>

            {/* SUCCESS */}
            {promoSuccess && (
              <div className="mt-2 text-green-600 text-sm">{promoSuccess}</div>
            )}

            {/* ERROR */}
            {promoError && (
              <div className="mt-2 text-red-500 text-sm">{promoError}</div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="text-xl font-semibold">ชำระเงิน</div>

            <button
              disabled={!canPay}
              className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold ${
                canPay
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleCheckout}
            >
              ชำระเงิน
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="text-xl font-semibold">สรุปคำสั่งซื้อ</div>

            <div className="mt-4 space-y-3">
              {rows.map((it) => (
                <div
                  key={it.productId}
                  className="flex justify-between bg-stone-50 p-3 rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-sm">{it.productName}</div>
                    <div className="text-xs text-muted">x{it.qty}</div>
                  </div>
                  <div className="font-semibold text-sm">
                    ฿ {(it.unitPrice * it.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>ยอดรวม</span>
                <span>฿ {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>ค่าจัดส่ง</span>
                <span>฿ {shippingFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm text-green-600">
                <span>ส่วนลด</span>
                <span>- ฿ {discount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-lg font-semibold">
                <span>ยอดสุทธิ</span>
                <span>฿ {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
