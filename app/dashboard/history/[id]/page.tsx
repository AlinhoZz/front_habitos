"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
    SessaoAtividade,
    Exercicio,
    getSessaoAtividadeById,
    updateSessaoAtividade,
    getMetricasCorridaAll,
    createMetricasCorrida,
    updateMetricasCorrida,
    deleteMetricasCorrida,
    getMetricasCiclismoAll,
    createMetricasCiclismo,
    updateMetricasCiclismo,
    deleteMetricasCiclismo,
    getSeriesMusculacaoBySessao,
    createSerieMusculacao,
    updateSerieMusculacao,
    deleteSerieMusculacao,
    getExercicios,
} from "@/lib/api";
import {
    Activity,
    ArrowLeft,
    Bike,
    PersonStanding,
    Dumbbell,
    Calendar,
    Clock,
    Flame,
    Save,
    Edit3,
    AlertTriangle,
    Trash2,
    Plus,
    X,
} from "lucide-react";

interface FeedbackMessage {
    type: "success" | "error";
    text: string;
}

interface MetricasCorrida {
    sessao: number;
    distancia_km: string; // vem como string do backend (DecimalField)
    ritmo_medio_seg_km: number;
    fc_media: number | null;
}

interface MetricasCiclismo {
    sessao: number;
    distancia_km: string;
    velocidade_media_kmh: string;
    fc_media: number | null;
}

interface SerieMusculacao {
    id: number;
    sessao: number;
    exercicio: number; // id do exercício
    ordem_serie: number;
    repeticoes: number | null;
    carga_kg: string | null;
}

