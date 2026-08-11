import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRouter from "./app/routes/AppRouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient";
import { CartProvider } from "./pages/customer/cart/CartContext";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("ไม่พบ Publishable key");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/customer/login"
      signUpFallbackRedirectUrl="/customer/login"
    >
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <AppRouter /> {/* เปลี่ยนจาก <App /> เป็น <AppRouter /> ตามที่คุณใช้จริง */}
        </CartProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);