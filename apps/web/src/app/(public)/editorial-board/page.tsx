import { MOCK_EDITORIAL_BOARD } from '@/data/editorial';

export default function EditorialBoardPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
      <div className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-4">Editorial Team</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-serif">
          Meet the distinguished academics and professionals leading Journova Press.
        </p>
      </div>

      <div className="space-y-16">
        {MOCK_EDITORIAL_BOARD.map((group, idx) => (
          <div key={idx}>
            <h2 className="text-2xl font-serif text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-8">
              {group.role}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {group.members.map((member, mIdx) => (
                <div key={mIdx} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-4">{member.affiliation}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
