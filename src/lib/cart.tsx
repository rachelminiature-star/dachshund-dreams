import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  image: string;
  color?: string;
  gender?: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "rmd-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const value: CartCtx = useMemo(() => ({
    items,
    count: items.reduce((a, i) => a + i.qty, 0),
    subtotal: items.reduce((a, i) => a + i.qty * i.price_cents, 0),
    add: (it, qty = 1) => setItems((prev) => {
      const ex = prev.find((p) => p.id === it.id);
      if (ex) return prev.map((p) => p.id === it.id ? { ...p, qty: p.qty + qty } : p);
      return [...prev, { ...it, qty }];
    }),
    remove: (id) => setItems((p) => p.filter((i) => i.id !== id)),
    setQty: (id, qty) => setItems((p) => p.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
    clear: () => setItems([]),
    open,
    setOpen,
  }), [items, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
