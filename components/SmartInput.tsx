import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";

interface SmartInputProps {
  currentUser: any;
  onTransactionAdded: () => void;
}

export default function SmartInput({ currentUser, onTransactionAdded }: SmartInputProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await fetch("/api/vortex-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "categorize", message: text }),
      });

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        throw new Error(aiData.error || "Error comunicándose con la IA");
      }

      // Validar datos devueltos por la IA
      let transactionsList = Array.isArray(aiData) ? aiData : [aiData];
      
      if (transactionsList.length === 0) {
        throw new Error("No se detectaron transacciones en el texto.");
      }

      for (const tx of transactionsList) {
        if (tx.amount === undefined || !tx.type || !tx.category) continue;

        // Limpiar tipo
        const typeStr = String(tx.type).toLowerCase();
        const finalType = typeStr.includes("ingreso") ? "ingreso" : "gasto";

        // Insertar automáticamente el gasto categorizado en InsForge
        const { error: dbError } = await insforge.database.from("transactions").insert({
          user_id: currentUser.id,
          amount: Number(tx.amount),
          type: finalType,
          category: tx.category,
        });

        if (dbError) throw dbError;
      }

      // Limpiar input y disparar recarga de datos en la pantalla
      setText("");
      toast.success(`¡IA analizó y guardó ${transactionsList.length} transacciones!`);
      onTransactionAdded();

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocurrió un error inesperado al procesar con IA.");
      setError(err.message || "Ocurrió un error inesperado al procesar con IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-neutral-900/80 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)] rounded-3xl p-4 md:p-6 my-2 relative overflow-hidden group transition-all hover:border-emerald-500/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            placeholder="✨ Ingresa un registro rápido (ej: Gasté $450 en Walmart...)"
            className="w-full bg-neutral-950/80 border border-neutral-800 rounded-2xl pl-5 pr-5 py-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-neutral-100 placeholder:text-neutral-500 disabled:opacity-50 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-4 px-8 rounded-2xl transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95 whitespace-nowrap shadow-lg shadow-emerald-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Procesando con Vortex AI...
            </>
          ) : (
            <>
              <Sparkles size={20} className="fill-neutral-950" />
              Analizar y Guardar
            </>
          )}
        </button>
      </form>
      {error && <p className="text-rose-400 text-sm mt-3 px-2 font-medium relative z-10">{error}</p>}
    </div>
  );
}
