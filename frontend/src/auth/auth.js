// src/auth/auth.js
// Comunicação com a API de autenticação hospedada no Render.

export const API_URL = (
  process.env.REACT_APP_API_URL || "https://gerador-de-curriculo-api.onrender.com"
).replace(/\/$/, "");

const TOKEN_KEY = "gc_plus_token";
const USER_KEY = "gc_plus_user";

export const WHATSAPP_NUMBER = "5531986763652";

export const whatsappLink = (mensagem) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* armazenamento indisponível */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* armazenamento indisponível */
    }
  },
};

export const getToken = () => storage.get(TOKEN_KEY);
export const getUsuario = () => storage.get(USER_KEY);
export const isLoggedIn = () => !!getToken();

export const logout = () => {
  storage.remove(TOKEN_KEY);
  storage.remove(USER_KEY);
  window.dispatchEvent(new Event("auth-change"));
};

// O plano gratuito do Render "dorme" sem uso; a primeira requisição pode levar ~50s.
const fetchWithTimeout = (url, options = {}, timeout = 70000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

export async function login(usuario, senha) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente em instantes.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.erro || "Não foi possível entrar.");
  }

  storage.set(TOKEN_KEY, data.token);
  storage.set(USER_KEY, data.usuario);
  window.dispatchEvent(new Event("auth-change"));
  return data;
}

// Valida o token salvo no servidor. Retorna o usuário ou null.
export async function verificarSessao() {
  const token = getToken();
  if (!token) return null;

  let res;
  try {
    res = await fetchWithTimeout(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  if (res.status === 401) {
    logout();
    return null;
  }
  if (!res.ok) throw new Error("Erro ao validar a sessão.");

  const data = await res.json();
  return data.usuario;
}
