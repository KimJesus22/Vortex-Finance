"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Lock, LogOut, ArrowLeft, User } from "lucide-react";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (!data.user || error) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await insforge.auth.signOut();
    router.push("/login");
  };

  const handlePasswordResetRequest = async () => {
    setStatusMsg({ type: "", text: "" });
    setIsUpdating(true);
    
    const { error } = await insforge.auth.sendResetPasswordEmail({
      email: user.email,
      redirectTo: window.location.origin + "/reset-password",
    });
    
    if (error) {
      setStatusMsg({ type: "error", text: error.message || "Error al solicitar el cambio de contraseña." });
    } else {
      setStatusMsg({ type: "success", text: "Te hemos enviado un correo con las instrucciones para restablecer tu contraseña." });
    }
    
    setIsUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Cabecera y Navegación */}
        <div className="flex justify-between items-center px-2">
          <Link href="/" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-emerald-400 transition-colors bg-neutral-900/50 hover:bg-neutral-800 py-2 px-4 rounded-full border border-neutral-800">
            <ArrowLeft size={16} />
            <span>Volver</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-rose-400 transition-colors bg-neutral-900/50 hover:bg-neutral-800 py-2 px-4 rounded-full border border-neutral-800"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        {/* Tarjeta de Perfil General */}
        <div className="bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-8 border border-neutral-800 shadow-2xl mt-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center border-2 border-emerald-500/30 text-emerald-500">
              <User size={48} />
            </div>
            <div className="flex flex-col text-center md:text-left pt-2">
              <h1 className="text-3xl font-bold text-neutral-100 mb-2">Tu Perfil</h1>
              <div className="bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-400 select-all">
                {user?.email}
              </div>
              {user?.profile?.name && (
                <p className="text-neutral-500 mt-2">Usuario: {user.profile.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Seguridad: Cambiar Contraseña */}
        <div className="bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-8 border border-neutral-800 shadow-xl relative mt-2">
          <h2 className="text-xl font-semibold mb-6 text-neutral-100 flex items-center gap-2">
            <Lock size={20} className="text-emerald-500" />
            Seguridad
          </h2>

          {statusMsg.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm text-center border ${
              statusMsg.type === "error" 
                ? "bg-rose-500/10 border-rose-500/50 text-rose-400" 
                : "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
            }`}>
              {statusMsg.text}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <p className="text-sm text-neutral-400 mb-2">Para proteger tu cuenta, los cambios de contraseña requieren verificación por correo electrónico.</p>
            <button
              onClick={handlePasswordResetRequest}
              disabled={isUpdating}
              className="mt-2 w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isUpdating ? "Enviando..." : "Solicitar Cambio de Contraseña"}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
