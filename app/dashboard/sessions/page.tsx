"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Exercicio,
  getExercicios,
  createSessaoAtividade,
  SessaoAtividadeInput,
  createMetricasCorrida,
  createMetricasCiclismo,
  createSerieMusculacao,
} from "@/lib/api";
import {
  Activity,
  Bike,
  PersonStanding,
  Dumbbell,
  Calendar,
  Clock,
  Flame,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
} from "lucide-react";

type Modalidade = "corrida" | "ciclismo" | "musculacao";

interface SerieTemp {
  id: number;
  exercicioId: number | null;
  repeticoes: string;
  cargaKg: string;
}

type FeedbackType = "success" | "error";

interface FeedbackMessage {
  type: FeedbackType;
  text: string;
}

export default function SessionsPage() {
  const [modalidade, setModalidade] = useState<Modalidade>("corrida");

  // campos de data/hora
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const defaultTime = now.toTimeString().slice(0, 5); // HH:MM

  const [data, setData] = useState(defaultDate);
  const [hora, setHora] = useState(defaultTime);

  const [duracaoMin, setDuracaoMin] = useState(""); // em minutos
  const [calorias, setCalorias] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [criarMetricas, setCriarMetricas] = useState<"nao" | "sim">("nao");

  // métricas corrida
  const [corridaDistancia, setCorridaDistancia] = useState("");
  const [corridaPaceMin, setCorridaPaceMin] = useState("");
  const [corridaPaceSeg, setCorridaPaceSeg] = useState("");
  const [corridaFc, setCorridaFc] = useState("");

  // métricas ciclismo
  const [ciclismoDistancia, setCiclismoDistancia] = useState("");
  const [ciclismoVelMedia, setCiclismoVelMedia] = useState("");
  const [ciclismoFc, setCiclismoFc] = useState("");

  // séries musculação
  const [series, setSeries] = useState<SerieTemp[]>([
    { id: 1, exercicioId: null, repeticoes: "", cargaKg: "" },
  ]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  const showMessage = (type: FeedbackType, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    // Carrega exercícios para musculação
    async function loadExercicios() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const data = await getExercicios(token);
        setExercicios(data);
      } catch (err) {
        console.error("Erro ao carregar exercícios", err);
      }
    }
    loadExercicios();
  }, []);

  const handleAddSerie = () => {
    setSeries((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        exercicioId: null,
        repeticoes: "",
        cargaKg: "",
      },
    ]);
  };

  const handleRemoveSerie = (id: number) => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSerieChange = (
    id: number,
    field: "exercicioId" | "repeticoes" | "cargaKg",
    value: string
  ) => {
    setSeries((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              [field]:
                field === "exercicioId" ? (value ? Number(value) : null) : value,
            }
          : s
      )
    );
  };

  const buildSessaoPayload = (): SessaoAtividadeInput => {
    const dt = `${data}T${hora}:00`;
    const inicioISO = new Date(dt).toISOString();

    const duracaoNum =
      duracaoMin && !Number.isNaN(Number(duracaoMin))
        ? Number(duracaoMin) * 60
        : null;

    const caloriasNum =
      calorias && !Number.isNaN(Number(calorias)) ? Number(calorias) : null;

    return {
      modalidade,
      inicio_em: inicioISO,
      duracao_seg: duracaoNum,
      calorias: caloriasNum,
      observacoes: observacoes || null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data || !hora) {
      showMessage("error", "Preencha a data e horário da sessão.");
      return;
    }

    if (!["corrida", "ciclismo", "musculacao"].includes(modalidade)) {
      showMessage("error", "Escolha uma modalidade válida.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        showMessage("error", "Sessão expirada. Faça login novamente.");
        return;
      }

      // 1) Cria a sessão
      const sessaoPayload = buildSessaoPayload();
      const sessaoCriada = await createSessaoAtividade(token, sessaoPayload);

      // 2) Se quiser registrar métricas agora
      if (criarMetricas === "sim") {
        if (modalidade === "corrida") {
          const distNum = corridaDistancia
            ? Number(corridaDistancia.replace(",", "."))
            : 0;
          const paceMin = corridaPaceMin ? Number(corridaPaceMin) : 0;
          const paceSeg = corridaPaceSeg ? Number(corridaPaceSeg) : 0;
          const totalSeg = paceMin * 60 + paceSeg;

          const fc =
            corridaFc && !Number.isNaN(Number(corridaFc))
              ? Number(corridaFc)
              : null;

          if (distNum <= 0 || totalSeg <= 0) {
            showMessage(
              "error",
              "Para corrida, informe distância e pace válidos."
            );
          } else {
            await createMetricasCorrida(token, {
              sessao: sessaoCriada.id,
              distancia_km: distNum.toFixed(2),
              ritmo_medio_seg_km: totalSeg,
              fc_media: fc,
            });
          }
        }

        if (modalidade === "ciclismo") {
          const distNum = ciclismoDistancia
            ? Number(ciclismoDistancia.replace(",", "."))
            : 0;
          const velNum = ciclismoVelMedia
            ? Number(ciclismoVelMedia.replace(",", "."))
            : 0;
          const fc =
            ciclismoFc && !Number.isNaN(Number(ciclismoFc))
              ? Number(ciclismoFc)
              : null;

          if (distNum <= 0 || velNum <= 0) {
            showMessage(
              "error",
              "Para ciclismo, informe distância e velocidade média válidas."
            );
          } else {
            await createMetricasCiclismo(token, {
              sessao: sessaoCriada.id,
              distancia_km: distNum.toFixed(2),
              velocidade_media_kmh: velNum.toFixed(2),
              fc_media: fc,
            });
          }
        }

        if (modalidade === "musculacao") {
          const seriesValidas = series.filter(
            (s) =>
              s.exercicioId &&
              (s.repeticoes.trim() !== "" || s.cargaKg.trim() !== "")
          );

          for (const s of seriesValidas) {
            await createSerieMusculacao(token, {
              sessao: sessaoCriada.id,
              exercicio: s.exercicioId as number,
              repeticoes:
                s.repeticoes && !Number.isNaN(Number(s.repeticoes))
                  ? Number(s.repeticoes)
                  : null,
              carga_kg:
                s.cargaKg && !Number.isNaN(Number(s.cargaKg))
                  ? Number(s.cargaKg).toString()
                  : null,
            });
          }
        }
      }

      // reset básico
      setDuracaoMin("");
      setCalorias("");
      setObservacoes("");
      setCriarMetricas("nao");
      setCorridaDistancia("");
      setCorridaPaceMin("");
      setCorridaPaceSeg("");
      setCorridaFc("");
      setCiclismoDistancia("");
      setCiclismoVelMedia("");
      setCiclismoFc("");
      setSeries([{ id: 1, exercicioId: null, repeticoes: "", cargaKg: "" }]);

      showMessage(
        "success",
        "Sessão registrada com sucesso! Você já pode vê-la em Meus Treinos."
      );
    } catch (err: any) {
      console.error(err);
      showMessage(
        "error",
        err?.message || "Erro ao salvar a sessão. Verifique os dados."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="max-w-5xl mx-auto px-4 lg:px-0 space-y-8 pt-4">
          {/* HERO */}
          <section className="rounded-3xl bg-gradient-to-r from-red-500 via-red-600 to-slate-900 px-6 py-5 sm:px-8 sm:py-6 shadow-lg text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-red-100/80">
                Registro rápido
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Sessão de atividade física
              </h1>
              <p className="text-sm text-red-50/90 max-w-md">
                Cadastre uma nova sessão e, se quiser, já salve as métricas ou
                séries dessa atividade no mesmo fluxo.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/20 border border-white/30 text-red-50">
                <CheckCircle2 className="w-3 h-3" />
                Tudo fica salvo para o dashboard e para o histórico.
              </span>
              <span className="flex items-center gap-1 text-red-100/90">
                <Info className="w-3 h-3" />
                Depois você pode ver tudo em{" "}
                <span className="font-semibold">Meus Treinos</span>.
              </span>
            </div>
          </section>

          {/* ALERTA GLOBAL */}
          {message && (
            <div
              className={`rounded-2xl px-4 py-3 flex items-center gap-3 text-sm border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* FORM PRINCIPAL */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
          >
            {/* Cabeçalho do card */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                    Dados da sessão
                  </h2>
                  <p className="text-xs text-slate-500">
                    Preencha primeiro as informações básicas da atividade.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Linha 1: modalidade + data + hora */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Modalidade
                  </label>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setModalidade("corrida")}
                      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl border transition-all ${
                        modalidade === "corrida"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <PersonStanding className="w-4 h-4" />
                      Corrida
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalidade("ciclismo")}
                      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl border transition-all ${
                        modalidade === "ciclismo"
                          ? "bg-orange-50 border-orange-500 text-orange-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      Ciclismo
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalidade("musculacao")}
                      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl border transition-all ${
                        modalidade === "musculacao"
                          ? "bg-red-50 border-red-500 text-red-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Dumbbell className="w-4 h-4" />
                      Musculação
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Data
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Linha 2: duração + calorias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Duração (min)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      value={duracaoMin}
                      onChange={(e) => setDuracaoMin(e.target.value)}
                      placeholder="Ex: 45"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Calorias (kcal)
                  </label>
                  <div className="relative">
                    <Flame className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      value={calorias}
                      onChange={(e) => setCalorias(e.target.value)}
                      placeholder="Opcional"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Corrida leve em jejum, treino de perna, pedal com subidas..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm resize-none"
                />
              </div>

              <div className="h-px bg-slate-100" />

              {/* Seção: registrar métricas? */}
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      Registrar métricas dessa sessão?
                    </h3>
                    <p className="text-xs text-slate-500">
                      Se você já sabe os dados (distância, pace, séries, etc.),
                      pode salvar tudo agora.
                    </p>
                  </div>
                  <select
                    value={criarMetricas}
                    onChange={(e) =>
                      setCriarMetricas(e.target.value as "nao" | "sim")
                    }
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none"
                  >
                    <option value="nao">Não, registrar depois</option>
                    <option value="sim">Sim, quero registrar agora</option>
                  </select>
                </div>

                {criarMetricas === "sim" && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-4">
                    {modalidade === "corrida" && (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <PersonStanding className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              Métricas de corrida
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Distância, pace médio por km e frequência
                              cardíaca.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Distância (km)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={corridaDistancia}
                              onChange={(e) =>
                                setCorridaDistancia(e.target.value)
                              }
                              placeholder="Ex: 5.20"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Pace médio (min/km)
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={corridaPaceMin}
                                onChange={(e) =>
                                  setCorridaPaceMin(e.target.value)
                                }
                                placeholder="min"
                                className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                              />
                              <span className="text-slate-400">:</span>
                              <input
                                type="number"
                                min={0}
                                max={59}
                                value={corridaPaceSeg}
                                onChange={(e) =>
                                  setCorridaPaceSeg(e.target.value)
                                }
                                placeholder="seg"
                                className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              FC média (bpm)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={corridaFc}
                              onChange={(e) =>
                                setCorridaFc(e.target.value)
                              }
                              placeholder="Opcional"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {modalidade === "ciclismo" && (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                            <Bike className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              Métricas de ciclismo
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Distância, velocidade média e frequência
                              cardíaca.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Distância (km)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={ciclismoDistancia}
                              onChange={(e) =>
                                setCiclismoDistancia(e.target.value)
                              }
                              placeholder="Ex: 25.40"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Velocidade média (km/h)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min={0}
                              value={ciclismoVelMedia}
                              onChange={(e) =>
                                setCiclismoVelMedia(e.target.value)
                              }
                              placeholder="Ex: 27.5"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              FC média (bpm)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={ciclismoFc}
                              onChange={(e) =>
                                setCiclismoFc(e.target.value)
                              }
                              placeholder="Opcional"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {modalidade === "musculacao" && (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              Séries de musculação
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Adicione as séries que você executou nessa
                              sessão.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {series.map((s) => (
                            <div
                              key={s.id}
                              className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 text-xs items-end"
                            >
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Exercício
                                </label>
                                <select
                                  value={s.exercicioId ?? ""}
                                  onChange={(e) =>
                                    handleSerieChange(
                                      s.id,
                                      "exercicioId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none"
                                >
                                  <option value="">Selecione</option>
                                  {exercicios.map((ex) => (
                                    <option key={ex.id} value={ex.id}>
                                      {ex.nome}
                                      {ex.grupo_muscular
                                        ? ` (${ex.grupo_muscular})`
                                        : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Repetições
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={s.repeticoes}
                                  onChange={(e) =>
                                    handleSerieChange(
                                      s.id,
                                      "repeticoes",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex: 12"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Carga (kg)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step="0.5"
                                  value={s.cargaKg}
                                  onChange={(e) =>
                                    handleSerieChange(
                                      s.id,
                                      "cargaKg",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex: 20"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSerie(s.id)}
                                className="mb-1 inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                title="Remover série"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={handleAddSerie}
                            className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border border-dashed border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Adicionar série
                          </button>

                          <p className="text-[11px] text-slate-500 flex gap-1">
                            <AlertTriangle className="w-3 h-3 mt-[1px]" />
                            Se você deixar uma linha totalmente vazia, ela será
                            ignorada.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Footer do form */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-3xl">
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Você poderá editar ou excluir essa sessão depois em{" "}
                <span className="font-semibold">Meus Treinos</span>.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Salvar sessão
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
