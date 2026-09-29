import Link from 'next/link';
import { type Issue } from '@/data/issues';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative">
        {issue.coverImage ? (
          <img src={issue.coverImage} alt={issue.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-serif">No Cover</div>
        )}
      </div>
      <CardHeader className="p-4">
        <div className="text-xs text-slate-500 mb-1">
          Vol. {issue.volume?.volume_number || issue.volume || '?'} No. {issue.issue_number || issue.number || '?'} ({issue.volume?.year || issue.year || '?'})
        </div>
        <CardTitle className="text-lg font-serif leading-snug">
          <Link href={`/issues/${issue.id}`} className="hover:text-primary transition-colors">
            {issue.title || `Issue ${issue.issue_number || issue.number}`}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow text-sm text-slate-600 dark:text-slate-400">
        Published: {issue.published_at || issue.publishDate ? new Date(issue.published_at || issue.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Draft'}
      </CardContent>
    </Card>
  );
}
