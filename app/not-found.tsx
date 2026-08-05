import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-8 text-center animate-fade-up">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold tracking-tight text-primary-foreground shadow-[0_6px_20px_rgba(11,95,255,0.25)]">
          DW
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Compass className="h-8 w-8" />
          </div>
          <p className="text-7xl font-bold tracking-tight text-foreground">
            404
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Double-check the URL and try again.
          </p>
        </div>

        <Link href="/">
          <Button size="lg">Back to Dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
