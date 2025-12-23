"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { loginSchema, signupSchema } from "@/lib/user/userSchema"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import logo from "@/assets/logo.png"

type Mode = "login" | "signup"

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const title = mode === "login" ? "Welcome back" : "Create your account"
  const subtitle =
    mode === "login"
      ? "Log in to access your portal."
      : "Sign up to start tracking your job pipeline."

  const cta = mode === "login" ? "Log in" : "Create account"
  const altHref = mode === "login" ? "/signup" : "/login"
  const altText = mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"

  const schema = useMemo(() => (mode === "login" ? loginSchema : signupSchema), [mode])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    setBusy(true)
    const res = await apiFetch<void>(mode === "login" ? "/auth/login" : "/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        Email: parsed.data.email,
        Password: parsed.data.password,
      }),
    })
    setBusy(false)

    if (!res.ok) {
      setError(res.error.message || "Request failed")
      return
    }

    router.replace("/")
  }

  const noteText =
    mode === "signup"
      ? "Note: your password is securely hashed and never stored in plain text. Don’t reuse a password you use anywhere else."
      : "Tip: Remember to update a role’s status as your process moves from applied → interview → offer/rejected."

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-secondary blur-3xl" />
        <div className="absolute left-[-220px] top-[180px] h-[460px] w-[460px] rounded-full bg-accent blur-3xl" />
        <div className="absolute right-[-220px] top-[260px] h-[460px] w-[460px] rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="hidden lg:flex">
            <Card className="w-full rounded-3xl border-border bg-card p-8">
              <div className="flex items-center gap-3">
                <Image src={logo} alt="Loggy logo" className="h-8 w-auto object-contain" priority />
                <div className="-mt-0.5">
                  <div className="text-sm font-semibold">Loggy</div>
                  <div className="text-xs text-muted-foreground">Job application tracker</div>
                </div>
              </div>

              <Separator className="my-6 bg-border" />

              <div className="grid gap-10">
                <div className="text-xl font-semibold tracking-tight">Keep your pipeline honest.</div>
                <div className="text-sm leading-6 text-muted-foreground">
                  Add roles, update statuses, keep notes and context, and see what’s actually happening in your search.
                </div>

                <div className="grid gap-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs">
                      ✓
                    </span>
                    <span>Fast CRUD — no fluff.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs">
                      ✓
                    </span>
                    <span>Source, location, contact, applied date.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs">
                      ✓
                    </span>
                    <span>Server-side sorting/filtering.</span>
                  </div>
                </div>

                <div className="mt-auto rounded-3xl border border-border bg-background p-5">
                  <div className="text-sm font-semibold">Tip</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Add 5 roles. If you don’t feel more organized immediately, it’s not for you.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="w-full rounded-3xl border-border bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 lg:hidden">
                <Image src={logo} alt="Loggy logo" className="h-8 w-auto object-contain" priority />
                <div className="-mt-0.5">
                  <div className="text-sm font-semibold">Loggy</div>
                  <div className="text-xs text-muted-foreground">Portal access</div>
                </div>
              </div>

              <Tabs value={mode} className="ml-auto">
                <TabsList className="h-10 rounded-2xl bg-secondary p-1">
                  <TabsTrigger value="login" asChild className="rounded-2xl data-[state=active]:bg-card">
                    <Link href="/login">Login</Link>
                  </TabsTrigger>
                  <TabsTrigger value="signup" asChild className="rounded-2xl data-[state=active]:bg-card">
                    <Link href="/signup">Signup</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mt-6 text-center">
              <div className="text-2xl font-semibold tracking-tight">{title}</div>
              <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {error}
              </div>
            ) : null}

            <form onSubmit={submit} className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Email</div>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@domain.com"
                  className="h-11 rounded-2xl border-input bg-card"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-muted-foreground">Password</div>
                  <div
                    className={[
                      "text-xs text-muted-foreground transition-opacity",
                      mode === "signup" ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                    aria-hidden={mode !== "signup"}
                  >
                    8+ chars, upper/lower, digit
                  </div>
                </div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="h-11 rounded-2xl border-input bg-card"
                />
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="mt-2 h-11 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {busy ? "Working…" : cta}
              </Button>

              <div className="mt-1 text-center text-sm text-muted-foreground">
                <Link href={altHref} className="font-medium text-foreground hover:underline">
                  {altText}
                </Link>
              </div>
            </form>

            <div className="rounded-2xl border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
              {noteText}
            </div>

            <Separator className="my-3 bg-border" />

            <div className="text-xs text-muted-foreground text-center">
              By continuing you agree to use Loggy responsibly. No spam, no automation, no nonsense.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

