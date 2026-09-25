'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Next.js App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 max-w-md w-full">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif text-slate-900 dark:text-white mb-2">Something went wrong!</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We encountered an unexpected error while trying to process your request.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => reset()}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
