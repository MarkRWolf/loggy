"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiFetch } from "@/lib/api/client"
import { createJobSchema, updateJobSchema, jobStatusSchema } from "@/lib/job/jobSchema"

type JobStatus = "wishlist" | "applied" | "interview" | "rejected" | "offer"
type SortKey = "createdAt" | "title" | "company" | "relevance"

type Job = {
  id: string
  title: string
  company: string
  url?: string
  status: JobStatus
  relevance: 1 | 2 | 3 | 4 | 5
  notes?: string
  createdAt: string
  updatedAt: string
}

type Me = { id: string; email: string }

const statusLabel: Record<JobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interview: "Interview",
  rejected: "Rejected",
  offer: "Offer",
}

const statusBadge: Record<JobStatus, string> = {
  wishlist: "bg-stone-100 text-stone-800 border-stone-200",
  applied: "bg-sky-50 text-sky-800 border-sky-200",
  interview: "bg-amber-50 text-amber-900 border-amber-200",
  rejected: "bg-rose-50 text-rose-900 border-rose-200",
  offer: "bg-emerald-50 text-emerald-900 border-emerald-200",
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
}

function countByStatus(items: Job[]) {
  const base = { wishlist: 0, applied: 0, interview: 0, rejected: 0, offer: 0 } as Record<JobStatus, number>
  for (const j of items) base[j.status] += 1
  return base
}

function RelevanceDots({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={cn("h-2 w-2 rounded-full", i < value ? "bg-stone-900" : "bg-stone-200")} />
      ))}
      <span className="ml-2 text-xs text-stone-500">{value}/5</span>
    </div>
  )
}

function NavItem({
  label,
  icon,
  active,
  href,
}: {
  label: string
  icon: React.ReactNode
  active?: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
        active ? "bg-stone-900 text-stone-50" : "text-stone-700 hover:bg-stone-100"
      )}
    >
      <span className={cn("grid h-9 w-9 place-items-center rounded-2xl", active ? "bg-white/10" : "bg-white border border-stone-200")}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  )
}

