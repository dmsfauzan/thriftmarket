import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartState = { ids: string[]; toggle: (id: string) => void; clear: () => void; set: (ids: string[]) => void };
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set({ ids: get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id] }),
      clear: () => set({ ids: [] }),
      set: (ids) => set({ ids }),
    }),
    { name: "thrift-cart" }
  )
);
