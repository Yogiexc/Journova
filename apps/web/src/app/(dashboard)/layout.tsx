import { Navbar } from "@/components/navbar";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-slate-950">
      <Navbar />
      <AuthGuard>
        <div className="flex-1 flex container mx-auto px-4 md:px-8 max-w-7xl">
          <DashboardSidebar />
          <main className="flex-1 py-8 md:pl-8">
            {children}
          </main>
        </div>
      </AuthGuard>
    </div>
  );
}
