"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CarFront, Utensils, Shirt, BedDouble, X, Check } from 'lucide-react';

interface QuickActionsProps {
  onQuickSave: (data: { amount: number; type: "ingreso" | "gasto"; category: string }) => Promise<void>;
}

type ActionConfig = {
  id: string;
  label: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  bgClass: string;
  textClass: string;
};

const actions: ActionConfig[] = [
  { id: 'transport', label: 'Uber/Metro', title: '🚕 Uber/Metro', icon: <CarFront size={28} />, category: 'Transporte', bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' },
  { id: 'food', label: 'Comida Rápida', title: '🍔 Comida Rápida', icon: <Utensils size={28} />, category: 'Comida', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' },
  { id: 'merch', label: 'Merch Oficial', title: '👕 Merch Oficial', icon: <Shirt size={28} />, category: 'Compras', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' },
  { id: 'lodging', label: 'Hospedaje', title: '🏨 Hospedaje', icon: <BedDouble size={28} />, category: 'Hospedaje', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' },
];

export default function QuickActions({ onQuickSave }: QuickActionsProps) {
  const [activeAction, setActiveAction] = useState<ActionConfig | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeAction && inputRef.current) {
      // Pequeño retraso para la animación del modal antes de enfocar en móviles
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [activeAction]);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSaving(true);
    try {
      await onQuickSave({
        amount: numAmount,
        type: 'gasto',
        category: activeAction!.category
      });
      setActiveAction(null);
      setAmount('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full mt-2 mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-neutral-400 text-sm font-medium">Botones Rápidos (Viaje)</h3>
        <span className="text-[10px] uppercase tracking-wider font-bold bg-neutral-800/80 text-neutral-500 px-2 py-0.5 rounded-full">Offline Ready</span>
      </div>
      
      {/* Carrusel Horizontal para Celulares */}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => setActiveAction(action)}
            className="snap-start shrink-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-3xl w-28 h-28 transition-all active:scale-95 shadow-lg relative overflow-hidden group"
          >
            <div className={`p-3 rounded-2xl ${action.bgClass} ${action.textClass} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-xs font-semibold text-neutral-300 text-center leading-tight px-1">
              {action.title}
            </span>
          </button>
        ))}
      </div>

      {/* Modal Rápido a una mano */}
      {activeAction && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border-t sm:border border-neutral-800 w-full max-w-sm rounded-t-[2.5rem] sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 pb-10 sm:pb-8">
            
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${activeAction.bgClass} ${activeAction.textClass}`}>
                  {activeAction.icon}
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">{activeAction.title}</h4>
                  <p className="text-sm text-neutral-400 mt-1">Registrar Gasto • {activeAction.category}</p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveAction(null); setAmount(''); }}
                className="p-2 bg-neutral-800/50 text-neutral-400 rounded-full hover:bg-neutral-700 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8">
              <div className="relative flex items-center justify-center">
                <span className="absolute left-6 text-4xl text-neutral-600 font-bold">$</span>
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-950 border-2 border-neutral-800 rounded-3xl py-6 pl-16 pr-6 text-center text-5xl font-extrabold text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-neutral-800 shadow-inner"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !amount || parseFloat(amount) <= 0}
              className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-neutral-950 font-black text-xl py-5 rounded-3xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              {isSaving ? (
                <div className="w-7 h-7 border-4 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check size={28} strokeWidth={3} /> GUARDAR
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
