"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { insforge } from "@/lib/insforge";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function FloatingAdvisor({ currentUser }: { currentUser: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "¡Hola! Soy Vortex AI. ¿En qué te puedo asesorar hoy con tus finanzas?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const fetchRecentTransactions = async () => {
    if (!currentUser) return [];
    
    const { data, error } = await insforge.database
      .from("transactions")
      .select("amount, type, category, created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (error || !data) return [];
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
      // 1. Obtener últimas 10 transacciones como contexto
      const recentTx = await fetchRecentTransactions();
      const txContextStr = recentTx.length > 0 
        ? JSON.stringify(recentTx.map(t => ({ 
            monto: t.amount, 
            tipo: t.type, 
            categoria: t.category, 
            fecha: t.created_at.split('T')[0] 
          })))
        : "Sin transacciones recientes registradas.";

      // 2. Construir prompt enriquecido (contexto oculto para el usuario)
      const enrichedMessage = `Contexto de los últimos movimientos del usuario: ${txContextStr}. Pregunta del usuario: ${userText}`;

      // 3. Enviar al backend de Next.js (que habla con LM Studio)
      const aiResponse = await fetch("/api/vortex-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "chat", message: enrichedMessage }),
      });

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        throw new Error(aiData.error || "Error conectando con la IA");
      }

      setMessages(prev => [...prev, { role: "ai", content: aiData.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: "ai", content: "Lo siento, tuve un problema de conexión con LM Studio: " + (err.message || "Error desconocido.") }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 p-4 rounded-full bg-emerald-500 text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all z-50 hover:scale-105 active:scale-95 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Abrir Asesor Financiero"
      >
        <MessageCircle size={32} className="fill-neutral-950/10" />
      </button>

      {/* Ventana de Chat Flotante */}
      <div className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 w-[350px] md:w-[400px] h-[550px] max-h-[80vh] bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800 shadow-2xl rounded-3xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Cabecera del Chat */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-100 leading-tight">Vortex AI</h3>
              <p className="text-xs text-emerald-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Asesor Financiero
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-colors active:scale-95"
            title="Cerrar Chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-neutral-800">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${msg.role === 'user' ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm shadow-emerald-900/20' : 'bg-neutral-800/80 text-neutral-200 rounded-tl-sm shadow-black/20'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Bot size={16} />
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-800/80 text-neutral-400 rounded-tl-sm flex items-center gap-2 text-sm shadow-sm shadow-black/20">
                <Loader2 size={16} className="animate-spin text-emerald-500" /> Pensando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Área de Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800 bg-neutral-950/80 rounded-b-3xl">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hazme una pregunta sobre tus gastos..."
              disabled={isLoading}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-full pl-5 pr-14 py-3.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm text-neutral-100 disabled:opacity-50 placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 bg-emerald-500 text-neutral-950 rounded-full hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:bg-neutral-800 disabled:text-neutral-600 active:scale-95"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