export default function PortalClient({ me, initialJobs }: { me: Me; initialJobs: Job[] }) {
  const router = useRouter()

  const [q, setQ] = useState("")
  const [tab, setTab] = useState<JobStatus | "all">("all")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const [jobsRaw, setJobsRaw] = useState<Job[]>(initialJobs)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [url, setUrl] = useState("")
  const [status, setStatus] = useState<JobStatus>("wishlist")
  const [relevance, setRelevance] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [notes, setNotes] = useState("")
  const [formBusy, setFormBusy] = useState(false)

  async function loadJobs() {
    setErr(null)
    setLoading(true)

    const r = await apiFetch<any[]>(`/jobs?sort=${encodeURIComponent(sortKey)}&dir=${encodeURIComponent(sortDir)}`, {
      method: "GET",
    })

    setLoading(false)

    if (!r.ok) {
      if (r.error.status === 401) {
        router.replace("/login")
        return
      }
      setErr(r.error.message || "Failed to load jobs")
      return
    }

    const mapped: Job[] = (r.data ?? []).map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      url: j.url ?? undefined,
      status: j.status,
      relevance: j.relevance,
      notes: j.notes ?? undefined,
      createdAt: j.createdAt,
      updatedAt: j.updatedAt,
    }))

    setJobsRaw(mapped)
  }

  const query = q.trim().toLowerCase()

  const jobs = useMemo(() => {
    let xs = jobsRaw.slice()
    if (tab !== "all") xs = xs.filter((j) => j.status === tab)
    if (query) xs = xs.filter((j) => (`${j.title} ${j.company} ${j.status}`).toLowerCase().includes(query))
    return xs
  }, [jobsRaw, tab, query])

  const stats = useMemo(() => countByStatus(jobsRaw), [jobsRaw])

  function resetForm() {
    setEditingId(null)
    setTitle("")
    setCompany("")
    setUrl("")
    setStatus("wishlist")
    setRelevance(3)
    setNotes("")
  }

  function openCreate() {
    resetForm()
    setShowForm(true)
  }

  function openEdit(j: Job) {
    setEditingId(j.id)
    setTitle(j.title)
    setCompany(j.company)
    setUrl(j.url ?? "")
    setStatus(j.status)
    setRelevance(j.relevance)
    setNotes(j.notes ?? "")
    setShowForm(true)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)

    const payload = { title, company, url, status, relevance, notes }
    const schema = editingId ? updateJobSchema : createJobSchema
    const parsed = schema.safeParse(payload)

    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    setFormBusy(true)

    const body = JSON.stringify({
      Title: parsed.data.title,
      Company: parsed.data.company,
      Url: parsed.data.url ?? null,
      Status: parsed.data.status,
      Relevance: parsed.data.relevance,
      Notes: parsed.data.notes ?? null,
    })

    const r = editingId
      ? await apiFetch<Job>(`/jobs/${editingId}`, { method: "PUT", body })
      : await apiFetch<Job>("/jobs", { method: "POST", body })

    setFormBusy(false)

    if (!r.ok) {
      if (r.error.status === 401) {
        router.replace("/login")
        return
      }
      setErr(r.error.message || "Save failed")
      return
    }

    setShowForm(false)
    resetForm()
    await loadJobs()
  }

  async function onDelete(id: string) {
    setErr(null)
    const r = await apiFetch<void>(`/jobs/${id}`, { method: "DELETE" })
    if (!r.ok) {
      if (r.error.status === 401) {
        router.replace("/login")
        return
      }
      setErr(r.error.message || "Delete failed")
      return
    }
    await loadJobs()
  }

  async function logout() {
    setErr(null)
    const r = await apiFetch<void>("/auth/logout", { method: "POST" })
    if (!r.ok) {
      setErr(r.error.message || "Logout failed")
      return
    }
    router.replace("/login")
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-stone-200/70 bg-emerald-50/40 lg:block">
          <div className="flex h-full flex-col px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-900 text-stone-50">
                <span className="text-sm font-semibold">L</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900">Loggy</div>
                <div className="text-xs text-stone-500">Portal</div>
              </div>
            </div>

            <Separator className="my-5 bg-stone-200/70" />

            <nav className="grid gap-1">
              <NavItem href="#" label="Home" active icon={<LayoutDashboard className="h-4 w-4" />} />
              <NavItem href="#" label="Jobs" icon={<BriefcaseBusiness className="h-4 w-4" />} />
              <NavItem href="#" label="Companies" icon={<Building2 className="h-4 w-4" />} />
              <NavItem href="#" label="Settings" icon={<Settings className="h-4 w-4" />} />
            </nav>

            <div className="mt-auto pt-6">
              <Card className="rounded-3xl border-stone-200 bg-white/80 p-4">
                <div className="text-xs font-semibold text-stone-900">Daily target</div>
                <div className="mt-2 text-sm text-stone-600">3 high-fit applications</div>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                  <span>Progress</span>
                  <span>1 / 3</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                  <div className="h-full w-1/3 rounded-full bg-stone-900" />
                </div>
              </Card>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-3xl font-semibold tracking-tight text-stone-900">Hello</div>
                  <div className="mt-1 text-sm text-stone-600">Keep your pipeline honest and searchable.</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative hidden w-[360px] sm:block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="h-10 rounded-2xl border-stone-200 bg-white pl-9"
                      placeholder="Search jobs, companies…"
                    />
                  </div>

                  <Button variant="outline" className="h-10 rounded-2xl border-stone-200 bg-white">
                    <Bell className="h-4 w-4" />
                  </Button>

                  <Button className="h-10 rounded-2xl bg-stone-900 text-stone-50 hover:bg-stone-800" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    New
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-10 rounded-2xl border-stone-200 bg-white">
                        {me.email} <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl">
                      <DropdownMenuItem className="rounded-xl">Profile</DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl" onClick={logout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="sm:hidden">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="h-10 rounded-2xl border-stone-200 bg-white pl-9"
                    placeholder="Search jobs, companies…"
                  />
                </div>
              </div>

              {err ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  {err}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <MiniStat label="Wishlist" value={stats.wishlist} />
                <MiniStat label="Applied" value={stats.applied} />
                <MiniStat label="Interview" value={stats.interview} />
                <MiniStat label="Offer" value={stats.offer} />
                <MiniStat label="Rejected" value={stats.rejected} />
              </div>

              {showForm ? (
                <Card className="rounded-3xl border-stone-200/80 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-stone-900">{editingId ? "Edit job" : "New job"}</div>
                    <Button
                      variant="outline"
                      className="h-9 rounded-2xl border-stone-200 bg-white px-4"
                      onClick={() => {
                        setShowForm(false)
                        resetForm()
                      }}
                      disabled={formBusy}
                    >
                      Close
                    </Button>
                  </div>

                  <Separator className="my-4 bg-stone-200/70" />

                  <form className="grid gap-3" onSubmit={submitForm}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <div className="text-xs font-medium text-stone-600">Title</div>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-10 rounded-2xl border-stone-200 bg-white"
                          placeholder="Frontend Developer"
                        />
                      </div>

                      <div className="grid gap-2">
                        <div className="text-xs font-medium text-stone-600">Company</div>
                        <Input
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="h-10 rounded-2xl border-stone-200 bg-white"
                          placeholder="Acme"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <div className="text-xs font-medium text-stone-600">URL</div>
                        <Input
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="h-10 rounded-2xl border-stone-200 bg-white"
                          placeholder="https://…"
                        />
                      </div>

                      <div className="grid gap-2">
                        <div className="text-xs font-medium text-stone-600">Status</div>
                        <Select
                          value={status}
                          onValueChange={(v) => {
                            const parsed = jobStatusSchema.safeParse(v)
                            if (parsed.success) setStatus(parsed.data)
                          }}
                        >
                          <SelectTrigger className="h-10 rounded-2xl border-stone-200 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="wishlist">Wishlist</SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <div className="text-xs font-medium text-stone-600">Relevance</div>
                        <Select
                          value={String(relevance)}
                          onValueChange={(v) => {
                            const n = Number(v)
                            if (n >= 1 && n <= 5) setRelevance(n as any)
                          }}
                        >
                          <SelectTrigger className="h-10 rounded-2xl border-stone-200 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <div className="text-xs font-medium text-stone-600">Notes</div>
                        <Input
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="h-10 rounded-2xl border-stone-200 bg-white"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-2xl border-stone-200 bg-white px-4"
                        onClick={() => {
                          setShowForm(false)
                          resetForm()
                        }}
                        disabled={formBusy}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="h-10 rounded-2xl bg-stone-900 text-stone-50 hover:bg-stone-800"
                        disabled={formBusy}
                      >
                        {formBusy ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : null}

              <Card className="rounded-3xl border-stone-200/80 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                    <TabsList className="h-10 rounded-2xl bg-stone-100 p-1">
                      <TabsTrigger value="all" className="rounded-2xl data-[state=active]:bg-white">All</TabsTrigger>
                      <TabsTrigger value="wishlist" className="rounded-2xl data-[state=active]:bg-white">Wishlist</TabsTrigger>
                      <TabsTrigger value="applied" className="rounded-2xl data-[state=active]:bg-white">Applied</TabsTrigger>
                      <TabsTrigger value="interview" className="rounded-2xl data-[state=active]:bg-white">Interview</TabsTrigger>
                      <TabsTrigger value="offer" className="rounded-2xl data-[state=active]:bg-white">Offer</TabsTrigger>
                      <TabsTrigger value="rejected" className="rounded-2xl data-[state=active]:bg-white">Rejected</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-2">
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                      <SelectTrigger className="h-10 w-[170px] rounded-2xl border-stone-200 bg-white">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="createdAt">Date added</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="relevance">Relevance</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      className="h-10 rounded-2xl border-stone-200 bg-white px-4"
                      onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                    >
                      {sortDir === "asc" ? "Asc" : "Desc"}
                    </Button>

                    <Button
                      variant="outline"
                      className="h-10 rounded-2xl border-stone-200 bg-white px-4"
                      onClick={loadJobs}
                      disabled={loading}
                    >
                      {loading ? "Loading…" : "Refresh"}
                    </Button>
                  </div>
                </div>

                <Separator className="my-4 bg-stone-200/70" />

                <div className="overflow-hidden rounded-2xl border border-stone-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-stone-50">
                        <TableHead className="text-stone-600">Role</TableHead>
                        <TableHead className="text-stone-600">Company</TableHead>
                        <TableHead className="text-stone-600">Status</TableHead>
                        <TableHead className="text-stone-600">Relevance</TableHead>
                        <TableHead className="text-stone-600">Added</TableHead>
                        <TableHead className="text-right text-stone-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((j) => (
                        <TableRow key={j.id} className="hover:bg-stone-50/60">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="grid h-9 w-9 place-items-center rounded-2xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-700">
                                {j.company.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-medium text-stone-900">{j.title}</div>
                                <div className="truncate text-xs text-stone-500">
                                  {j.url ? (
                                    <Link className="hover:underline" href={j.url} target="_blank">
                                      {j.url.replace(/^https?:\/\//, "")}
                                    </Link>
                                  ) : (
                                    <span>No link</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-stone-900">{j.company}</TableCell>

                          <TableCell>
                            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", statusBadge[j.status])}>
                              {statusLabel[j.status]}
                            </span>
                          </TableCell>

                          <TableCell>
                            <RelevanceDots value={j.relevance} />
                          </TableCell>

                          <TableCell className="text-stone-600">{formatDate(j.createdAt)}</TableCell>

                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button
                                variant="outline"
                                className="h-9 rounded-2xl border-stone-200 bg-white px-4"
                                onClick={() => openEdit(j)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                className="h-9 rounded-2xl border-stone-200 bg-white px-4"
                                onClick={() => onDelete(j.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {!jobs.length ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center text-sm text-stone-600">
                            {loading ? "Loading…" : "No results."}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <div className="inline-flex items-center gap-2">
                    <Button variant="outline" className="h-9 rounded-2xl border-stone-200 bg-white px-4" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" className="h-9 rounded-2xl border-stone-200 bg-white px-4" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-3xl border-stone-200/80 bg-white p-4">
      <div className="text-xs font-medium text-stone-600">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">{value}</div>
      <div className="mt-1 text-xs text-stone-500">Last 30 days</div>
    </Card>
  )
}

