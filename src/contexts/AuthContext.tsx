"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "super_admin" | "kepala_lab" | "peserta";

export interface AuthUser {
  id: string;
  nup: string;
  name: string;
  email?: string | null;
  role: UserRole;
  lab_id?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (nup: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Ambil sesi login dari localStorage
    const savedUser = localStorage.getItem("inventorium_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem("inventorium_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    nupInput: string,
    passwordInput: string,
  ): Promise<AuthUser> => {
    setIsLoading(true);

    try {
      const cleanNup = nupInput.trim();
      const cleanPassword = passwordInput.trim();

      if (!cleanNup || !cleanPassword) {
        throw new Error("NUP dan Password wajib diisi");
      }

      // 1. Cek langsung ke database Supabase (Strict Check)
      const { data, error } = await supabase
        .from("participant_accounts")
        .select("*")
        .eq("nup", cleanNup)
        .eq("password", cleanPassword)
        .maybeSingle();

      // Jika query error atau data tidak ditemukan di tabel
      if (error || !data) {
        throw new Error("NUP atau Password salah. Akun tidak terdaftar.");
      }

      // 2. Jika ditemukan, set data user resmi
      const authenticatedUser: AuthUser = {
        id: data.id,
        nup: data.nup,
        name: data.name,
        email: data.email || null,
        role: "peserta",
        lab_id: data.lab_id || null,
      };

      setUser(authenticatedUser);
      localStorage.setItem(
        "inventorium_user",
        JSON.stringify(authenticatedUser),
      );
      setIsLoading(false);
      return authenticatedUser;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("inventorium_user");
    window.location.href = "/login";
  };

  const hasPermission = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
