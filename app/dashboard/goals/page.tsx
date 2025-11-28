"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getMetas,
  createMetaHabito,
  encerrarMetaHabito,
  updateMetaHabito,
  reativarMetaHabito,
  deleteMetaHabito,
  MetaHabito,
  MetaHabitoInput,
  MarcacaoHabito,
  getMarcacoesHabitoByMeta,
  createMarcacaoHabito,
  updateMarcacaoHabito,
} from "@/lib/api";
import {
  Target,
  Plus,
  Calendar,
  Trophy,
  Bike,
  PersonStanding,
  Dumbbell,
  X,
  Loader2,
  CheckCircle2,
  Flag,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";

type TabType = "ativas" | "inativas";

export default function GoalsPage() {
  const [metasAtivas, setMetasAtivas] = useState<MetaHabito[]>([]);
  const [metasInativas, setMetasInativas] = useState<MetaHabito[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("ativas");

  // Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formCreate, setFormCreate] = useState<MetaHabitoInput>({
    titulo: "",
    modalidade: "corrida",
    data_inicio: new Date().toISOString().split("T")[0],
    frequencia_semana: null,
    distancia_meta_km: null,
    duracao_meta_min: null,
    sessoes_meta: null,
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [metaParaEditar, setMetaParaEditar] = useState<MetaHabito | null>(null);
  const [formEdit, setFormEdit] = useState<MetaHabitoInput>({
    titulo: "",
    modalidade: "corrida",
    data_inicio: "",
    data_fim: null,
    frequencia_semana: null,
    distancia_meta_km: null,
    duracao_meta_min: null,
    sessoes_meta: null,
    ativo: true,
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Confirmações
  const [metaParaEncerrar, setMetaParaEncerrar] = useState<MetaHabito | null>(null);
  const [metaParaReativar, setMetaParaReativar] = useState<MetaHabito | null>(null);
  const [metaParaExcluir, setMetaParaExcluir] = useState<MetaHabito | null>(null);
  const [processingAcao, setProcessingAcao] = useState(false);

  // Feedback global
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Calendário / marcações de hábito
  const [metaDoCalendario, setMetaDoCalendario] = useState<MetaHabito | null>(null);
  const [marcacoes, setMarcacoes] = useState<MarcacaoHabito[]>([]);
  const [loadingMarcacoes, setLoadingMarcacoes] = useState(false);
  const [savingMarcacao, setSavingMarcacao] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  const marcacoesPorData = React.useMemo(() => {
    const map: Record<string, MarcacaoHabito> = {};
    marcacoes.forEach((m) => {
      map[m.data] = m;
    });
    return map;
  }, [marcacoes]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const hasPeloMenosUmTarget = (data: MetaHabitoInput) => {
    return Boolean(
      data.frequencia_semana ||
        data.distancia_meta_km ||
        data.duracao_meta_min ||
        data.sessoes_meta
    );
  };

  const loadMetas = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) return;

      const [ativas, inativas] = await Promise.all([
        getMetas(token, true),
        getMetas(token, false),
      ]);

      setMetasAtivas(ativas);
      setMetasInativas(inativas);
    } catch (error) {
      console.error("Erro ao carregar metas", error);
      showFeedback("error", "Erro ao carregar suas metas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetas();
  }, []);

  // --------- Funções auxiliares de visual ---------

  const getIcon = (mod: string) => {
    switch (mod) {
      case "ciclismo":
        return <Bike size={16} />;
      case "musculacao":
        return <Dumbbell size={16} />;
      default:
        return <PersonStanding size={16} />;
    }
  };

  const getBgColor = (mod: string) => {
    switch (mod) {
      case "ciclismo":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "musculacao":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  const getLabelModalidade = (mod: string) => {
    switch (mod) {
      case "ciclismo":
        return "Meta de Ciclismo";
      case "musculacao":
        return "Meta de Musculação";
      default:
        return "Meta de Corrida";
    }
  };

  const formatData = (value?: string | null) => {
    if (!value) return "--";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("pt-BR");
  };

  // --------- CREATE ---------

  const handleCreateMeta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPeloMenosUmTarget(formCreate)) {
      showFeedback(
        "error",
        "Defina pelo menos um objetivo (frequência, distância, duração ou sessões)."
      );
      return;
    }

    setSubmittingCreate(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuário não autenticado.");

      await createMetaHabito(token, formCreate);
      showFeedback("success", "Meta criada com sucesso!");

      setIsCreateModalOpen(false);
      setFormCreate({
        titulo: "",
        modalidade: "corrida",
        data_inicio: new Date().toISOString().split("T")[0],
        frequencia_semana: null,
        distancia_meta_km: null,
        duracao_meta_min: null,
        sessoes_meta: null,
      });

      await loadMetas();
      setTab("ativas");
    } catch (error: any) {
      console.error(error);
      showFeedback("error", error?.message || "Erro ao criar meta.");
    } finally {
      setSubmittingCreate(false);
    }
  };

  // --------- EDIT ---------

  const abrirEditModal = (meta: MetaHabito) => {
    setMetaParaEditar(meta);
    setFormEdit({
      titulo: meta.titulo,
      modalidade: meta.modalidade,
      data_inicio:
        meta.data_inicio ?? new Date().toISOString().split("T")[0],
      data_fim: meta.data_fim ?? null,
      frequencia_semana:
        meta.frequencia_semana !== undefined ? meta.frequencia_semana : null,
      distancia_meta_km:
        meta.distancia_meta_km !== undefined ? meta.distancia_meta_km : null,
      duracao_meta_min:
        meta.duracao_meta_min !== undefined ? meta.duracao_meta_min : null,
      sessoes_meta:
        meta.sessoes_meta !== undefined ? meta.sessoes_meta : null,
      ativo: meta.ativo,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaParaEditar) return;

    if (!hasPeloMenosUmTarget(formEdit)) {
      showFeedback(
        "error",
        "A meta precisa ter pelo menos um alvo (frequência, distância, duração ou sessões)."
      );
      return;
    }

    setSubmittingEdit(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuário não autenticado.");

      await updateMetaHabito(token, metaParaEditar.id, formEdit);
      showFeedback("success", "Meta atualizada com sucesso!");

      setIsEditModalOpen(false);
      setMetaParaEditar(null);
      await loadMetas();
    } catch (error: any) {
      console.error(error);
      showFeedback("error", error?.message || "Erro ao atualizar meta.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // --------- ENCERRAR META ---------

  const pedirEncerrarMeta = (meta: MetaHabito) => {
    setMetaParaEncerrar(meta);
  };

  const confirmarEncerrarMeta = async () => {
    if (!metaParaEncerrar) return;
    setProcessingAcao(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuário não autenticado.");

      await encerrarMetaHabito(token, metaParaEncerrar.id);
      showFeedback("success", "Meta encerrada e movida para o histórico.");
      setMetaParaEncerrar(null);
      await loadMetas();
      setTab("inativas");
    } catch (error: any) {
      console.error(error);
      showFeedback("error", error?.message || "Erro ao encerrar meta.");
    } finally {
      setProcessingAcao(false);
    }
  };

  // --------- REATIVAR META ---------

  const pedirReativarMeta = (meta: MetaHabito) => {
    setMetaParaReativar(meta);
  };

  const confirmarReativarMeta = async () => {
    if (!metaParaReativar) return;
    setProcessingAcao(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuário não autenticado.");

      await reativarMetaHabito(token, metaParaReativar.id);
      showFeedback("success", "Meta reativada com sucesso!");
      setMetaParaReativar(null);
      await loadMetas();
      setTab("ativas");
    } catch (error: any) {
      console.error(error);
      showFeedback("error", error?.message || "Erro ao reativar meta.");
    } finally {
      setProcessingAcao(false);
    }
  };

  // --------- EXCLUIR META ---------

  const pedirExcluirMeta = (meta: MetaHabito) => {
    setMetaParaExcluir(meta);
  };

  const confirmarExcluirMeta = async () => {
    if (!metaParaExcluir) return;
    setProcessingAcao(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuário não autenticado.");

      const resp = await deleteMetaHabito(token, metaParaExcluir.id);
      const msg =
        (resp && (resp as any).detail) ||
        "Meta removida (ou desativada) com sucesso.";
      showFeedback("success", msg);

      setMetaParaExcluir(null);
      await loadMetas();
    } catch (error: any) {
      console.error(error);
      showFeedback("error", error?.message || "Erro ao excluir meta.");
    } finally {
      setProcessingAcao(false);
    }
  };

  // --------- CALENDÁRIO / MARCAÇÕES ---------

  const abrirCalendarioDaMeta = async (meta: MetaHabito) => {
    setMetaDoCalendario(meta);

    // Se tiver data de início, centraliza o mês nela
    if (meta.data_inicio) {
      const base = new Date(meta.data_inicio);
      if (!Number.isNaN(base.getTime())) {
        setCurrentMonth(new Date(base.getFullYear(), base.getMonth(), 1));
      }
    }

    setLoadingMarcacoes(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) throw new Error("Usuário não autenticado.");

      const lista = await getMarcacoesHabitoByMeta(token, meta.id);
      setMarcacoes(lista);
    } catch (error: any) {
      console.error(error);
      showFeedback("error", error?.message || "Erro ao carregar marcações dessa meta.");
    } finally {
      setLoadingMarcacoes(false);
    }
  };

  const fecharCalendario = () => {
    setMetaDoCalendario(null);
    setMarcacoes([]);
  };

  const toggleMarcacaoDia = async (dateISO: string) => {
    if (!metaDoCalendario) return;

    setSavingMarcacao(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) throw new Error("Usuário não autenticado.");

      const existente = marcacoesPorData[dateISO];

      if (!existente) {
        await createMarcacaoHabito(token, {
          meta: metaDoCalendario.id,
          data: dateISO,
          concluido: true,
          sessao: null,
        });
      } else {
        await updateMarcacaoHabito(token, existente.id, {
          concluido: !existente.concluido,
        });
      }

      const listaAtualizada = await getMarcacoesHabitoByMeta(
        token,
        metaDoCalendario.id
      );
      setMarcacoes(listaAtualizada);
    } catch (error: any) {
      console.error(error);
      showFeedback("error", error?.message || "Erro ao atualizar marcação.");
    } finally {
      setSavingMarcacao(false);
    }
  };

  // --------- RENDER ---------

  const listaAtual = tab === "ativas" ? metasAtivas : metasInativas;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-0 space-y-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* HERO / HEADER */}
          <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-700 px-6 py-5 sm:px-8 sm:py-6 shadow-lg text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-300/80">
                Constância
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
                <Target className="w-6 h-6 text-red-300" />
                Metas e Hábitos
              </h1>
              <p className="text-sm text-slate-100/90 max-w-md">
                Crie metas simples e acompanhe seus hábitos para manter o treino em dia.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-100 border border-white/20 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                {loading
                  ? "Carregando metas…"
                  : `${metasAtivas.length} ativas · ${metasInativas.length} encerradas`}
              </span>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-1 bg-white text-slate-900 px-4 py-2 rounded-xl font-semibold hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm text-xs sm:text-sm"
              >
                <Plus size={16} /> Nova meta
              </button>
            </div>
          </section>

          {/* FEEDBACK GLOBAL */}
          {feedback && (
            <div
              className={`rounded-2xl p-4 border flex items-center gap-3 text-sm ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Flag size={18} />
              )}
              <span className="font-medium">{feedback.text}</span>
            </div>
          )}

          {/* TABS / SUB-HEADER */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Metas ajudam você a transformar treinos soltos em progresso consistente.
            </span>
            <div className="bg-white border border-slate-200 rounded-full p-1 flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setTab("ativas")}
                className={`px-3 py-1 rounded-full font-semibold ${
                  tab === "ativas"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Ativas
              </button>
              <button
                onClick={() => setTab("inativas")}
                className={`px-3 py-1 rounded-full font-semibold ${
                  tab === "inativas"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Encerradas
              </button>
            </div>
          </div>

          {/* LISTAGEM */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-gradient-to-br from-slate-200 to-slate-100 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : listaAtual.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Target size={32} />
              </div>
              {tab === "ativas" ? (
                <>
                  <h3 className="text-lg font-bold text-slate-900">
                    Nenhuma meta ativa
                  </h3>
                  <p className="text-slate-500 mb-6 text-sm">
                    Que tal começar um desafio simples, como treinar 3x por semana?
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={16} /> Criar primeira meta
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-900">
                    Nenhuma meta encerrada
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Assim que você encerrar metas, elas aparecerão aqui no histórico.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listaAtual.map((meta) => (
                <div
                  key={meta.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative group"
                >
                  {/* Badge Modalidade */}
                  <div
                    className={`absolute top-5 right-5 px-3 py-1 rounded-full text-[11px] font-semibold border ${getBgColor(
                      meta.modalidade
                    )} flex items-center gap-1`}
                  >
                    {getIcon(meta.modalidade)}
                    <span>{getLabelModalidade(meta.modalidade)}</span>
                  </div>

                  {/* Título / Info básica */}
                  <div className="pr-16 mb-4 space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {meta.titulo}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar size={11} />
                      Início: {formatData(meta.data_inicio)}
                      {meta.data_fim && ` · Fim: ${formatData(meta.data_fim)}`}
                    </p>
                  </div>

                  {/* Metas Configuradas */}
                  <div className="space-y-2.5 mb-5 text-sm">
                    {meta.frequencia_semana != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Frequência semanal</span>
                        <span className="font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">
                          {meta.frequencia_semana}x / sem
                        </span>
                      </div>
                    )}
                    {meta.distancia_meta_km != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Distância alvo</span>
                        <span className="font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">
                          {Number(meta.distancia_meta_km)} km
                        </span>
                      </div>
                    )}
                    {meta.duracao_meta_min != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Duração alvo</span>
                        <span className="font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">
                          {meta.duracao_meta_min} min
                        </span>
                      </div>
                    )}
                    {meta.sessoes_meta != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total de sessões</span>
                        <span className="font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">
                          {meta.sessoes_meta}
                        </span>
                      </div>
                    )}
                    {meta.frequencia_semana == null &&
                      meta.distancia_meta_km == null &&
                      meta.duracao_meta_min == null &&
                      meta.sessoes_meta == null && (
                        <p className="text-xs text-slate-400 italic">
                          Nenhum alvo numérico definido. Ainda assim, essa meta ajuda a
                          manter o foco.
                        </p>
                      )}
                  </div>

                  {/* Ações */}
                  <div className="pt-3 border-t border-slate-50 flex flex-col gap-2">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border ${
                          meta.ativo
                            ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                            : "text-slate-500 bg-slate-50 border-slate-100"
                        }`}
                      >
                        <CheckCircle2 size={11} />
                        {meta.ativo ? "Meta ativa" : "Meta encerrada"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] justify-end">
                      <button
                        onClick={() => abrirEditModal(meta)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <Pencil size={11} />
                        Editar
                      </button>

                      <button
                        onClick={() => abrirCalendarioDaMeta(meta)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <Calendar size={11} />
                        Progresso
                      </button>

                      {meta.ativo ? (
                        <>
                          <button
                            onClick={() => pedirEncerrarMeta(meta)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Flag size={11} />
                            Encerrar
                          </button>
                          <button
                            onClick={() => pedirExcluirMeta(meta)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={11} />
                            Excluir
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => pedirReativarMeta(meta)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <RotateCcw size={11} />
                            Reativar
                          </button>
                          <button
                            onClick={() => pedirExcluirMeta(meta)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={11} />
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========== MODAL CRIAR META ========== */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Target className="text-red-600" size={18} />
                    Nova meta
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Defina um título, modalidade e pelo menos um objetivo numérico.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateMeta} className="p-6 space-y-6">
                {/* Título e Modalidade */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                      Título da meta
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Correr 5km todo sábado"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                      value={formCreate.titulo}
                      onChange={(e) =>
                        setFormCreate({ ...formCreate, titulo: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                        Modalidade
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-white"
                        value={formCreate.modalidade}
                        onChange={(e) =>
                          setFormCreate({ ...formCreate, modalidade: e.target.value })
                        }
                      >
                        <option value="corrida">Corrida</option>
                        <option value="ciclismo">Ciclismo</option>
                        <option value="musculacao">Musculação</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                        Início
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formCreate.data_inicio}
                        onChange={(e) =>
                          setFormCreate({ ...formCreate, data_inicio: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Objetivos */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Trophy size={14} className="text-yellow-500" /> Objetivos da meta
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Você não precisa preencher todos, mas pelo menos um deve ser definido.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Freq. semanal (dias)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        placeholder="Ex: 3"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formCreate.frequencia_semana ?? ""}
                        onChange={(e) =>
                          setFormCreate({
                            ...formCreate,
                            frequencia_semana: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Distância (km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 10.5"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formCreate.distancia_meta_km ?? ""}
                        onChange={(e) =>
                          setFormCreate({
                            ...formCreate,
                            distancia_meta_km: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Duração (min)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 60"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formCreate.duracao_meta_min ?? ""}
                        onChange={(e) =>
                          setFormCreate({
                            ...formCreate,
                            duracao_meta_min: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Total de sessões
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 30"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formCreate.sessoes_meta ?? ""}
                        onChange={(e) =>
                          setFormCreate({
                            ...formCreate,
                            sessoes_meta: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {submittingCreate ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Criar meta"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========== MODAL EDITAR META ========== */}
        {isEditModalOpen && metaParaEditar && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Pencil className="text-red-600" size={18} />
                    Editar meta
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ajuste título, modalidade ou objetivos dessa meta.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setMetaParaEditar(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleUpdateMeta} className="p-6 space-y-6">
                {/* Título e Modalidade */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                      Título da meta
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                      value={formEdit.titulo}
                      onChange={(e) =>
                        setFormEdit({ ...formEdit, titulo: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                        Modalidade
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-white"
                        value={formEdit.modalidade}
                        onChange={(e) =>
                          setFormEdit({ ...formEdit, modalidade: e.target.value })
                        }
                      >
                        <option value="corrida">Corrida</option>
                        <option value="ciclismo">Ciclismo</option>
                        <option value="musculacao">Musculação</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                        Início
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formEdit.data_inicio || ""}
                        onChange={(e) =>
                          setFormEdit({ ...formEdit, data_inicio: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Objetivos */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Trophy size={14} className="text-yellow-500" /> Objetivos da meta
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Mantenha pelo menos um alvo definido (frequência, distância, duração
                    ou sessões).
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Freq. semanal (dias)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formEdit.frequencia_semana ?? ""}
                        onChange={(e) =>
                          setFormEdit({
                            ...formEdit,
                            frequencia_semana: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Distância (km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formEdit.distancia_meta_km ?? ""}
                        onChange={(e) =>
                          setFormEdit({
                            ...formEdit,
                            distancia_meta_km: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Duração (min)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formEdit.duracao_meta_min ?? ""}
                        onChange={(e) =>
                          setFormEdit({
                            ...formEdit,
                            duracao_meta_min: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Total de sessões
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-slate-50/40 focus:bg-white transition-all"
                        value={formEdit.sessoes_meta ?? ""}
                        onChange={(e) =>
                          setFormEdit({
                            ...formEdit,
                            sessoes_meta: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {submittingEdit ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Salvar alterações"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========== MODAL ENCERRAR META ========== */}
        {metaParaEncerrar && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <Flag size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Encerrar meta?
                </h3>
                <p className="text-sm text-slate-500">
                  A meta <strong>{metaParaEncerrar.titulo}</strong> será marcada como
                  encerrada e irá para o histórico. Você poderá reativá-la depois.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMetaParaEncerrar(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEncerrarMeta}
                  disabled={processingAcao}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {processingAcao ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Sim, encerrar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== MODAL REATIVAR META ========== */}
        {metaParaReativar && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <RotateCcw size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Reativar meta?
                </h3>
                <p className="text-sm text-slate-500">
                  A meta <strong>{metaParaReativar.titulo}</strong> voltará a ser ativa e
                  poderá receber novas marcações.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMetaParaReativar(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarReativarMeta}
                  disabled={processingAcao}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {processingAcao ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Sim, reativar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== MODAL EXCLUIR META ========== */}
        {metaParaExcluir && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Excluir meta?
                </h3>
                <p className="text-sm text-slate-500">
                  A meta <strong>{metaParaExcluir.titulo}</strong> pode ser removida
                  permanentemente ou apenas desativada, dependendo se já possui histórico
                  de marcações. Essa ação não poderá ser totalmente desfeita.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMetaParaExcluir(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExcluirMeta}
                  disabled={processingAcao}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {processingAcao ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Sim, excluir"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== MODAL CALENDÁRIO META ========== */}
        {metaDoCalendario && (
          <div className="fixed inset-0 z-[75] flex justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-xl my-8 shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="text-red-600" size={18} />
                    Calendário da meta
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {metaDoCalendario.titulo}
                  </p>
                </div>
                <button
                  onClick={fecharCalendario}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() =>
                      setCurrentMonth((prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                      )
                    }
                    className="px-2 py-1 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                  >
                    &larr; Mês anterior
                  </button>
                  <div className="text-sm font-semibold text-slate-900">
                    {currentMonth.toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentMonth((prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                      )
                    }
                    className="px-2 py-1 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Próximo mês &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-7 text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  <span>Dom</span>
                  <span>Seg</span>
                  <span>Ter</span>
                  <span>Qua</span>
                  <span>Qui</span>
                  <span>Sex</span>
                  <span>Sáb</span>
                </div>

                {loadingMarcacoes ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    Carregando marcações...
                  </div>
                ) : (
                  <CalendarGrid
                    currentMonth={currentMonth}
                    marcacoesPorData={marcacoesPorData}
                    onToggleDia={toggleMarcacaoDia}
                    saving={savingMarcacao}
                  />
                )}

                <p className="text-[11px] text-slate-400 mt-3">
                  Toque em um dia para marcar ou desmarcar a conclusão da meta.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ---------- COMPONENTE DE GRID DO CALENDÁRIO ---------- */

type CalendarGridProps = {
  currentMonth: Date;
  marcacoesPorData: Record<string, MarcacaoHabito>;
  onToggleDia: (dateISO: string) => void;
  saving: boolean;
};

function CalendarGrid({
  currentMonth,
  marcacoesPorData,
  onToggleDia,
  saving,
}: CalendarGridProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return (
    <div className="grid grid-cols-7 gap-1 text-xs">
      {cells.map((day, idx) => {
        if (day === null) {
          return <div key={`empty-${idx}`} />;
        }

        const date = new Date(year, month, day);
        const iso = date.toISOString().split("T")[0];
        const marcacao = marcacoesPorData[iso];
        const concluido = !!marcacao?.concluido;

        return (
          <button
            key={iso}
            type="button"
            disabled={saving}
            onClick={() => onToggleDia(iso)}
            className={`aspect-square flex flex-col items-center justify-center rounded-xl border text-[11px] ${
              concluido
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span className="font-semibold">{day}</span>
            {concluido && <span className="text-[9px] mt-0.5">ok</span>}
          </button>
        );
      })}
    </div>
  );
}
