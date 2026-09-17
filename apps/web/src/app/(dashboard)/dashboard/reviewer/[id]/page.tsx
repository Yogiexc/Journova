import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, CheckCircle2, AlertCircle, FileUp } from 'lucide-react';

export default function ReviewSubmissionPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/reviewer" className="hover:text-slate-900">Dashboard</Link>
        <span>/</span>
        <span>Review Submission #{params.id}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-serif text-slate-900 dark:text-white mb-2">Review Form</h1>
        <p className="text-sm text-slate-500">Evaluating the Impact of Quantum Algorithms on Cryptography</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
              <CardDescription>Select your final recommendation for the editor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                <input type="radio" name="recommendation" className="text-primary w-4 h-4" />
                <span className="text-sm font-medium">Accept Submission</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                <input type="radio" name="recommendation" className="text-primary w-4 h-4" />
                <span className="text-sm font-medium">Minor Revision Required</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                <input type="radio" name="recommendation" className="text-primary w-4 h-4" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-500">Major Revision Required</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                <input type="radio" name="recommendation" className="text-primary w-4 h-4" />
                <span className="text-sm font-medium text-rose-600 dark:text-rose-500">Reject Submission</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments to Author</CardTitle>
              <CardDescription>These comments will be visible to the author.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea 
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Provide constructive feedback, methodology critique, etc..."
              ></textarea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confidential Comments to Editor</CardTitle>
              <CardDescription>These comments will ONLY be visible to the editor.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Any private concerns regarding plagiarism, conflict of interest, or overall quality..."
              ></textarea>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Save Draft</Button>
            <Button>Submit Review</Button>
          </div>
        </div>

        {/* Right Column: Context/Files */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Files to Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <FileUp className="w-4 h-4 text-slate-400" />
                  Manuscript (Blind)
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-900 text-sm leading-relaxed">
            <strong>Double-Blind Policy:</strong> The author identities have been removed from the manuscript. Please ensure your review does not contain your identifying information.
          </div>
        </div>
      </div>
    </div>
  );
}
