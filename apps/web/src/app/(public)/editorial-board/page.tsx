import Link from 'next/link';
import { EDITORIAL_BOARD_DATA } from '@/data/editorial';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ShieldCheck, Mail } from 'lucide-react';

export const metadata = {
  title: 'Editorial Team | Journova Press',
  description: 'Meet the distinguished editorial board and advisory leaders steering academic rigor and open-access publishing at Journova.',
};

export default function EditorialBoardPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Hero Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Governance & Editorial Integrity
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 dark:text-white mb-4">
            Editorial Board
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-serif max-w-3xl leading-relaxed">
            Journova operates under strict peer-review governance aligned with COPE (Committee on Publication Ethics) principles. Our international editorial team ensures academic rigor, impartiality, and excellence.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-12 max-w-5xl space-y-16">
        {EDITORIAL_BOARD_DATA.map((section, sIdx) => (
          <section key={sIdx} className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-2xl md:text-3xl font-serif text-slate-900 dark:text-white">
                {section.role}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {section.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.members.map((member, mIdx) => (
                <div
                  key={mIdx}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-white">
                          {member.name}
                        </h3>
                        <p className="text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400 mt-0.5">
                          {member.roleTitle}
                        </p>
                      </div>
                      {member.orcid && (
                        <a
                          href={`https://orcid.org/${member.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View ORCID Profile"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors shrink-0"
                        >
                          <span>ORCID</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5 mb-4 font-sans">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{member.affiliation}</p>
                      <p>{member.department}</p>
                      <p className="text-slate-500">{member.country}</p>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-serif">
                      {member.bio}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Research Expertise
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {member.specialization.map((spec, spIdx) => (
                        <Badge
                          key={spIdx}
                          variant="secondary"
                          className="text-xs font-normal bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Ethics & Contact Callout */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-8 md:p-10 shadow-lg border border-slate-700">
          <div className="max-w-2xl space-y-4">
            <h3 className="text-2xl font-serif font-medium">Interested in Joining the Editorial & Reviewer Board?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Journova welcomes active scholars with proven publishing records to join as peer reviewers or track editors. Help us shape the future of transparent, high-standard open scholarship.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium px-5 py-2.5 text-sm transition-all"
              >
                Register as Reviewer
              </Link>
              <a
                href="mailto:editorial@journova.com"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-800 px-5 py-2.5 text-sm text-slate-200 transition-all"
              >
                <Mail className="w-4 h-4" />
                Contact Editorial Office
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
