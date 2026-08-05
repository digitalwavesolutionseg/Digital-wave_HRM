import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/sidebar-context";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" richColors closeButton />
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}