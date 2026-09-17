import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

export default function ReviewerDashboardPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-1">Reviewer Dashboard</h1>
        <p className="text-sm text-slate-500">Manage your peer review assignments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">2</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">0</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <CardTitle className="text-lg font-medium">Assigned Manuscripts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Assignment 1 */}
            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">#SUB-1024</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">Review In Progress</Badge>
                </div>
                <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                  Evaluating the Impact of Quantum Algorithms on Cryptography
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 pt-2">
                  <div><strong>Assigned:</strong> Sep 15, 2026</div>
                  <div className="text-amber-600 dark:text-amber-400"><strong>Due:</strong> Oct 01, 2026</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[140px]">
                <Button asChild className="w-full">
                  <Link href="/dashboard/reviewer/1024">Continue Review</Link>
                </Button>
              </div>
            </div>

            {/* Assignment 2 */}
            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">#SUB-1089</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">New Assignment</Badge>
                </div>
                <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                  Generative AI in Legal Tech: A Systematic Review
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 pt-2">
                  <div><strong>Assigned:</strong> Sep 17, 2026</div>
                  <div><strong>Due:</strong> Oct 05, 2026</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[140px]">
                <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30" asChild>
                  <Link href="/dashboard/reviewer/1089">Accept Review</Link>
                </Button>
                <Button variant="ghost" className="w-full text-slate-500 hover:text-rose-600">Decline</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
