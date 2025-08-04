"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { setFirebaseSessionCookie } from "@/utils/setSessionCookie";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

let confirmationResultGlobal: any = null;

const syncUserWithDatabase = async (user: User) => {
  const token = await user.getIdToken?.();
  if (!token) return;

  try {
    await fetch("/api/create-user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error syncing user to database:", error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await syncUserWithDatabase(result.user);
    await setFirebaseSessionCookie();
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await syncUserWithDatabase(result.user);
    await setFirebaseSessionCookie();
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await syncUserWithDatabase(result.user);
    await setFirebaseSessionCookie();
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
