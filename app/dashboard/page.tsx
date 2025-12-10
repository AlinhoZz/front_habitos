"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getDashboardResumo,
  getMetasAtivas,
  getMetaStreaks,
  MetaHabito,
} from "@/lib/api";
import {
  Activity,
  Flame,
  Timer,
  Bike,
  PersonStanding,
  Dumbbell,
  TrendingUp,
  AlertCircle,
  Trophy,
  Target,
  Plus,
} from "lucide-react";

// Tipagem do Dashboard Geral
interface DashboardData {
  periodo_dias: number;
  total_sessoes: number;
  duracao_total_segundos: number;
  calorias_totais: number;
  por_modalidade: {
    corrida: { sessoes: number; distancia_total_km: number; ritmo_medio: number };
    ciclismo: { sessoes: number; distancia_total_km: number; velocidade_media: number };
    musculacao: { sessoes: number; series_totais: number };
  };
}

// Tipagem combinada para exibir no card (Meta + Streak)
interface HabitoComStreak extends MetaHabito {
  streak_atual: number;
  streak_maximo: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "maisfolegoapp.com.br";

const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
const STRAVA_REDIRECT_URI = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI;

const STRAVA_AUTH_URL =
  STRAVA_CLIENT_ID && STRAVA_REDIRECT_URI
    ? `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
        STRAVA_REDIRECT_URI
      )}&approval_prompt=auto&scope=read,activity:read_all`
    : null;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [habits, setHabits] = useState<HabitoComStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(30);

