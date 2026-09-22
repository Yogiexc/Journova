import Link from 'next/link';
import { ArticleCard } from '@/components/articles/ArticleCard';

async function getLatestArticles() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const res = await fetch(`${apiUrl}/articles?limit=3`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Failed to fetch latest articles", error);
    return [];
  }
}

async function getLatestIssue() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const res = await fetch(`${apiUrl}/issues`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] || null; // Assume the first one is the latest for now
  } catch (error) {
    console.error("Failed to fetch latest issue", error);
    return null;
  }
}

export default async function HomePage() {
  const currentIssue = await getLatestIssue();
  const latestArticles = await getLatestArticles();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Editorial Identity / Hero */}
      <section className="bg-slate-50 dark:bg-slate-950 py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 md:px-8 flex flex-col items-center text-center max-w-3xl">
          <p className="uppercase tracking-widest text-xs font-semibold text-slate-500 mb-4">Journova Press</p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-white mb-6 leading-tight">
            Modernizing Scientific Publishing
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-serif">
            An open-access editorial platform dedicated to the rapid dissemination of high-quality, peer-reviewed research.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/articles"
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
            >
              Browse Directory
            </Link>
            <Link 
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              Submit Manuscript
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content: Latest Articles */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-serif text-slate-900 dark:text-white">Latest Articles</h2>
                <Link href="/articles" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  View all →
                </Link>
              </div>
              <div className="flex flex-col">
                {latestArticles.length > 0 ? (
                  latestArticles.map((article: any) => (
                    <ArticleCard key={article.id} article={article} />
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500">No published articles yet.</div>
                )}
              </div>
            </div>

            {/* Sidebar: Current Issue & Announcements */}
            <div className="lg:col-span-4 space-y-12">
              {/* Current Issue */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                  Current Issue
                </h2>
                {currentIssue ? (
                  <div className="flex flex-col gap-4">
                    <div className="aspect-[3/4] rounded shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100">
                      {currentIssue.cover_image_url ? (
                        <img src={currentIssue.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-serif">No Cover</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">{currentIssue.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Vol. {currentIssue.volume?.volume_number} No. {currentIssue.issue_number} • {currentIssue.volume?.year}
                      </p>
                    </div>
                    <Link href={`/issues/${currentIssue.id}`} className="text-sm font-medium text-slate-900 hover:underline dark:text-white">
                      View full issue →
                    </Link>
                  </div>
                ) : (
                  <div className="py-4 text-slate-500">No issues published yet.</div>
                )}
              </div>

              {/* Announcements */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                  Announcements
                </h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Call for Papers 2026</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    We are currently accepting submissions for the upcoming special issue on Quantum AI Algorithms.
                  </p>
                  <Link href="/author-guidelines" className="text-sm font-medium text-slate-900 hover:underline dark:text-white">
                    Read Author Guidelines
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
