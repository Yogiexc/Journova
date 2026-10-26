import Link from 'next/link';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { IssueCoverPlaceholder } from '@/components/issues/IssueCoverPlaceholder';

async function getLatestArticles() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://journova-api-production.up.railway.app/api/v1';
    const res = await fetch(`${apiUrl}/articles?limit=3`, {
      cache: 'no-store'
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://journova-api-production.up.railway.app/api/v1';
    const res = await fetch(`${apiUrl}/issues`, {
      cache: 'no-store'
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
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-24 border-b border-slate-200/80 dark:border-slate-800">
        {/* Subtle Decorative Ambient Background */}
        <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-r from-amber-200/40 via-blue-200/30 to-amber-100/40 blur-3xl rounded-full" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col items-center text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 mb-6 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="uppercase tracking-[0.2em] text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Journova Press • Open Access
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-slate-900 dark:text-white mb-6 leading-[1.15] tracking-tight">
            Modernizing Scientific <span className="italic font-normal text-amber-700 dark:text-amber-400">Publishing</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed font-serif max-w-2xl font-light">
            An open-access editorial platform dedicated to the rapid dissemination of high-impact, peer-reviewed research across multidisciplinary sciences.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/articles"
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow-md hover:shadow-lg transition-all hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Browse Directory
            </Link>
            <Link 
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-8 text-sm font-medium text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
                    <Link href={`/issues/${currentIssue.id}`} className="block group">
                      <div className="aspect-[3/4] rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-900 group-hover:scale-[1.01]">
                        {currentIssue.cover_image_url ? (
                          <img src={currentIssue.cover_image_url} alt={currentIssue.title} className="w-full h-full object-cover" />
                        ) : (
                          <IssueCoverPlaceholder
                            volume={currentIssue.volume?.volume_number}
                            issueNumber={currentIssue.issue_number}
                            year={currentIssue.volume?.year}
                            title={currentIssue.title}
                          />
                        )}
                      </div>
                    </Link>
                    <div>
                      <h3 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-lg mb-1 leading-snug">
                        <Link href={`/issues/${currentIssue.id}`} className="hover:text-amber-600 transition-colors">
                          {currentIssue.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-sans font-medium">
                        Vol. {currentIssue.volume?.volume_number} No. {currentIssue.issue_number} • {currentIssue.volume?.year}
                      </p>
                    </div>
                    <Link href={`/issues/${currentIssue.id}`} className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white hover:text-amber-600 transition-colors">
                      View full issue <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
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
                <div className="p-5 bg-gradient-to-br from-slate-50 to-amber-50/20 dark:from-slate-900 dark:to-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs relative overflow-hidden">
                  <div className="w-1 h-full bg-amber-500 absolute top-0 left-0" />
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-sm mb-2.5">
                    Call For Papers • 2026
                  </span>
                  <h3 className="font-serif font-bold text-slate-900 dark:text-slate-100 mb-2 text-base leading-snug">
                    Special Issue on AI in Healthcare & Multidisciplinary Sciences
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed font-sans">
                    Submissions are open for upcoming volume publications. Fast-track peer review and rapid digital publishing available for accepted manuscripts.
                  </p>
                  <Link href="/author-guidelines" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white hover:text-amber-600 transition-colors">
                    Read Author Guidelines <span className="ml-1">→</span>
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
