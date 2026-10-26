import Link from 'next/link';
import { type Issue } from '@/data/issues';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IssueCoverPlaceholder } from './IssueCoverPlaceholder';

export function IssueCard({ issue }: { issue: Issue }) {
  const volNumber = typeof issue.volume === 'object' ? (issue.volume as any).volume_number : issue.volume;
  const issueNum = (issue as any).issue_number || issue.number;
  const year = typeof issue.volume === 'object' ? (issue.volume as any).year : issue.year;

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden group">
      <Link href={`/issues/${issue.id}`} className="aspect-[3/4] bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative block overflow-hidden">
        {issue.coverImage || (issue as any).cover_image_url ? (
          <img src={issue.coverImage || (issue as any).cover_image_url} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <IssueCoverPlaceholder
            volume={volNumber}
            issueNumber={issueNum}
            year={year}
            title={issue.title}
            className="group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </Link>
      <CardHeader className="p-4">
        <div className="text-xs text-slate-500 mb-1">
          Vol. {typeof issue.volume === 'object' ? (issue.volume as any).volume_number : issue.volume || '?'} No. {(issue as any).issue_number || issue.number || '?'} ({typeof issue.volume === 'object' ? (issue.volume as any).year : issue.year || '?'})
        </div>
        <CardTitle className="text-lg font-serif leading-snug">
          <Link href={`/issues/${issue.id}`} className="hover:text-primary transition-colors">
            {issue.title || `Issue ${(issue as any).issue_number || issue.number}`}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow text-sm text-slate-600 dark:text-slate-400">
        Published: {(issue as any).published_at || issue.publishDate ? new Date((issue as any).published_at || issue.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Draft'}
      </CardContent>
    </Card>
  );
}
