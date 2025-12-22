import Link from "next/link"

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/landing" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <span className="text-sm font-semibold">L</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Loggy</div>
              <div className="text-xs text-muted-foreground">Job application tracker</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/landing"
              className="rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href={PORTAL_URL}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Portal
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16 pt-12">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          About Loggy
        </div>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          A simple job tracker — because job hunting is already hard enough.
        </h1>

        <p className="mt-5 text-base leading-7 text-muted-foreground">
          Loggy is a focused tool for tracking job applications. The goal is not to “optimize” you with
          gimmicks — it’s to keep your pipeline accurate, your context in one place, and your next step obvious.
        </p>

        <div className="mt-10 grid gap-6">
          <Section
            title="What Loggy is"
            body={
              <>
                Loggy is a job application tracker with a clean pipeline:
                <span className="font-medium text-foreground"> wishlist → applied → interview → offer/rejected</span>.
                You can add roles, update status, score relevance, and keep the details you’ll want later (notes,
                source, contact, location, applied date).
              </>
            }
          />

          <Section
            title="What Loggy is not"
            body={
              <>
                Loggy is not a “platform”. It won’t apply to jobs for you, spam recruiters, or pretend it knows better
                than you. It’s intentionally manual so your tracker stays trustworthy.
              </>
            }
          />

          <Section
            title="What’s in v1"
            body={
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <li className="rounded-2xl border border-border bg-card px-4 py-3">
                  Track jobs with title, company, URL, status, relevance, notes
                </li>
                <li className="rounded-2xl border border-border bg-card px-4 py-3">
                  Capture applied date, application source, location, contact name
                </li>
                <li className="rounded-2xl border border-border bg-card px-4 py-3">
                  Server-side sorting and filtering so the list scales cleanly
                </li>
              </ul>
            }
          />

          <Section
            title="What’s coming next"
            body={
              <>
                The next step is adding “over-time” visibility on top of the tracker:
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <RoadmapItem title="Over-time stats" text="Trends across weeks/months." />
                  <RoadmapItem title="Analytics" text="Simple conversion insights." />
                  <RoadmapItem title="Advanced filtering" text="Saved views, richer queries." />
                  <RoadmapItem title="Export to CSV" text="Take your data anywhere." />
                </div>
              </>
            }
          />

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="text-sm font-semibold">Try it</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Open the portal and add a few roles. You’ll know in 2 minutes if it fits your workflow.
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={PORTAL_URL}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Open the portal
              </Link>
              <Link
                href="/landing"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-accent"
              >
                Back to home
              </Link>
              <a
                href="mailto:hello@loggy.dk"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-accent"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        <footer className="mt-12 border-t border-border/70 pt-8">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-medium text-foreground">Loggy</span> — job application tracking, without the noise.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/landing" className="hover:text-foreground">
                Home
              </Link>
              <Link href={PORTAL_URL} className="hover:text-foreground">
                Portal
              </Link>
              <a href="mailto:hello@loggy.dk" className="hover:text-foreground">
                hello@loggy.dk
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

function Section({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{body}</div>
    </section>
  )
}

function RoadmapItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{text}</div>
    </div>
  )
}

