"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AuthProvider, useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}

function RegisterForm() {
  const { verifySignup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"form" | "verify">("form");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    void role;
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: workEmail, password, firstName, lastName }),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof data?.message === "string" ? data.message : "Registration failed."
        );
      }
      if (data?.devOtp) setDevOtp(data.devOtp);
      setStage("verify");
      setInfo(`We sent a 6-digit code to ${workEmail}. Enter it below to verify your account.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await verifySignup(workEmail, otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: workEmail }),
        }
      );
      const data = await res.json().catch(() => null);
      if (data?.devOtp) setDevOtp(data.devOtp);
      setInfo("A new code has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the code.");
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
                {stage === "form" ? "Create account" : "Verify your email"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {stage === "form"
                  ? "Start your journey with Digital Wave HRM in minutes."
                  : "Enter the 6-digit code we emailed you."}
              </p>
            </div>
          </div>

          {stage === "verify" ? (
            <form className="flex flex-col gap-5" onSubmit={handleVerify}>
              {info ? <p className="text-center text-sm text-muted-foreground">{info}</p> : null}
              {devOtp ? (
                <p className="rounded-lg bg-warning/10 px-3 py-2 text-center text-xs text-warning">
                  Dev mode — code: <strong>{devOtp}</strong>
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
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
                {submitting ? "Verifying…" : "Verify and continue"}
              </Button>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={submitting}
                  className="font-medium text-primary hover:underline"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => { setStage("form"); setError(""); setInfo(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Edit details
                </button>
              </div>
            </form>
          ) : (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jane"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="workEmail">Work Email</Label>
              <Input
                id="workEmail"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
              </Select>
            </div>

            {error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-primary hover:text-primary/80 hover:underline"
            >
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
