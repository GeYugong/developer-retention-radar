export const API = import.meta.env.VITE_API_URL ?? '';
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...init.headers }, ...init });
  if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error ?? '请求失败，请稍后重试'); }
  return res.status === 204 ? undefined as T : res.json();
}
