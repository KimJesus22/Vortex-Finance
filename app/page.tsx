"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

import DashboardCharts from "@/components/DashboardCharts";
import SmartInput from "@/components/SmartInput";
import FloatingAdvisor from "@/components/FloatingAdvisor";
import TransactionForm from "@/components/TransactionForm";
import TransactionHistory from "@/components/TransactionHistory";
import SavingsGoal from "@/components/SavingsGoal";
import { TransactionService, Transaction } from "@/lib/services/transactionService";

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "ingreso" | "gasto">("todos");
  const [filterMonth, setFilterMonth] = useState<string>("todos");

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await insforge.auth.getCurrentUser();
      if (data.user) {
        setCurrentUser(data.user);
        
        // Ensure user exists in public.users table to satisfy foreign key constraints
        const { data: existingUsers } = await insforge.database
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .limit(1);
          
        if (!existingUsers || existingUsers.length === 0) {
          const { error: insertErr } = await insforge.database.from("users").insert({
            id: data.user.id,
            email: data.user.email,
          });
          if (insertErr) console.error("Error sincando usuario:", insertErr);
        }

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
    try {
      const data = await TransactionService.fetchTransactions(userId);
      setTransactions(data);
    } catch (error: any) {
      console.error(error);
      toast.error("Error cargando transacciones");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await insforge.auth.signOut();
    router.push("/login");
  };

  const handleSaveTransaction = async (data: { amount: number; type: "ingreso" | "gasto"; category: string }) => {
    if (!currentUser) return;
    
    try {
      if (editingTransaction) {
        await TransactionService.updateTransaction(editingTransaction.id, currentUser.id, data);
        setEditingTransaction(null);
        toast.success("Transacción actualizada exitosamente");
      } else {
        await TransactionService.createTransaction({
          user_id: currentUser.id,
          ...data,
        });
        toast.success("Transacción guardada exitosamente");
      }
      fetchTransactions(currentUser.id);
    } catch (error: any) {
      console.error(error);
      toast.error("Error guardando la transacción.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!currentUser || !confirm("¿Estás seguro de eliminar esta transacción?")) return;

    try {
      await TransactionService.deleteTransaction(id, currentUser.id);
      fetchTransactions(currentUser.id);
      toast.success("Transacción eliminada");
    } catch (error: any) {
      console.error(error);
      toast.error("Error eliminando la transacción.");
    }
  };

  // Derived state for filtering
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "todos" ? true : t.type === filterType;
    const transactionMonth = new Date(t.created_at).getMonth().toString();
    const matchesMonth = filterMonth === "todos" ? true : transactionMonth === filterMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  const currentBalance = filteredTransactions.reduce((acc, curr) => {
    return curr.type === "ingreso" ? acc + Number(curr.amount) : acc - Number(curr.amount);
  }, 0);

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
          <div className="flex items-center gap-3 text-neutral-400 text-sm">
            <Link href="/profile" className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-full border border-emerald-500/20 transition-colors" title="Ver Perfil">
              <User size={18} />
            </Link>
            <span>Hola, <span className="text-neutral-100 font-medium">{currentUser?.profile?.name || currentUser?.email}</span></span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-rose-400 transition-colors bg-neutral-900/50 hover:bg-neutral-800 py-2 px-4 rounded-full border border-neutral-800"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        {/* Panel Superior: Balance Total Dinámico */}
        <div className="bg-neutral-900 rounded-3xl p-8 md:p-10 border border-neutral-800 shadow-2xl text-center relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h1 className="text-lg md:text-xl text-neutral-400 font-medium mb-3 relative z-10">
            {searchQuery || filterType !== "todos" || filterMonth !== "todos" ? "Balance de Selección" : "Balance Total"}
          </h1>
          <p className={`text-6xl md:text-7xl font-bold tracking-tight relative z-10 transition-colors duration-500 ${currentBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            ${currentBalance.toLocaleString("es-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <SavingsGoal currentBalance={currentBalance} />

        {/* Input Inteligente impulsado por LM Studio */}
        <SmartInput currentUser={currentUser} onTransactionAdded={() => currentUser && fetchTransactions(currentUser.id)} />

        <DashboardCharts transactions={filteredTransactions} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
          
          <TransactionForm 
            editingTransaction={editingTransaction}
            onSave={handleSaveTransaction}
            onCancel={() => setEditingTransaction(null)}
          />

          <TransactionHistory 
            transactions={transactions}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            editingId={editingTransaction?.id || null}
            onEdit={setEditingTransaction}
            onDelete={handleDeleteTransaction}
          />

        </div>
      </div>
      
      {/* Botón y Chat Flotante del Asesor */}
      <FloatingAdvisor currentUser={currentUser} />
    </main>
  );
}
