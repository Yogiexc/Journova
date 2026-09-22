"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';
import { BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditorPublicationsPage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPublications = async () => {
      try {
        const res = await fetchApi('/api/v1/editor/publications');
        if (res && res.data) setPublications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPublications();
  }, []);

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-2">Publication Pipeline</h1>
          <p className="text-slate-500">Manage accepted articles through copyediting, production, and scheduling.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 uppercase mb-1">Accepted</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {publications.filter(p => p.status === 'ACCEPTED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 uppercase mb-1">Copyediting</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {publications.filter(p => p.status === 'COPYEDITING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 uppercase mb-1">Production</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {publications.filter(p => p.status === 'PRODUCTION').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 uppercase mb-1">Scheduled</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {publications.filter(p => p.status === 'SCHEDULED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8 text-slate-500">Loading pipeline...</div>
          ) : publications.length === 0 ? (
            <div className="text-center p-8 text-slate-500 border border-dashed rounded-md">
              No articles in the publication pipeline.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {publications.map(article => (
                <div key={article.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={
                        article.status === 'ACCEPTED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        article.status === 'COPYEDITING' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        article.status === 'PRODUCTION' ? "bg-purple-50 text-purple-700 border-purple-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }>{article.status}</Badge>
                      <span className="text-xs text-slate-400">ID: {article.id.substring(0, 8)}</span>
                    </div>
                    <Link href={`/dashboard/editor/publications/${article.id}`} className="font-medium text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                      {article.title}
                    </Link>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                      {article.authors?.map((a: any) => a.author.full_name).join(', ') || 'Unknown Author'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {article.issue && (
                      <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        <BookOpen className="w-3 h-3" />
                        Vol {article.issue.volume_id} Issue {article.issue.issue_number}
                      </div>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/editor/publications/${article.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
