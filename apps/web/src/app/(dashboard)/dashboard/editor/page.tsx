import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, FileSearch, CheckCircle, RefreshCcw, Users } from 'lucide-react';

export default function EditorDashboardPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-1">Editor Dashboard</h1>
          <p className="text-sm text-slate-500">Manage the complete editorial lifecycle of your journal.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" /> Manage Reviewers
          </Button>
        </div>
      </div>

      {/* Editor Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">12</h3>
            <p className="text-sm font-medium text-slate-500">New Submissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">5</h3>
            <p className="text-sm font-medium text-slate-500">Under Review</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">3</h3>
            <p className="text-sm font-medium text-slate-500">Revision Required</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">8</h3>
            <p className="text-sm font-medium text-slate-500">Accepted</p>
          </CardContent>
        </Card>
      </div>

      {/* Editor Queue */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Recent Activity Queue</CardTitle>
          <select className="text-sm border-slate-200 dark:border-slate-700 bg-transparent rounded-md focus:ring-primary">
            <option>All Statuses</option>
            <option>Action Required</option>
            <option>New Submissions</option>
          </select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            
            {/* Item 1 - Action Required (Review complete) */}
            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row justify-between gap-6 bg-amber-50/30 dark:bg-amber-950/10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 font-mono">#SUB-1089</span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400">Reviews Complete (2/2)</Badge>
                </div>
                <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                  <Link href="/dashboard/editor/submissions/1089" className="hover:text-primary transition-colors">
                    Generative AI in Legal Tech: A Systematic Review
                  </Link>
                </h4>
                <div className="flex gap-4 text-sm text-slate-500 pt-1">
                  <span><strong>Author:</strong> Dr. Budi Santoso</span>
                  <span><strong>Round:</strong> 1</span>
                </div>
              </div>
              <div className="flex items-center">
                <Button asChild className="w-full whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white">
                  <Link href="/dashboard/editor/submissions/1089">Make Editorial Decision</Link>
                </Button>
              </div>
            </div>

            {/* Item 2 - New Submission */}
            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 font-mono">#SUB-1090</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400">New Submission</Badge>
                </div>
                <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                  <Link href="/dashboard/editor/submissions/1090" className="hover:text-primary transition-colors">
                    Evaluating the Impact of Quantum Algorithms on Cryptography
                  </Link>
                </h4>
                <div className="flex gap-4 text-sm text-slate-500 pt-1">
                  <span><strong>Author:</strong> Prof. Michael Chen</span>
                  <span><strong>Submitted:</strong> Today, 14:30</span>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="outline" asChild className="w-full whitespace-nowrap">
                  <Link href="/dashboard/editor/submissions/1090">Initial Check & Assign</Link>
                </Button>
              </div>
            </div>

            {/* Item 3 - Under Review */}
            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row justify-between gap-6 opacity-75">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 font-mono">#SUB-1024</span>
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300">Under Review (1/2)</Badge>
                </div>
                <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                  Sustainable Energy Solutions in Developing Nations
                </h4>
                <div className="flex gap-4 text-sm text-slate-500 pt-1">
                  <span><strong>Author:</strong> Dr. Sarah Johnson</span>
                  <span><strong>Status:</strong> Waiting for Reviewer 2</span>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" asChild className="w-full whitespace-nowrap">
                  <Link href="/dashboard/editor/submissions/1024">View Progress</Link>
                </Button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
