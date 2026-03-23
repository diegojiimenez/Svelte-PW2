const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type ApiError = { success?: boolean; message?: string };

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = opts;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {})
    }
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      (data as ApiError)?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

export type AuthUser = {
  _id?: string;
  id?: string;
  nombre?: string;
  apellido?: string;
  email: string;
  rol: 'usuario' | 'administrador';
  activo?: boolean;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  user: { id: string; nombre: string; email: string; rol: 'usuario' | 'administrador' };
};

export type RegisterResponse = LoginResponse;

export function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function register(payload: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}) {
  return apiFetch<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getMe(token: string) {
  return apiFetch<{ success: boolean; user: AuthUser }>('/api/auth/me', {
    method: 'GET',
    token
  });
}