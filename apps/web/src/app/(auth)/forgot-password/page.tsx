import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-2xl font-serif font-semibold text-slate-900 dark:text-white tracking-tight">Reset Password</h1>
        <p className="text-sm text-slate-500 mt-2">Enter your email address and we'll send you a link to reset your password.</p>
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
        
        <Button 
          type="button"
          className="w-full h-11 text-base mt-2"
        >
          Send Reset Link
        </Button>
      </form>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
