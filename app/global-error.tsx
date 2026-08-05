"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full items-center justify-center bg-background px-4 py-12 text-foreground">
        <div className="flex flex-col items-center gap-8 text-center animate-fade-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold tracking-tight text-primary-foreground shadow-[0_6px_20px_rgba(11,95,255,0.25)]">
            DW
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <p className="text-7xl font-bold tracking-tight text-foreground">
              500
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              An unexpected error occurred. Try again, or contact support if the
              problem persists.
            </p>
          </div>

          <Button size="lg" onClick={reset}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
