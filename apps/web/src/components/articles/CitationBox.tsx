'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Quote } from 'lucide-react';

interface CitationBoxProps {
  title: string;
  authors: { author: { full_name: string } }[];
  journalName?: string;
  year?: number | string;
  volume?: number | string;
  issue?: number | string;
  doi?: string;
  url: string;
}

export function CitationBox({
  title,
  authors,
  journalName = 'Journova Press',
  year = new Date().getFullYear(),
  volume = 1,
  issue = 1,
  doi,
  url,
}: CitationBoxProps) {
  const [activeTab, setActiveTab] = useState<'apa' | 'ieee' | 'bibtex'>('apa');
  const [copied, setCopied] = useState(false);

  // Format author names
  const authorNames = authors.map((a) => a.author.full_name);
  const authorTextApa =
    authorNames.length > 0
      ? authorNames.join(', & ')
      : 'Author, A. A.';
  const authorTextIeee =
    authorNames.length > 0
      ? authorNames.join(', ')
      : 'A. A. Author';

  // Build formats
  const apa = `${authorTextApa} (${year}). ${title}. ${journalName}, ${volume}(${issue}). ${
    doi ? `https://doi.org/${doi}` : url
  }`;

  const ieee = `${authorTextIeee}, "${title}," ${journalName}, vol. ${volume}, no. ${issue}, ${year}${
    doi ? `, doi: ${doi}` : ''
  }.`;

  const bibtex = `@article{journova_${year}_${(authors[0]?.author.full_name || 'author').split(' ')[0].toLowerCase()},
  author    = {${authorNames.join(' and ')}},
  title     = {${title}},
  journal   = {${journalName}},
  year      = {${year}},
  volume    = {${volume}},
  number    = {${issue}},
  url       = {${url}}${doi ? `,\n  doi       = {${doi}}` : ''}
}`;

  const currentCitation = activeTab === 'apa' ? apa : activeTab === 'ieee' ? ieee : bibtex;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCitation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Quote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="font-serif font-semibold text-base">Cite this Article</h3>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
          {(['apa', 'ieee', 'bibtex'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <pre className="font-mono text-xs bg-slate-50 dark:bg-slate-950/80 p-4 rounded-lg text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-800">
          {currentCitation}
        </pre>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="absolute top-2 right-2 text-xs h-7 px-2.5 gap-1.5 shadow-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

