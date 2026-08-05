import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-8 text-center animate-fade-up">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold tracking-tight text-primary-foreground shadow-[0_6px_20px_rgba(11,95,255,0.25)]">
          DW
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Lock className="h-8 w-8" />
          </div>
          <p className="text-7xl font-bold tracking-tight text-foreground">
            403
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Access denied
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            You don&apos;t have permission to view this page. Contact your
            administrator if you believe this is a mistake.
          </p>
        </div>

        <Link href="/">
          <Button size="lg">Back to Dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
