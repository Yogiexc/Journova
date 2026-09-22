"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileUp, ArrowRight, Download, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function EditorPublicationDetailPage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [issueId, setIssueId] = useState("");
  const [pageStart, setPageStart] = useState("");
  const [pageEnd, setPageEnd] = useState("");
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articleRes, issuesRes] = await Promise.all([
          fetchApi(`/api/v1/editor/publications/${params.id}`),
          fetchApi('/api/v1/issues') // We might need an endpoint for drafts/open issues, but we'll use this for now
        ]);
        if (articleRes?.data) setArticle(articleRes.data);
        if (issuesRes?.data) setIssues(issuesRes.data);
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  const refresh = async () => {
    const res = await fetchApi(`/api/v1/editor/publications/${params.id}`);
    if (res?.data) setArticle(res.data);
  };

  const advanceStatus = async (endpoint: string) => {
    try {
      await fetchApi(`/api/v1/editor/publications/${params.id}/${endpoint}`, { method: 'POST' });
      alert('Status updated');
      refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const uploadFile = async (stage: string) => {
    try {
      await fetchApi(`/api/v1/editor/publications/${params.id}/files`, {
        method: 'POST',
        body: JSON.stringify({ stage, notes: `Uploaded mock ${stage} file` })
      });
      alert(`${stage} file uploaded`);
      refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to upload file');
    }
  };

  const handleSchedule = async () => {
    try {
      await fetchApi(`/api/v1/editor/publications/${params.id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({
          issue_id: issueId,
          page_start: parseInt(pageStart),
          page_end: parseInt(pageEnd)
        })
      });
      alert('Article Scheduled Successfully');
      refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!article) return null;

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/editor/publications" className="hover:text-slate-900">Publications</Link>
        <span>/</span>
        <span>Article #{params.id.substring(0, 8)}</span>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className={
              article.status === 'ACCEPTED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              article.status === 'COPYEDITING' ? "bg-blue-50 text-blue-700 border-blue-200" :
              article.status === 'PRODUCTION' ? "bg-purple-50 text-purple-700 border-purple-200" :
              "bg-amber-50 text-amber-700 border-amber-200"
            }>{article.status}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-slate-900 dark:text-white mb-2 leading-tight max-w-3xl">
            {article.title}
          </h1>
          <p className="text-sm text-slate-600">Authors: <strong>{article.authors?.map((a:any) => a.author.full_name).join(', ')}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg">Editorial Files</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {article.editorial_files?.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No editorial files uploaded yet.</div>
                ) : (
                  article.editorial_files?.map((ef: any) => (
                    <div key={ef.id} className="p-6 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">{ef.stage}</Badge>
                          <span className="text-sm font-medium">v{ef.version}</span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white">{ef.file?.original_name}</p>
                        <p className="text-xs text-slate-500 mt-1">Uploaded by {ef.uploader?.name} on {new Date(ef.created_at).toLocaleString()}</p>
                        {ef.notes && <p className="text-xs text-slate-500 mt-1 italic">{ef.notes}</p>}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/v1/public/mock-pdf`} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </a>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {article.status === 'SCHEDULED' && article.publications?.[0] && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader>
                <CardTitle className="text-emerald-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> Publication Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-emerald-900">
                <p><strong>Status:</strong> SCHEDULED for Publication</p>
                <p><strong>Issue:</strong> Vol {article.issue?.volume_id} Issue {article.issue?.issue_number}</p>
                <p><strong>Pages:</strong> {article.page_start} - {article.page_end}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Workflow Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {article.status === 'ACCEPTED' && (
                <>
                  <Button onClick={() => advanceStatus('start-copyediting')} className="w-full justify-between bg-blue-600 hover:bg-blue-700 text-white">
                    Start Copyediting <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {article.status === 'COPYEDITING' && (
                <>
                  <Button onClick={() => uploadFile('COPYEDIT')} variant="outline" className="w-full justify-start gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <FileUp className="w-4 h-4" /> Upload Copyedited File
                  </Button>
                  <div className="pt-2 border-t border-slate-100">
                    <Button onClick={() => advanceStatus('start-production')} className="w-full justify-between bg-purple-600 hover:bg-purple-700 text-white">
                      Move to Production <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {article.status === 'PRODUCTION' && (
                <>
                  <Button onClick={() => uploadFile('PRODUCTION')} variant="outline" className="w-full justify-start gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                    <FileUp className="w-4 h-4" /> Upload Final Galley
                  </Button>
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <h4 className="text-sm font-medium">Schedule for Publication</h4>
                    <select 
                      className="w-full border-slate-300 rounded-md text-sm p-2"
                      value={issueId}
                      onChange={(e) => setIssueId(e.target.value)}
                    >
                      <option value="">Select Issue...</option>
                      {issues.map(i => (
                        <option key={i.id} value={i.id}>{i.title || `Issue ${i.issue_number}`}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Start Page" 
                        className="w-full border-slate-300 rounded-md text-sm p-2"
                        value={pageStart}
                        onChange={(e) => setPageStart(e.target.value)}
                      />
                      <input 
                        type="number" 
                        placeholder="End Page" 
                        className="w-full border-slate-300 rounded-md text-sm p-2"
                        value={pageEnd}
                        onChange={(e) => setPageEnd(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSchedule} className="w-full bg-slate-900 text-white">
                      Schedule Article
                    </Button>
                  </div>
                </>
              )}
              
              {article.status === 'SCHEDULED' && (
                <div className="text-sm text-slate-500 text-center p-4 bg-slate-50 rounded-md">
                  This article is scheduled. Publish the Issue to make it public.
                </div>
              )}

              {article.status === 'PUBLISHED' && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-medium">DOI Registration</h4>
                  {article.doi_deposits && article.doi_deposits.length > 0 ? (
                    <div className="text-sm p-3 border rounded-md border-slate-200 bg-white">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-500">Status:</span>
                        <Badge variant="outline" className={
                          article.doi_deposits[0].status === 'SUCCESS' ? 'text-emerald-700 bg-emerald-50' : 
                          article.doi_deposits[0].status === 'FAILED' ? 'text-red-700 bg-red-50' : 
                          'text-amber-700 bg-amber-50'
                        }>
                          {article.doi_deposits[0].status}
                        </Badge>
                      </div>
                      {article.doi_deposits[0].status === 'SUCCESS' && (
                        <p className="mt-2 font-mono text-xs text-slate-600 truncate">{article.doi}</p>
                      )}
                      {article.doi_deposits[0].status === 'FAILED' && (
                        <div className="mt-2">
                          <p className="text-xs text-red-600 mb-2">{article.doi_deposits[0].error_msg}</p>
                          <Button size="sm" variant="outline" className="w-full text-red-700 border-red-200 hover:bg-red-50" onClick={async () => {
                            try {
                              await fetchApi(`/api/v1/doi/${params.id}/retry`, { method: 'POST' });
                              alert('Retry initiated. Please refresh shortly.');
                            } catch (e: any) { alert(e.message); }
                          }}>
                            Retry Registration
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 text-center p-3 border rounded-md">
                      No DOI registration attempts yet.
                      <Button size="sm" variant="outline" className="w-full mt-2" onClick={async () => {
                            try {
                              await fetchApi(`/api/v1/doi/${params.id}/retry`, { method: 'POST' });
                              alert('Registration initiated.');
                            } catch (e: any) { alert(e.message); }
                          }}>
                        Register DOI Now
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
