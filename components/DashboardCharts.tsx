"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "ingreso" | "gasto";
  category: string;
  created_at: string;
};

interface DashboardChartsProps {
  transactions: Transaction[];
}

export default function DashboardCharts({ transactions }: DashboardChartsProps) {
  // Datos para PieChart: Gastos por Categoría
  const expensesByCategory = transactions
    .filter((t) => t.type === "gasto")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map((key) => ({
    name: key,
    value: expensesByCategory[key],
  }));

  // Colores neón para PieChart
  const COLORS = ["#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#8b5cf6", "#6366f1", "#3b82f6"];

  // Datos para BarChart: Ingresos vs Gastos
  const totalIncome = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const totalExpenses = transactions
    .filter((t) => t.type === "gasto")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const barData = [
    { name: "Ingresos", valor: totalIncome, fill: "#10b981" },
    { name: "Gastos", valor: totalExpenses, fill: "#f43f5e" },
  ];

  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-2">
      {/* Gráfico Circular (Gastos) */}
      <div className="bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-6 border border-neutral-800 shadow-xl h-80 flex flex-col transition-all hover:border-neutral-700">
        <h3 className="text-neutral-400 font-medium mb-2 text-center">Distribución de Gastos</h3>
        <div className="flex-grow w-full relative">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-lg" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString("es-US", { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: "rgba(23, 23, 23, 0.9)", backdropFilter: "blur(8px)", borderColor: "#404040", borderRadius: "16px", color: "#f5f5f5", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }}
                  itemStyle={{ color: "#e5e5e5", fontWeight: "bold" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-600 text-sm">No hay gastos registrados</div>
          )}
        </div>
      </div>

      {/* Gráfico de Barras (Resumen) */}
      <div className="bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-6 border border-neutral-800 shadow-xl h-80 flex flex-col transition-all hover:border-neutral-700">
        <h3 className="text-neutral-400 font-medium mb-4 text-center">Balance Mensual</h3>
        <div className="flex-grow w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
              <Tooltip 
                cursor={{ fill: '#262626', opacity: 0.5, rx: 8 }}
                formatter={(value: number) => `$${value.toLocaleString("es-US", { minimumFractionDigits: 2 })}`}
                contentStyle={{ backgroundColor: "rgba(23, 23, 23, 0.9)", backdropFilter: "blur(8px)", borderColor: "#404040", borderRadius: "16px", color: "#f5f5f5", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }}
              />
              <Bar dataKey="valor" radius={[8, 8, 8, 8]} barSize={60} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
