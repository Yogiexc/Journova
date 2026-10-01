"use client";

import Link from 'next/link';
import { useAuth, getDefaultDashboardUrl } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-primary">Journova</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/articles" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Articles</Link>
            <Link href="/issues" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Issues</Link>
            <Link href="/archives" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Archives</Link>
            <Link href="/editorial-board" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Editorial Team</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            isDashboard ? (
              // When on dashboard, hide the redundant auth info since sidebar has it
              <></>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-4 border-r pr-4 mr-2">
                  <span className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  <button onClick={() => logout()} className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors">Logout</button>
                </div>
                <Link href={getDefaultDashboardUrl(user.roles)} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                  Dashboard
                </Link>
              </>
            )
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors hidden md:block">Sign In</Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                Submit Manuscript
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
