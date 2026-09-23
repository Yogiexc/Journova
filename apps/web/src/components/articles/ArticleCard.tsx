import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { type Article } from '@/data/articles';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group py-6 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors -mx-4 px-4 rounded-lg">
      <Link href={`/articles/${article.slug}`} className="block">
        <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors leading-tight mb-2">
          {article.title}
        </h3>
      </Link>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-serif">
        {article.authors?.map((a: any) => a.author?.full_name || a.name).join(', ')}
      </p>
      
      <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
        {article.abstract}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="font-normal text-[10px] uppercase tracking-wider text-slate-500">
            Open Access
          </Badge>
          <span>DOI: {article.doi ? article.doi.split('/')[1] : 'Not assigned yet'}</span>
        </div>
        <div className="flex gap-4">
          <span>{new Date(article.published_at || article.publishDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </article>
  );
}
