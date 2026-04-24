"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plane, CreditCard, Calendar, User, Eye, EyeOff } from "lucide-react";
import { usePrivacy } from "@/components/PrivacyProvider";

const navItems = [
  { name: "Inicio", path: "/", icon: Home },
  { name: "Viajes", path: "/trips", icon: Plane },
  { name: "Deudas", path: "/debts", icon: CreditCard },
  { name: "Fijos", path: "/subscriptions", icon: Calendar },
  { name: "Perfil", path: "/profile", icon: User },
];

export default function Navigation() {
  const { isPrivate, togglePrivacy } = usePrivacy();
  const pathname = usePathname();

  // No mostrar la navegación en pantallas de autenticación
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? "text-emerald-400" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <div className={`p-1 rounded-full transition-all duration-300 ${isActive ? "bg-emerald-400/10 scale-110" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-neutral-950/90 backdrop-blur-xl border-r border-neutral-800 z-50">
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
            Vortex.
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-medium tracking-widest uppercase">Finance</p>
        </div>
        
        <div className="flex flex-col flex-1 px-4 space-y-2 mt-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-400 font-bold shadow-[inset_4px_0_0_0_rgba(52,211,153,1)]" 
                    : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200 font-medium"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="p-6 mt-auto space-y-4">
          <button
            onClick={togglePrivacy}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
              isPrivate 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10" 
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
            }`}
          >
            {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="text-sm font-medium">{isPrivate ? "Privacidad ON" : "Privacidad OFF"}</span>
          </button>

          <div className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/50 text-center">
            <p className="text-xs text-neutral-500 font-medium">Vortex Finance v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
