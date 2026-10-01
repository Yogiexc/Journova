import { AuthGuard } from "@/components/layout/AuthGuard";

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="REVIEWER">{children}</AuthGuard>;
}
