import { writable } from 'svelte/store';
import { apiFetch } from '$lib/api';
import { auth } from '$lib/stores/auth';

type CartItem = {
  _id: string;
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color: { name: string; hex: string };
  size: string;
};

type CartData = {
  items: CartItem[];
  subtotal: number;
};

function createCart() {
  const { subscribe, set, update } = writable<{ loading: boolean; items: CartItem[]; subtotal: number; error: string | null }>({
    loading: true,
    items: [],
    subtotal: 0,
    error: null,
  });

  async function load() {
    let token: string | undefined = undefined;
    const unsub = auth.subscribe((a) => (token = a.token ?? undefined));
    unsub();

    if (!token) {
      set({ loading: false, items: [], subtotal: 0, error: null });
      return;
    }
    update((s) => ({ ...s, loading: true }));

    try {
      const res = await apiFetch<{ success: boolean; data: CartData }>('/api/cart', { token });
      set({ loading: false, items: res.data.items, subtotal: res.data.subtotal, error: null });
    } catch (e: any) {
      set({ loading: false, items: [], subtotal: 0, error: e?.message ?? 'Error' });
    }
  }

  async function addOrUpdate(data: {
    productId: string;
    quantity: number;
    size: string;
    color: { name: string; hex: string };
  }) {
    let token: string | undefined = undefined;
    const unsub = auth.subscribe((a) => (token = a.token ?? undefined));
    unsub();

    const res = await apiFetch<{ success: boolean; data: CartData }>('/api/cart/items', {
      token,
      method: 'POST',
      body: JSON.stringify(data)
    });
    set({ loading: false, items: res.data.items, subtotal: res.data.subtotal, error: null });
  }

  async function updateItem(itemId: string, data: Partial<{ quantity: number; size: string; color: { name: string; hex: string } }>) {
    let token: string | undefined = undefined;
    const unsub = auth.subscribe((a) => (token = a.token ?? undefined));
    unsub();
    const res = await apiFetch<{ success: boolean; data: CartData }>(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data)
    });
    set({ loading: false, items: res.data.items, subtotal: res.data.subtotal, error: null });
  }

  async function remove(itemId: string) {
    let token: string | undefined = undefined;
    const unsub = auth.subscribe((a) => (token = a.token ?? undefined));
    unsub();
    const res = await apiFetch<{ success: boolean; data: CartData }>(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
      token
    });
    set({ loading: false, items: res.data.items, subtotal: res.data.subtotal, error: null });
  }

  async function checkout() {
    let token: string | undefined = undefined;
    const unsub = auth.subscribe((a) => (token = a.token ?? undefined));
    unsub();
    const order = await apiFetch<{ success: boolean; data: any }>('/api/orders', {
      method: 'POST',
      token
    });
    // Recargar carrito vacío después
    await load();
    return order;
  }

  return { subscribe, load, addOrUpdate, updateItem, remove, checkout };
}

export const cartStore = createCart();