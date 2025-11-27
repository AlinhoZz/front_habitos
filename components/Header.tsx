"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, Bell, User, Flame, Calendar, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  userName: string;
  userEmail?: string; // ➜ opcional, se você quiser mostrar o email no menu
}

export default function Header({ onMenuClick, userName, userEmail }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const firstName = (userName || '').trim().split(' ')[0] || 'Atleta';

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <header className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-100 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
      {/* Lado Esquerdo: Menu + saudação */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Botão menu mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg lg:hidden transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Barrinha de cor (sem texto ‘painel de treinos’) */}
        <div className="hidden sm:block w-1 h-10 rounded-full bg-gradient-to-b from-red-500 via-red-400 to-amber-400" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">
              Olá, {firstName}
            </h1>
            <span className="inline-flex items-center justify-center text-lg">
              💪
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Bora manter a constância hoje?
          </p>
        </div>
      </div>

      {/* Lado Direito: data, “streak” e avatar com menu */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Chip com dia de hoje */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-600">
          <Calendar size={13} className="text-red-500" />
          <span>{todayLabel}</span>
        </div>

        {/* “Streak” / frase motivacional */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-[11px] font-semibold text-red-600 border border-red-100">
          <Flame size={13} className="text-red-500" />
          <span>Dia bom pra bater meta</span>
        </div>

        {/* Notificações */}
        <button className="relative p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-white" />
        </button>

        {/* Avatar + menu dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <User size={20} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-900/10 p-3 z-40">
              {/* Cabeçalho do menu: nome + email */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {userName || 'Atleta'}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-slate-500 truncate">
                      {userEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Opções */}
              <div className="pt-2 space-y-1">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center justify-between px-2 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <span>Ver perfil completo</span>
                  <ArrowRight size={14} className="text-red-500" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
