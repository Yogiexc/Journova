import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <main className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Welcome to <span className="text-blue-600">Journova</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-10">
          The modern, modular, and mobile-first platform for academic journal management and scientific publishing.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/articles" 
            className="px-6 py-3 bg-white text-slate-900 font-medium rounded-lg shadow hover:bg-slate-100 transition-colors border border-slate-200"
          >
            Browse Articles
          </Link>
          <Link 
            href="/login" 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Login / Submit
          </Link>
        </div>
      </main>
    </div>
  );
}
