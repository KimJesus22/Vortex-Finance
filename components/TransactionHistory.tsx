"use client";

import { Search, Filter, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Transaction } from "@/lib/services/transactionService";
import ExportButton from "@/components/ExportButton";
import ReportButton from "@/components/ReportButton";
import { TransactionSkeleton } from "@/components/Skeleton";

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: "todos" | "ingreso" | "gasto";
  setFilterType: (val: "todos" | "ingreso" | "gasto") => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  editingId: string | null;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  userName: string;
}

export default function TransactionHistory({
  transactions,
  loading,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterMonth,
  setFilterMonth,
  editingId,
  onEdit,
  onDelete,
  userName
}: TransactionHistoryProps) {

  // Computed state
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "todos" ? true : t.type === filterType;
    const transactionMonth = new Date(t.created_at).getMonth().toString();
    const matchesMonth = filterMonth === "todos" ? true : transactionMonth === filterMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  return (
    <div className="lg:col-span-2 bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-neutral-800 shadow-xl flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-neutral-100">Historial</h2>
      
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-neutral-950/50 p-3 rounded-2xl border border-neutral-800">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input 
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-neutral-200"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as any)}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-neutral-200 appearance-none"
        >
          <option value="todos">Todos los Tipos</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto">Gastos</option>
        </select>
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-neutral-200 appearance-none"
        >
          <option value="todos">Meses</option>
          <option value="0">Enero</option>
          <option value="1">Febrero</option>
          <option value="2">Marzo</option>
          <option value="3">Abril</option>
          <option value="4">Mayo</option>
          <option value="5">Junio</option>
          <option value="6">Julio</option>
          <option value="7">Agosto</option>
          <option value="8">Septiembre</option>
          <option value="9">Octubre</option>
          <option value="10">Noviembre</option>
          <option value="11">Diciembre</option>
        </select>
        
        <div className="flex gap-2">
          <ExportButton transactions={filteredTransactions} />
          <ReportButton transactions={filteredTransactions} userName={userName} />
        </div>
      </div>

      {loading ? (
        <TransactionSkeleton />
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center text-neutral-500 flex-1 py-16 flex flex-col items-center justify-center">
          <Filter className="w-12 h-12 text-neutral-800 mb-3" />
          <p>No hay transacciones que coincidan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTransactions.map((t, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              key={t.id}
              className={`group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl bg-neutral-950 border transition-all duration-300 gap-4 ${
                editingId === t.id 
                  ? "border-amber-500/50 bg-amber-500/5" 
                  : "border-neutral-800/50 hover:border-neutral-700 hover:bg-neutral-900/80"
              }`}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${t.type === "ingreso" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                  {t.type === "ingreso" ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0-16l-4 4m4-4l4 4" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m0 16l-4-4m4 4l4-4" /></svg>
                  )}
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="font-medium text-neutral-200 text-lg line-clamp-1">{t.category}</span>
                  <span className="text-sm text-neutral-500">
                    {new Date(t.created_at).toLocaleDateString("es-US", {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-16 sm:pl-0">
                <div className={`font-semibold text-xl tracking-tight privacy-blur ${t.type === "ingreso" ? "text-emerald-400" : "text-rose-400"}`}>
                  {t.type === "ingreso" ? "+" : "-"}${Number(t.amount).toLocaleString("es-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                
                {/* Acciones */}
                <div className={`flex gap-2 transition-opacity duration-200 ${editingId === t.id ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"}`}>
                  <button
                    onClick={() => onEdit(t)}
                    className="p-2.5 text-neutral-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-colors active:scale-90"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="p-2.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-colors active:scale-90"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
