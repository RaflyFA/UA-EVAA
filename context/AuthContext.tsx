"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export interface UserProfile {
  id: string;
  nama_lengkap: string;
  role: "guru" | "siswa";
  kelas?: string | null;
  nomor_induk?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfileManually: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  setProfileManually: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data && !error) {
        setProfile(data as UserProfile);
      } else {
        // Fallback jika profile belum terbentuk di tabel
        console.warn("Profile not found for user:", userId, error);
        const targetUser = currentUser || user;
        if (targetUser?.user_metadata?.role) {
          setProfile({
            id: userId,
            nama_lengkap:
              targetUser.user_metadata.nama_lengkap ||
              targetUser.email?.split("@")[0] ||
              "Pengguna",
            role: targetUser.user_metadata.role,
            kelas: targetUser.user_metadata.kelas || null,
            nomor_induk: targetUser.user_metadata.nomor_induk || null,
            avatar_url: targetUser.user_metadata.avatar_url || null,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      const targetUser = currentUser || user;
      if (targetUser?.user_metadata?.role) {
        setProfile({
          id: userId,
          nama_lengkap:
            targetUser.user_metadata.nama_lengkap ||
            targetUser.email?.split("@")[0] ||
            "Pengguna",
          role: targetUser.user_metadata.role,
          kelas: targetUser.user_metadata.kelas || null,
          nomor_induk: targetUser.user_metadata.nomor_induk || null,
          avatar_url: targetUser.user_metadata.avatar_url || null,
        });
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  useEffect(() => {
    // 1. Ambil sesi awal
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Pre-populate instan dari user_metadata jika ada
          if (session.user.user_metadata?.role) {
            setProfile({
              id: session.user.id,
              nama_lengkap:
                session.user.user_metadata.nama_lengkap ||
                session.user.email?.split("@")[0] ||
                "Pengguna",
              role: session.user.user_metadata.role,
              kelas: session.user.user_metadata.kelas || null,
              nomor_induk: session.user.user_metadata.nomor_induk || null,
              avatar_url: session.user.user_metadata.avatar_url || null,
            });
          }
          await fetchProfile(session.user.id, session.user);
        }
      } catch (err) {
        console.error("Error getting session:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // 2. Langganan perubahan status auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          if (session.user.user_metadata?.role) {
            setProfile({
              id: session.user.id,
              nama_lengkap:
                session.user.user_metadata.nama_lengkap ||
                session.user.email?.split("@")[0] ||
                "Pengguna",
              role: session.user.user_metadata.role,
              kelas: session.user.user_metadata.kelas || null,
              nomor_induk: session.user.user_metadata.nomor_induk || null,
              avatar_url: session.user.user_metadata.avatar_url || null,
            });
          }
          await fetchProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const setProfileManually = (customProfile: UserProfile | null) => {
    setProfile(customProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
        setProfileManually,
      }}
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
