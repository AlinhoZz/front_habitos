import { Suspense } from "react";
import StravaCallbackClient from "./StravaCallbackClient";

export default function StravaCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl px-6 py-5 max-w-md w-full shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center mb-1">
              <span className="text-xl font-black text-orange-500">S</span>
            </div>
            <h1 className="text-lg font-semibold">Conectando ao Strava…</h1>
            <p className="text-sm text-slate-300">
              Preparando ambiente para finalizar a conexão com segurança…
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Você será redirecionado automaticamente assim que tudo estiver pronto.
            </p>
          </div>
        </div>
      }
    >
      <StravaCallbackClient />
    </Suspense>
  );
}
