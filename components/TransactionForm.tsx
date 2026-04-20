"use client";

import { useState, useEffect, FormEvent } from "react";
import { X } from "lucide-react";
import { Transaction } from "@/lib/services/transactionService";

interface TransactionFormProps {
  editingTransaction: Transaction | null;
  onSave: (data: { amount: number; type: "ingreso" | "gasto"; category: string }) => Promise<void>;
  onCancel: () => void;
}

export default function TransactionForm({ editingTransaction, onSave, onCancel }: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"ingreso" | "gasto">("ingreso");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
    } else {
      setAmount("");
      setType("ingreso");
      setCategory("");
    }
  }, [editingTransaction]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    setIsSubmitting(true);
    await onSave({
      amount: Number(amount),
      type,
      category,
    });
    setIsSubmitting(false);
    
    if (!editingTransaction) {
      setAmount("");
      setCategory("");
    }
  };

  return (
    <div className="lg:col-span-1 bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-6 border border-neutral-800 shadow-xl h-fit transition-all duration-300 relative">
      {editingTransaction && (
        <button 
          onClick={onCancel}
          type="button"
          className="absolute top-5 right-5 p-2 text-neutral-500 hover:text-neutral-200 bg-neutral-800/50 hover:bg-neutral-800 rounded-full transition-all"
          title="Cancelar edición"
        >
          <X size={18} />
        </button>
      )}
      
      <h2 className="text-xl font-semibold mb-6 text-neutral-100 pr-10">
        {editingTransaction ? "Editar Registro" : "Nueva Transacción"}
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Monto</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 placeholder:text-neutral-600 disabled:opacity-50"
              placeholder="0.00"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "ingreso" | "gasto")}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 appearance-none disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="ingreso">Ingreso</option>
            <option value="gasto">Gasto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Categoría</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 placeholder:text-neutral-600 disabled:opacity-50"
            placeholder="Ej: Nómina, Servicios..."
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-4 w-full font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none ${
            editingTransaction 
            ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-900/20" 
            : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
          }`}
        >
          {isSubmitting ? "Guardando..." : (editingTransaction ? "Guardar Cambios" : "Agregar Transacción")}
        </button>
      </form>
    </div>
  );
}
