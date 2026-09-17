import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <div className="w-full">
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-2xl font-serif font-semibold text-slate-900 dark:text-white tracking-tight">Create an account</h1>
        <p className="text-sm text-slate-500 mt-2">Join the Journova academic community.</p>
      </div>
      
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
            <Input type="text" placeholder="Sarah" className="h-11" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
            <Input type="text" placeholder="Johnson" className="h-11" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Affiliation / Institution</label>
          <Input type="text" placeholder="Stanford University" className="h-11" />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
          <Input type="email" placeholder="author@university.edu" className="h-11" />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <Input type="password" placeholder="••••••••" className="h-11" />
        </div>
        
        <Button 
          type="button"
          className="w-full h-11 text-base mt-4"
        >
          Register
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
