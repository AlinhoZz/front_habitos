"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2, Loader2, AlertCircle, X, Check, FileText } from 'lucide-react';
import { register } from '@/lib/api';

// --- Componente Modal dos Termos (Embutido no arquivo) ---
function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header do Modal */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="bg-red-100 p-2 rounded-lg text-red-600"><FileText size={20}/></div>
            <h3 className="text-xl font-bold">Termos de Uso e Privacidade</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto text-slate-600 space-y-4 leading-relaxed">
          <p className="font-bold text-slate-900">1. Aceitação dos Termos</p>
          <p>Ao criar uma conta no +Fôlego, você concorda em cumprir estes termos de serviço e todas as leis aplicáveis.</p>
          
          <p className="font-bold text-slate-900">2. Uso da Licença</p>
          <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site +Fôlego.</p>
          
          <p className="font-bold text-slate-900">3. Privacidade de Dados</p>
          <p>Nós levamos sua privacidade a sério. Seus dados de saúde e performance são criptografados e nunca serão vendidos.</p>
          
          <p className="font-bold text-slate-900">4. Responsabilidade</p>
          <p>O +Fôlego é uma ferramenta de auxílio. Consulte sempre um médico antes de iniciar qualquer atividade física intensa.</p>
        </div>

        {/* Footer do Modal */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors">
            Li e Concordo
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal da Página ---
export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados visuais
  const [showTerms, setShowTerms] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Chama a API via api.ts
      const data = await register(formData.nome, formData.email, formData.senha);

      // 2. Se chegou aqui, é SUCESSO!
      setIsSuccess(true);
      
      // 3. Salva tokens se a API já retornou (login automático)
      if (data.access_token) {
         if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
         }
      }

      // 4. Aguarda a animação da barra (3 segundos) antes de redirecionar
      setTimeout(() => {
        if (data.access_token) {
           router.push('/dashboard'); 
        } else {
           router.push('/login');
        }
      }, 3000);

    } catch (err: any) {
      // Erro tratado pelo api.ts
      setError(err.message || 'Ocorreu um erro ao registrar.');
      setLoading(false); // Só para loading se der erro. Se for sucesso, mantém loading visual ou o banner.
    }
  };

  return (
    <>
      {/* --- MODAL --- */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      {/* --- BANNER DE SUCESSO (TOAST COM BARRA DE PROGRESSO) --- */}
      {isSuccess && (
        <div className="fixed top-0 left-0 w-full z-[70] animate-in slide-in-from-top duration-500 shadow-2xl">
          <div className="bg-emerald-600 text-white p-4">
             <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2 text-lg font-bold">
                   <div className="bg-white text-emerald-600 rounded-full p-1"><Check size={20} strokeWidth={4}/></div>
                   Conta criada com sucesso!
                </div>
                <p className="text-emerald-100 text-sm">Estamos preparando seu ambiente...</p>
             </div>
          </div>
          {/* Barra de Progresso Animada */}
          <div className="h-1.5 w-full bg-emerald-800">
             <div 
               className="h-full bg-white w-full origin-left"
               style={{ animation: 'shrink 3s linear forwards' }} 
             ></div>
             <style jsx>{`
               @keyframes shrink {
                 from { transform: scaleX(0); }
                 to { transform: scaleX(1); }
               }
             `}</style>
          </div>
        </div>
      )}

      <div className="min-h-screen flex bg-white">
        {/* Lado Esquerdo - Visual Rico */}
        <div className="hidden lg:flex w-1/2 bg-red-900 relative items-center justify-center overflow-hidden">
           <div className="absolute inset-0 z-0">
             <img 
               src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1920&auto=format&fit=crop" 
               className="w-full h-full object-cover opacity-30 mix-blend-overlay" 
               alt="Background Registro"
             />
          </div>
          <div className="relative z-10 p-12 text-white max-w-lg">
              <h2 className="text-4xl font-bold mb-8">Junte-se ao +Fôlego.</h2>
              <ul className="space-y-6">
                  <li className="flex items-center gap-4 text-lg">
                      <div className="bg-white/20 p-2 rounded-full"><CheckCircle2 className="text-white"/></div>
                      <span>Acompanhe Corrida, Ciclismo e Musculação</span>
                  </li>
                  <li className="flex items-center gap-4 text-lg">
                      <div className="bg-white/20 p-2 rounded-full"><CheckCircle2 className="text-white"/></div>
                      <span>Sem cartão de crédito necessário</span>
                  </li>
                   <li className="flex items-center gap-4 text-lg">
                      <div className="bg-white/20 p-2 rounded-full"><CheckCircle2 className="text-white"/></div>
                      <span>Comunidade com +15k atletas</span>
                  </li>
              </ul>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
          <div className="w-full max-w-md space-y-8">
            
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-extrabold text-slate-900">Crie sua conta</h1>
              <p className="mt-2 text-slate-600">É rápido, fácil e gratuito.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
                <AlertCircle size={20} /> 
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-5 transition-opacity duration-500 ${isSuccess ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all"
                  placeholder="Ex: Alisson Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">E-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="senha"
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all pr-12"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isSuccess}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading || isSuccess ? <Loader2 className="animate-spin" /> : "Criar Conta Grátis"}
              </button>
            </form>

            <p className="text-center text-slate-600 text-sm">
              Ao se registrar, você concorda com nossos{' '}
              <button 
                type="button" 
                onClick={() => setShowTerms(true)} 
                className="underline text-slate-800 hover:text-red-600 font-semibold"
              >
                Termos e Privacidade
              </button>.
            </p>

            <p className="text-center text-slate-600 pt-4 border-t border-slate-100">
              Já tem uma conta?{' '}
              <a href="/login" className="font-bold text-red-600 hover:text-red-700">
                Fazer Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}