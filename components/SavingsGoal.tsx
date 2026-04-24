"use client";

import React, { useState, useEffect } from 'react';
import { Target, CalendarDays } from 'lucide-react';

interface SavingsGoalProps {
  currentBalance: number;
}

export default function SavingsGoal({ currentBalance }: SavingsGoalProps) {
  const [goalAmount, setGoalAmount] = useState<number>(5000);
  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    // Current date logic
    const today = new Date();
    // Target: May 7th
    let targetYear = today.getFullYear();
    const targetDateThisYear = new Date(targetYear, 4, 7); // Month is 0-indexed, so 4 is May
    
    // If today is past May 7th of the current year, target next year's May 7th
    // We compare with targetDateThisYear + 1 day to allow May 7 itself to be 0 days
    if (today.getTime() > targetDateThisYear.getTime() + 86400000) {
      targetYear++;
    }
    
    const finalTargetDate = new Date(targetYear, 4, 7);
    
    // Calculate difference in days
    // Setting hours to 0 to make day calculation exact
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetMidnight = new Date(finalTargetDate.getFullYear(), finalTargetDate.getMonth(), finalTargetDate.getDate());
    
    const diffTime = targetMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysLeft(diffDays >= 0 ? diffDays : 0);
  }, []);

  const progressPercentage = Math.min(Math.max((currentBalance / goalAmount) * 100, 0), 100);

  return (
    <div className="bg-neutral-900/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-neutral-800 shadow-xl transition-all duration-300 hover:border-neutral-700 relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-500"></div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 text-cyan-400 p-3 rounded-2xl shadow-inner">
            <Target size={28} />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg md:text-xl tracking-tight">Meta de Viaje</h2>
            <div className="flex items-center gap-1.5 text-neutral-400 text-sm mt-1">
              <CalendarDays size={14} />
              <span>7 de Mayo — Faltan <strong className="text-cyan-400 font-bold">{daysLeft}</strong> días</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-neutral-950/50 p-2 pl-4 rounded-2xl border border-neutral-800/50">
          <span className="text-sm font-medium text-neutral-500">Meta:</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
            <input 
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(Number(e.target.value) || 0)}
              className="bg-neutral-900 border border-neutral-700 rounded-xl py-2 pl-8 pr-3 w-32 text-right text-white font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-neutral-400">Progreso actual</span>
          <span className="text-cyan-400 font-bold text-lg privacy-blur">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
          </div>
        </div>
        <div className="text-right text-xs text-neutral-500 font-medium privacy-blur">
          ${Math.max(currentBalance, 0).toLocaleString()} / ${goalAmount.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
