"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, XCircle } from "lucide-react";
import { login } from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [showPassword, setShowPassword] = useState(false);

  // 👇 agora temos dois estados:
  const [isSubmitting, setIsSubmitting] = useState(false);      // spinner no botão
  const [showFullLoading, setShowFullLoading] = useState(false); // tela inteira de loading

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = await login(formData.email, formData.senha);

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
      }

      // 👉 SÓ aqui, depois do login dar certo, mostramos a tela de carregamento full
      setShowFullLoading(true);

      // só pra simular um "loading" bonitinho
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "Ocorreu um erro desconhecido ao tentar entrar."
      );
      setIsSubmitting(false); // volta pro formulário, sem tela full
    }
  };

  // Se o login JÁ deu certo, mostra a tela de carregamento
  if (showFullLoading) {
    return (
      <LoadingScreen
        title="Entrando no +Fôlego…"
        subtitle="Carregando seus treinos, metas e histórico."
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Lado Esquerdo - Visual Rico */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-40"
            alt="Background Login"
          />
        </div>
        <div className="relative z-10 p-12 text-white max-w-lg">
          <img src="/placeholder-logo-white.png" alt="Logo" className="h-12 mb-8" />
          <h2 className="text-4xl font-bold mb-6">
            Bem-vindo de volta, atleta.
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            "A única maneira de definir seus limites é indo além deles. Continue sua jornada hoje."
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Acesse sua conta
            </h1>
            <p className="mt-2 text-slate-600">
              Preencha seus dados para continuar.
            </p>
          </div>

          {/* Mensagem de Erro Estilizada */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Não foi possível entrar</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  error ? "border-red-300 bg-red-50" : "border-slate-200"
                } focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all`}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <a
                  href="#"
                  className="text-sm font-bold text-red-600 hover:text-red-700"
                >
                  Esqueceu?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    error ? "border-red-300 bg-red-50" : "border-slate-200"
                  } focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all pr-12`}
                  placeholder="Sua senha secreta"
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
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Entrar <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-600">
            Não tem uma conta?{" "}
            <a
              href="/register"
              className="font-bold text-red-600 hover:text-red-700"
            >
              Crie agora gratuitamente
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
