import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png"
import JobsTable from "@/features/portal/components/JobsTable"
import type { Job } from "@/lib/job/types"

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";

const mockJobs: Job[] = [
  {
    id: "preview-1",
    title: "Frontend Developer",
    company: "Acme",
    url: "https://example.com/jobs/frontend-developer",
    status: "wishlist",
    relevance: 4,
    notes: "High-fit role",
    appliedAt: null,
    applicationSource: "posted",
    location: "Copenhagen",
    contactName: "Jane Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "preview-2",
    title: "Fullstack Engineer",
    company: "Northwind",
    url: "https://example.com/jobs/fullstack-engineer",
    status: "applied",
    relevance: 5,
    notes: "Sent application",
    appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    applicationSource: "referral",
    location: "Remote",
    contactName: "Sam Recruiter",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "preview-3",
    title: "Software Engineer",
    company: "Contoso",
    url: "https://example.com/jobs/software-engineer",
    status: "interview",
    relevance: 4,
    notes: "Screening scheduled",
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applicationSource: "recruiter",
    location: "Copenhagen",
    contactName: "Alex Hiring",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/landing" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center">
              <Image
                src={logo}
                alt="Loggy logo"
                className="h-8 object-contain"
                priority
              />
            </div>
            <div className="leading-tight -mt-1">
              <div className="text-sm font-semibold">Loggy</div>
              <div className="text-xs text-muted-foreground">Job application tracker</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/landing/about"
              className="rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              About
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

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-160px] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-secondary blur-3xl" />
            <div className="absolute left-[-200px] top-[180px] h-[420px] w-[420px] rounded-full bg-accent blur-3xl" />
            <div className="absolute right-[-200px] top-[260px] h-[420px] w-[420px] rounded-full bg-secondary blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pb-18 sm:pt-18">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="grid gap-6">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  v1 is live: track → overview → move on
                </div>

                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Keep your job search organized in one place.
                </h1>

                <p className="text-base leading-7 text-muted-foreground">
                  Loggy v1 is a fast job application tracker: add roles, update status, keep notes and context, and get
                  a clear overview of your pipeline.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href={PORTAL_URL}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Open the portal
                  </Link>
                  <Link
                    href="/landing/about"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    Why Loggy?
                  </Link>
                </div>

                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs">
                      ✓
                    </span>
                    <span>Track jobs with title, company, URL, status, relevance, notes.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs">
                      ✓
                    </span>
                    <span>Capture applied date, source, location, and contact name.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs">
                      ✓
                    </span>
                    <span>Sort and filter server-side so the list stays reliable as it grows.</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="text-sm font-semibold">Coming next</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    We’re building the “what changed over time?” layer on top of v1.
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <RoadmapItem title="Over-time stats" text="Pipeline trends and progress over weeks/months." />
                    <RoadmapItem title="Analytics" text="Simple insights: what converts, what doesn’t." />
                    <RoadmapItem title="Advanced filtering" text="Saved views and more flexible queries." />
                    <RoadmapItem title="Export to CSV" text="Take your data anywhere when you want." />
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="grid gap-1">
                    <div className="text-sm font-semibold">Portal preview</div>
                    <div className="text-sm text-muted-foreground">
                      Same table component as the portal, with mock data. 
                    </div>
                    <div className="text-xs text-muted-foreground"><i>View on desktop for best experience</i></div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                    v1
                  </div>
                </div>

                <div className="mt-5 min-w-0">
                  <JobsTable jobs={mockJobs} showActions={false} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <FeatureCard
                    title="Simple pipeline"
                    text="Wishlist → Applied → Interview → Offer/Rejected."
                  />
                  <FeatureCard
                    title="Context fields"
                    text="Source, location, contact, notes, applied date."
                  />
                  <FeatureCard
                    title="Fast updates"
                    text="Add/edit quickly so your tracker stays current."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-14">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Open Loggy and keep your pipeline honest.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  v1 is deliberately focused: capture the truth, get the overview, and move.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href={PORTAL_URL}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Go to the portal
                </Link>
                <a
                  href="mailto:hello@loggy.dk"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/70">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Loggy</span> — job application tracking, without the noise.
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/landing/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href={PORTAL_URL} className="text-muted-foreground hover:text-foreground">
                Portal
              </Link>
              <a href="mailto:hello@loggy.dk" className="text-muted-foreground hover:text-foreground">
                hello@loggy.dk
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{text}</div>
    </div>
  )
}

function RoadmapItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{text}</div>
    </div>
  )
}

