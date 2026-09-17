import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { MOCK_ARTICLES } from '@/data/articles';
import { Search, Filter } from 'lucide-react';

export default function ArticleDirectoryPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">
      <div className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-4">Article Directory</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-serif">
          Browse our complete collection of peer-reviewed publications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="md:col-span-1 space-y-8">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </h3>
            <input 
              type="text" 
              placeholder="Keywords, authors, DOI..." 
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
            />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter by Year
            </h3>
            <div className="space-y-2">
              {['2026', '2025', '2024'].map(year => (
                <label key={year} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                  {year}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Category</h3>
            <div className="flex flex-wrap gap-2">
              {['Technology', 'Education', 'Sustainability', 'AI', 'Algorithms'].map(cat => (
                <Badge key={cat} variant="secondary" className="cursor-pointer font-normal hover:bg-slate-200 dark:hover:bg-slate-800">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </aside>

        {/* Article List */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-500 font-medium">{MOCK_ARTICLES.length} results found</span>
            <select className="border border-slate-300 dark:border-slate-700 rounded-md text-sm px-3 py-1.5 bg-white dark:bg-slate-900">
              <option>Sort by: Newest</option>
              <option>Sort by: Most Cited</option>
              <option>Sort by: Most Viewed</option>
            </select>
          </div>

          <div className="space-y-2">
            {MOCK_ARTICLES.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-slate-100 dark:bg-slate-800">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
