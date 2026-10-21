"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Users, BookOpen, Layers, CheckCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 sm:p-10 shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-indigo-500 text-indigo-500 font-medium">SUPER ADMIN</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 dark:text-white tracking-tight">System Administration</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 font-normal max-w-xl">
              Control platform settings, oversee journals, manage roles, and review journal activity.
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
              <Link href="/dashboard/editor">
                <Layers className="w-4 h-4" /> Switch to Editor View
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1">Railway & Neon connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Journal</CardTitle>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 Active</div>
            <p className="text-xs text-muted-foreground mt-1">Journova Digital Innovation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <Users className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 Roles</div>
            <p className="text-xs text-muted-foreground mt-1">ADMIN, EDITOR, REVIEWER, AUTHOR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Security</CardTitle>
            <CheckCircle className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Enabled</div>
            <p className="text-xs text-muted-foreground mt-1">Argon2 & JWT token rotation</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-slate-400 transition-all">
          <CardHeader>
            <CardTitle className="text-lg">Editor Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Triage incoming submissions, assign peer reviewers, and issue publishing.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/editor">Open Editor Workspace</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-400 transition-all">
          <CardHeader>
            <CardTitle className="text-lg">Reviewer Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Inspect peer reviewer workflow and scoring interface.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/reviewer">Open Reviewer Workspace</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-400 transition-all">
          <CardHeader>
            <CardTitle className="text-lg">Author Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">View submitted manuscripts and submit new research papers.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/author">Open Author Workspace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
