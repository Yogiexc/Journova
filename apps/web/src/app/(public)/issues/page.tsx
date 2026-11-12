import { IssueCard } from '@/components/issues/IssueCard';
import { BookMarked } from 'lucide-react';

async function getIssues() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://journova-api-production.up.railway.app/api/v1';
    const res = await fetch(`${apiUrl}/issues?limit=30`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Failed to fetch issues', error);
    return [];
  }
}

export const metadata = {
  title: 'Current & Past Issues | Journova Press',
  description: 'Browse current and past issues published in Journova Journal of Digital Innovation.',
};

export default async function IssuesPage() {
  const issues = await getIssues();

  // Filter out noise test issues with draft titles and 0 articles
  const curatedIssues = issues.filter((i: any) => {
    if (i.article_count && i.article_count > 0) return true;
    if (i.title && !i.title.toLowerCase().includes('test draft')) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4">
            <BookMarked className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Issue Catalog
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 dark:text-white mb-4">
            Current & Past Issues
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-serif max-w-2xl leading-relaxed">
            Browse through peer-reviewed issues in Journova Journal of Digital Innovation. All articles are published under full Open Access licensing.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {curatedIssues.length > 0 ? (
            curatedIssues.map((issue: any) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              No published issues found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
