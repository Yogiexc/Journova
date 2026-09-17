import Link from 'next/link';
import { Home, FileText, CheckSquare, Settings, LogOut } from 'lucide-react';

export function DashboardSidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-serif text-xl font-bold">
            S
          </div>
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white leading-tight">Sarah Johnson</p>
            <p className="text-xs text-slate-500">Author</p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link href="/dashboard/author" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-slate-200/50 dark:bg-slate-800 text-slate-900 dark:text-white">
            <Home className="w-4 h-4 text-slate-500" />
            Dashboard
          </Link>
          <Link href="/dashboard/author/submissions" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors">
            <FileText className="w-4 h-4 text-slate-500" />
            My Submissions
          </Link>
          <Link href="/dashboard/author/reviews" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors">
            <CheckSquare className="w-4 h-4 text-slate-500" />
            Peer Reviews
          </Link>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
        <nav className="space-y-1">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors">
            <Settings className="w-4 h-4 text-slate-500" />
            Profile Settings
          </Link>
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <LogOut className="w-4 h-4 text-red-500" />
            Logout
          </Link>
        </nav>
      </div>
    </aside>
  );
}
