const AUTH_URL = 'https://functions.poehali.dev/48dbe4b3-0610-4e60-b7c1-f57a8b4c30db';

export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  status?: string;
}

async function call(action: string, data: Record<string, unknown> = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Auth-Token'] = token;
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...data }),
  });
  const text = await res.text();
  const json = JSON.parse(text);
  return { ok: res.ok, status: res.status, data: json };
}

export async function register(name: string, username: string, password: string, avatar: string) {
  return call('register', { name, username, password, avatar });
}

export async function login(username: string, password: string) {
  return call('login', { username, password });
}

export async function getMe(token: string) {
  return call('me', {}, token);
}

export async function logout(token: string) {
  return call('logout', {}, token);
}

export async function deleteAccount(token: string) {
  return call('delete_account', {}, token);
}

export function saveSession(token: string, user: User) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function loadSession(): { token: string; user: User } | null {
  const token = localStorage.getItem('auth_token');
  const raw = localStorage.getItem('auth_user');
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}
