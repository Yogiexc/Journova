"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, FileSearch, CheckCircle, RefreshCcw, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function EditorDashboardPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetchApi('/api/v1/editor/submissions');
        if (res && res.data) {
          setSubmissions(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const newSubmissions = submissions.filter(s => s.status === 'SUBMITTED').length;
  const underReview = submissions.filter(s => s.status === 'UNDER_REVIEW').length;
  const revisionRequired = submissions.filter(s => s.status === 'REVISION_REQUIRED').length;
  const accepted = submissions.filter(s => s.status === 'ACCEPTED').length;

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-1">Editor Dashboard</h1>
          <p className="text-sm text-slate-500">Manage the complete editorial lifecycle of your journal.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" /> Manage Reviewers
          </Button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

      {/* Editor Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : newSubmissions}</h3>
            <p className="text-sm font-medium text-slate-500">New Submissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : underReview}</h3>
            <p className="text-sm font-medium text-slate-500">Under Review</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : revisionRequired}</h3>
            <p className="text-sm font-medium text-slate-500">Revision Required</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : accepted}</h3>
            <p className="text-sm font-medium text-slate-500">Accepted</p>
          </CardContent>
        </Card>
      </div>

      {/* Editor Queue */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Recent Activity Queue</CardTitle>
          <select className="text-sm border-slate-200 dark:border-slate-700 bg-transparent rounded-md focus:ring-primary">
            <option>All Statuses</option>
            <option>Action Required</option>
            <option>New Submissions</option>
          </select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Loading queue...</div>
            ) : submissions.length === 0 ? (
              <div className="p-6 text-center text-slate-500">Queue is empty.</div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-500 font-mono">#{sub.id.substring(0, 8)}</span>
                      <Badge variant="outline" className={
                        sub.status === 'SUBMITTED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        sub.status === 'UNDER_REVIEW' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        sub.status === 'ACCEPTED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }>
                        {sub.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                      <Link href={`/dashboard/editor/submissions/${sub.id}`} className="hover:text-primary transition-colors">
                        {sub.article.title}
                      </Link>
                    </h4>
                    <div className="flex gap-4 text-sm text-slate-500 pt-1">
                      <span><strong>Author:</strong> {sub.submitted_by.name}</span>
                      <span><strong>Updated:</strong> {new Date(sub.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button asChild variant={sub.status === 'SUBMITTED' ? 'default' : 'outline'} className="w-full whitespace-nowrap">
                      <Link href={`/dashboard/editor/submissions/${sub.id}`}>View Details</Link>
                    </Button>
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
