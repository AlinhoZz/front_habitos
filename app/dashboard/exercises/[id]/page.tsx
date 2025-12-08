"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { getExercicioById, Exercicio } from '@/lib/api';
import { ArrowLeft, Dumbbell, Info, PlayCircle, Target } from 'lucide-react';
import { AiCoach } from '@/components/AiCoach';

export default function ExerciseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id); // Converte string para number

  const [exercise, setExercise] = useState<Exercicio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const data = await getExercicioById(token, id);
        setExercise(data);
      } catch (error) {
        console.error("Erro ao carregar exercício", error);
        router.push('/dashboard/exercises'); // Volta se der erro
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!exercise) return null;

  const aiContext = `
    Exercício: ${exercise.nome}
    Grupo Muscular: ${exercise.grupo_muscular || 'Geral'}
    Equipamento: ${exercise.equipamento || 'Peso do corpo'}
    
    Instruções Técnicas da Ficha:
    - Mantenha a postura neutra, abdômen levemente contraído.
    - Evite usar impulso excessivo.
    - Inspire na descida, expire na subida.
    
    Dicas passadas ao aluno:
    - Comece com carga leve.
    - Controle a volta do movimento.
    - Foque em sentir o músculo.
    
    Cuidados passados ao aluno:
    - Evite dores agudas.
    - Ajuste o banco.
  `;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pt-4 px-4 lg:px-0">
          
          {/* Botão Voltar */}
          <Link 
            href="/dashboard/exercises" 
            className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-2 text-xs font-medium"
          >
            <ArrowLeft size={18} className="mr-1" />
            Voltar para a lista de exercícios
          </Link>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* Header visual (imagem / placeholder) */}
            <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center relative overflow-hidden group">
              {/* Aqui você colocará a imagem real no futuro */}
              <div className="flex flex-col items-center gap-3">
                <Dumbbell 
                  size={70} 
                  className="text-slate-300 mb-2 group-hover:scale-110 transition-transform duration-500" 
                />
                <span className="text-xs text-slate-200/90">
                  Visualização ilustrativa do movimento
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-slate-700 font-semibold">
                  <Target size={14} className="text-red-500" />
                  {exercise.grupo_muscular || 'Grupo muscular geral'}
                </span>
                {exercise.equipamento && (
                  <span className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-sm px-3 py-1.5 rounded-full text-slate-100 font-medium border border-white/10">
                    Equipamento: {exercise.equipamento}
                  </span>
                )}
              </div>
            </div>

            <div className="p-7 sm:p-8">
              {/* Título + CTA */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {exercise.nome}
                  </h1>
                  <p className="text-xs text-slate-500 max-w-md">
                    Execute com técnica e controle. Use essa ficha como referência antes de adicionar o exercício ao seu treino.
                  </p>
                </div>
                {/* Botão de ação fictício */}
                <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20">
                  <PlayCircle size={18}/> 
                  Ver tutorial (em breve)
                </button>
              </div>

              {/* Blocos principais */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-slate-700">
                      <Dumbbell size={18}/>
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Equipamento</h3>
                  </div>
                  <p className="text-slate-600 text-sm ml-11">
                    {exercise.equipamento || 'Peso do corpo / Livre'}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-slate-700">
                      <Target size={18}/>
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Músculo alvo</h3>
                  </div>
                  <p className="text-slate-600 text-sm ml-11">
                    {exercise.grupo_muscular || 'Geral'}
                  </p>
                </div>
              </div>

              {/* Instruções */}
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Como executar
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Mantenha a postura neutra, abdômen levemente contraído e realize o movimento em amplitude confortável. 
                    Evite usar impulso excessivo; priorize a contração do músculo alvo. 
                    Inspire na fase excêntrica (descida) e expire na fase concêntrica (subida).
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <p className="font-semibold text-emerald-800 mb-1 text-xs uppercase tracking-wide">
                      Dicas rápidas
                    </p>
                    <ul className="text-emerald-900 text-xs space-y-1.5">
                      <li>• Comece com carga leve para aprender o padrão de movimento.</li>
                      <li>• Use controle na volta do movimento, não “deixe cair”.</li>
                      <li>• Foque em sentir o músculo alvo trabalhando.</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="font-semibold text-amber-800 mb-1 text-xs uppercase tracking-wide">
                      Cuidados
                    </p>
                    <ul className="text-amber-900 text-xs space-y-1.5">
                      <li>• Evite dores agudas nas articulações durante o exercício.</li>
                      <li>• Ajuste banco/apoios conforme sua altura.</li>
                      <li>• Em caso de lesão prévia, peça orientação profissional.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <AiCoach 
                  exerciseName={exercise.nome}
                  exerciseContext={aiContext}
                />
              </div>

            </div>
          </div>

          {/* Rodapé de contato */}
          <div className="text-center pt-4 pb-2">
            <p className="text-slate-400 text-xs flex items-center justify-center gap-2">
              <Info size={14}/>
              Encontrou alguma informação incorreta neste exercício?{" "}
              <span className="text-slate-600 font-semibold cursor-pointer hover:underline">
                Reportar à equipe
              </span>
            </p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
