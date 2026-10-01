"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function ReviewerDashboardPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetchApi('/api/v1/reviews/assignments');
        if (res && res.data) {
          setAssignments(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    try {
      await fetchApi(`/api/v1/reviews/assignments/${id}/${action}`, { method: 'POST' });
      // Refresh list
      const res = await fetchApi('/api/v1/reviews/assignments');
      if (res && res.data) setAssignments(res.data);
    } catch (err: any) {
      alert(err.message || `Failed to ${action}`);
    }
  };

  const pending = assignments.filter(a => ['INVITED', 'ACCEPTED'].includes(a.status)).length;
  const completed = assignments.filter(a => a.status === 'COMPLETED').length;
  const overdue = 0; // Mocked for now

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 sm:p-10 shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Reviewer Workspace</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 font-normal max-w-xl">Evaluate manuscripts, submit your peer reviews, and contribute to scientific publishing.</p>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

      {/* Reviewer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Pending Reviews', value: pending, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Overdue', value: overdue, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-500/10' },
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

      {/* Assigned Manuscripts */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 px-8 py-6">
          <CardTitle className="text-xl font-serif text-slate-800 dark:text-slate-100">Assigned Manuscripts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <p>Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-500 space-y-4 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-2">
                  <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No manuscripts to review yet</h3>
                <p className="text-sm max-w-md">You don&apos;t have any review assignments at the moment. We&apos;ll notify you when an editor assigns a manuscript to you.</p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="p-6 sm:px-8 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-3xl flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">#{assignment.round.submission.id.substring(0, 8)}</span>
                        <Badge variant="outline" className={`font-medium border-0 px-3 py-1 bg-opacity-10 dark:bg-opacity-20 ${
                          assignment.status === 'INVITED' ? "bg-blue-500 text-blue-600 dark:text-blue-400" :
                          assignment.status === 'ACCEPTED' ? "bg-amber-500 text-amber-600 dark:text-amber-400" :
                          assignment.status === 'DECLINED' ? "bg-rose-500 text-rose-600 dark:text-rose-400" :
                          "bg-emerald-500 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 inline-block ${
                            assignment.status === 'INVITED' ? "bg-blue-500" :
                            assignment.status === 'ACCEPTED' ? "bg-amber-500" :
                            assignment.status === 'DECLINED' ? "bg-rose-500" :
                            "bg-emerald-500"
                          }`}></span>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-serif text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
                        {assignment.round.submission.article.title}
                      </h4>
                      <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 pt-1">
                        <span><Clock className="w-3.5 h-3.5 inline mr-1" /> Assigned: {new Date(assignment.created_at).toLocaleDateString()}</span>
                        <span className={new Date(assignment.due_date) < new Date() && assignment.status !== 'COMPLETED' ? "text-rose-500 font-medium" : ""}>
                          <Clock className="w-3.5 h-3.5 inline mr-1" /> Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 min-w-[140px] flex flex-col sm:flex-row gap-2">
                      {assignment.status === 'INVITED' ? (
                        <>
                          <Button onClick={() => handleAction(assignment.id, 'accept')} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 w-full sm:w-auto transition-transform hover:-translate-y-0.5">Accept Review</Button>
                          <Button variant="ghost" onClick={() => handleAction(assignment.id, 'decline')} className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 w-full sm:w-auto">Decline</Button>
                        </>
                      ) : assignment.status === 'ACCEPTED' ? (
                        <Button asChild className="w-full sm:w-auto shadow-sm transition-transform hover:-translate-y-0.5">
                          <Link href={`/dashboard/reviewer/${assignment.id}`}>Continue Review</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full sm:w-auto border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform hover:-translate-y-0.5" asChild>
                          <Link href={`/dashboard/reviewer/${assignment.id}`}>View Details</Link>
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
