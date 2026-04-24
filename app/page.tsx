"use client";

import { useEffect, useState, useMemo } from "react";
import { insforge } from "@/lib/insforge";
import { LogOut, User, Flame, Plane, CreditCard, Calendar, ChevronRight, Eye, EyeOff } from "lucide-react";
import { usePrivacy } from "@/components/PrivacyProvider";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

import DashboardCharts from "@/components/DashboardCharts";
import SmartInput from "@/components/SmartInput";
import FloatingAdvisor from "@/components/FloatingAdvisor";
import TransactionForm from "@/components/TransactionForm";
import TransactionHistory from "@/components/TransactionHistory";
import SavingsGoal from "@/components/SavingsGoal";
import QuickActions from "@/components/QuickActions";
import { TransactionService, Transaction } from "@/lib/services/transactionService";
import { BalanceSkeleton, ChartSkeleton } from "@/components/Skeleton";
import { vortexCache } from "@/lib/cache";

export default function Dashboard() {
  const { isPrivate, togglePrivacy } = usePrivacy();
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
    // 1. Try to load from cache first for instant UI
    const cachedData = vortexCache.get<Transaction[]>(`transactions_${userId}`);
    if (cachedData) {
      setTransactions(cachedData);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const data = await TransactionService.fetchTransactions(userId);
      setTransactions(data);
      // 2. Save to cache for next time
      vortexCache.set(`transactions_${userId}`, data);
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

  // Sistema de Rachas (Streaks)
  const streakDays = useMemo(() => {
    if (transactions.length === 0) return 0;
    
    // Obtener fechas locales sin hora, formato YYYY-MM-DD
    const uniqueDatesStr = Array.from(new Set(transactions.map(t => {
      const d = new Date(t.created_at);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))).sort((a, b) => b.localeCompare(a));
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const firstDate = new Date(uniqueDatesStr[0] + "T00:00:00");
    const diffTime = today.getTime() - firstDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    
    if (diffDays > 1) return 0; // Streak perdida
    
    let expectedDate = firstDate;
    for (const dateStr of uniqueDatesStr) {
      const date = new Date(dateStr + "T00:00:00");
      if (date.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, [transactions]);

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-neutral-400 text-sm">
              <Link href="/profile" className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-full border border-emerald-500/20 transition-colors" title="Ver Perfil">
                <User size={18} />
              </Link>
              <span className="hidden sm:inline">Hola, <span className="text-neutral-100 font-medium">{currentUser?.profile?.name || currentUser?.email?.split('@')[0]}</span></span>
            </div>

            {/* Privacy Toggle */}
            <button
              onClick={togglePrivacy}
              className={`p-2 rounded-full border transition-all duration-300 ${
                isPrivate 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10" 
                  : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
              }`}
              title={isPrivate ? "Desactivar Modo Privacidad" : "Activar Modo Privacidad"}
            >
              {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {/* Widget de Racha (Streak) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={streakDays}
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-lg ${
                  streakDays > 0 
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-orange-500/10" 
                    : "bg-neutral-900 border-neutral-800 text-neutral-500"
                }`}
                title="Días consecutivos registrando transacciones"
              >
                <motion.div
                  animate={streakDays > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                >
                  <Flame size={16} className={streakDays > 0 ? "fill-orange-400/50" : ""} />
                </motion.div>
                <span className="text-sm font-bold">{streakDays} <span className="hidden sm:inline">Días</span></span>
              </motion.div>
            </AnimatePresence>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-rose-400 transition-colors bg-neutral-900/50 hover:bg-neutral-800 py-2 px-4 rounded-full border border-neutral-800"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>

        {/* Panel Superior: Balance Total Dinámico */}
        {loading ? (
          <BalanceSkeleton />
        ) : (
          <div className="bg-neutral-900 rounded-3xl p-8 md:p-10 border border-neutral-800 shadow-2xl text-center relative overflow-hidden group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h1 className="text-lg md:text-xl text-neutral-400 font-medium mb-3 relative z-10">
              {searchQuery || filterType !== "todos" || filterMonth !== "todos" ? "Balance de Selección" : "Balance Total"}
            </h1>
            <p className={`text-6xl md:text-7xl font-bold tracking-tight relative z-10 transition-colors duration-500 privacy-blur ${currentBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              ${currentBalance.toLocaleString("es-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}

        <QuickActions onQuickSave={handleSaveTransaction} />

        <SavingsGoal currentBalance={currentBalance} />

        {/* Input Inteligente impulsado por LM Studio */}
        <SmartInput currentUser={currentUser} onTransactionAdded={() => currentUser && fetchTransactions(currentUser.id)} />

        {loading ? (
          <ChartSkeleton />
        ) : (
          <DashboardCharts transactions={filteredTransactions} />
        )}

        {/* Explorar Módulos */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2 px-1">
            Explorar Módulos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link href="/trips" className="bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plane size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Viajes Compartidos
                <ChevronRight size={18} className="text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Divide gastos de viaje con amigos equitativamente.</p>
            </Link>

            <Link href="/debts" className="bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-rose-500/50 rounded-3xl p-6 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Control de Deudas
                <ChevronRight size={18} className="text-neutral-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Registra y liquida préstamos o tarjetas paso a paso.</p>
            </Link>

            <Link href="/subscriptions" className="bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 group shadow-xl">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Gastos Fijos
                <ChevronRight size={18} className="text-neutral-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Aplica nóminas o suscripciones recurrentes al instante.</p>
            </Link>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          
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
            userName={currentUser?.profile?.name || currentUser?.email?.split('@')[0]}
          />

        </div>
      </div>
      
      {/* Botón y Chat Flotante del Asesor */}
      <FloatingAdvisor currentUser={currentUser} />
    </main>
  );
}
