"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { getExercicios, Exercicio } from '@/lib/api';
import { Search, Dumbbell, Info, ChevronRight } from 'lucide-react';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const data = await getExercicios(token);
        setExercises(data);
      } catch (error) {
        console.error("Erro ao carregar exercícios", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtro de busca
  const filteredExercises = exercises.filter(ex => 
    ex.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.grupo_muscular?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = exercises.length;
  const showing = filteredExercises.length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4 px-4 lg:px-0">
          
          {/* HERO / HEADER */}
          <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-700 px-6 py-5 sm:px-8 sm:py-6 shadow-lg text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-300/80">
                biblioteca de musculação
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-red-300" />
                Exercícios de Musculação
              </h1>
              <p className="text-sm text-slate-100/90 max-w-md">
                Explore os movimentos, crie treinos mais inteligentes e execute com técnica.
              </p>
              {!loading && (
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-200/90 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  {total === 0 ? 'Nenhum exercício cadastrado ainda' : `${total} exercício${total > 1 ? 's' : ''} disponíveis`}
                </span>
              )}
            </div>

            {/* Busca no Hero */}
            <div className="w-full max-w-sm">
              <label className="block text-xs font-semibold text-slate-200 mb-1 uppercase tracking-wide">
                Buscar exercício
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  type="text" 
                  placeholder="Nome, músculo alvo, equipamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/95 text-slate-900 border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none text-sm"
                />
              </div>
              {!loading && (
                <p className="mt-1 text-[11px] text-slate-200/90">
                  Mostrando {showing} de {total} exercício{total !== 1 && 's'}
                </p>
              )}
            </div>
          </section>

          {/* LISTA / GRID */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div 
                  key={i} 
                  className="h-32 bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Nenhum exercício encontrado
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Ajuste o termo de busca ou limpe o filtro para ver toda a biblioteca.
              </p>
              {total > 0 && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((ex) => (
                <Link href={`/dashboard/exercises/${ex.id}`} key={ex.id}>
                  <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all cursor-pointer h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-50 p-3 rounded-xl text-slate-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                          <Dumbbell size={24} />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded-md group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                          {ex.grupo_muscular || 'Geral'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-red-700 transition-colors mb-1 line-clamp-2">
                        {ex.nome}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {ex.equipamento || 'Equipamento livre / Peso do corpo'}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center text-xs font-semibold text-red-600 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                      Ver detalhes <ChevronRight size={14} className="ml-1"/>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mensagem de Suporte */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
              <Info size={22} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1 text-sm">
                Não encontrou o exercício que queria?
              </h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                Estamos sempre atualizando nossa base de exercícios. Se você quiser adicionar um movimento específico
                (variações, máquinas diferentes, adaptações para lesões), fale com nossa equipe de desenvolvimento.
              </p>
              <button className="mt-3 text-xs font-bold text-blue-700 hover:text-blue-900 underline">
                Falar com suporte
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
