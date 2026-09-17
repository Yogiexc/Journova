import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-2xl font-serif font-semibold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-2">Sign in to your Journova account to manage submissions and reviews.</p>
      </div>
      
      <form className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
          <Input 
            type="email" 
            placeholder="author@university.edu"
            className="h-11"
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
          />
        </div>
        
        <Button 
          type="button" // Change to submit when API is ready
          className="w-full h-11 text-base mt-2"
          asChild
        >
          <Link href="/dashboard/author">Sign In</Link>
        </Button>
      </form>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
