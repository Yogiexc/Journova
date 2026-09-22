"use client";

import Link from 'next/link';
import { Home, FileText, CheckSquare, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-serif text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white leading-tight">{user.name}</p>
            <p className="text-xs text-slate-500">
              {user.roles?.map((r: any) => r?.role?.name || r?.name || r).join(', ')}
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link href="/dashboard/author" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/dashboard/author' ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
            <Home className="w-4 h-4 text-slate-500" />
            Author Dashboard
          </Link>
          
          {hasRole('REVIEWER') && (
            <Link href="/dashboard/reviewer" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/dashboard/reviewer' ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <CheckSquare className="w-4 h-4 text-slate-500" />
              Reviewer Dashboard
            </Link>
          )}

          {hasRole('EDITOR') && (
            <Link href="/dashboard/editor" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/dashboard/editor' ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              Editor Dashboard
            </Link>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
        <nav className="space-y-1">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}