export default function SessionDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const sessaoId = Number(params.id);

    const [sessao, setSessao] = useState<SessaoAtividade | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingSessao, setSavingSessao] = useState(false);

    const [message, setMessage] = useState<FeedbackMessage | null>(null);

    // Form de edição da sessão
    const [sessaoForm, setSessaoForm] = useState({
        modalidade: "corrida",
        inicio_em: "",
        duracao_seg: "",
        calorias: "",
        observacoes: "",
    });
    const [sessaoEditMode, setSessaoEditMode] = useState(false);

    // Métricas Corrida
    const [metricasCorrida, setMetricasCorrida] = useState<MetricasCorrida | null>(null);
    const [corridaForm, setCorridaForm] = useState({
        distancia_km: "",
        ritmo_medio_seg_km: "",
        fc_media: "",
    });
    const [savingCorrida, setSavingCorrida] = useState(false);
    const [deleteCorridaOpen, setDeleteCorridaOpen] = useState(false);

    // Métricas Ciclismo
    const [metricasCiclismo, setMetricasCiclismo] = useState<MetricasCiclismo | null>(null);
    const [ciclismoForm, setCiclismoForm] = useState({
        distancia_km: "",
        velocidade_media_kmh: "",
        fc_media: "",
    });
    const [savingCiclismo, setSavingCiclismo] = useState(false);
    const [deleteCiclismoOpen, setDeleteCiclismoOpen] = useState(false);

    // Séries Musculação
    const [series, setSeries] = useState<SerieMusculacao[]>([]);
    const [seriesLoading, setSeriesLoading] = useState(false);
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [newSerieForm, setNewSerieForm] = useState({
        exercicioId: "",
        repeticoes: "",
        carga_kg: "",
    });
    const [savingSerie, setSavingSerie] = useState(false);
    const [editingSerieId, setEditingSerieId] = useState<number | null>(null);
    const [editingSerieReps, setEditingSerieReps] = useState("");
    const [editingSerieCarga, setEditingSerieCarga] = useState("");
    const [deletingSerieId, setDeletingSerieId] = useState<number | null>(null);
    const [deleteSerieModalOpen, setDeleteSerieModalOpen] = useState(false);
    const [serieToDelete, setSerieToDelete] = useState<SerieMusculacao | null>(null);
    const showMessage = (type: FeedbackMessage["type"], text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4500);
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

    const formatDuracao = (segundos: number | null) => {
        if (!segundos || segundos <= 0) return "—";
        const h = Math.floor(segundos / 3600);
        const m = Math.floor((segundos % 3600) / 60);
        if (h > 0) return `${h}h ${m}min`;
        return `${m}min`;
    };

    const getIconModalidade = (modalidade: SessaoAtividade["modalidade"]) => {
        if (modalidade === "ciclismo") return <Bike className="w-4 h-4" />;
        if (modalidade === "musculacao") return <Dumbbell className="w-4 h-4" />;
        return <PersonStanding className="w-4 h-4" />;
    };

    const getModalidadeLabel = (modalidade: SessaoAtividade["modalidade"]) => {
        if (modalidade === "ciclismo") return "Ciclismo";
        if (modalidade === "musculacao") return "Musculação";
        return "Corrida";
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

    const loadCorridaMetricas = useCallback(
        async (token: string, sessaoId: number) => {
            try {
                const todas = await getMetricasCorridaAll(token);
                const m = todas.find((item: MetricasCorrida) => item.sessao === sessaoId) || null;
                setMetricasCorrida(m);
                if (m) {
                    setCorridaForm({
                        distancia_km: String(m.distancia_km),
                        ritmo_medio_seg_km: String(m.ritmo_medio_seg_km),
                        fc_media: m.fc_media != null ? String(m.fc_media) : "",
                    });
                } else {
                    setCorridaForm({
                        distancia_km: "",
                        ritmo_medio_seg_km: "",
                        fc_media: "",
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar métricas de corrida", error);
                setMetricasCorrida(null);
            }
        },
        []
    );

    const loadCiclismoMetricas = useCallback(
        async (token: string, sessaoId: number) => {
            try {
                const todas = await getMetricasCiclismoAll(token);
                const m =
                    todas.find((item: MetricasCiclismo) => item.sessao === sessaoId) || null;
                setMetricasCiclismo(m);
                if (m) {
                    setCiclismoForm({
                        distancia_km: String(m.distancia_km),
                        velocidade_media_kmh: String(m.velocidade_media_kmh),
                        fc_media: m.fc_media != null ? String(m.fc_media) : "",
                    });
                } else {
                    setCiclismoForm({
                        distancia_km: "",
                        velocidade_media_kmh: "",
                        fc_media: "",
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar métricas de ciclismo", error);
                setMetricasCiclismo(null);
            }
        },
        []
    );

    const loadSeriesMusculacao = useCallback(
        async (token: string, sessaoId: number) => {
            setSeriesLoading(true);
            try {
                const lista = await getSeriesMusculacaoBySessao(token, sessaoId);
                setSeries(lista);
            } catch (error) {
                console.error("Erro ao carregar séries de musculação", error);
                setSeries([]);
            } finally {
                setSeriesLoading(false);
            }
        },
        []
    );

    const loadAll = useCallback(async () => {
        if (!sessaoId || Number.isNaN(sessaoId)) {
            showMessage("error", "Sessão inválida.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) {
                setLoading(false);
                return;
            }

            const s = await getSessaoAtividadeById(token, sessaoId);
            setSessao(s);

            setSessaoForm({
                modalidade: s.modalidade,
                inicio_em: s.inicio_em ? s.inicio_em.slice(0, 16) : "",
                duracao_seg: s.duracao_seg != null ? String(s.duracao_seg) : "",
                calorias: s.calorias != null ? String(s.calorias) : "",
                observacoes: s.observacoes ?? "",
            });

            if (s.modalidade === "corrida") {
                await loadCorridaMetricas(token, sessaoId);
            } else if (s.modalidade === "ciclismo") {
                await loadCiclismoMetricas(token, sessaoId);
            } else if (s.modalidade === "musculacao") {
                const exs = await getExercicios(token);
                setExercicios(exs);
                await loadSeriesMusculacao(token, sessaoId);
            }
        } catch (error) {
            console.error("Erro ao carregar sessão", error);
            showMessage("error", "Não foi possível carregar os detalhes da sessão.");
        } finally {
            setLoading(false);
        }
    }, [sessaoId, loadCorridaMetricas, loadCiclismoMetricas, loadSeriesMusculacao]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleSessaoSave = async () => {
        if (!sessao) return;

        setSavingSessao(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) return;

            const body = {
                modalidade: sessaoForm.modalidade as SessaoAtividade["modalidade"],
                inicio_em: sessaoForm.inicio_em
                    ? new Date(sessaoForm.inicio_em).toISOString()
                    : sessao.inicio_em,
                duracao_seg: sessaoForm.duracao_seg
                    ? Number(sessaoForm.duracao_seg)
                    : null,
                calorias: sessaoForm.calorias ? Number(sessaoForm.calorias) : null,
                observacoes: sessaoForm.observacoes || "",
            };

            const updated = await updateSessaoAtividade(token, sessao.id, body);
            setSessao(updated);
            setSessaoEditMode(false);
            showMessage("success", "Sessão atualizada com sucesso.");
        } catch (error: any) {
            console.error(error);
            showMessage(
                "error",
                error?.message || "Não foi possível atualizar a sessão."
            );
        } finally {
            setSavingSessao(false);
        }
    };

    const handleSaveCorrida = async () => {
        if (!sessao || sessao.modalidade !== "corrida") return;

        if (!corridaForm.distancia_km || !corridaForm.ritmo_medio_seg_km) {
            showMessage(
                "error",
                "Preencha pelo menos distância e ritmo médio para salvar as métricas."
            );
            return;
        }

        setSavingCorrida(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) return;

            const payload = {
                sessao: sessao.id,
                distancia_km: corridaForm.distancia_km,
                ritmo_medio_seg_km: Number(corridaForm.ritmo_medio_seg_km),
                fc_media: corridaForm.fc_media
                    ? Number(corridaForm.fc_media)
                    : null,
            };

            if (metricasCorrida) {
                await updateMetricasCorrida(token, sessao.id, payload);
                showMessage("success", "Métricas de corrida atualizadas.");
            } else {
                await createMetricasCorrida(token, payload);
                showMessage("success", "Métricas de corrida criadas.");
            }

            await loadCorridaMetricas(token, sessao.id);
        } catch (error: any) {
            console.error(error);
            showMessage(
                "error",
                error?.message ||
                "Não foi possível salvar as métricas de corrida. Verifique os dados."
            );
        } finally {
            setSavingCorrida(false);
        }
    };

    const handleDeleteCorrida = async () => {
        if (!sessao) return;
        setSavingCorrida(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) return;

            await deleteMetricasCorrida(token, sessao.id);
            setMetricasCorrida(null);
            setCorridaForm({
                distancia_km: "",
                ritmo_medio_seg_km: "",
                fc_media: "",
            });
            showMessage("success", "Métricas de corrida apagadas.");
        } catch (error: any) {
            console.error(error);
            showMessage(
                "error",
                error?.message || "Não foi possível apagar as métricas de corrida."
            );
        } finally {
            setSavingCorrida(false);
            setDeleteCorridaOpen(false);
        }
    };

    const handleSaveCiclismo = async () => {
        if (!sessao || sessao.modalidade !== "ciclismo") return;

        if (
            !ciclismoForm.distancia_km ||
            !ciclismoForm.velocidade_media_kmh
        ) {
            showMessage(
                "error",
                "Preencha distância e velocidade média para salvar as métricas."
            );
            return;
        }

        setSavingCiclismo(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) return;

            const payload = {
                sessao: sessao.id,
                distancia_km: ciclismoForm.distancia_km,
                velocidade_media_kmh: ciclismoForm.velocidade_media_kmh,
                fc_media: ciclismoForm.fc_media
                    ? Number(ciclismoForm.fc_media)
                    : null,
            };

            if (metricasCiclismo) {
                await updateMetricasCiclismo(token, sessao.id, payload);
                showMessage("success", "Métricas de ciclismo atualizadas.");
            } else {
                await createMetricasCiclismo(token, payload);
                showMessage("success", "Métricas de ciclismo criadas.");
            }

            await loadCiclismoMetricas(token, sessao.id);
        } catch (error: any) {
            console.error(error);
            showMessage(
                "error",
                error?.message ||
                "Não foi possível salvar as métricas de ciclismo. Verifique os dados."
            );
        } finally {
            setSavingCiclismo(false);
        }
    };

    const handleDeleteCiclismo = async () => {
        if (!sessao) return;
        setSavingCiclismo(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) return;

            await deleteMetricasCiclismo(token, sessao.id);
            setMetricasCiclismo(null);
            setCiclismoForm({
                distancia_km: "",
                velocidade_media_kmh: "",
                fc_media: "",
            });
            showMessage("success", "Métricas de ciclismo apagadas.");
        } catch (error: any) {
            console.error(error);
            showMessage(
                "error",
                error?.message || "Não foi possível apagar as métricas de ciclismo."
            );
        } finally {
            setSavingCiclismo(false);
            setDeleteCiclismoOpen(false);
        }
    };

    const handleCreateSerie = async () => {
        if (!sessao || sessao.modalidade !== "musculacao") return;

        if (!newSerieForm.exercicioId) {
            showMessage("error", "Selecione um exercício para criar a série.");
            return;
        }

        setSavingSerie(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) return;

            const payload = {
                sessao: sessao.id,
                exercicio: Number(newSerieForm.exercicioId),
                repeticoes: newSerieForm.repeticoes
                    ? Number(newSerieForm.repeticoes)
                    : null,
                carga_kg: newSerieForm.carga_kg || null,
            };

            await createSerieMusculacao(token, payload);
            showMessage("success", "Série criada com sucesso.");

            setNewSerieForm({
                exercicioId: "",
                repeticoes: "",
                carga_kg: "",
            });

            await loadSeriesMusculacao(token, sessao.id);
        } catch (error: any) {
            console.error(error);
            showMessage(
                "error",
                error?.message ||
                "Não foi possível criar a série. Verifique os dados."
            );
        } finally {
            setSavingSerie(false);
        }
    };

    const handleStartEditSerie = (serie: SerieMusculacao) => {
        setEditingSerieId(serie.id);
        setEditingSerieReps(
            serie.repeticoes != null ? String(serie.repeticoes) : ""
        );
        setEditingSerieCarga(serie.carga_kg != null ? String(serie.carga_kg) : "");
    };

    const handleSaveEditSerie = async (serie: SerieMusculacao) => {
        if (!sessao) return;

        setSavingSerie(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) return;

            const payload = {
                sessao: sessao.id,
                exercicio: serie.exercicio,
                ordem_serie: serie.ordem_serie,
                repeticoes: editingSerieReps ? Number(editingSerieReps) : null,
                carga_kg: editingSerieCarga || null,
            };

            await updateSerieMusculacao(token, serie.id, payload);
            showMessage("success", "Série atualizada com sucesso.");
            setEditingSerieId(null);
            setEditingSerieReps("");
            setEditingSerieCarga("");
            await loadSeriesMusculacao(token, sessao.id);
        } catch (error: any) {
            console.error(error);
            showMessage(
                "error",
                error?.message ||
                "Não foi possível atualizar a série. Verifique os dados."
            );
        } finally {
            setSavingSerie(false);
        }
    };

    const openDeleteSerieModal = (serie: SerieMusculacao) => {
        setSerieToDelete(serie);
        setDeleteSerieModalOpen(true);
    };

    const closeDeleteSerieModal = () => {
        setDeleteSerieModalOpen(false);
        setSerieToDelete(null);
    };

    const handleDeleteSerie = async () => {
        if (!sessao || !serieToDelete) return;

        setDeletingSerieId(serieToDelete.id);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            if (!token) return;

            await deleteSerieMusculacao(token, serieToDelete.id);
            showMessage("success", "Série excluída com sucesso.");
            await loadSeriesMusculacao(token, sessao.id);
            closeDeleteSerieModal();
        } catch (error: any) {
            console.error(error);
            showMessage(
                "error",
                error?.message || "Não foi possível excluir a série."
            );
        } finally {
            setDeletingSerieId(null);
        }
    };


    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="space-y-3 text-center">
                        <div className="h-10 w-40 bg-slate-200 rounded-full mx-auto animate-pulse" />
                        <p className="text-slate-500 text-sm">
                            Carregando detalhes da sessão...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!sessao) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 py-8 max-w-md text-center">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h2 className="text-slate-900 font-semibold mb-2">
                            Sessão não encontrada
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                            Verifique se o link está correto ou volte para a lista de treinos.
                        </p>
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Voltar
                        </button>

                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50 pb-14">
                <div className="max-w-5xl mx-auto px-4 lg:px-0 space-y-6 pt-4">
                    {/* HEADER / HERO */}
                    <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-6 py-5 sm:px-8 sm:py-6 shadow-lg text-white flex flex-col gap-4">
                        <button
                            onClick={() => router.push("/dashboard/history")}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-white/80 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para Meus Treinos
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-slate-400/80">
                                    Detalhes da Sessão
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-red-400" />
                                    {getModalidadeLabel(sessao.modalidade)}
                                </h1>
                                <p className="text-sm text-slate-100/90 max-w-md">
                                    Edite os dados da sessão, cadastre métricas específicas e,
                                    para musculação, gerencie as séries executadas.
                                </p>
                            </div>

                            <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-100 border border-white/10 font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDataHora(sessao.inicio_em)}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-100 border border-white/10 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuracao(sessao.duracao_seg)}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* MENSAGEM GLOBAL */}
                    {message && (
                        <div
                            className={`rounded-2xl px-4 py-3 flex items-center gap-3 text-sm border animate-in slide-in-from-top-2 ${message.type === "success"
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

                    {/* CARD: DADOS DA SESSÃO */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-full text-[11px] font-semibold ${getChipModalidadeStyles(
                                        sessao.modalidade
                                    )}`}
                                >
                                    {getIconModalidade(sessao.modalidade)}
                                    <span className="uppercase tracking-wide">
                                        {getModalidadeLabel(sessao.modalidade)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    ID da sessão:{" "}
                                    <span className="font-semibold text-slate-800">
                                        #{sessao.id}
                                    </span>
                                </p>
                            </div>

                            <button
                                onClick={() => setSessaoEditMode((prev) => !prev)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                                <Edit3 className="w-3 h-3" />
                                {sessaoEditMode ? "Cancelar edição" : "Editar sessão"}
                            </button>
                        </div>

                        {sessaoEditMode ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Modalidade
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm"
                                        value={sessaoForm.modalidade}
                                        onChange={(e) =>
                                            setSessaoForm((prev) => ({
                                                ...prev,
                                                modalidade: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="corrida">Corrida</option>
                                        <option value="ciclismo">Ciclismo</option>
                                        <option value="musculacao">Musculação</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Início da sessão
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm"
                                        value={sessaoForm.inicio_em}
                                        onChange={(e) =>
                                            setSessaoForm((prev) => ({
                                                ...prev,
                                                inicio_em: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Duração (segundos)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm"
                                        value={sessaoForm.duracao_seg}
                                        onChange={(e) =>
                                            setSessaoForm((prev) => ({
                                                ...prev,
                                                duracao_seg: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Calorias (kcal)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm"
                                        value={sessaoForm.calorias}
                                        onChange={(e) =>
                                            setSessaoForm((prev) => ({
                                                ...prev,
                                                calorias: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Observações
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none text-sm min-h-[80px]"
                                        value={sessaoForm.observacoes}
                                        onChange={(e) =>
                                            setSessaoForm((prev) => ({
                                                ...prev,
                                                observacoes: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="sm:col-span-2 flex justify-end gap-3 mt-1">
                                    <button
                                        onClick={() => setSessaoEditMode(false)}
                                        disabled={savingSessao}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSessaoSave}
                                        disabled={savingSessao}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {savingSessao ? (
                                            <>
                                                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Salvar sessão
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-2">
                                <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                                    <p className="text-slate-500 flex items-center gap-1 mb-1">
                                        <Calendar className="w-3 h-3" />
                                        Data e horário
                                    </p>
                                    <p className="font-semibold text-slate-900">
                                        {formatDataHora(sessao.inicio_em)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                                    <p className="text-slate-500 flex items-center gap-1 mb-1">
                                        <Clock className="w-3 h-3" />
                                        Duração
                                    </p>
                                    <p className="font-semibold text-slate-900">
                                        {formatDuracao(sessao.duracao_seg)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                                    <p className="text-slate-500 flex items-center gap-1 mb-1">
                                        <Flame className="w-3 h-3" />
                                        Calorias
                                    </p>
                                    <p className="font-semibold text-slate-900">
                                        {sessao.calorias != null ? `${sessao.calorias} kcal` : "—"}
                                    </p>
                                </div>
                                {sessao.observacoes && (
                                    <div className="sm:col-span-3 bg-slate-50 rounded-xl px-3 py-2.5">
                                        <p className="text-slate-500 text-xs mb-1">
                                            Observações
                                        </p>
                                        <p className="text-slate-700 text-sm">
                                            {sessao.observacoes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* CARD: MÉTRICAS / SÉRIES DEPENDENDO DA MODALIDADE */}
                    {sessao.modalidade === "corrida" && (
                        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                                        <PersonStanding className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Métricas de Corrida
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Distância, pace médio e frequência cardíaca dessa sessão.
                                        </p>
                                    </div>
                                </div>

                                {metricasCorrida && (
                                    <button
                                        onClick={() => setDeleteCorridaOpen(true)}
                                        disabled={savingCorrida}
                                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-red-100 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Apagar métricas
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Distância (km)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm"
                                        value={corridaForm.distancia_km}
                                        onChange={(e) =>
                                            setCorridaForm((prev) => ({
                                                ...prev,
                                                distancia_km: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Ritmo médio (seg/km)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm"
                                        value={corridaForm.ritmo_medio_seg_km}
                                        onChange={(e) =>
                                            setCorridaForm((prev) => ({
                                                ...prev,
                                                ritmo_medio_seg_km: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        FC média (bpm)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm"
                                        value={corridaForm.fc_media}
                                        onChange={(e) =>
                                            setCorridaForm((prev) => ({
                                                ...prev,
                                                fc_media: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveCorrida}
                                    disabled={savingCorrida}
                                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-60"
                                >
                                    {savingCorrida ? (
                                        <>
                                            <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Salvar métricas
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Modal delete métricas corrida */}
                            {deleteCorridaOpen && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
                                        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                                                    Apagar métricas de corrida
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Isso não exclui a sessão, apenas as métricas
                                                    associadas.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-3 text-sm">
                                            <p className="text-slate-600">
                                                Tem certeza que deseja apagar as métricas desta sessão
                                                de corrida?
                                            </p>
                                        </div>
                                        <div className="px-6 pb-5 pt-3 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-slate-100 bg-slate-50/60 rounded-b-3xl">
                                            <button
                                                onClick={() => setDeleteCorridaOpen(false)}
                                                disabled={savingCorrida}
                                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-white disabled:opacity-60"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleDeleteCorrida}
                                                disabled={savingCorrida}
                                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-60"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Apagar métricas
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {sessao.modalidade === "ciclismo" && (
                        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-700">
                                        <Bike className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Métricas de Ciclismo
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Distância, velocidade média e frequência cardíaca dessa
                                            sessão.
                                        </p>
                                    </div>
                                </div>

                                {metricasCiclismo && (
                                    <button
                                        onClick={() => setDeleteCiclismoOpen(true)}
                                        disabled={savingCiclismo}
                                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-red-100 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Apagar métricas
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Distância (km)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm"
                                        value={ciclismoForm.distancia_km}
                                        onChange={(e) =>
                                            setCiclismoForm((prev) => ({
                                                ...prev,
                                                distancia_km: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Velocidade média (km/h)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm"
                                        value={ciclismoForm.velocidade_media_kmh}
                                        onChange={(e) =>
                                            setCiclismoForm((prev) => ({
                                                ...prev,
                                                velocidade_media_kmh: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        FC média (bpm)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm"
                                        value={ciclismoForm.fc_media}
                                        onChange={(e) =>
                                            setCiclismoForm((prev) => ({
                                                ...prev,
                                                fc_media: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveCiclismo}
                                    disabled={savingCiclismo}
                                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2 disabled:opacity-60"
                                >
                                    {savingCiclismo ? (
                                        <>
                                            <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Salvar métricas
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Modal delete métricas ciclismo */}
                            {deleteCiclismoOpen && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
                                        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                                                    Apagar métricas de ciclismo
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Isso não exclui a sessão, apenas as métricas
                                                    associadas.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-3 text-sm">
                                            <p className="text-slate-600">
                                                Tem certeza que deseja apagar as métricas desta sessão
                                                de ciclismo?
                                            </p>
                                        </div>
                                        <div className="px-6 pb-5 pt-3 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-slate-100 bg-slate-50/60 rounded-b-3xl">
                                            <button
                                                onClick={() => setDeleteCiclismoOpen(false)}
                                                disabled={savingCiclismo}
                                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-white disabled:opacity-60"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleDeleteCiclismo}
                                                disabled={savingCiclismo}
                                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-60"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Apagar métricas
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {sessao.modalidade === "musculacao" && (
                        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                        <Dumbbell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Séries de Musculação
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Registre as séries executadas nesta sessão (exercício,
                                            repetições e carga).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nova série */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3 text-sm">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                    Adicionar nova série
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Exercício
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm"
                                            value={newSerieForm.exercicioId}
                                            onChange={(e) =>
                                                setNewSerieForm((prev) => ({
                                                    ...prev,
                                                    exercicioId: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">Selecione...</option>
                                            {exercicios.map((ex) => (
                                                <option key={ex.id} value={ex.id}>
                                                    {ex.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Repetições
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm"
                                            value={newSerieForm.repeticoes}
                                            onChange={(e) =>
                                                setNewSerieForm((prev) => ({
                                                    ...prev,
                                                    repeticoes: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Carga (kg)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min={0}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm"
                                            value={newSerieForm.carga_kg}
                                            onChange={(e) =>
                                                setNewSerieForm((prev) => ({
                                                    ...prev,
                                                    carga_kg: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleCreateSerie}
                                        disabled={savingSerie}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {savingSerie ? (
                                            <>
                                                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                                Adicionando...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Adicionar série
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Lista de séries */}
                            <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                    <span>Séries registradas</span>
                                    <span>
                                        {series.length}{" "}
                                        {series.length === 1 ? "série" : "séries"}
                                    </span>
                                </div>
                                {/* Modal de exclusão de série */}
                                {deleteSerieModalOpen && serieToDelete && (
                                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
                                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                                        <AlertTriangle className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                                                            Excluir série de musculação
                                                        </h3>
                                                        <p className="text-xs text-slate-500">
                                                            Essa ação não pode ser desfeita.
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={closeDeleteSerieModal}
                                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="p-6 space-y-3 text-sm">
                                                <p className="text-slate-600">
                                                    Tem certeza que deseja excluir a{" "}
                                                    <span className="font-semibold">
                                                        série #{serieToDelete.ordem_serie}
                                                    </span>{" "}
                                                    desta sessão?
                                                </p>

                                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[11px] text-slate-600 space-y-1.5">
                                                    <p>
                                                        <span className="font-semibold">Repetições:</span>{" "}
                                                        {serieToDelete.repeticoes ?? "—"}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold">Carga:</span>{" "}
                                                        {serieToDelete.carga_kg ?? "—"}{" "}
                                                        {serieToDelete.carga_kg && "kg"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="px-6 pb-5 pt-3 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-slate-100 bg-slate-50/60 rounded-b-3xl">
                                                <button
                                                    onClick={closeDeleteSerieModal}
                                                    disabled={deletingSerieId === serieToDelete.id}
                                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-white disabled:opacity-60"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleDeleteSerie}
                                                    disabled={deletingSerieId === serieToDelete.id}
                                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-60"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {deletingSerieId === serieToDelete.id
                                                        ? "Excluindo..."
                                                        : "Excluir série"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {seriesLoading ? (
                                    <div className="p-4 text-xs text-slate-500">
                                        Carregando séries...
                                    </div>
                                ) : series.length === 0 ? (
                                    <div className="p-4 text-xs text-slate-500">
                                        Nenhuma série registrada ainda para esta sessão.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {series.map((serie) => {
                                            const exercicio = exercicios.find(
                                                (ex) => ex.id === serie.exercicio
                                            );
                                            const isEditing = editingSerieId === serie.id;
                                            const isDeleting = deletingSerieId === serie.id;

                                            return (
                                                <div
                                                    key={serie.id}
                                                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                                                Série #{serie.ordem_serie}
                                                            </span>
                                                            <span className="font-semibold text-slate-900">
                                                                {exercicio?.nome || `Exercício #${serie.exercicio}`}
                                                            </span>
                                                        </div>

                                                        {isEditing ? (
                                                            <div className="flex flex-wrap gap-3 text-xs mt-1">
                                                                <div>
                                                                    <span className="text-slate-500 mr-1">
                                                                        Reps:
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs"
                                                                        value={editingSerieReps}
                                                                        onChange={(e) =>
                                                                            setEditingSerieReps(e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500 mr-1">
                                                                        Carga:
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.5"
                                                                        min={0}
                                                                        className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs"
                                                                        value={editingSerieCarga}
                                                                        onChange={(e) =>
                                                                            setEditingSerieCarga(e.target.value)
                                                                        }
                                                                    />
                                                                    <span className="text-slate-400 ml-1">
                                                                        kg
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-3 text-xs mt-1 text-slate-600">
                                                                <span>
                                                                    Repetições:{" "}
                                                                    <span className="font-semibold">
                                                                        {serie.repeticoes ?? "—"}
                                                                    </span>
                                                                </span>
                                                                <span>
                                                                    Carga:{" "}
                                                                    <span className="font-semibold">
                                                                        {serie.carga_kg ?? "—"}{" "}
                                                                        {serie.carga_kg && "kg"}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => setEditingSerieId(null)}
                                                                    disabled={savingSerie}
                                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-60"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSaveEditSerie(serie)}
                                                                    disabled={savingSerie}
                                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 disabled:opacity-60"
                                                                >
                                                                    <Save className="w-3 h-3" />
                                                                    Salvar
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStartEditSerie(serie)}
                                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => openDeleteSerieModal(serie)}
                                                                    disabled={isDeleting}
                                                                    className="p-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-1 disabled:opacity-60"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                    {isDeleting ? "Excluindo..." : "Excluir"}
                                                                </button>

                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
