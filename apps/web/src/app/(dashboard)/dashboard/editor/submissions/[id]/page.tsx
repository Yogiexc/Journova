"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Users, Mail, FileCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function EditorSubmissionViewPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewers, setReviewers] = useState<any[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetchApi(`/api/v1/editor/submissions/${params.id}`);
        if (res && res.data) {
          setSubmission(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load submission");
      } finally {
        setLoading(false);
      }
    };
    
    const loadReviewers = async () => {
      try {
        const res = await fetchApi('/api/v1/editor/reviewers');
        if (res && res.data) setReviewers(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchSubmission();
    loadReviewers();
  }, [params.id]);

  const handleAssignReviewer = async () => {
    if (!selectedReviewerId) return;
    try {
      await fetchApi(`/api/v1/editor/submissions/${params.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ reviewer_id: selectedReviewerId })
      });
      alert('Reviewer assigned');
      // Refresh
      const res = await fetchApi(`/api/v1/editor/submissions/${params.id}`);
      if (res && res.data) setSubmission(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to assign reviewer');
    }
  };

  const handleDecision = async (status: string) => {
    try {
      await fetchApi(`/api/v1/editor/submissions/${params.id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      alert(`Decision recorded: ${status}`);
      // Refresh
      const res = await fetchApi(`/api/v1/editor/submissions/${params.id}`);
      if (res && res.data) setSubmission(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to record decision');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading submission...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!submission) return null;

  const currentRound = submission.rounds && submission.rounds.length > 0 
    ? submission.rounds[submission.rounds.length - 1] 
    : null;
  const assignments = currentRound ? currentRound.assignments : [];

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/editor" className="hover:text-slate-900">Dashboard</Link>
        <span>/</span>
        <span>Submission #{params.id.substring(0, 8)}</span>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className={
              submission.status === 'SUBMITTED' ? "bg-blue-50 text-blue-700 border-blue-200" :
              submission.status === 'UNDER_REVIEW' ? "bg-amber-50 text-amber-700 border-amber-200" :
              submission.status === 'ACCEPTED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              "bg-slate-50 text-slate-700 border-slate-200"
            }>{submission.status.replace('_', ' ')}</Badge>
            <span className="text-sm font-medium text-slate-500">Round {submission.rounds?.length || 1}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-slate-900 dark:text-white mb-2 leading-tight max-w-3xl">
            {submission.article.title}
          </h1>
          <p className="text-sm text-slate-600">Author: <strong>{submission.submitted_by.name}</strong> • Updated: {new Date(submission.updated_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column: Review Results */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Review Results</CardTitle>
                <Badge variant="secondary">{assignments.filter((a: any) => a.status === 'COMPLETED').length} of {assignments.length} Completed</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No reviewers assigned for this round.</div>
                ) : (
                  assignments.map((assignment: any, index: number) => (
                    <div key={assignment.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">Reviewer {index + 1}</h4>
                          <p className="text-xs text-slate-500">Status: {assignment.status}</p>
                        </div>
                        {assignment.recommendation && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{assignment.recommendation}</Badge>
                        )}
                      </div>
                      {assignment.status === 'COMPLETED' && assignment.review && (
                        <div className="space-y-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white block mb-1">Author Comments:</span>
                            <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded">
                              {assignment.review.comments_to_author || "No comments."}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white block mb-1 text-rose-600">Confidential Editor Comments:</span>
                            <p className="text-slate-600 dark:text-slate-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 p-3 rounded">
                              {assignment.review.comments_to_editor || "No confidential comments."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Meta & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Editorial Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => handleDecision('ACCEPT')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Accept Submission</Button>
              <Button onClick={() => handleDecision('MINOR_REVISION')} variant="outline" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50">Minor Revision</Button>
              <Button onClick={() => handleDecision('MAJOR_REVISION')} variant="outline" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50">Major Revision</Button>
              <Button onClick={() => handleDecision('REJECT')} variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50">Reject Submission</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Manuscript Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3" asChild>
                <a href={`http://localhost:3001/api/v1/public/mock-pdf`} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 text-slate-400" />
                  View PDF
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Assign Reviewer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <select 
                  className="w-full border-slate-300 dark:border-slate-700 rounded-md text-sm p-2 bg-transparent"
                  value={selectedReviewerId}
                  onChange={(e) => setSelectedReviewerId(e.target.value)}
                >
                  <option value="">Select a reviewer...</option>
                  {reviewers.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.email}</option>
                  ))}
                </select>
                <Button variant="secondary" size="sm" className="w-full mt-2 gap-2" onClick={handleAssignReviewer}>
                  <Users className="w-4 h-4" /> Assign Reviewer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
