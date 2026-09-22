"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api-client";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchApi('/api/v1/auth/register', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({ 
          name: `${firstName} ${lastName}`.trim(), 
          email, 
          password 
        }),
      });
      
      if (res && res.data?.access_token) {
        await login(res.data.access_token);
        window.location.href = '/dashboard/author';
      }
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-2xl font-serif font-semibold text-slate-900 dark:text-white tracking-tight">Create an account</h1>
        <p className="text-sm text-slate-500 mt-2">Join the Journova academic community.</p>
      </div>
      
      <form className="space-y-4" onSubmit={handleRegister}>
        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
            <Input type="text" placeholder="Sarah" className="h-11" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
            <Input type="text" placeholder="Johnson" className="h-11" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Affiliation / Institution</label>
          <Input type="text" placeholder="Stanford University" className="h-11" />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
          <Input type="email" placeholder="author@university.edu" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <Input type="password" placeholder="••••••••" className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        
        <Button 
          type="submit"
          className="w-full h-11 text-base mt-4"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
