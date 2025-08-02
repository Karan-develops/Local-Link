"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Chrome, Loader2, MapPin } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { auth } from "@/lib/firebase/firebase";

export function AuthForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);

  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        document.cookie = `__session=${token}; path=/; secure; samesite=strict`;
      }
      toast.success("Welcome to Local Link!");
      router.push("/");
    } catch (error) {
      toast.error("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setIsLoading(true);
    try {
      if (isSignIn) {
        await signInWithEmail(email, password);
        toast.success("Signed in successfully!");
      } else {
        await signUpWithEmail(email, password);
        toast.success("Account created successfully!");
      }
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        document.cookie = `__session=${token}; path=/; secure; samesite=strict`;
      }
      router.push("/");
    } catch (error) {
      toast.error(isSignIn ? "Email sign-in failed" : "Email sign-up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to Local Link</CardTitle>
          <CardDescription>
            <span className="dark:text-gray-400">
              {isSignIn
                ? "Sign in to connect with your local community"
                : "Create an account to get started"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <Button
            onClick={handleEmailAuth}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isSignIn ? (
              "Sign in with Email"
            ) : (
              "Sign up with Email"
            )}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-gray-800 dark:text-gray-200">or</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-transparent"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>

          <div className="text-center text-sm dark:text-white text-gray-800 pt-4">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="underline ml-1 hover:cursor-pointer"
              onClick={() => setIsSignIn(!isSignIn)}
              disabled={isLoading}
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className="text-center text-sm dark:text-white text-gray-800">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
