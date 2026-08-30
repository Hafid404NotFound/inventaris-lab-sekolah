"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LogIn, School, KeyRound, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [nup, setNup] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const loggedUser = await login(nup, password);
      if (loggedUser.lab_id) {
        router.push(`/ruangan?lab_id=${loggedUser.lab_id}`);
      } else {
        router.push("/ruangan");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "NUP atau Password salah. Silakan periksa kembali.",
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 overflow-hidden">
      {/* Background Image dengan Cover Penuh */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000"
        style={{ backgroundImage: "url('/bg-login.png')" }}
      />

      {/* Dark Overlay Gradient untuk Meningkatkan Kontras & Keterbacaan */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/75 to-emerald-950/80 backdrop-blur-[2px]" />

      {/* Card Form Glassmorphism */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 sm:p-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100/90 text-emerald-700 rounded-2xl mb-4 shadow-sm ring-4 ring-emerald-50">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Inventorium
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
            Portal Inventaris Laboratorium Berbasis Peserta
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nomor Urut Peserta (NUP)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={nup}
                onChange={(e) => setNup(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800 placeholder-slate-400 text-sm font-medium"
                placeholder="Masukkan NUP (contoh: 44008)"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800 placeholder-slate-400 text-sm font-mono"
                placeholder="Masukkan password"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Gunakan NUP dan kata sandi resmi yang telah diberikan.
              </span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}
          </button>
        </form>

        {/* Footer Sub-Info */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Hak Cipta © 2026 Inventorium Laboratorium.
          </p>
        </div>
      </div>
    </div>
  );
}
