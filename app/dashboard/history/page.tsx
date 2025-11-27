"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getSessoesAtividade,
  deleteSessaoAtividade,
  SessaoAtividade,
} from "@/lib/api";
import {
  Activity,
  Search,
  Bike,
  PersonStanding,
  Dumbbell,
  Calendar,
  Clock,
  Flame,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

type ModalidadeFiltro = "todos" | "corrida" | "ciclismo" | "musculacao";
type PeriodoFiltro = 7 | 30 | 90;

interface FeedbackMessage {
  type: "success" | "error";
  text: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessaoAtividade[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalidadeFiltro, setModalidadeFiltro] =
    useState<ModalidadeFiltro>("todos");
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>(30);
  const [searchTerm, setSearchTerm] = useState("");

  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  // Estado do modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessaoSelecionada, setSessaoSelecionada] =
    useState<SessaoAtividade | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showMessage = (type: FeedbackMessage["type"], text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4500);
  };

  const formatDuracao = (segundos: number | null) => {
    if (!segundos || segundos <= 0) return "—";
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min`;
  };

  const formatDataHora = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const data = d.toLocaleDateString("pt-BR");
    const hora = d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${data} • ${hora}`;
  };

  const getIconModalidade = (modalidade: SessaoAtividade["modalidade"]) => {
    if (modalidade === "ciclismo") return <Bike className="w-4 h-4" />;
    if (modalidade === "musculacao") return <Dumbbell className="w-4 h-4" />;
    return <PersonStanding className="w-4 h-4" />;
  };

  const getChipModalidadeStyles = (modalidade: SessaoAtividade["modalidade"]) => {
    if (modalidade === "ciclismo") {
      return "bg-orange-50 text-orange-700 border-orange-100";
    }
    if (modalidade === "musculacao") {
      return "bg-red-50 text-red-700 border-red-100";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  // Calcula intervalo de datas com base no período selecionado (7, 30, 90)
  const dateRange = useMemo(() => {
    const hoje = new Date();
    const fim = hoje.toISOString().split("T")[0];

    const inicioDate = new Date();
    inicioDate.setDate(hoje.getDate() - periodoFiltro + 1);
    const inicio = inicioDate.toISOString().split("T")[0];

    return { inicio, fim };
  }, [periodoFiltro]);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (!token) return;

      const params = new URLSearchParams();

      // Filtro de modalidade -> backend já sabe lidar com isso
      if (modalidadeFiltro !== "todos") {
        params.set("modalidade", modalidadeFiltro);
      }

      // Filtro de datas (início_em_inicio / inicio_em_fim)
      params.set("inicio_em_inicio", dateRange.inicio);
      params.set("inicio_em_fim", dateRange.fim);

      const data = await getSessoesAtividade(token, params.toString());
      setSessions(data);
    } catch (error) {
      console.error("Erro ao carregar sessões de atividade", error);
      showMessage(
        "error",
        "Não foi possível carregar seus treinos. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  }, [modalidadeFiltro, dateRange]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filtro em memória só para o texto da observação
  const filteredSessions = useMemo(() => {
    if (!searchTerm.trim()) return sessions;
    const term = searchTerm.toLowerCase();
    return sessions.filter((s) => {
      const obs = s.observacoes?.toLowerCase() ?? "";
      return obs.includes(term);
    });
  }, [sessions, searchTerm]);

  // Abrir modal de confirmação de exclusão
  const handleOpenDeleteModal = (sessao: SessaoAtividade) => {
    setSessaoSelecionada(sessao);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;
    setDeleteModalOpen(false);
    setSessaoSelecionada(null);
  };

  const handleDelete = async () => {
    if (!sessaoSelecionada) return;
    setDeleting(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (!token) return;

      const resp = await deleteSessaoAtividade(token, sessaoSelecionada.id);
      showMessage("success", resp.detail || "Sessão excluída com sucesso.");

      // Recarrega lista
      await loadSessions();
      handleCloseDeleteModal();
    } catch (err: any) {
      console.error(err);
      showMessage(
        "error",
        err?.message ||
          "Não foi possível excluir a sessão. Verifique se existem dados associados (métricas, séries ou marcações de hábito)."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-14 space-y-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-0 space-y-6 pt-4">
          {/* HERO / CABEÇALHO */}
          <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-6 py-5 sm:px-8 sm:py-6 shadow-lg text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400/80">
                Histórico
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
                <Activity className="w-6 h-6 text-red-400" />
                Meus Treinos
              </h1>
              <p className="text-sm text-slate-100/90 max-w-md">
                Veja todas as suas sessões registradas, filtre por modalidade e
                período e acompanhe sua evolução no detalhe.
              </p>
            </div>

            {/* Filtros principais: período + info de quantidade */}
            <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-100 border border-white/10 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {`De ${dateRange.inicio.split("-").reverse().join("/")} até ${
                  dateRange.fim.split("-").reverse().join("/")
                }`}
              </span>
              <div className="flex bg-black/20 rounded-full p-1 shadow-sm border border-white/20">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setPeriodoFiltro(d as PeriodoFiltro)}
                    className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                      periodoFiltro === d
                        ? "bg-white text-slate-900 shadow-md"
                        : "text-slate-100/80 hover:bg-white/10"
                    }`}
                  >
                    {d} dias
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* MENSAGEM GLOBAL */}
          {message && (
            <div
              className={`rounded-2xl px-4 py-3 flex items-center gap-3 text-sm border animate-in slide-in-from-top-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {message.type === "success" ? (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  OK
                </span>
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* FILTROS SECUNDÁRIOS: modalidade + busca */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Modalidades */}
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {[
                { label: "Todos", value: "todos" as ModalidadeFiltro },
                { label: "Corrida", value: "corrida" as ModalidadeFiltro },
                { label: "Ciclismo", value: "ciclismo" as ModalidadeFiltro },
                {
                  label: "Musculação",
                  value: "musculacao" as ModalidadeFiltro,
                },
              ].map((item) => {
                const isActive = modalidadeFiltro === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setModalidadeFiltro(item.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {item.value === "corrida" && (
                      <PersonStanding className="w-3 h-3" />
                    )}
                    {item.value === "ciclismo" && (
                      <Bike className="w-3 h-3" />
                    )}
                    {item.value === "musculacao" && (
                      <Dumbbell className="w-3 h-3" />
                    )}
                    {item.value === "todos" && (
                      <Activity className="w-3 h-3" />
                    )}
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Busca por observação */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por observação..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm transition-all"
              />
            </div>
          </section>

          {/* LISTAGEM DE SESSÕES */}
          <section className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-28 bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-400">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-slate-900 font-semibold mb-1">
                  Nenhum treino encontrado
                </h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Ajuste os filtros de período ou modalidade, ou limpe o campo
                  de busca para visualizar mais sessões.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSessions.map((sessao) => (
                  <div
                    key={sessao.id}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-3"
                  >
                    {/* Topo: modalidade + data/hora */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div
                          className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[11px] font-semibold ${getChipModalidadeStyles(
                            sessao.modalidade
                          )}`}
                        >
                          {getIconModalidade(sessao.modalidade)}
                          <span className="uppercase tracking-wide">
                            {sessao.modalidade === "corrida" && "Corrida"}
                            {sessao.modalidade === "ciclismo" && "Ciclismo"}
                            {sessao.modalidade === "musculacao" &&
                              "Musculação"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDataHora(sessao.inicio_em)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenDeleteModal(sessao)}
                        className="p-2 rounded-full text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir sessão"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <p className="text-slate-500 flex items-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3" />
                          Duração
                        </p>
                        <p className="font-semibold text-slate-900">
                          {formatDuracao(sessao.duracao_seg)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <p className="text-slate-500 flex items-center gap-1 mb-0.5">
                          <Flame className="w-3 h-3" />
                          Calorias
                        </p>
                        <p className="font-semibold text-slate-900">
                          {sessao.calorias != null ? `${sessao.calorias} kcal` : "—"}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <p className="text-slate-500 mb-0.5">ID</p>
                        <p className="font-semibold text-slate-900">
                          #{sessao.id}
                        </p>
                      </div>
                    </div>

                    {/* Observação */}
                    {sessao.observacoes && (
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2 line-clamp-2">
                        {sessao.observacoes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
        {deleteModalOpen && sessaoSelecionada && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Excluir sessão de treino
                  </h3>
                </div>
                <button
                  onClick={handleCloseDeleteModal}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                  disabled={deleting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <p className="text-slate-600">
                  Tem certeza de que deseja excluir esta sessão? Essa ação{" "}
                  <span className="font-semibold">não pode ser desfeita</span>.
                </p>

                <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-xs text-slate-600 space-y-1.5">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {getIconModalidade(sessaoSelecionada.modalidade)}
                    <span>
                      {sessaoSelecionada.modalidade === "corrida" && "Corrida"}
                      {sessaoSelecionada.modalidade === "ciclismo" &&
                        "Ciclismo"}
                      {sessaoSelecionada.modalidade === "musculacao" &&
                        "Musculação"}
                    </span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDataHora(sessaoSelecionada.inicio_em)}
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Duração: {formatDuracao(sessaoSelecionada.duracao_seg)}
                  </p>
                  {sessaoSelecionada.calorias != null && (
                    <p className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {sessaoSelecionada.calorias} kcal
                    </p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-[11px] text-amber-800 flex gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Se esta sessão tiver{" "}
                    <strong>métricas de corrida/ciclismo</strong>,{" "}
                    <strong>séries de musculação</strong> ou{" "}
                    <strong>marcações de hábito</strong>, a exclusão será
                    bloqueada pelo sistema. Você precisará remover esses dados
                    antes.
                  </span>
                </div>
              </div>

              <div className="px-6 pb-5 pt-3 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-slate-100 bg-slate-50/60 rounded-b-3xl">
                <button
                  onClick={handleCloseDeleteModal}
                  disabled={deleting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-white transition-colors disabled:opacity-70"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {deleting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      Excluindo...
                    </span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Excluir sessão
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
