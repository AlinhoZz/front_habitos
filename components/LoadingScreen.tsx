"use client";

import React from "react";

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export default function LoadingScreen({
  title = "Entrando no +Fôlego…",
  subtitle = "Carregando seus dados de treino, metas e histórico.",
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-1 px-6">
        {/* Logo */}
        <div className="w-full flex justify-center">
          <img
            src="/icons/loading.gif"
            alt="+Fôlego"
            className="h-40 w-auto object-contain mx-auto logo-pulse"
          />
        </div>

        {/* Card de loading */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl px-8 py-6 shadow-2xl max-w-sm w-full">
          <div className="flex items-center gap-4">
            {/* Spinner */}
            <div className="w-10 h-10 rounded-full border-2 border-slate-600 border-t-red-400 animate-spin" />

            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white">
                {title}
              </h2>
              <p className="text-[11px] text-slate-300 mt-1">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Barra de progresso fake */}
          <div className="mt-5 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-red-500 rounded-full loading-bar" />
          </div>

          {/* Mensagens “humanas” */}
          <ul className="mt-4 space-y-1.5 text-[11px] text-slate-400">
            <li>• Sincronizando sessões de atividade…</li>
            <li>• Carregando suas metas de hábito…</li>
            <li>• Montando painel de resumo…</li>
          </ul>
        </div>
      </div>

      {/* Animações globais para barra e logo */}
      <style jsx global>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        .loading-bar {
          animation: loading-bar 1.4s ease-in-out infinite;
        }

        @keyframes logo-pulse {
          0%,
          100% {
            filter: drop-shadow(0 0 0px rgba(248, 113, 113, 0.2));
            opacity: 0.8;
          }
          50% {
            filter: drop-shadow(0 0 14px rgba(248, 113, 113, 0.9));
            opacity: 1;
          }
        }

        .logo-pulse {
          animation: logo-pulse 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
