import Link from 'next/link';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { notFound } from 'next/navigation';

async function getIssue(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const res = await fetch(`${apiUrl}/issues/${id}`, { next: { revalidate: 60 } });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch issue');
  }
  
  const data = await res.json();
  return data.data;
}

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const issue = await getIssue(params.id);
  
  if (!issue) {
    notFound();
  }

  const issueArticles = issue.articles || [];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-slate-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/issues" className="hover:text-slate-900 transition-colors">Issues</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-300">Vol. {issue.volume?.volume_number} No. {issue.issue_number}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar: Issue Cover & Meta */}
        <aside className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 mb-6">
            {issue.coverImage ? (
              <img src={issue.coverImage} alt={issue.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-serif text-center p-4 bg-slate-50 dark:bg-slate-800">
                Vol. {issue.volume?.volume_number} No. {issue.issue_number}
              </div>
            )}
          </div>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Published</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(issue.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Articles</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{issueArticles.length}</span>
            </div>
          </div>
        </aside>

        {/* Main Content: Article List */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <header className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="text-primary font-medium mb-2 tracking-wide text-sm">Vol. {issue.volume?.volume_number} No. {issue.issue_number} ({issue.volume?.year})</div>
            <h1 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-white leading-tight">
              {issue.title}
            </h1>
            {issue.description && (
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                {issue.description}
              </p>
            )}
          </header>

          <div className="space-y-4">
            <h2 className="text-xl font-serif text-slate-900 dark:text-white mb-6">Table of Contents</h2>
            {issueArticles.map((article: any) => {
              // Map backend structure to expected ArticleCard prop structure
              const mappedArticle = {
                id: article.id,
                title: article.title,
                slug: article.slug,
                abstract: article.abstract,
                published_at: article.published_at,
                doi: article.doi,
                pageStart: article.page_start,
                pageEnd: article.page_end,
                authors: article.authors.map((a: any) => ({
                  name: a.author.full_name,
                  affiliation: a.author.affiliation || a.author.institution
                }))
              };
              return <ArticleCard key={mappedArticle.id} article={mappedArticle as any} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
