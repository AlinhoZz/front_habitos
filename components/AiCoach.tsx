'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  User,
  Wind,
  Trash2,
  AlertTriangle,
  MessageSquarePlus,
  ChevronDown,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AiCoachProps {
  exerciseName: string;
  exerciseContext: string;
}

const SUGGESTIONS = [
  'Quais os músculos alvo?',
  'Erros comuns na execução',
  'Sinto dor na lombar',
  'Adaptação para iniciantes',
  'Como respirar corretamente?',
];

export function AiCoach({ exerciseName, exerciseContext }: AiCoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const wasLoadingRef = useRef(false);

  const STORAGE_KEY = `chat_history_${exerciseName.replace(/\s+/g, '_')}`;

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Carrega histórico do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar histórico', e);
      }
    }
  }, [STORAGE_KEY]);

  // Salva histórico e faz scroll
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setTimeout(() => scrollToBottom(), 100);
  }, [messages, STORAGE_KEY]);

  // Foca no input quando termina o loading
  useEffect(() => {
    if (!isLoading && wasLoadingRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 60);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  const confirmClearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowClearModal(false);
  };

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substring(2);

  const handleAskAi = async (
    e?: React.FormEvent,
    overrideQuestion?: string
  ) => {
    if (e) e.preventDefault();

    const questionToSend = overrideQuestion || inputValue.trim();

    if (!questionToSend || isLoading) return;

    setInputValue('');
    setIsOpen(true); // se estava fechado, abre ao enviar

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: questionToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;

      if (!token) throw new Error('Faça login para falar com o O2.');

      const API_URL = 'http://localhost:8000/api/ai-coach/';

      const historicoRecente = messages
        .filter((m) => !m.content.startsWith('⚠️'))
        .slice(-6);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pergunta: questionToSend,
          nome_exercicio: exerciseName,
          contexto_exercicio: exerciseContext,
          primeira_mensagem: messages.length === 0,
          historico: historicoRecente,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          throw new Error(
            'Calma, atleta! Muitas mensagens seguidas. Respire 1 minuto.'
          );
        }
        const msg = errorData.detail || errorData.erro || 'Erro de conexão';
        throw new Error(msg);
      }

      const data = await res.json();

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.resposta,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `⚠️ ${err.message || 'Erro desconhecido.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm overflow-hidden">
        {/* HEADER COLAPSÁVEL */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen((prev) => !prev);
            }
          }}
          className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-md shadow-red-200">
                <Wind className="w-5 h-5 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  O2 · IA Coach
                </h3>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  {exerciseName}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Tire dúvidas rápidas sobre técnica, segurança e execução.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowClearModal(true);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Limpar histórico"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="p-1.5 rounded-full bg-slate-100 text-slate-500">
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* CORPO DO CHAT (só aparece quando aberto) */}
        {isOpen && (
          <>
            {/* Área de mensagens */}
            <div
              ref={chatContainerRef}
              className="h-72 sm:h-80 bg-slate-50 border-t border-slate-100 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col space-y-4 scroll-smooth touch-pan-y"
            >
              {/* Estado vazio com sugestões */}
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-95 space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center">
                    <Wind className="w-7 h-7 text-red-400" />
                  </div>
                  <p className="text-sm font-medium px-4 text-center text-slate-500">
                    Me chama pelo nome do exercício e manda a dúvida. Eu te ajudo
                    com o {exerciseName}.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 px-4 max-w-md">
                    {SUGGESTIONS.map((sugestao) => (
                      <button
                        key={sugestao}
                        type="button"
                        onClick={() => handleAskAi(undefined, sugestao)}
                        className="text-[11px] font-medium bg-white text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <MessageSquarePlus
                          size={13}
                          className="text-red-400"
                        />
                        {sugestao}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensagens */}
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={`flex w-full ${
                      isUser ? 'justify-end' : 'justify-start'
                    } animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out`}
                  >
                    <div
                      className={`flex max-w-[96%] sm:max-w-[80%] gap-1.5 sm:gap-2.5 ${
                        isUser ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                          isUser ? 'bg-slate-200' : 'bg-red-100'
                        }`}
                      >
                        {isUser ? (
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <Wind className="w-3.5 h-3.5 text-red-500" />
                        )}
                      </div>

                      {/* Balão */}
                      <div
                        className={`px-3 py-2.5 sm:px-3.5 sm:py-3 shadow-sm relative text-xs sm:text-sm leading-relaxed break-words ${
                          isUser
                            ? 'bg-slate-900 text-white rounded-2xl rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none'
                        }`}
                      >
                        <ReactMarkdown
                          components={{
                            strong: ({ node, ...props }) => (
                              <span
                                className={`font-bold ${
                                  isUser ? 'text-white' : 'text-slate-900'
                                }`}
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-1 last:mb-0" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-disc pl-4 mb-2 space-y-1"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="" {...props} />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>

                        <span
                          className={`text-[9px] sm:text-[10px] block mt-1 font-medium opacity-60 ${
                            isUser ? 'text-right' : 'text-left'
                          }`}
                        >
                          {new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-start animate-in fade-in duration-300 my-2">
                  <div className="flex items-center gap-3 px-1.5">
                    <div className="relative flex items-center justify-center w-9 h-9">
                      <div className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-100" />
                      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-red-500 border-r-red-500/40 animate-spin" />
                      <div className="relative z-10">
                        <Wind className="w-4 h-4 text-red-600 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-700">
                        O2
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 animate-pulse">
                        Pensando na melhor forma de explicar…
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-100 px-3 sm:px-4 py-3 sm:py-3.5">
              <form
                onSubmit={(e) => handleAskAi(e)}
                className="relative flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pergunte algo sobre este exercício…"
                  className="w-full pl-4 sm:pl-4 pr-11 sm:pr-12 py-2.5 sm:py-3 rounded-full bg-slate-100 text-slate-900 font-medium text-[13px] sm:text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-200 border border-transparent outline-none transition-all placeholder:text-slate-400"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-1.5 sm:right-2 p-1.5 sm:p-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
                >
                  <Send className="w-4 h-4 sm:w-4 sm:h-4 ml-0.5" />
                </button>
              </form>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 text-center">
                O2 é uma IA experimental. Em caso de dor ou lesão, siga
                orientações médicas.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal de limpar histórico */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowClearModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Apagar histórico?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Tem certeza que deseja apagar toda a conversa sobre este
                  exercício?
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearChat}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
