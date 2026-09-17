import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUp, CheckCircle2, ChevronRight, User } from 'lucide-react';

export default function NewSubmissionPage() {
  // Static mockup for step 1 of the wizard
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-2">New Submission</h1>
        <p className="text-sm text-slate-500">Please follow the steps below to submit your manuscript for peer review.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
        
        {/* Step 1 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm ring-4 ring-slate-50 dark:ring-slate-950">1</div>
          <span className="text-xs font-medium text-slate-900 dark:text-white">Metadata</span>
        </div>
        {/* Step 2 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm ring-4 ring-slate-50 dark:ring-slate-950">2</div>
          <span className="text-xs font-medium text-slate-500">Authors</span>
        </div>
        {/* Step 3 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm ring-4 ring-slate-50 dark:ring-slate-950">3</div>
          <span className="text-xs font-medium text-slate-500">Upload</span>
        </div>
        {/* Step 4 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm ring-4 ring-slate-50 dark:ring-slate-950">4</div>
          <span className="text-xs font-medium text-slate-500">Review</span>
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>Article Metadata</CardTitle>
          <CardDescription>Enter the title, abstract, and keywords for your submission.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Article Title <span className="text-red-500">*</span></label>
            <Input placeholder="Enter the full title of your manuscript" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Abstract <span className="text-red-500">*</span></label>
            <textarea 
              className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Paste your abstract here (150-250 words)"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keywords <span className="text-red-500">*</span></label>
              <Input placeholder="e.g. Machine Learning, Education (comma separated)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option>Select a category...</option>
                <option>Computer Science</option>
                <option>Education</option>
                <option>Sustainability</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button className="gap-2">
              Save & Continue to Authors <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
