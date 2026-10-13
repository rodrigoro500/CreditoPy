import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export interface AuthProfile {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "lender";
  approval_status: "pending" | "approved" | "rejected";
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, approval_status")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    setProfile(data as AuthProfile | null);
    return data as AuthProfile | null;
  }

  async function refreshProfile() {
    if (!session?.user) return;
    await loadProfile(session.user.id);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      setSession(nextSession);
      if (nextSession?.user) {
        loadProfile(nextSession.user.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile: profile ? {
        ...profile,
        full_name: typeof session?.user.user_metadata?.display_name === "string" && session.user.user_metadata.display_name.trim()
          ? session.user.user_metadata.display_name : profile.full_name
      } : null,
      loading,
      isAdmin: profile?.role === "admin" && profile.approval_status === "approved",
      signIn: async (email, password) => {
        if (!supabase) throw new Error("Supabase no esta configurado.");
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setLoading(false);
          throw error;
        }
        setSession(data.session);
        if (data.session?.user) {
          await loadProfile(data.session.user.id);
        }
        setLoading(false);
      },
      signUp: async (fullName, email, password) => {
        if (!supabase) throw new Error("Supabase no esta configurado.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        if (error) throw error;
      },
      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) throw error;
        setSession(null);
        setProfile(null);
      },
      updateDisplayName: async (name) => {
        if (!supabase || !session?.user) throw new Error("Iniciá sesión para modificar tu perfil.");
        const normalized = name.trim();
        if (normalized.length < 2 || normalized.length > 100) throw new Error("El nombre debe tener entre 2 y 100 caracteres.");
        const { data, error } = await supabase.auth.updateUser({ data: { display_name: normalized } });
        if (error) throw error;
        setSession((current) => current && data.user ? { ...current, user: data.user } : current);
      },
      refreshProfile
    }),
    [loading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
