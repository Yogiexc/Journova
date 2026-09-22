"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { fetchApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function NewSubmissionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [submissionId, setSubmissionId] = useState("");

  const handleCreateDraft = async () => {
    if (!title || !abstract) {
      setError("Title and Abstract are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetchApi('/api/v1/submissions', {
        method: 'POST',
        body: JSON.stringify({ title, abstract })
      });
      if (res && res.data) {
        setSubmissionId(res.data.id);
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create draft");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      // 1. Upload mock file
      await fetchApi(`/api/v1/submissions/${submissionId}/versions`, {
        method: 'POST',
        body: JSON.stringify({ notes: "Initial upload" })
      });

      // 2. Submit
      await fetchApi(`/api/v1/submissions/${submissionId}/submit`, {
        method: 'POST'
      });
      
      router.push(`/dashboard/author/submissions/${submissionId}`);
    } catch (err: any) {
      setError(err.message || "Failed to upload or submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-2">New Submission</h1>
        <p className="text-sm text-slate-500">Please follow the steps below to submit your manuscript for peer review.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{step === 1 ? 'Article Metadata' : 'Upload Manuscript'}</CardTitle>
          <CardDescription>
            {step === 1 ? 'Enter the title and abstract for your submission.' : 'Upload your manuscript file.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Article Title <span className="text-red-500">*</span></label>
                <Input placeholder="Enter the full title of your manuscript" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Abstract <span className="text-red-500">*</span></label>
                <textarea 
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Paste your abstract here"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button onClick={handleCreateDraft} disabled={loading}>
                  {loading ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-4">In this MVP phase, clicking the button below will automatically generate and attach a mock PDF file to your submission, then finalize it.</p>
                <Button onClick={handleUploadAndSubmit} disabled={loading}>
                  {loading ? 'Processing...' : 'Upload Mock File & Finalize Submission'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
