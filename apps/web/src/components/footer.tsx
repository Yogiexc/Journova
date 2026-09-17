import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t py-12 mt-16">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <span className="text-2xl font-bold tracking-tight text-primary mb-4 block">Journova</span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A modern, open-access platform for discovering and publishing peer-reviewed academic research across various disciplines.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Journal</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/articles" className="hover:text-primary transition-colors">All Articles</Link></li>
            <li><Link href="/issues" className="hover:text-primary transition-colors">Current Issue</Link></li>
            <li><Link href="/archives" className="hover:text-primary transition-colors">Archives</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Information</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/editorial-board" className="hover:text-primary transition-colors">Editorial Board</Link></li>
            <li><Link href="/author-guidelines" className="hover:text-primary transition-colors">Author Guidelines</Link></li>
            <li><Link href="/ethics" className="hover:text-primary transition-colors">Publication Ethics</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Connect</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-slate-500">© 2026 Journova Press. All rights reserved.</p>
        <p className="text-sm text-slate-400 mt-4 md:mt-0">ISSN: XXXX-XXXX</p>
      </div>
    </footer>
  );
}
