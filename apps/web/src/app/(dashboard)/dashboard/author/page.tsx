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
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-1">Author Dashboard</h1>
          <p className="text-sm text-slate-500">Manage your manuscripts and track editorial progress.</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/author/submissions/new">
            <Plus className="w-4 h-4" /> New Submission
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Submissions</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Under Review</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : underReview}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Revision Required</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : revisionReq}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Published</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : published}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Submissions List */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <CardTitle className="text-lg font-medium">Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No submissions found. Create a new one to get started.</div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">#{sub.id.substring(0, 8)}</span>
                      <Badge variant="outline" className={
                        sub.status === 'UNDER_REVIEW' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        sub.status === 'REVISION_REQUIRED' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        sub.status === 'PUBLISHED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }>
                        {sub.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                      <Link href={`/dashboard/author/submissions/${sub.id}`} className="hover:text-primary transition-colors">
                        {sub.article.title}
                      </Link>
                    </h4>
                    <p className="text-sm text-slate-500">
                      Last updated: {new Date(sub.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  {sub.status === 'REVISION_REQUIRED' ? (
                    <Button variant="default" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white" asChild>
                      <Link href={`/dashboard/author/submissions/${sub.id}`}>Submit Revision</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/author/submissions/${sub.id}`}>View Status</Link>
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
