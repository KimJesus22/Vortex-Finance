"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "@/lib/services/transactionService";

interface ExportButtonProps {
  transactions: Transaction[];
}

export default function ExportButton({ transactions }: ExportButtonProps) {
  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error("No hay transacciones para exportar");
      return;
    }

    // Encabezados de CSV solicitados: Fecha, Descripción, Categoría, Tipo y Monto
    let csvContent = "Fecha,Descripción,Categoría,Tipo,Monto\n";

    transactions.forEach((t) => {
      const date = new Date(t.created_at).toLocaleDateString("es-US");
      // Como no tenemos un campo separado de "Descripción", usamos la categoría
      const descripcion = `"${t.category.replace(/"/g, '""')}"`;
      const categoria = `"${t.category.replace(/"/g, '""')}"`;
      const tipo = t.type;
      const monto = t.amount;
      csvContent += `${date},${descripcion},${categoria},${tipo},${monto}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Generar nombre de archivo: vortex-reporte-[mes-actual].csv
    const currentMonth = new Date().toLocaleString("es-ES", { month: "long" }).toLowerCase();
    
    link.setAttribute("href", url);
    link.setAttribute("download", `vortex-reporte-${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Historial exportado a CSV");
  };

  return (
    <button
      onClick={handleExport}
      className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-neutral-200 flex items-center justify-center gap-2 active:scale-95"
      title="Exportar a CSV"
    >
      <Download size={16} className="text-emerald-500" />
      <span className="hidden sm:inline">Exportar</span>
    </button>
  );
}
