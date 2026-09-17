import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Users, Mail, FileCheck } from 'lucide-react';

export default function EditorSubmissionViewPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/editor" className="hover:text-slate-900">Dashboard</Link>
        <span>/</span>
        <span>Submission #{params.id}</span>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400">Reviews Complete</Badge>
            <span className="text-sm font-medium text-slate-500">Round 1</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-slate-900 dark:text-white mb-2 leading-tight max-w-3xl">
            Generative AI in Legal Tech: A Systematic Review
          </h1>
          <p className="text-sm text-slate-600">Author: <strong>Dr. Budi Santoso</strong> • Submitted: Sep 15, 2026</p>
        </div>
        <Button className="shrink-0 gap-2 bg-amber-600 hover:bg-amber-700 text-white">
          <FileCheck className="w-4 h-4" /> Make Decision
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column: Review Results */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Review Results</CardTitle>
                <Badge variant="secondary">2 of 2 Completed</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Reviewer 1 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Reviewer 1 (Blind)</h4>
                      <p className="text-xs text-slate-500">Submitted: Sep 28, 2026</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Accept</Badge>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block mb-1">Author Comments:</span>
                      <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded">
                        "The methodology is extremely sound and the systematic review covers all necessary recent literature. Very well written."
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block mb-1 text-rose-600">Confidential Editor Comments:</span>
                      <p className="text-slate-600 dark:text-slate-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 p-3 rounded">
                        "No signs of plagiarism or conflicts of interest detected. A solid paper ready for publication."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviewer 2 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Reviewer 2 (Blind)</h4>
                      <p className="text-xs text-slate-500">Submitted: Oct 01, 2026</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Minor Revision</Badge>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block mb-1">Author Comments:</span>
                      <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded">
                        "Good overview, but the section on EU regulations is slightly outdated. Please update paragraph 3 in the Discussion section."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Meta & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Manuscript Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Download className="w-4 h-4 text-slate-400" />
                Original Submission PDF
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                <Download className="w-4 h-4 text-emerald-500" />
                Blind Version PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Reviewers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>Prof. A (Completed)</span>
                <Mail className="w-4 h-4 text-slate-400 cursor-pointer hover:text-primary" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Dr. B (Completed)</span>
                <Mail className="w-4 h-4 text-slate-400 cursor-pointer hover:text-primary" />
              </div>
              <Button variant="secondary" size="sm" className="w-full mt-2 gap-2">
                <Users className="w-4 h-4" /> Assign Additional
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
