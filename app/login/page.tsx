"use client";

import { useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}

function LoginForm() {
  const { login, loginWithOtp } = useAuth();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [otpStage, setOtpStage] = useState<"email" | "code">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; devOtp?: string }>("/auth/request-login-otp", { email });
      if (res.devOtp) setDevOtp(res.devOtp);
      setOtpStage("code");
      setInfo("We sent a 6-digit code to your email. It expires in 10 minutes.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginWithOtp(email, otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
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
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your Digital Wave HRM account to continue.
              </p>
            </div>
            <div className="flex rounded-[12px] bg-muted p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => { setMode("password"); setError(""); setInfo(""); }}
                className={`flex-1 rounded-[9px] px-4 py-1.5 transition-colors ${mode === "password" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setMode("otp"); setOtpStage("email"); setError(""); setInfo(""); }}
                className={`flex-1 rounded-[9px] px-4 py-1.5 transition-colors ${mode === "otp" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              >
                Email code
              </button>
            </div>
          </div>

          {mode === "password" ? (
            <form className="flex flex-col gap-5" onSubmit={handlePasswordSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
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

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                />
                Remember me
              </label>

              {error ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : otpStage === "email" ? (
            <form className="flex flex-col gap-5" onSubmit={handleRequestOtp}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp-email">Email</Label>
                <Input
                  id="otp-email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send a one-time 6-digit code to this address.
                </p>
              </div>

              {error ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={submitting || !email}>
                {submitting ? "Sending…" : "Send code"}
              </Button>
            </form>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleVerifyOtp}>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MailCheck className="h-5 w-5" />
                </div>
                {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}
                {devOtp ? (
                  <p className="rounded-lg bg-warning/10 px-3 py-1.5 text-xs text-warning">
                    Dev mode — code: <strong>{devOtp}</strong>
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp-code">Verification code</Label>
                <Input
                  id="otp-code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.5em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              {error ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={submitting || otp.length !== 6}>
                {submitting ? "Verifying…" : "Verify and sign in"}
              </Button>
              <button
                type="button"
                onClick={() => { setOtpStage("email"); setError(""); setInfo(""); }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Use a different email
              </button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground">
            © 2026 Digital Wave
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
