import { AuthGuard } from "@/components/layout/AuthGuard";

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="AUTHOR">{children}</AuthGuard>;
}
