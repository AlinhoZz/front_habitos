"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { conectarStrava } from "@/lib/api";

export default function StravaCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [statusMsg, setStatusMsg] = useState("Finalizando conexão com o Strava...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      // Strava devolveu erro
      if (error) {
        setErrorMsg("Você cancelou a autorização do Strava ou ocorreu um erro.");
        setStatusMsg("");
        return;
      }

      if (!code) {
        setErrorMsg("Código de autorização não encontrado na URL.");
        setStatusMsg("");
        return;
      }

      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

        if (!token) {
          setErrorMsg("Você não está logado no +Fôlego. Faça login e tente novamente.");
          setStatusMsg("");
          return;
        }

        // Chama o backend: /integracoes/strava/conectar/
        await conectarStrava(token, code);

        setStatusMsg("Conta Strava conectada com sucesso! Redirecionando...");
        setErrorMsg(null);

        // Dá um tempinho e redireciona para o dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(
          err?.message ||
            "Não foi possível finalizar a conexão com o Strava. Tente novamente."
        );
        setStatusMsg("");
      }
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl px-6 py-5 max-w-md w-full shadow-2xl text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center mb-1">
          {/* Ícone “S” estilo Strava improvisado */}
          <span className="text-xl font-black text-orange-500">S</span>
        </div>
        <h1 className="text-lg font-semibold">Conectando ao Strava…</h1>

        {statusMsg && (
          <p className="text-sm text-slate-300">{statusMsg}</p>
        )}

        {errorMsg && (
          <p className="text-sm text-red-400">{errorMsg}</p>
        )}

        <p className="text-xs text-slate-500 mt-2">
          Você será redirecionado automaticamente para o painel assim que a
          conexão for concluída.
        </p>
      </div>
    </div>
  );
}
