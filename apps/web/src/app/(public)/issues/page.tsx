import { IssueCard } from '@/components/issues/IssueCard';

async function getIssues() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const res = await fetch(`${apiUrl}/issues`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Failed to fetch issues", error);
    return [];
  }
}

export default async function IssuesPage() {
  const issues = await getIssues();

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
      <div className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-4">Current & Past Issues</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-serif max-w-2xl">
          Browse through the complete collection of Journova issues. We publish cutting-edge research regularly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {issues.length > 0 ? (
          issues.map((issue: any) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-slate-500">No issues found.</div>
        )}
      </div>
    </div>
  );
}
