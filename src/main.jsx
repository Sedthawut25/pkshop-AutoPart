import ReactDOM from "react-dom/client";
import "./index.css";
import AppRouter from "./app/routes/AppRouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient";
import { CartProvider } from "./pages/customer/cart/CartContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <AppRouter />
    </CartProvider>
  </QueryClientProvider>
);