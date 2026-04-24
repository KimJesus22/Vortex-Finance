"use client";

import { FileText, Printer } from "lucide-react";
import { Transaction } from "@/lib/services/transactionService";

interface ReportButtonProps {
  transactions: Transaction[];
  userName: string;
}

export default function ReportButton({ transactions, userName }: ReportButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalIncome = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  
  const totalExpenses = transactions
    .filter((t) => t.type === "gasto")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group"
      >
        <Printer size={18} className="group-hover:rotate-12 transition-transform" />
        <span>Generar Reporte</span>
      </button>

      {/* Estructura del Reporte (Solo visible al imprimir) */}
      <div id="vortex-print-report" className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[9999]">
        <div className="flex justify-between items-start border-b-4 border-emerald-500 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-emerald-600 tracking-tighter">VORTEX FINANCE</h1>
            <p className="text-gray-500 font-medium">Gestión Financiera Inteligente</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">REPORTE DE MOVIMIENTOS</p>
            <p className="text-gray-500">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Usuario</p>
            <p className="text-xl font-bold">{userName}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Periodo</p>
            <p className="text-xl font-bold">Consolidado Mensual</p>
          </div>
        </div>

        <table className="w-full mb-10 border-collapse">
          <thead>
            <tr className="bg-emerald-500 text-white">
              <th className="text-left p-4 rounded-tl-xl">Fecha</th>
              <th className="text-left p-4">Concepto</th>
              <th className="text-center p-4">Tipo</th>
              <th className="text-right p-4 rounded-tr-xl">Monto</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => (
              <tr key={t.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-4 border-b border-gray-100">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="p-4 border-b border-gray-100 font-medium">{t.category}</td>
                <td className="p-4 border-b border-gray-100 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.type === 'ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {t.type === 'ingreso' ? 'INGRESO' : 'GASTO'}
                  </span>
                </td>
                <td className={`p-4 border-b border-gray-100 text-right font-bold ${t.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${Number(t.amount).toLocaleString('es-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-12">
          <div className="w-80 space-y-3 bg-emerald-50 p-8 rounded-3xl border-2 border-emerald-100">
            <div className="flex justify-between text-gray-600">
              <span>Total Ingresos:</span>
              <span className="font-bold text-emerald-600">${totalIncome.toLocaleString('es-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total Gastos:</span>
              <span className="font-bold text-rose-600">${totalExpenses.toLocaleString('es-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-4 border-t-2 border-emerald-200 flex justify-between items-end">
              <span className="font-bold text-lg">Balance Neto:</span>
              <span className={`text-2xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ${balance.toLocaleString('es-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-10 text-center text-gray-400 text-sm border-t border-gray-100">
          Este reporte es un documento oficial generado por Vortex Finance. &copy; {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
}
