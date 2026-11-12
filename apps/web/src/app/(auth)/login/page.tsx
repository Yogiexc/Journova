"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth, getDefaultDashboardUrl } from "@/contexts/AuthContext";
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
        const fetchedUser = await login(res.data.access_token);
        const roles = fetchedUser?.roles || [];
        window.location.href = getDefaultDashboardUrl(roles);
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

      {/* Demo Credentials Helper Pill */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            Quick Demo Login
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Password: Password123!</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Editor', email: 'editor@test.com' },
            { label: 'Reviewer', email: 'reviewer@test.com' },
            { label: 'Author', email: 'author@test.com' },
            { label: 'Admin', email: 'admin@journova.com' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setEmail(item.email);
                setPassword('Password123!');
              }}
              className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-slate-700 dark:text-slate-300"
            >
              <div className="font-medium text-[11px] text-slate-900 dark:text-white">{item.label}</div>
              <div className="text-[10px] text-slate-500 truncate">{item.email}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
