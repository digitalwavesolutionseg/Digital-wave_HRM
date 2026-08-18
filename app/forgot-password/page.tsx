"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

type Step = "email" | "otp" | "password";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          typeof data?.message === "string" ? data.message : "Could not send the code."
        );
      }
      setMessage("If an account exists for that email, a 6-digit code has been sent.");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setSubmitting(true);
    try {
      setStep("password");
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.trim(), password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          typeof data?.message === "string" ? data.message : "Could not reset your password."
        );
      }
      setMessage("Password reset successfully.");
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-fade-up">
        <CardContent className="flex flex-col gap-8 p-8 sm:p-10">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold tracking-tight text-primary-foreground shadow-[0_6px_20px_rgba(11,95,255,0.25)]">
              DW
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {step === "email"
                  ? "Forgot password"
                  : step === "otp"
                    ? "Check your inbox"
                    : "Set a new password"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {step === "email"
                  ? "Enter your email and we'll send you a one-time code."
                  : step === "otp"
                    ? `Enter the 6-digit code sent to ${email}.`
                    : "Choose a new password for your account."}
              </p>
            </div>
          </div>

          {step === "email" ? (
            <form className="flex flex-col gap-5" onSubmit={requestOtp}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {message ? (
                <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset code"}
              </Button>
            </form>
          ) : null}

          {step === "otp" ? (
            <form className="flex flex-col gap-5" onSubmit={verifyOtp}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp">6-digit code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl font-bold tracking-[0.5em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              {error ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                Continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                size="lg"
                disabled={submitting}
                onClick={requestOtp}
              >
                Resend code
              </Button>
            </form>
          ) : null}

          {step === "password" ? (
            <form className="flex flex-col gap-5" onSubmit={resetPassword}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">New Password</Label>
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
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          ) : null}

          <div className="flex flex-col gap-2 text-center">
            {step === "otp" || step === "password" ? (
              <button
                type="button"
                onClick={() => setStep(step === "otp" ? "email" : "otp")}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {step === "otp" ? "Change email" : "Re-enter code"}
              </button>
            ) : null}
            <p className="text-sm text-muted-foreground">
              Remembered it?{" "}
              <a
                href="/login"
                className="font-medium text-primary hover:text-primary/80 hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
