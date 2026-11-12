import Link from 'next/link';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

async function getArchives() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://journova-api-production.up.railway.app/api/v1';
    const res = await fetch(`${apiUrl}/issues?limit=50`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Failed to fetch archives', error);
    return [];
  }
}

export const metadata = {
  title: 'Journal Archives | Journova Press',
  description: 'Explore the complete archive of past volumes and issues published by Journova Press.',
};

export default async function ArchivesPage() {
  const issues = await getArchives();

  // Filter out noisy development test issues if any (keep meaningful issues or issues with articles)
  const curatedIssues = issues.filter((i: any) => {
    // Keep inaugural issue, or issues without "Draft Issue" in title, or issues with articles
    if (i.article_count && i.article_count > 0) return true;
    if (i.title && !i.title.toLowerCase().includes('test draft')) return true;
    return false;
  });

  // Group by Year
  const groupedByYear: { [year: string]: any[] } = {};
  curatedIssues.forEach((issue: any) => {
    const year = issue.volume?.year || (issue.published_at ? new Date(issue.published_at).getFullYear() : 2026);
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(issue);
  });

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Permanent Scientific Record
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 dark:text-white mb-4">
            Journal Archives
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-serif max-w-3xl leading-relaxed">
            Access past volumes, special issues, and scholarly collections published under open-access indexation.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-12 max-w-5xl space-y-12">
        {sortedYears.length > 0 ? (
          sortedYears.map((year) => (
            <section key={year} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-2xl font-serif font-semibold text-slate-900 dark:text-white">
                    Year {year}
                  </h2>
                </div>
                <Badge variant="secondary" className="text-xs font-normal">
                  {groupedByYear[year].length} Issue{groupedByYear[year].length > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {groupedByYear[year].map((issue: any) => (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 -mx-4 px-4 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                        <span>Volume {issue.volume?.volume_number || 1}</span>
                        <span>•</span>
                        <span>Issue {issue.issue_number}</span>
                      </div>
                      <h3 className="text-lg font-serif font-medium text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {issue.title || `Issue ${issue.issue_number}`}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Published: {issue.published_at ? new Date(issue.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Published'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {issue.article_count !== undefined && (
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
                          {issue.article_count} {issue.article_count === 1 ? 'Article' : 'Articles'}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">No archived issues found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
