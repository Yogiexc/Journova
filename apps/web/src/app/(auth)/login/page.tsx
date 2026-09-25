"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchApi('/api/v1/auth/login', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({ email, password }),
      });
      
      if (res && res.data?.access_token) {
        await login(res.data.access_token);
        window.location.href = '/dashboard/author'; // Just a default fallback, dashboard layout can handle redirecting
      }
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-2xl font-serif font-semibold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-2">Sign in to your Journova account to manage submissions and reviews.</p>
      </div>
      
      <form className="space-y-5" onSubmit={handleLogin}>
        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
          <Input 
            type="email" 
            placeholder="author@university.edu"
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input 
            type="password" 
            placeholder="••••••••"
            className="h-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button 
          type="submit"
          className="w-full h-11 text-base mt-2"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
