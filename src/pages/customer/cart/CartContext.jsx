import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartCtx = createContext(null);

function getCartKey() {
  try {
    const raw = localStorage.getItem("pk_user");

    if (!raw) {
      return "pk_cart_guest";
    }

    const user = JSON.parse(raw);

    if (!user?.id) {
      return "pk_cart_guest";
    }

    return `pk_cart_${user.id}`;
  } catch {
    return "pk_cart_guest";
  }
}

function readCart() {
  try {
    const key = getCartKey();

    const raw = localStorage.getItem(key);

    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  const key = getCartKey();

  localStorage.setItem(key, JSON.stringify(items || []));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  /*
    โหลด cart ใหม่ทุกครั้งเมื่อ login/logout
  */
  useEffect(() => {
    setItems(readCart());
  }, []);

  function add(item, qty = 1) {
    setItems((prev) => {
      const list = [...prev];

      const idx = list.findIndex(
        (x) => x.productId === item.productId
      );

      if (idx >= 0) {
        const nextQty = (list[idx].qty || 0) + qty;

        list[idx] = {
          ...list[idx],
          ...item,
          qty: nextQty,
        };
      } else {
        list.push({
          ...item,
          qty,
        });
      }

      writeCart(list);

      return list;
    });
  }

  function setQty(productId, qty) {
    const q = Math.max(1, Number(qty || 1));

    setItems((prev) => {
      const list = prev.map((x) =>
        x.productId === productId
          ? {
              ...x,
              qty: q,
            }
          : x
      );

      writeCart(list);

      return list;
    });
  }

  function remove(productId) {
    setItems((prev) => {
      const list = prev.filter(
        (x) => x.productId !== productId
      );

      writeCart(list);

      return list;
    });
  }

  function clearCart() {
    writeCart([]);

    setItems([]);
  }

  const summary = useMemo(() => {
    const subtotal = items.reduce(
      (sum, x) =>
        // 🟢 แก้ไขตรงนี้: ให้รองรับทั้ง unitPrice (ใหม่) และ price (เก่า) เพื่อป้องกันยอดเป็น ฿0
        sum +
        Number(x.unitPrice || x.price || 0) *
          Number(x.qty || 0),
      0
    );

    const count = items.reduce(
      (sum, x) =>
        sum + Number(x.qty || 0),
      0
    );

    return {
      subtotal,
      count,
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      add,
      setQty,
      remove,
      clearCart,
      summary,
    }),
    [items, summary]
  );

  return (
    <CartCtx.Provider value={value}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);

  if (!ctx) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return ctx;
}