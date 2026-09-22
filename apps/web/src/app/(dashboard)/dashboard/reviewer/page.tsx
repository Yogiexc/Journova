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
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-1">Reviewer Dashboard</h1>
        <p className="text-sm text-slate-500">Manage your peer review assignments.</p>
      </div>

      {error && <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : pending}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : completed}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : overdue}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <CardTitle className="text-lg font-medium">Assigned Manuscripts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No review assignments yet.</div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">#{assignment.submission.id.substring(0, 8)}</span>
                      <Badge variant="outline" className={
                        assignment.status === 'INVITED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        assignment.status === 'ACCEPTED' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        assignment.status === 'DECLINED' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }>
                        {assignment.status}
                      </Badge>
                    </div>
                    <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                      {assignment.submission.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 pt-2">
                      <div><strong>Assigned:</strong> {new Date(assignment.created_at).toLocaleDateString()}</div>
                      <div><strong>Due:</strong> {new Date(assignment.due_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {assignment.status === 'INVITED' ? (
                      <>
                        <Button variant="outline" onClick={() => handleAction(assignment.id, 'accept')} className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">Accept Review</Button>
                        <Button variant="ghost" onClick={() => handleAction(assignment.id, 'decline')} className="w-full text-slate-500 hover:text-rose-600">Decline</Button>
                      </>
                    ) : assignment.status === 'ACCEPTED' ? (
                      <Button asChild className="w-full">
                        <Link href={`/dashboard/reviewer/${assignment.id}`}>Continue Review</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/dashboard/reviewer/${assignment.id}`}>View Details</Link>
                      </Button>
                    )}
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
