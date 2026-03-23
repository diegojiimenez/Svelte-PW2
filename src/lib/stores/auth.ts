import { writable } from 'svelte/store';
import type { AuthUser } from '$lib/api';
import { getMe, login as apiLogin, register as apiRegister } from '$lib/api';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
};

const TOKEN_KEY = 'auth_token';

function createAuth() {
  const { subscribe, set, update } = writable<AuthState>({
    token: null,
    user: null,
    loading: true
  });

  async function init() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ token: null, user: null, loading: false });
      return;
    }

    try {
      const me = await getMe(token);
      set({ token, user: me.user, loading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null, loading: false });
    }
  }

  async function login(email: string, password: string) {
    const res = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    set({ token: res.token, user: res.user, loading: false });
    return res;
  }

  async function register(payload: { nombre: string; apellido: string; email: string; password: string }) {
    const res = await apiRegister(payload);
    localStorage.setItem(TOKEN_KEY, res.token);
    set({ token: res.token, user: res.user, loading: false });
    return res;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, loading: false });
  }

  return { subscribe, init, login, register, logout };
}

export const auth = createAuth();