"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getMe, updateMe, deleteMe, changePassword } from '@/lib/api';
import { 
  Save, 
  Trash2, 
  User, 
  Mail, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  KeyRound 
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [formData, setFormData] = useState({ nome: '', email: '' });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [passData, setPassData] = useState({ 
    senha_atual: '', 
    nova_senha: '', 
    nova_senha_confirmacao: '' 
  });
  const [savingPass, setSavingPass] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 1. Carregar dados ao montar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return; 
        
        const user = await getMe(token);
        setFormData({ nome: user.nome, email: user.email });
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    loadProfile();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 2. Atualizar Perfil
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await updateMe(token, formData);
      showMessage('success', 'Informações atualizadas com sucesso!');
    } catch (err: any) {
      showMessage('error', err.message || 'Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Atualizar Senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPass(true);
    setMessage(null);

    if (passData.nova_senha !== passData.nova_senha_confirmacao) {
      showMessage('error', 'As novas senhas não coincidem.');
      setSavingPass(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await changePassword(token, passData);
      showMessage('success', 'Senha alterada com sucesso!');
      setPassData({ senha_atual: '', nova_senha: '', nova_senha_confirmacao: '' });
    } catch (err: any) {
      showMessage('error', err.message || 'Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setSavingPass(false);
    }
  };

  // 4. Deletar Conta
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await deleteMe(token);

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } catch (err: any) {
      showMessage('error', 'Erro ao excluir conta.');
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-50">
          <Loader2 className="animate-spin text-red-600" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-0 space-y-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* HERO / HEADER */}
          <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-700 px-6 py-5 sm:px-8 sm:py-6 shadow-lg text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-300/80">
                Conta
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
                <User className="w-6 h-6" />
                Meu Perfil
              </h1>
              <p className="text-sm text-slate-100/90 max-w-md">
                Gerencie suas informações pessoais e deixe sua conta sempre atualizada e segura.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-100 border border-white/20 font-medium">
                Status: <span className="font-semibold text-emerald-300">Ativo</span>
              </span>
              <span className="text-[11px] text-slate-200/80">
                Use uma senha forte para proteger seus dados.
              </span>
            </div>
          </section>

          {/* ALERTA GLOBAL */}
          {message && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm border text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* GRID PRINCIPAL: PERFIL + SENHA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* --- CARD 1: INFORMAÇÕES BÁSICAS --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
              <div className="p-6 sm:p-7 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <User className="text-red-600" size={18} /> Informações Básicas
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Nome e e-mail usados para identificar sua conta.
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleUpdateInfo} className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Nome completo
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/40 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/40 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 mt-auto border-t border-slate-50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-70 shadow-sm"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    Salvar dados
                  </button>
                </div>
              </form>
            </div>

            {/* --- CARD 2: SEGURANÇA / SENHA --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
              <div className="p-6 sm:p-7 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Lock className="text-red-600" size={18} /> Segurança
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Atualize sua senha e mantenha sua conta protegida.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleChangePassword}
                className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Senha atual
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passData.senha_atual}
                        onChange={(e) =>
                          setPassData({
                            ...passData,
                            senha_atual: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/40 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Nova senha
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={passData.nova_senha}
                          onChange={(e) =>
                            setPassData({
                              ...passData,
                              nova_senha: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/40 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Confirmar nova senha
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="password"
                          placeholder="Repita a nova senha"
                          value={passData.nova_senha_confirmacao}
                          onChange={(e) =>
                            setPassData({
                              ...passData,
                              nova_senha_confirmacao: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/40 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 mt-auto border-t border-slate-50">
                  <button
                    type="submit"
                    disabled={
                      savingPass ||
                      !passData.senha_atual ||
                      !passData.nova_senha
                    }
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-70 shadow-sm"
                  >
                    {savingPass ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    Alterar senha
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* --- CARD 3: ZONA DE PERIGO --- */}
          <div className="bg-red-50 rounded-2xl border border-red-100 p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-red-700 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Zona de perigo
                </h3>
                <p className="text-red-600/80 text-sm mt-1 max-w-xl">
                  Excluir sua conta apagará todos os seus treinos e histórico permanentemente.
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Trash2 size={16} /> Excluir conta
              </button>
            </div>
          </div>

          {/* --- MODAL --- */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
                <div className="text-center mb-6">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Tem certeza absoluta?
                  </h3>
                  <p className="text-slate-500 mt-2 text-sm">
                    Essa ação não pode ser desfeita. Todos os seus dados serão
                    removidos permanentemente da plataforma.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      'Sim, excluir'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
