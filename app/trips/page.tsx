"use client";

import React, { useState, useMemo } from 'react';

type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
};

type Participant = {
  id: string;
  name: string;
};

export default function TripsPage() {
  const [tripName, setTripName] = useState('');
  const [numParticipants, setNumParticipants] = useState(1);
  
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Participante 1' },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expensePayer, setExpensePayer] = useState<string>('1');

  const handleNumParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let num = parseInt(e.target.value);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 20) num = 20; // limit
    
    setNumParticipants(num);
    const newParticipants = Array.from({ length: num }, (_, i) => ({
      id: String(i + 1),
      name: `Persona ${i + 1}`,
    }));
    setParticipants(newParticipants);
    
    if (!newParticipants.find(p => p.id === expensePayer)) {
        setExpensePayer(newParticipants[0]?.id || '');
    }
  };

  const updateParticipantName = (id: string, name: string) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name } : p));
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || expenseAmount === '' || expenseAmount <= 0 || !expensePayer) return;

    setExpenses([
      ...expenses,
      {
        id: crypto.randomUUID(),
        description: expenseDesc,
        amount: Number(expenseAmount),
        paidBy: expensePayer,
      },
    ]);
    setExpenseDesc('');
    setExpenseAmount('');
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalTripCost = useMemo(() => expenses.reduce((acc, exp) => acc + exp.amount, 0), [expenses]);
  
  const transactions = useMemo(() => {
    if (participants.length === 0 || expenses.length === 0) return [];
    
    const costPerPerson = totalTripCost / participants.length;
    const balancesRecord: Record<string, number> = {};
    
    participants.forEach(p => {
        balancesRecord[p.id] = 0;
    });

    expenses.forEach(exp => {
        if (balancesRecord[exp.paidBy] !== undefined) {
            balancesRecord[exp.paidBy] += exp.amount;
        }
    });

    participants.forEach(p => {
        balancesRecord[p.id] -= costPerPerson;
    });

    const debtors = participants
        .map(p => ({ id: p.id, name: p.name, balance: balancesRecord[p.id] }))
        .filter(p => p.balance < -0.01)
        .sort((a, b) => a.balance - b.balance);
        
    const creditors = participants
        .map(p => ({ id: p.id, name: p.name, balance: balancesRecord[p.id] }))
        .filter(p => p.balance > 0.01)
        .sort((a, b) => b.balance - a.balance);

    const results: { from: string; to: string; amount: number }[] = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        
        const amount = Math.min(-debtor.balance, creditor.balance);
        
        results.push({
            from: debtor.name,
            to: creditor.name,
            amount: Number(amount.toFixed(2))
        });

        debtor.balance += amount;
        creditor.balance -= amount;

        if (debtor.balance >= -0.01) i++;
        if (creditor.balance <= 0.01) j++;
    }

    return results;

  }, [expenses, participants, totalTripCost]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Viajes Compartidos
          </h1>
          <p className="text-neutral-400 text-lg">Divide los gastos de tu aventura sin complicaciones.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Controls - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Trip Config Card */}
            <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-neutral-700">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg">🚀</span>
                Detalles del Viaje
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-400">Nombre del Viaje</label>
                  <input 
                    type="text" 
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    placeholder="Ej. Concierto CDMX"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-400">Participantes</label>
                  <input 
                    type="number" 
                    min="1"
                    max="20"
                    value={numParticipants}
                    onChange={handleNumParticipantsChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-800/50">
                <label className="text-sm font-medium text-neutral-400 mb-2 block">Nombres (Opcional)</label>
                <div className="flex flex-wrap gap-2">
                    {participants.map(p => (
                        <input
                            key={p.id}
                            type="text"
                            value={p.name}
                            onChange={(e) => updateParticipantName(p.id, e.target.value)}
                            className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28 sm:w-32"
                        />
                    ))}
                </div>
              </div>
            </div>

            {/* Add Expense Form */}
            <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-neutral-700">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <span className="bg-cyan-500/10 text-cyan-400 p-2 rounded-lg">💸</span>
                Registrar Gasto
              </h2>
              
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-400">Concepto</label>
                    <input 
                      type="text" 
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="Ej. Transporte, Hospedaje..."
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-400">Monto ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value !== '' ? Number(e.target.value) : '')}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-400">¿Quién pagó?</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {participants.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setExpensePayer(p.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                          expensePayer === p.id 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50' 
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Agregar Gasto
                </button>
              </form>
            </div>

            {/* Expenses List */}
            {expenses.length > 0 && (
              <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-neutral-300 mb-4">Historial de Gastos</h3>
                <div className="space-y-3">
                  {expenses.map((exp) => {
                    const payer = participants.find(p => p.id === exp.paidBy)?.name || 'Desconocido';
                    return (
                      <div key={exp.id} className="flex items-center justify-between group p-3 rounded-xl hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-700/50">
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-200">{exp.description}</span>
                          <span className="text-xs text-neutral-500">Pagado por {payer}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-emerald-400">${exp.amount.toFixed(2)}</span>
                          <button 
                            onClick={() => deleteExpense(exp.id)}
                            className="text-neutral-600 hover:text-red-400 transition-colors p-1"
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Resumen - Right Column */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl sticky top-8">
              <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                <span className="bg-purple-500/10 text-purple-400 p-2 rounded-lg">📊</span>
                Resumen
              </h2>
              
              <div className="mb-6 pb-6 border-b border-neutral-800/50 text-center">
                <p className="text-neutral-400 text-sm mb-1">Costo Total del Viaje</p>
                <p className="text-4xl font-bold text-white tracking-tight">${totalTripCost.toFixed(2)}</p>
                <p className="text-neutral-500 text-sm mt-2">
                  ${(totalTripCost / (participants.length || 1)).toFixed(2)} por persona
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Saldos Finales</h3>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm bg-neutral-900/50 rounded-xl border border-neutral-800/50 dashed">
                    Agrega gastos para ver quién debe a quién
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx, idx) => (
                      <div key={idx} className="bg-neutral-800/30 border border-neutral-700/50 rounded-xl p-4 flex items-center justify-between transition-all hover:bg-neutral-800/50">
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-200 text-sm">{tx.from}</span>
                          <span className="text-xs text-neutral-500">le debe a <span className="text-neutral-300">{tx.to}</span></span>
                        </div>
                        <span className="font-bold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg text-sm">
                          ${tx.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
