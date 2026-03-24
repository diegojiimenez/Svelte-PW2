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

  // GET: Cargar productos (Público para la tienda, no bloquea si no hay token)
  async function load() {
    set({ loading: true, items: [], error: null });

    let token: string | undefined = undefined;
    const unsub = auth.subscribe((s) => (token = s.token || undefined));
    unsub();

    try {
      // Pasamos el token solo si existe, pero no obligamos a tenerlo
      const res = await apiFetch<{ success: boolean; data: Product[] }>('/api/products', { token });
      set({ loading: false, items: res.data, error: null });
    } catch (e: any) {
      set({ loading: false, items: [], error: e?.message ?? 'Error loading products' });
    }
  }

  // POST: Crear producto (Protegido para Admin)
  async function add(data: Partial<Product>) {
    let token: string | undefined = undefined;
    const unsub = auth.subscribe((a) => (token = a.token || undefined));
    unsub();

    if (!token) throw new Error("No auth token: Only admins can add products");

    const res = await apiFetch<{ success: boolean; data: Product }>('/api/products', {
      method: 'POST',
      token,
      body: JSON.stringify(data)
    });
    
    // Agregamos el nuevo producto al principio de la lista visualmente
    update(s => ({ ...s, items: [res.data, ...s.items] }));
  }

  // PUT: Editar producto (Protegido para Admin)
  async function updateItem(id: string, data: Partial<Product>) {
    let token: string | undefined = undefined;
    const unsub = auth.subscribe((a) => (token = a.token || undefined));
    unsub();

    if (!token) throw new Error("No auth token: Only admins can edit products");

    const res = await apiFetch<{ success: boolean; data: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data)
    });
    
    // Buscamos el producto editado y lo actualizamos en la UI
    update(s => ({ ...s, items: s.items.map(p => (p.id === id || (p as any)._id === id) ? res.data : p) }));
  }

  // DELETE: Eliminar producto (Protegido para Admin)
  async function remove(id: string) {
    let token: string | undefined = undefined;
    const unsub = auth.subscribe((a) => (token = a.token || undefined));
    unsub();

    if (!token) throw new Error("No auth token: Only admins can delete products");

    await apiFetch(`/api/products/${id}`, { 
      method: 'DELETE', 
      token 
    });
    
    // Filtramos y quitamos el producto eliminado de la UI
    update(s => ({ ...s, items: s.items.filter(p => p.id !== id && (p as any)._id !== id) }));
  }

  return { subscribe, load, add, updateItem, remove };
}

export const productsStore = createProductsStore();