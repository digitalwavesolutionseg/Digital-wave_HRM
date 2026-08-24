"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { AuthProvider, useAuth } from "@/components/auth-provider";

export default function AcceptInvitePage() {
  return (
    <AuthProvider>
      <Suspense>
        <AcceptInviteForm />
      </Suspense>
    </AuthProvider>
  );
}

function AcceptInviteForm() {
  const { acceptInvite } = useAuth();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function policyError(pw: string): string | null {
    if (pw.length < 10) return "Password must be at least 10 characters.";
    if (!/[A-Z]/.test(pw)) return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(pw)) return "Password must contain a lowercase letter.";
    if (!/\d/.test(pw)) return "Password must contain a digit.";
    if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain a special character.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const policy = policyError(password);
    if (policy) {
      setError(policy);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await acceptInvite(token, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept the invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md animate-fade-up">
          <CardContent className="flex flex-col gap-6 p-8 text-center sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_6px_20px_rgba(11,95,255,0.25)] mx-auto">
              <img src="/logo.png" alt="Digital Wave" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Invalid invitation link</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This link is missing its invitation token. Please ask your administrator to resend
                the invitation.
              </p>
            </div>
            <a href="/login" className="text-sm font-medium text-primary hover:underline">
              Go to sign in
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-fade-up">
        <CardContent className="flex flex-col gap-8 p-8 sm:p-10">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_6px_20px_rgba(11,95,255,0.25)]">
              <img src="/logo.png" alt="Digital Wave" className="h-12 w-12 object-contain" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Activate your account
              </h1>
              <p className="text-sm text-muted-foreground">
                You&apos;ve been invited to Digital Wave HRM. Set a password to finish setting up
                your account.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
              <MailCheck className="h-4 w-4 shrink-0" />
              Your email will be verified automatically when you set your password.
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                At least 10 characters with uppercase, lowercase, a digit and a symbol.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Activating…" : "Set password and sign in"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">© 2026 Digital Wave</p>
        </CardContent>
      </Card>
    </main>
  );
}
