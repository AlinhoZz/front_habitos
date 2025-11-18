// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não está definida")
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface ApiFetchOptions extends RequestInit {
  authToken?: string | null
}

async function apiFetch<T>(
  path: string,
  { authToken, headers, ...options }: ApiFetchOptions = {}
): Promise<T> {
  const url = `${API_URL}${path}`

  const resp = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  })

  const data = await resp.json().catch(() => null)

  if (!resp.ok) {
    // Joga erro já com mensagem da API, se tiver
    const detail =
      (data && (data.detail || data.non_field_errors || data.error)) ||
      JSON.stringify(data)

    throw new Error(detail || `Erro na requisição: ${resp.status}`)
  }

  return data as T
}

/* ===== Auth ===== */

export interface LoginResponse {
  user: {
    id: number
    nome: string
    email: string
    criado_em: string
  }
  access_token: string
  refresh_token: string
}

export async function login(email: string, senha: string) {
  return apiFetch<LoginResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  })
}

export async function register(nome: string, email: string, senha: string) {
  return apiFetch<LoginResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha }),
  })
}

export async function refreshAccessToken(refreshToken: string) {
  return apiFetch<{ access_token: string }>("/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

/* ===== Recursos protegidos ===== */

export async function getMe(accessToken: string) {
  return apiFetch("/auth/me/", {
    method: "GET",
    authToken: accessToken,
  })
}

export async function getExercicios(accessToken: string) {
  return apiFetch("/api/exercicios/", {
    method: "GET",
    authToken: accessToken,
  })
}

export async function criarSessaoMusculacao(
  accessToken: string,
  body: {
    modalidade: "musculacao"
    inicio_em: string
    duracao_seg?: number | null
    calorias?: number | null
    observacoes?: string | null
  }
) {
  return apiFetch("/api/sessoes-atividade/", {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(body),
  })
}
