import Link from 'next/link';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex">
      {/* Left Pane - Editorial Image/Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1500&auto=format&fit=crop')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-serif font-bold tracking-tight">Journova</Link>
        </div>
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-serif mb-4 leading-tight">Modernizing Scientific Publishing</h2>
          <p className="text-slate-300">
            Join thousands of researchers advancing global knowledge through rigorous peer-review and open access.
          </p>
        </div>
      </div>

      {/* Right Pane - Form Content */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-slate-950">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Branding */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">Journova</Link>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
