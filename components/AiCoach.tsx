'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Wind, Trash2, AlertTriangle, MessageSquarePlus } from 'lucide-react';
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
  "Quais os músculos alvo?",
  "Erros comuns na execução",
  "Sinto dor na lombar",
  "Adaptação para iniciantes",
  "Como respirar corretamente?"
];

export function AiCoach({ exerciseName, exerciseContext }: AiCoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const STORAGE_KEY = `chat_history_${exerciseName.replace(/\s+/g, '_')}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, STORAGE_KEY]);

  useEffect(() => {
    if (!isLoading) {
      // Um pequeno timeout garante que o input já está "habilitado" antes de focar
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isLoading]);

  const confirmClearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowClearModal(false);
  };

  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

  const handleAskAi = async (e?: React.FormEvent, overrideQuestion?: string) => {
    if (e) e.preventDefault();
    
    const questionToSend = overrideQuestion || inputValue.trim();

    if (!questionToSend || isLoading) return;

    setInputValue('');

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: questionToSend,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (!token) throw new Error('Faça login para falar com o O2.');

      const API_URL = 'http://localhost:8000/api/ai-coach/';

      const historicoRecente = messages
        .filter(m => !m.content.startsWith('⚠️')) 
        .slice(-6);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pergunta: questionToSend,
          nome_exercicio: exerciseName,
          contexto_exercicio: exerciseContext,
          primeira_mensagem: messages.length === 0,
          historico: historicoRecente
        })
      });

     if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 429) {
             throw new Error("Calma, atleta! Muitas mensagens seguidas. Respire 1 minuto.");
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
    <div className="mt-6 w-full lg:max-w-3xl mx-auto px-2 sm:px-0 pb-4 relative">
      
      {/* Header - VOLTOU PARA O TEMA RED/ORANGE */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-t-2xl sm:rounded-t-3xl p-3 sm:p-4 flex items-center justify-between shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Gradiente Vermelho/Laranja Original */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
              <Wind className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              O2 <span className="text-[10px] sm:text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">IA Coach</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[150px] sm:max-w-none">
              {exerciseName}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button 
            onClick={() => setShowClearModal(true)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-95"
            title="Limpar histórico"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Área do Chat */}
      <div className="h-[400px] sm:h-[500px] bg-slate-50 border-x border-slate-200 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6 scroll-smooth touch-pan-y">
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-90 space-y-4 animate-in fade-in duration-500">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center">
              <Wind className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            </div>
            <p className="text-sm font-medium px-4 text-center text-slate-500">
              Olá! Como posso ajudar com o {exerciseName}?
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 px-4 max-w-md">
              {SUGGESTIONS.map((sugestao) => (
                <button
                  key={sugestao}
                  onClick={() => handleAskAi(undefined, sugestao)}
                  className="text-xs font-medium bg-white text-slate-600 border border-slate-200 px-3 py-2 rounded-full shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <MessageSquarePlus size={14} className="text-red-400"/>
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out`}
            >
              <div className={`flex max-w-[98%] sm:max-w-[85%] gap-1.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${isUser ? 'bg-slate-200' : 'bg-red-100'}`}>
                  {isUser ? <User size={12} className="text-slate-500 sm:w-3.5 sm:h-3.5"/> : <Wind size={12} className="text-red-500 sm:w-3.5 sm:h-3.5"/>}
                </div>

                {/* Balão de Mensagem */}
                <div
                  className={`
                    px-3 py-2.5 sm:p-4 shadow-sm relative text-sm leading-relaxed break-words
                    ${isUser 
                      ? 'bg-slate-900 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none'
                    }
                  `}
                >
                  <ReactMarkdown
                    components={{
                      // ✅ TEXTO EM NEGRITO AGORA É PRETO (slate-900) ou BRANCO (se for usuário)
                      strong: ({node, ...props}) => <span className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`} {...props} />,
                      p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="" {...props} />
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  
                  <span className={`text-[9px] sm:text-[10px] block mt-1 font-medium opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Animação de Carregamento (Vermelha O2 Original) */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300 my-4">
             <div className="flex items-center gap-3 px-2">
                <div className="relative flex items-center justify-center w-10 h-10">
                   <div className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-100"></div>
                   <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-red-500 border-r-red-500/30 animate-spin"></div>
                   <div className="relative z-10">
                      <Wind className="w-5 h-5 text-red-600 animate-pulse" />
                   </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">O2</span>
                  <span className="text-[10px] font-medium text-slate-400 animate-pulse">
                    Analisando biomecânica...
                  </span>
                </div>
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input */}
      <div className="bg-white border-t border-slate-200 rounded-b-2xl sm:rounded-b-3xl p-3 sm:p-4">
        <form onSubmit={(e) => handleAskAi(e)} className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite aqui..."
            className="w-full pl-4 sm:pl-5 pr-12 sm:pr-14 py-3 sm:py-4 rounded-full bg-slate-100 text-slate-900 font-medium text-base sm:text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-200 border border-transparent outline-none transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-1.5 sm:right-2 p-2 sm:p-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
          </button>
        </form>
        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 text-center px-2">
          O2 é uma IA experimental. Siga orientações médicas.
        </p>
      </div>

      {/* Modal Limpar */}
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
                <h3 className="text-lg font-bold text-slate-900">Apagar histórico?</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Você tem certeza que deseja apagar toda a conversa sobre este exercício?
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