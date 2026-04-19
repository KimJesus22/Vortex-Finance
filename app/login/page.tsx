"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isLogin) {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message || "Error al iniciar sesión");
      } else if (data?.accessToken) {
        router.push("/");
      }
    } else {
      const { data, error } = await insforge.auth.signUp({ email, password, name });
      if (error) {
        setErrorMsg(error.message || "Error al registrarse");
      } else if (data?.requireEmailVerification) {
        setErrorMsg("Por favor, verifica tu correo antes de iniciar sesión.");
      } else if (data?.accessToken) {
        router.push("/");
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-md bg-neutral-900/50 backdrop-blur-xl rounded-3xl p-8 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <h1 className="text-3xl font-bold text-center mb-2 relative z-10 text-neutral-100">Vortex Finance</h1>
        <p className="text-neutral-400 text-center mb-8 relative z-10">
          {isLogin ? "Inicia sesión en tu cuenta" : "Crea tu cuenta familiar"}
        </p>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-xl mb-6 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 placeholder:text-neutral-600"
                placeholder="Tu nombre"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 placeholder:text-neutral-600"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-neutral-100 placeholder:text-neutral-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Cargando..." : isLogin ? "Ingresar" : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400 relative z-10">
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </button>
        </div>
      </div>
    </main>
  );
}
