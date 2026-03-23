import { writable } from 'svelte/store';
import type { Product } from '$lib/data';
import { apiFetch } from '$lib/api';
import { auth } from '$lib/stores/auth';

type ProductsState = {
  loading: boolean;
  items: Product[];
  error: string | null;
};

function createProductsStore() {
  const { subscribe, set, update } = writable<ProductsState>({
    loading: false,
    items: [],
    error: null
  });

  async function load() {
    set({ loading: true, items: [], error: null });

    let token: string | null = null;
    const unsub = auth.subscribe((s) => (token = s.token));
    unsub();

    if (!token) {
      set({ loading: false, items: [], error: 'No auth token' });
      return;
    }

    try {
      const res = await apiFetch<{ success: boolean; data: Product[] }>('/api/products', { token });
      set({ loading: false, items: res.data, error: null });
    } catch (e: any) {
      set({ loading: false, items: [], error: e?.message ?? 'Error loading products' });
    }
  }

  return { subscribe, load };
}

export const productsStore = createProductsStore();