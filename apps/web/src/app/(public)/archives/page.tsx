import Link from 'next/link';

export default function ArchivesPage() {
  const archives = [
    {
      year: 2026,
      issues: [
        { id: 'issue-1', title: 'Current Trends in Technology', vol: 1, no: 1 },
        { id: 'issue-2', title: 'Future of Artificial Intelligence', vol: 1, no: 2 },
      ]
    },
    {
      year: 2025,
      issues: [
        { id: 'issue-3', title: 'Machine Learning in Healthcare', vol: 0, no: 1 },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
      <div className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-4">Archives</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-serif">
          Past publications organized by year and volume.
        </p>
      </div>

      <div className="space-y-12">
        {archives.map((yearGroup) => (
          <div key={yearGroup.year}>
            <h2 className="text-2xl font-serif text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-6">
              {yearGroup.year}
            </h2>
            <ul className="space-y-4">
              {yearGroup.issues.map(issue => (
                <li key={issue.id} className="group flex items-center">
                  <span className="w-32 text-sm text-slate-500">Vol. {issue.vol} No. {issue.no}</span>
                  <Link href={`/issues/${issue.id}`} className="text-lg font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                    {issue.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
