import { writable } from 'svelte/store';
import { apiFetch } from '$lib/api';
import { auth } from '$lib/stores/auth';

export type AdminOrderRow = {
  id: string; customer: string; item: string; date: string; total: string; status: string;
};

function createAdminOrdersStore() {
  const { subscribe, set, update } = writable<{ loading: boolean; items: AdminOrderRow[]; error: string | null }>({
    loading: false, items: [], error: null
  });

  async function load() {
    let token: string | undefined;
    auth.subscribe((a) => (token = a.token ?? undefined))();
    update((s) => ({ ...s, loading: true }));
    try {
      const res = await apiFetch<{ success: boolean; data: AdminOrderRow[] }>('/api/orders', { token });
      set({ loading: false, items: res.data, error: null });
    } catch (e: any) {
      set({ loading: false, items: [], error: e?.message ?? 'Error' });
    }
  }

  async function updateStatus(orderNumber: string, status: string) {
    let token: string | undefined;
    auth.subscribe((a) => (token = a.token ?? undefined))();
    await apiFetch(`/api/orders/${orderNumber}/status`, {
      method: 'PUT', token, body: JSON.stringify({ status })
    });
    update(s => ({
      ...s,
      items: s.items.map(o => o.id === orderNumber ? { ...o, status } : o)
    }));
  }

  return { subscribe, load, updateStatus };
}
export const adminOrderStore = createAdminOrdersStore();