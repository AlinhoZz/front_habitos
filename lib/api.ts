// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não está definida no .env.local");
}

interface ApiFetchOptions extends RequestInit {
  authToken?: string | null;
  // Flag interna para evitar loop infinito de tentativas
  _retry?: boolean; 
}

/**
 * Função principal para chamadas na API.
 * Gerencia automaticamente o Refresh Token em caso de erro 401.
 */
async function apiFetch<T>(
  path: string,
  { authToken, headers, _retry, ...options }: ApiFetchOptions = {}
): Promise<T> {
  const url = `${API_URL}${path}`;

  // 1. Tenta fazer a requisição original
  const resp = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  // 2. Se deu erro 401 (Não autorizado) e ainda não tentamos reconectar
  if (resp.status === 401 && !_retry) {
    if (path.includes("/auth/login") || path.includes("/auth/refresh")) {
       throw new Error("Credenciais inválidas");
    }

    try {
      const currentRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      if (currentRefreshToken) {
        // --- LOGICA DE REFRESH ---
        const refreshResponse = await fetch(`${API_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: currentRefreshToken })
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newAccessToken = data.access_token;
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', newAccessToken);
                if (data.refresh_token) {
                    localStorage.setItem('refreshToken', data.refresh_token);
                }
            }

            // --- REFAZ A REQUISIÇÃO ORIGINAL ---
            return apiFetch<T>(path, {
                ...options,
                authToken: newAccessToken,
                headers,
                _retry: true
            });
        }
      }
    } catch (refreshError) {
      if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/pages/login'; 
      }
    }
  }

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const detail =
      (data && (data.detail || data.non_field_errors || data.error)) ||
      JSON.stringify(data);

    throw new Error(detail || `Erro na requisição: ${resp.status}`);
  }

  return data as T;
}

/* ========================================== */
/* TIPOS DE RETORNO             */
/* ========================================== */

export interface UserProfile {
  id: number;
  nome: string;
  email: string;
  criado_em?: string;
}

export interface LoginResponse {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
}

export interface Exercicio {
  id: number;
  nome: string;
  grupo_muscular: string;
  equipamento: string;
}
export interface SessaoAtividade {
  id: number;
  usuario: number;
  modalidade: 'corrida' | 'ciclismo' | 'musculacao';
  inicio_em: string; // ISO datetime
  duracao_seg: number | null;
  calorias: number | null;
  observacoes: string | null;
  criado_em: string; // ISO datetime
}

/* ========================================== */
/* FUNÇÕES DE AUTENTICAÇÃO          */
/* ========================================== */

export async function login(email: string, senha: string) {
  return apiFetch<LoginResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export async function register(nome: string, email: string, senha: string) {
  return apiFetch<LoginResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha }),
  });
}

export async function refreshAccessToken(refreshToken: string) {
  return apiFetch<{ access_token: string }>("/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

/* ========================================== */
/* GERENCIAMENTO DE PERFIL (ME)       */
/* ========================================== */

export async function getMe(accessToken: string) {
  return apiFetch<UserProfile>("/auth/me/", {
    method: "GET",
    authToken: accessToken,
  });
}

export async function updateMe(accessToken: string, data: { nome?: string; email?: string }) {
  return apiFetch<UserProfile>("/auth/me/", {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(data),
  });
}

export async function deleteMe(accessToken: string) {
  return apiFetch("/auth/me/", {
    method: "DELETE",
    authToken: accessToken,
  });
}

/* ========================================== */
/* RECURSOS DO SISTEMA (EXERCÍCIOS, ETC)    */
/* ========================================== */

export async function getExercicios(accessToken: string) {
  return apiFetch<Exercicio[]>("/api/exercicios/", {
    method: "GET",
    authToken: accessToken,
  });
}

export async function getExercicioById(accessToken: string, id: number) {
  return apiFetch<Exercicio>(`/api/exercicios/${id}/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function getDashboardResumo(accessToken: string, dias = 30) {
  return apiFetch(`/api/dashboard/resumo/?dias=${dias}`, {
      method: "GET",
      authToken: accessToken,
  });
}
export async function changePassword(accessToken: string, data: { 
  senha_atual: string; 
  nova_senha: string; 
  nova_senha_confirmacao: string; 
}) {
  return apiFetch("/auth/change-password/", {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(data),
  }); }

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
  });
  
}
export interface MetaHabito {
  id: number;
  titulo: string;
  modalidade: string;
  ativo: boolean;
  data_inicio?: string;
  data_fim?: string | null;
  frequencia_semana?: number | null;
  distancia_meta_km?: number | null;
  duracao_meta_min?: number | null;
  sessoes_meta?: number | null;
}

export interface StreakResponse {
  streak_atual: number;
  streak_maximo: number;
}

export async function getMetasAtivas(accessToken: string) {
  return apiFetch<MetaHabito[]>("/api/metas-habito/?ativo=true", {
    method: "GET",
    authToken: accessToken,
  });
}

export async function getMetaStreaks(accessToken: string, id: number) {
  return apiFetch<StreakResponse>(`/api/metas-habito/${id}/streaks/`, {
    method: "GET",
    authToken: accessToken,
  });
}
export interface MetaHabitoInput {
  titulo: string;
  modalidade: string; // 'corrida' | 'ciclismo' | 'musculacao'
  data_inicio: string;
  data_fim?: string | null;
  frequencia_semana?: number | null;
  distancia_meta_km?: number | null;
  duracao_meta_min?: number | null;
  sessoes_meta?: number | null;
  ativo?: boolean;
}

// --- Adicione nas funções de API ---

export async function getMetas(accessToken: string, ativo = true) {
  // Converte booleano para string 'true'/'false' ou '1'/'0' conforme sua API espera
  const ativoStr = ativo ? 'true' : 'false';
  return apiFetch<MetaHabito[]>(`/api/metas-habito/?ativo=${ativoStr}`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function createMetaHabito(accessToken: string, data: MetaHabitoInput) {
  return apiFetch<MetaHabito>("/api/metas-habito/", {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(data),
  });
}

export async function encerrarMetaHabito(accessToken: string, id: number) {
  return apiFetch<MetaHabito>(`/api/metas-habito/${id}/encerrar/`, {
    method: "PATCH",
    authToken: accessToken,
  });
}
  export async function updateMetaHabito(
  accessToken: string,
  id: number,
  data: Partial<MetaHabitoInput>
) {
  return apiFetch<MetaHabito>(`/api/metas-habito/${id}/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(data),
  });
}

// Reativar meta: só envia { ativo: true } para o PATCH
export async function reativarMetaHabito(
  accessToken: string,
  id: number
) {
  // aproveita a função de update genérica
  return updateMetaHabito(accessToken, id, { ativo: true });
}

// DELETE /api/metas-habito/:id/
// Se tiver marcações, o backend só desativa (ativo=false) e retorna um detail
// Se não tiver histórico, apaga de vez
export async function deleteMetaHabito(
  accessToken: string,
  id: number
) {
  return apiFetch<{ detail?: string }>(`/api/metas-habito/${id}/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function getSessoesAtividade(
  accessToken: string,
  queryString = ''
) {
  const sufixo = queryString ? `?${queryString}` : '';
  return apiFetch<SessaoAtividade[]>(`/api/sessoes-atividade/${sufixo}`, {
    method: 'GET',
    authToken: accessToken,
  });
}

// DELETE /api/sessoes-atividade/:id/
// Se tiver métricas/séries/marcações associadas, o backend devolve 400 com detail.
export async function deleteSessaoAtividade(
  accessToken: string,
  id: number
) {
  return apiFetch<{ detail?: string }>(`/api/sessoes-atividade/${id}/`, {
    method: 'DELETE',
    authToken: accessToken,
  });
}