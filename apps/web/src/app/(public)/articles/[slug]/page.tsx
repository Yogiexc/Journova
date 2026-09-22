import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Share2, BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getArticle(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const res = await fetch(`${apiUrl}/articles/${slug}`, { next: { revalidate: 60 } });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch article');
  }
  
  const data = await res.json();
  return data.data;
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const pdfUrl = article.pdf_url ? `${apiUrl.replace('/api/v1', '')}${article.pdf_url}` : null;

  return (
    <article className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-slate-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/articles" className="hover:text-slate-900 transition-colors">Articles</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-300 truncate max-w-[200px]">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 uppercase tracking-wider text-[10px]">Open Access</Badge>
          <span className="text-sm text-slate-500">Research Article</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 dark:text-white leading-tight mb-8">
          {article.title}
        </h1>

        <div className="flex flex-col gap-6">
          {/* Authors */}
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {article.authors.map((authorData: any, idx: number) => (
              <div key={idx} className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-slate-100">{authorData.author.full_name}</span>
                <span className="text-sm text-slate-500">{authorData.author.affiliation || authorData.author.institution}</span>
              </div>
            ))}
          </div>

          {/* Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-900">
            <div className="flex flex-col gap-1 text-sm text-slate-600">
              <span className="font-mono"><strong>DOI:</strong> {article.doi || 'Not assigned yet'}</span>
              <span><strong>Published:</strong> {new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button className="w-full sm:w-auto gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <FileText className="w-4 h-4" /> Read Online
              </Button>
              {pdfUrl && (
                <Link href={pdfUrl} target="_blank">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Download className="w-4 h-4" /> PDF
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <h2 className="text-2xl font-serif font-medium text-slate-900 dark:text-white mb-4">Abstract</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-loose">
              <p>{article.abstract}</p>
            </div>
          </section>

          {article.keywords && article.keywords.length > 0 && (
            <section>
              <h2 className="text-2xl font-serif font-medium text-slate-900 dark:text-white mb-4">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((kw: any) => (
                  <Badge key={kw.keyword.id} variant="secondary" className="font-normal text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {kw.keyword.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <hr className="border-slate-200 dark:border-slate-800" />
          
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-4" />
            <h3 className="font-medium mb-2">Full Text Available</h3>
            <p className="text-sm text-slate-500 mb-4">You have full access to read this article online.</p>
            {pdfUrl && (
              <Link href={pdfUrl} target="_blank">
                <Button variant="outline">View Full Text</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-lg">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Views</span>
                <span className="font-medium">142</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Downloads</span>
                <span className="font-medium">89</span>
              </div>
            </div>
          </div>

          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-lg">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Article Info</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex flex-col gap-1">
                <span className="text-slate-500">Issue</span>
                <span className="font-medium text-slate-900 dark:text-slate-300">
                  Vol {article.issue?.volume?.volume_number}, Issue {article.issue?.issue_number} ({article.issue?.volume?.year})
                </span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-slate-500">Pages</span>
                <span className="font-medium text-slate-900 dark:text-slate-300">
                  {article.page_start} - {article.page_end}
                </span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-slate-500">Published</span>
                <span className="font-medium text-slate-900 dark:text-slate-300">
                  {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </li>
            </ul>
          </div>
          
          <Button variant="outline" className="w-full gap-2">
            <Share2 className="w-4 h-4" /> Share Article
          </Button>
        </aside>
      </div>
    </article>
  );
}
