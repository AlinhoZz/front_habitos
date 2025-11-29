"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Target,
  LogOut,
  X,
  BicepsFlexed,
  User,
  Activity, // ícone para Sessões
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();

  // Ordem organizada pensando no fluxo:
  // 1) Visão Geral -> 2) Registrar Sessão -> 3) Meus Treinos -> 4) Metas -> 5) Exercícios
  const mainItems = [
    { name: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Registrar Sessão", icon: Activity, href: "/dashboard/sessions" },
    { name: "Meus Treinos", icon: Dumbbell, href: "/dashboard/history" },
    { name: "Metas", icon: Target, href: "/dashboard/goals" },
    { name: "Exercícios de Musculação", icon: BicepsFlexed, href: "/dashboard/exercises" },
  ];

  const profileItem = { name: "Meu Perfil", icon: User, href: "/dashboard/profile" };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Overlay Mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-slate-950 text-white border-r border-slate-800/60
          transition-transform duration-300 ease-in-out shadow-xl
          lg:translate-x-0 lg:static lg:h-screen lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/60">
            <div className="flex-1 flex items-center justify-center px-3">
              <img
                src="/icons/logosidebar.svg"
                alt="+Fôlego Logo"
                className="h-12 lg:h-14 w-auto object-contain transition-transform duration-200 hover:scale-105"
              />
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Conteúdo scrollável */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            {/* Principal */}
            <nav className="space-y-1">
              <p className="px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-1">
                Principal
              </p>

              {mainItems.map((item) => {
                const active = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      }
                    `}
                  >
                    <item.icon
                      size={18}
                      className={`
                        transition-transform duration-200
                        ${active ? "text-red-400" : "text-slate-500 group-hover:text-red-300"}
                        group-hover:scale-110
                      `}
                    />
                    <span className="truncate group-hover:translate-x-0.5 transition-transform duration-200">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Perfil */}
            <div className="mt-6">
              <p className="px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-1">
                Conta
              </p>
              {(() => {
                const active = isActiveRoute(profileItem.href);
                const Icon = profileItem.icon;
                return (
                  <Link
                    href={profileItem.href}
                    onClick={onClose}
                    className={`
                      group
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`
                        transition-transform duration-200
                        ${active ? "text-red-400" : "text-slate-500 group-hover:text-red-300"}
                        group-hover:scale-110
                      `}
                    />
                    <span className="truncate group-hover:translate-x-0.5 transition-transform duration-200">
                      {profileItem.name}
                    </span>
                  </Link>
                );
              })()}
            </div>
          </div>

          {/* Footer / Logout */}
          <div className="border-t border-slate-800/60 px-4 py-3 bg-slate-950">
            <button
              onClick={onLogout}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
