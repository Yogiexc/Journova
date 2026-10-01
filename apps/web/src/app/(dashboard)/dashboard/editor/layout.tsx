import { AuthGuard } from "@/components/layout/AuthGuard";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="EDITOR">{children}</AuthGuard>;
}
