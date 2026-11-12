import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, ArrowRight, BookCheck, ShieldAlert, Clock } from 'lucide-react';

export const metadata = {
  title: 'Author Guidelines | Journova Press',
  description: 'Comprehensive submission guidelines, manuscript preparation, ethical standards, and peer-review process for Journova authors.',
};

export default function AuthorGuidelinesPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4">
            <BookCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Author Instructions & Policies
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 dark:text-white mb-4">
            Author Guidelines
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-serif max-w-3xl leading-relaxed">
            Everything you need to prepare, structure, format, and submit your manuscript for peer review and publication at Journova Press.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Guide Body */}
          <div className="lg:col-span-8 space-y-12">
            {/* Step Overview */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h2 className="text-2xl font-serif font-medium text-slate-900 dark:text-white mb-6">
                Editorial Review Workflow
              </h2>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Initial Submission & Screening',
                    desc: 'Editor evaluates manuscript scope, similarity check (<20% Turnitin threshold), and formatting compliance within 3-5 days.',
                  },
                  {
                    step: '02',
                    title: 'Double-Blind Peer Review',
                    desc: 'Manuscript is anonymized and assigned to at least two independent expert reviewers. Review turnaround is typically 3-4 weeks.',
                  },
                  {
                    step: '03',
                    title: 'Editorial Decision & Revision',
                    desc: 'Authors receive constructive reviewer rubrics: Accept, Minor Revisions, Major Revisions, or Decline. Authors have 14 days to submit revisions.',
                  },
                  {
                    step: '04',
                    title: 'Copyediting, Galley Proof & DOI Deposit',
                    desc: 'Accepted papers receive professional copyediting, author proof approval, immediate Open Access publication, and Crossref DOI deposit.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="font-serif font-bold text-amber-600 dark:text-amber-400 text-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Manuscript Structure */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <h2 className="text-2xl font-serif font-medium text-slate-900 dark:text-white">
                Manuscript Structure Requirements
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                Articles must be submitted as a clean PDF or Microsoft Word document following the standard IMRaD format (Introduction, Method, Results, and Discussion).
              </p>

              <div className="space-y-4">
                {[
                  {
                    part: 'Title & Abstract',
                    detail: 'Title max 20 words. Structured abstract between 150-250 words summarizing background, methodology, key findings, and scientific impact. 4-6 indexing keywords.',
                  },
                  {
                    part: 'Introduction',
                    detail: 'Contextualize the scientific problem, state of the art literature review, identifiable research gaps, and explicit contributions of this work.',
                  },
                  {
                    part: 'Methodology & Data Availability',
                    detail: 'Provide comprehensive procedural detail to guarantee reproducibility. Authors must include a Data Availability statement disclosing where code or datasets are hosted.',
                  },
                  {
                    part: 'Results & Critical Discussion',
                    detail: 'Present data clearly using high-resolution figures (min. 300 DPI) and vector graphs. Contrast your findings with existing seminal benchmarks in the literature.',
                  },
                  {
                    part: 'References & Citation Style',
                    detail: 'Strict APA 7th Edition style. Every cited reference must include an active Crossref DOI link whenever available.',
                  },
                ].map((sec, sIdx) => (
                  <div key={sIdx} className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 py-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{sec.part}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{sec.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Ethical Standards */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="text-2xl font-serif font-medium text-slate-900 dark:text-white">
                  Publication Ethics & Plagiarism Policy
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Journova upholds zero tolerance for academic misconduct, data falsification, duplicate publication, or honorary authorship. All authors must confirm:
              </p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>The manuscript is entirely original and has not been submitted elsewhere simultaneously.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>All co-authors have actively contributed and consented to the submitted manuscript version.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Conflicts of interest, commercial ties, and funding sources are explicitly stated in the acknowledgment section.</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Quick Info & Submission Card */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 sticky top-24">
              <div>
                <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Ready to Submit?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Log in to your author account to start your submission or check the review status of existing manuscripts.
                </p>
              </div>

              <div className="space-y-2">
                <Link href="/login" className="w-full block">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 gap-2">
                    <FileText className="w-4 h-4" /> Start New Submission
                  </Button>
                </Link>
                <Link href="/register" className="w-full block">
                  <Button variant="outline" className="w-full text-xs">
                    Create Author Account
                  </Button>
                </Link>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  At a Glance
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Peer Review Model</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Double-Blind</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">First Decision</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">21 - 28 Days</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Article Processing Charge</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Zero APC (Diamond OA)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Licensing</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">CC BY 4.0</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