  // Estado para Strava
  const [stravaLoading, setStravaLoading] = useState(false);
  const [stravaMessage, setStravaMessage] = useState<string | null>(null);
  const [stravaError, setStravaError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

        if (!token) return;

        // 1. Resumo Geral
        const dashboardResult = (await getDashboardResumo(
          token,
          periodo
        )) as unknown as DashboardData;
        setData(dashboardResult);

        // 2. Metas + Streaks
        const metasAtivas = await getMetasAtivas(token);

        const habitsWithData = await Promise.all(
          metasAtivas.map(async (meta) => {
            try {
              const streak = await getMetaStreaks(token, meta.id);
              return { ...meta, ...streak };
            } catch {
              return { ...meta, streak_atual: 0, streak_maximo: 0 };
            }
          })
        );

        setHabits(habitsWithData);
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [periodo]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  const handleSyncStrava = async () => {
    setStravaError(null);
    setStravaMessage(null);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!token) {
      setStravaError("Você precisa estar logado para sincronizar com o Strava.");
      return;
    }

    setStravaLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/integracoes/strava/sync/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        setStravaError(
          data?.detail ||
            "Erro ao sincronizar com o Strava. Verifique se sua conta já está conectada."
        );
      } else {
        setStravaMessage(
          data?.detail || "Atividades do Strava sincronizadas com sucesso!"
        );
      }
    } catch (error) {
      console.error(error);
      setStravaError("Erro de conexão com o servidor ao sincronizar com o Strava.");
    } finally {
      setStravaLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 space-y-10 pb-12">
        {/* HEADER / HERO */}
        <section className="rounded-3xl bg-gradient-to-r from-red-500 via-red-600 to-amber-500 px-6 py-5 shadow-lg text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-red-100/80 mb-1">
              Resumo
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Visão Geral
            </h2>
            <p className="text-sm text-red-50/90 max-w-md">
              Acompanhe sua evolução nos últimos {data.periodo_dias} dias e veja
              como seus hábitos estão construindo consistência.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs font-medium text-red-100/80">
              Período analisado
            </span>
            <div className="flex bg-black/15 rounded-full p-1 shadow-sm border border-white/25">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setPeriodo(d)}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                    periodo === d
                      ? "bg-white text-red-600 shadow-md"
                      : "text-red-50/80 hover:bg-white/10"
                  }`}
                >
                  {d} dias
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SEÇÃO 1: KPIs PRINCIPAIS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100/80 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Activity size={26} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total de Treinos
              </p>
              <h3 className="text-3xl font-bold text-slate-900">
                {data.total_sessoes}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sessões registradas no período
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100/80 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <Timer size={26} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Tempo em Movimento
              </p>
              <h3 className="text-3xl font-bold text-slate-900">
                {formatTime(data.duracao_total_segundos)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Soma de todas as sessões
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100/80 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition">
            <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
              <Flame size={26} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Calorias Queimadas
              </p>
              <h3 className="text-3xl font-bold text-slate-900">
                {data.calorias_totais}{" "}
                <span className="text-sm font-normal text-slate-400">kcal</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Estimativa total registrada
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: HÁBITOS & STREAKS */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Target className="text-red-600" />
              Hábitos em fogo
            </h3>
          </div>

          {habits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform"
                >
                  <div className="absolute top-0 right-0 bg-white/5 w-24 h-24 rounded-bl-full -mr-4 -mt-4" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h4
                        className="font-semibold text-lg truncate pr-2"
                        title={habit.titulo}
                      >
                        {habit.titulo}
                      </h4>
                      <div
                        className={`p-1.5 rounded-lg ${
                          habit.streak_atual > 0
                            ? "bg-orange-500 text-white"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        <Flame
                          size={18}
                          fill={habit.streak_atual > 0 ? "currentColor" : "none"}
                        />
                      </div>
                    </div>

                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-3xl font-black">
                        {habit.streak_atual}
                      </span>
                      <span className="text-sm font-medium text-slate-400 mb-1">
                        dias seguidos
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 py-1 px-2 rounded-md w-fit">
                      <Trophy size={12} className="text-yellow-400" />
                      Recorde:{" "}
                      <span className="text-white font-semibold">
                        {habit.streak_maximo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <div className="bg-red-50 p-3 rounded-full mb-3">
                <Target className="text-red-500" size={24} />
              </div>
              <h4 className="text-slate-900 font-semibold mb-1">
                Nenhum hábito monitorado
              </h4>
              <p className="text-slate-500 text-sm mb-4 max-w-xs">
                Crie metas de constância para enxergar seu “foguinho” de
                disciplina aqui.
              </p>
              <a
                href="/dashboard/goals"
                className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1"
              >
                Criar minha primeira meta <Plus size={16} />
              </a>
            </div>
          )}
        </section>

        {/* SEÇÃO 3: PERFORMANCE POR MODALIDADE */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Performance por modalidade
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ciclismo */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -mr-4 -mt-4 opacity-60" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <Bike />
                  </div>
                  <h4 className="font-semibold text-slate-800">Ciclismo</h4>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Sessões</span>
                    <span className="font-semibold text-lg text-slate-900">
                      {data.por_modalidade.ciclismo.sessoes}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Distância</span>
                    <span className="font-semibold text-lg text-slate-900">
                      {Number(
                        data.por_modalidade.ciclismo.distancia_total_km
                      ).toFixed(1)}{" "}
                      <small className="text-xs">km</small>
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-slate-500">Vel. média</span>
                    <span className="font-semibold text-lg text-slate-900">
                      {Number(
                        data.por_modalidade.ciclismo.velocidade_media
                      ).toFixed(1)}{" "}
                      <small className="text-xs">km/h</small>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Corrida */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-bl-full -mr-4 -mt-4 opacity-60" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <PersonStanding />
                  </div>
                  <h4 className="font-semibold text-slate-800">Corrida</h4>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Sessões</span>
                    <span className="font-semibold text-lg text-slate-900">
                      {data.por_modalidade.corrida.sessoes}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Distância</span>
                    <span className="font-semibold text-lg text-slate-900">
                      {Number(
                        data.por_modalidade.corrida.distancia_total_km
                      ).toFixed(1)}{" "}
                      <small className="text-xs">km</small>
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-slate-500">Pace médio</span>
                    <span className="font-semibold text-lg text-slate-900">
                      {data.por_modalidade.corrida.ritmo_medio
                        ? `${Math.floor(
                            data.por_modalidade.corrida.ritmo_medio / 60
                          )}'${
                            data.por_modalidade.corrida.ritmo_medio % 60
                          }"`
                        : "--"}{" "}
                      <small className="text-xs">/km</small>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Musculação */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-bl-full -mr-4 -mt-4 opacity-60" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600">
                    <Dumbbell />
                  </div>
                  <h4 className="font-semibold text-slate-800">Musculação</h4>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Sessões</span>
                    <span className="font-semibold text-lg text-slate-900">
                      {data.por_modalidade.musculacao.sessoes}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-slate-500">Séries totais</span>
                    <span className="font-semibold text-lg text-slate-900">
                      {data.por_modalidade.musculacao.series_totais}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-2 opacity-70">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <AlertCircle size={10} />
                      Mais métricas em breve
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: INTEGRAÇÃO COM STRAVA */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Bike className="text-red-600" />
            Integração com Strava
          </h3>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="space-y-2 max-w-md">
              <p className="text-sm text-slate-700 font-medium">
                Traga seus treinos automaticamente do Strava
              </p>
              <p className="text-xs text-slate-500">
                Conecte sua conta Strava para importar corridas, pedaladas e
                outras atividades diretamente para o +Fôlego. Depois de conectado,
                você pode sincronizar quando quiser.
              </p>

              {stravaMessage && (
                <div className="mt-2 text-xs px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {stravaMessage}
                </div>
              )}

              {stravaError && (
                <div className="mt-2 text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-100 flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 mt-[2px]" />
                  <span>{stravaError}</span>
                </div>
              )}

              {!STRAVA_AUTH_URL && (
                <p className="mt-2 text-[11px] text-slate-400">
                  Para habilitar a conexão com o Strava, configure{" "}
                  <code className="bg-slate-100 px-1 rounded">
                    NEXT_PUBLIC_STRAVA_CLIENT_ID
                  </code>{" "}
                  e{" "}
                  <code className="bg-slate-100 px-1 rounded">
                    NEXT_PUBLIC_STRAVA_REDIRECT_URI
                  </code>{" "}
                  no front.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {STRAVA_AUTH_URL && (
                <a
                  href={STRAVA_AUTH_URL}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Conectar ao Strava
                </a>
              )}

              <button
                type="button"
                onClick={handleSyncStrava}
                disabled={stravaLoading}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 bg-slate-50 hover:bg-white hover:border-slate-300 transition-colors disabled:opacity-70"
              >
                {stravaLoading ? "Sincronizando..." : "Sincronizar atividades"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
