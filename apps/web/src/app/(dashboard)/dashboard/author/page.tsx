"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function AuthorDashboardPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetchApi('/api/v1/submissions');
        if (res && res.data) {
          setSubmissions(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const total = submissions.length;
  const underReview = submissions.filter(s => s.status === 'UNDER_REVIEW').length;
  const revisionReq = submissions.filter(s => s.status === 'REVISION_REQUIRED').length;
  const published = submissions.filter(s => s.status === 'PUBLISHED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 sm:p-10 shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Author Workspace</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 font-normal max-w-xl">Manage your manuscripts, respond to peer reviews, and track editorial progress.</p>
          </div>
          <Button size="lg" className="gap-2 shadow-sm transition-all hover:-translate-y-0.5" asChild>
            <Link href="/dashboard/author/submissions/new">
              <Plus className="w-4 h-4" /> New Submission
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Submissions', value: total, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Under Review', value: underReview, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Revision Required', value: revisionReq, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Published', value: published, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, idx) => (
          <Card key={idx} className="group relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 transition-opacity group-hover:opacity-40 ${stat.bg.replace('/10', '')}`}></div>
            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{loading ? <span className="animate-pulse">...</span> : stat.value}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Submissions List */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 px-8 py-6">
          <CardTitle className="text-xl font-serif text-slate-800 dark:text-slate-100">Recent Manuscripts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <p>Loading your manuscripts...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-500 space-y-4 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-2">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No manuscripts yet</h3>
                <p className="text-sm max-w-md">You haven't submitted any manuscripts yet. Click the button above to start your first submission.</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="p-6 sm:px-8 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-3xl flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">#{sub.id.substring(0, 8)}</span>
                        <Badge variant="outline" className={`font-medium border-0 px-3 py-1 bg-opacity-10 dark:bg-opacity-20 ${
                          sub.status === 'UNDER_REVIEW' ? "bg-amber-500 text-amber-600 dark:text-amber-400" :
                          sub.status === 'REVISION_REQUIRED' ? "bg-rose-500 text-rose-600 dark:text-rose-400" :
                          sub.status === 'PUBLISHED' ? "bg-emerald-500 text-emerald-600 dark:text-emerald-400" :
                          "bg-slate-500 text-slate-600 dark:text-slate-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 inline-block ${
                            sub.status === 'UNDER_REVIEW' ? "bg-amber-500" :
                            sub.status === 'REVISION_REQUIRED' ? "bg-rose-500" :
                            sub.status === 'PUBLISHED' ? "bg-emerald-500" :
                            "bg-slate-500"
                          }`}></span>
                          {sub.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-serif text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
                        <Link href={`/dashboard/author/submissions/${sub.id}`}>
                          {sub.article.title}
                        </Link>
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Updated {new Date(sub.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {sub.status === 'REVISION_REQUIRED' ? (
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 w-full sm:w-auto transition-transform hover:-translate-y-0.5" asChild>
                          <Link href={`/dashboard/author/submissions/${sub.id}`}>Submit Revision</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full sm:w-auto border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform hover:-translate-y-0.5" asChild>
                          <Link href={`/dashboard/author/submissions/${sub.id}`}>View Details</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
