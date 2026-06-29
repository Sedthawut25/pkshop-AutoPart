import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "./cart/CartContext";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const {clearCart} = useCart();
  const orderId = params.get("orderId");

  useEffect(() => {
    clearCart();
  }, []); 

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-lg text-center max-w-md w-full">
        <div className="text-6xl mb-4"> ✅</div>
        <h1 className="text-2xl font-bold text-green-600">
          ชำระเงินสำเร็จ
        </h1>

        <p className="mt-2 text-gray-600">
          ขอบคุณสำหรับการสั่งซื้อ
        </p>

        <div className="mt-4 text-sm text-gray-500">
          Order ID: <span className="font-semibold">{orderId}</span>
        </div>
        <div className="mt-6 space-y-3">
        <button
          onClick = {() => navigate("/customer")}
          className = "w-full bg-black text-white py-3 rounded-2xl font-semibold"
        >
          กลับหน้าหลัก
        </button>

        <button
          onClick={() => navigate("/customer/orders")}
          className="w-full border py-3 rounded-2xl font-semibold"
        >
          ดูคำสั่งซื้อของฉัน
        </button>
        </div>
      </div>
    </div>
  );
}