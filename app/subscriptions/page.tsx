"use client";

import React, { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { Repeat, ArrowDownCircle, ArrowUpCircle, PlayCircle, Plus, Wallet, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Transaction } from '@/lib/services/transactionService';
import ReportButton from '@/components/ReportButton';

export default function SubscriptionsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<"ingreso" | "gasto">("gasto");
  const [frequency, setFrequency] = useState('mensual');

  useEffect(() => {
    const init = async () => {
      const { data } = await insforge.auth.getCurrentUser();
      if (data.user) {
        setCurrentUser(data.user);
        await fetchSubscriptions(data.user.id);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchSubscriptions = async (userId: string) => {
    try {
      const { data, error } = await insforge.database
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_recurring', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data as Transaction[] || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMonthlyCharges = async () => {
    if (!currentUser || subscriptions.length === 0) return;
    setIsProcessing(true);

    try {
      const monthlySubs = subscriptions.filter(s => s.frequency === 'mensual');
      
      if (monthlySubs.length === 0) {
        toast.info('No tienes cobros recurrentes mensuales configurados');
        setIsProcessing(false);
        return;
      }

      // Preparar bulk insert desactivando la bandera recurrente (son instancias ejecutadas)
      const inserts = monthlySubs.map(sub => ({
        user_id: currentUser.id,
        amount: sub.amount,
        type: sub.type,
        category: sub.category,
        is_recurring: false,
        frequency: null
      }));

      const { error } = await insforge.database.from('transactions').insert(inserts);

      if (error) throw error;

      toast.success(`Se aplicaron ${inserts.length} cobros fijos al mes actual`);
    } catch (err) {
      console.error(err);
      toast.error('Hubo un error al aplicar cobros');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !amount || !category) return;

    try {
      const { error } = await insforge.database.from('transactions').insert({
        user_id: currentUser.id,
        amount: parseFloat(amount),
        type,
        category,
        is_recurring: true,
        frequency
      });

      if (error) throw error;

      toast.success('Transacción recurrente guardada');
      setShowAddModal(false);
      setAmount('');
      setCategory('');
      fetchSubscriptions(currentUser.id);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await insforge.database.from('transactions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Suscripción eliminada');
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar');
    }
  };

  const ingresosFijos = subscriptions.filter(s => s.type === 'ingreso');
  const gastosFijos = subscriptions.filter(s => s.type === 'gasto');

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-800/50 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Repeat className="text-indigo-400" size={40} />
              Recurrentes
            </h1>
            <p className="text-neutral-400">Tus suscripciones y cobros automáticos en piloto automático.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleApplyMonthlyCharges}
              disabled={isProcessing || subscriptions.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PlayCircle size={20} />
              )}
              Aplicar cobros del mes
            </button>

            <ReportButton 
              transactions={subscriptions} 
              userName={currentUser?.profile?.name || currentUser?.email?.split('@')[0]} 
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-indigo-400 font-semibold py-2.5 px-5 rounded-xl border border-neutral-800 transition-colors"
          >
            <Plus size={18} /> Nueva Recurrencia
          </button>
        </div>

        {/* Listados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Gastos Fijos */}
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <ArrowDownCircle className="text-rose-500" />
              Gastos Fijos (Suscripciones)
            </h2>
            
            {gastosFijos.length === 0 ? (
              <div className="text-center py-10 bg-neutral-950/50 rounded-2xl border border-dashed border-neutral-800 text-neutral-500">
                <Wallet className="mx-auto mb-3 opacity-30" size={32} />
                No tienes gastos recurrentes
              </div>
            ) : (
              <div className="space-y-4">
                {gastosFijos.map(sub => (
                  <div key={sub.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between group hover:border-rose-500/30 transition-colors">
                    <div>
                      <h4 className="font-semibold text-neutral-200">{sub.category}</h4>
                      <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md mt-1 inline-block capitalize">
                        {sub.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-rose-400 text-lg privacy-blur">${sub.amount.toLocaleString('es-US', { minimumFractionDigits: 2 })}</span>
                      <button onClick={() => deleteSubscription(sub.id)} className="text-neutral-600 hover:text-rose-500 transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ingresos Fijos */}
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <ArrowUpCircle className="text-emerald-500" />
              Ingresos Fijos (Nómina, Rentas)
            </h2>
            
            {ingresosFijos.length === 0 ? (
              <div className="text-center py-10 bg-neutral-950/50 rounded-2xl border border-dashed border-neutral-800 text-neutral-500">
                <Wallet className="mx-auto mb-3 opacity-30" size={32} />
                No tienes ingresos recurrentes
              </div>
            ) : (
              <div className="space-y-4">
                {ingresosFijos.map(sub => (
                  <div key={sub.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                    <div>
                      <h4 className="font-semibold text-neutral-200">{sub.category}</h4>
                      <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md mt-1 inline-block capitalize">
                        {sub.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-emerald-400 text-lg privacy-blur">${sub.amount.toLocaleString('es-US', { minimumFractionDigits: 2 })}</span>
                      <button onClick={() => deleteSubscription(sub.id)} className="text-neutral-600 hover:text-rose-500 transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal Add Recurrencia */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-8">
            <h2 className="text-xl font-bold text-white mb-6">Nueva Transacción Recurrente</h2>
            
            <form onSubmit={handleAddSubscription} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                <button type="button" onClick={() => setType('gasto')} className={`py-2 text-sm font-medium rounded-lg transition-all ${type === 'gasto' ? 'bg-rose-500 text-white' : 'text-neutral-400 hover:text-white'}`}>Gasto Fijo</button>
                <button type="button" onClick={() => setType('ingreso')} className={`py-2 text-sm font-medium rounded-lg transition-all ${type === 'ingreso' ? 'bg-emerald-500 text-white' : 'text-neutral-400 hover:text-white'}`}>Ingreso Fijo</button>
              </div>

              <div>
                <label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold block mb-1">Monto</label>
                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50" placeholder="0.00" />
              </div>
              
              <div>
                <label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold block mb-1">Concepto</label>
                <input type="text" required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50" placeholder="Netflix, Gimnasio, Nómina..." />
              </div>

              <div>
                <label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold block mb-1">Frecuencia</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 appearance-none">
                  <option value="mensual">Mensual</option>
                  <option value="semanal">Semanal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
