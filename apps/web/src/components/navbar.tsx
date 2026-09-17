import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-primary">Journova</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/articles" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Articles</Link>
            <Link href="/issues" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Issues</Link>
            <Link href="/archives" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Archives</Link>
            <Link href="/editorial-board" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Editorial Team</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors hidden md:block">Sign In</Link>
          <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
            Submit Manuscript
          </Link>
        </div>
      </div>
    </nav>
  );
}
