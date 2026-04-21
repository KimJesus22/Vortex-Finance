"use client";

import React, { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { Plus, CreditCard, Calendar, ArrowRight, Wallet, Percent, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import SecureCreditReader from '@/components/SecureCreditReader';

type Debt = {
  id: string;
  name: string;
  total_amount: number;
  current_balance: number;
  interest_rate: number | null;
  due_date: string | null;
};

export default function DebtsDashboard() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Payment State
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await insforge.auth.getCurrentUser();
      if (data.user) {
        setCurrentUser(data.user);
        await fetchDebts(data.user.id);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchDebts = async (userId: string) => {
    try {
      const { data, error } = await insforge.database
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDebts(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar deudas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      const { error } = await insforge.database.from('debts').insert({
        user_id: currentUser.id,
        name,
        total_amount: parseFloat(totalAmount),
        current_balance: parseFloat(currentBalance) || parseFloat(totalAmount),
        interest_rate: interestRate ? parseFloat(interestRate) : null,
        due_date: dueDate || null
      });

      if (error) throw error;
      
      toast.success('Deuda registrada');
      setShowAddModal(false);
      setName('');
      setTotalAmount('');
      setCurrentBalance('');
      setInterestRate('');
      setDueDate('');
      fetchDebts(currentUser.id);
    } catch (err) {
      console.error(err);
      toast.error('Hubo un error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsProcessingPayment(true);
    try {
      // 1. Inserción en debt_payments
      const { error: paymentError } = await insforge.database.from('debt_payments').insert({
        debt_id: selectedDebt.id,
        amount: amount,
      });

      if (paymentError) throw paymentError;

      // 2. Actualización optimista local y en debts
      const newBalance = Math.max(0, selectedDebt.current_balance - amount);
      const { error: updateError } = await insforge.database
        .from('debts')
        .update({ current_balance: newBalance })
        .eq('id', selectedDebt.id);

      if (updateError) throw updateError;

      // Actualización instantánea del UI
      setDebts(debts.map(d => d.id === selectedDebt.id ? { ...d, current_balance: newBalance } : d));
      
      toast.success('¡Abono registrado con éxito!');
      setSelectedDebt(null);
      setPaymentAmount('');
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error al procesar el abono');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const totalGlobalDebt = debts.reduce((acc, debt) => acc + debt.current_balance, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans selection:bg-rose-500/30 relative">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header y Resumen Global */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-800/50 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent mb-2">
              Gestor de Deudas
            </h1>
            <p className="text-neutral-400">Mantén el control y libérate de tus deudas estratégicamente.</p>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 md:min-w-[250px] shadow-lg">
            <span className="text-neutral-500 text-sm font-medium uppercase tracking-wider">Deuda Global Activa</span>
            <div className="text-3xl font-black text-white mt-1">
              ${totalGlobalDebt.toLocaleString('es-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <div className="flex justify-end">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-1"
          >
            <Plus size={20} />
            Nueva Deuda
          </button>
        </div>

        {/* Secure Credit Reader (Zero-Knowledge) */}
        <SecureCreditReader />

        {/* Grid de Tarjetas de Deudas */}
        {debts.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/30 border border-neutral-800/50 rounded-3xl border-dashed">
            <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-neutral-300">¡Libre de deudas!</h3>
            <p className="text-neutral-500 mt-2">No tienes ninguna deuda registrada actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debts.map(debt => {
              const paidAmount = debt.total_amount - debt.current_balance;
              const percentage = Math.min(Math.max((paidAmount / debt.total_amount) * 100, 0), 100);
              
              return (
                <div key={debt.id} className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:border-rose-500/30 rounded-3xl p-6 transition-all duration-300 shadow-xl group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                        <CreditCard size={24} />
                      </div>
                      <h3 className="font-bold text-lg text-white">{debt.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Saldo Restante</span>
                      <div className="text-2xl font-black text-rose-400 mt-0.5">
                        ${debt.current_balance.toLocaleString('es-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-800/50">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-emerald-400 font-medium">Pagado: {percentage.toFixed(1)}%</span>
                        <span className="text-neutral-500">${paidAmount.toLocaleString('es-US', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Wallet size={14} /> Total: ${debt.total_amount.toLocaleString('es-US')}
                      </div>
                      {debt.interest_rate && (
                        <div className="flex items-center gap-1.5 text-orange-400">
                          <Percent size={14} /> {debt.interest_rate}%
                        </div>
                      )}
                    </div>
                    
                    {debt.due_date && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 pt-1">
                        <Calendar size={14} /> Vence: {new Date(debt.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedDebt(debt)}
                    className="w-full mt-6 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-neutral-800"
                  >
                    Abonar a cuenta <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Agregar Deuda */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-bold text-white mb-6">Registrar Nueva Deuda</h2>
            
            <form onSubmit={handleAddDebt} className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 font-medium block mb-1">Nombre (ej. Tarjeta de Crédito)</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400 font-medium block mb-1">Monto Original</label>
                  <input type="number" step="0.01" required value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50" />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 font-medium block mb-1">Saldo Actual</label>
                  <input type="number" step="0.01" required value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50" placeholder="Opcional" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400 font-medium block mb-1">Tasa Interés (%)</label>
                  <input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50" />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 font-medium block mb-1">Fecha de Corte</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 [color-scheme:dark]" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 rounded-xl transition-colors">
                  {isSaving ? 'Guardando...' : 'Guardar Deuda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Pago Minimalista */}
      {selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Abonar a cuenta</h2>
              <p className="text-sm text-neutral-400 font-medium">{selectedDebt.name}</p>
            </div>
            
            <form onSubmit={handlePayment} className="space-y-8">
              <div className="relative flex items-center justify-center">
                <span className="absolute left-6 text-3xl text-neutral-500 font-bold">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  required
                  autoFocus
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-950 border-2 border-neutral-800 rounded-2xl py-5 pl-14 pr-4 text-center text-4xl font-extrabold text-white focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setSelectedDebt(null); setPaymentAmount(''); }} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-4 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isProcessingPayment || !paymentAmount} className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                  {isProcessingPayment ? '...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
