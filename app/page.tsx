"use client";

import { useEffect, useState, FormEvent } from "react";
import { insforge } from "@/lib/insforge";
import { Trash2, Edit2, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "ingreso" | "gasto";
  category: string;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"ingreso" | "gasto">("ingreso");
  const [category, setCategory] = useState("");
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await insforge.auth.getCurrentUser();
      if (data.user) {
        setCurrentUser(data.user);
        fetchTransactions(data.user.id);
      } else {
        router.push("/login");
      }
      setAuthChecking(false);
    };
    checkAuth();
  }, [router]);

  const fetchTransactions = async (userId: string) => {
    setLoading(true);
    const { data, error } = await insforge.database
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data as Transaction[]);
      const total = data.reduce((acc: number, curr: any) => {
        return curr.type === "ingreso"
          ? acc + Number(curr.amount)
          : acc - Number(curr.amount);
      }, 0);
      setBalance(total);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await insforge.auth.signOut();
    router.push("/login");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !currentUser) return;

    if (editingId) {
      const { error } = await insforge.database
        .from("transactions")
        .update({
          amount: Number(amount),
          type,
          category,
        })
        .eq("id", editingId)
        .eq("user_id", currentUser.id);

      if (!error) {
        cancelEdit();
        fetchTransactions(currentUser.id);
      } else {
        console.error(error);
        alert("Error actualizando la transacción.");
      }
    } else {
      const { error } = await insforge.database.from("transactions").insert({
        user_id: currentUser.id,
        amount: Number(amount),
        type,
        category,
      });

      if (!error) {
        setAmount("");
        setCategory("");
        fetchTransactions(currentUser.id);
      } else {
        console.error(error);
        alert("Error guardando la transacción.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser || !confirm("¿Estás seguro de eliminar esta transacción?")) return;

    const { error } = await insforge.database
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id);

    if (!error) {
      fetchTransactions(currentUser.id);
    } else {
      console.error(error);
      alert("Error eliminando la transacción.");
    }
  };

  const handleEditMode = (t: Transaction) => {
    setEditingId(t.id);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setCategory("");
    setType("ingreso");
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Cabecera del Usuario */}
        <div className="flex justify-between items-center px-2">
          <div className="text-neutral-400 text-sm">
            Hola, <span className="text-neutral-100 font-medium">{currentUser?.profile?.name || currentUser?.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-rose-400 transition-colors bg-neutral-900/50 hover:bg-neutral-800 py-2 px-4 rounded-full border border-neutral-800"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        {/* Panel Superior: Balance Total */}
        <div className="bg-neutral-900 rounded-3xl p-8 md:p-10 border border-neutral-800 shadow-2xl text-center relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h1 className="text-lg md:text-xl text-neutral-400 font-medium mb-3 relative z-10">Balance Total</h1>
          <p className={`text-6xl md:text-7xl font-bold tracking-tight relative z-10 transition-colors duration-500 ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            ${balance.toLocaleString("es-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
          
          {/* Formulario Nueva/Editar Transacción */}
          <div className="lg:col-span-1 bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-6 border border-neutral-800 shadow-xl h-fit transition-all duration-300 relative">
            {editingId && (
              <button 
                onClick={cancelEdit}
                type="button"
                className="absolute top-5 right-5 p-2 text-neutral-500 hover:text-neutral-200 bg-neutral-800/50 hover:bg-neutral-800 rounded-full transition-all"
                title="Cancelar edición"
              >
                <X size={18} />
              </button>
            )}
            
            <h2 className="text-xl font-semibold mb-6 text-neutral-100 pr-10">
              {editingId ? "Editar Registro" : "Nueva Transacción"}
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
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 placeholder:text-neutral-600"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "ingreso" | "gasto")}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 appearance-none"
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
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 placeholder:text-neutral-600"
                  placeholder="Ej: Nómina, Servicios..."
                  required
                />
              </div>

              <button
                type="submit"
                className={`mt-4 w-full font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg ${
                  editingId 
                  ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-900/20" 
                  : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
                }`}
              >
                {editingId ? "Guardar Cambios" : "Agregar Transacción"}
              </button>
            </form>
          </div>

          {/* Lista de Historial */}
          <div className="lg:col-span-2 bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-neutral-800 shadow-xl">
            <h2 className="text-xl font-semibold mb-6 text-neutral-100">Historial</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-neutral-500 py-16 flex flex-col items-center justify-center">
                <p>No hay transacciones aún.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {transactions.map((t) => (
                  <div
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
                      <div className={`font-semibold text-xl tracking-tight ${t.type === "ingreso" ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.type === "ingreso" ? "+" : "-"}${Number(t.amount).toLocaleString("es-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      
                      {/* Acciones */}
                      <div className={`flex gap-2 transition-opacity duration-200 ${editingId === t.id ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"}`}>
                        <button
                          onClick={() => handleEditMode(t)}
                          className="p-2.5 text-neutral-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-colors active:scale-90"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-colors active:scale-90"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
