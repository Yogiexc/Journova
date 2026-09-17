import { MOCK_ISSUES } from '@/data/issues';
import { IssueCard } from '@/components/issues/IssueCard';

export default function IssuesPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
      <div className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-4">Current & Past Issues</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-serif max-w-2xl">
          Browse through the complete collection of Journova issues. We publish cutting-edge research regularly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {MOCK_ISSUES.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
