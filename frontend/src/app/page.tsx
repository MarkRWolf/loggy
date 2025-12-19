"use client"

import { useState } from "react"
import Link from "next/link"
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

type JobStatus = "wishlist" | "applied" | "interview" | "rejected" | "offer"
type SortKey = "createdAt" | "title" | "company" | "relevance"

type Job = {
  id: string
  title: string
  company: string
  url?: string
  status: JobStatus
  relevance: 1 | 2 | 3 | 4 | 5
  createdAt: string
}

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

const data: Job[] = [
  { id: "1", title: "Frontend Developer", company: "Acme", url: "https://example.com", status: "applied", relevance: 4, createdAt: "2025-12-15" },
  { id: "2", title: "Software Engineer", company: "Nordic Labs", status: "wishlist", relevance: 5, createdAt: "2025-12-14" },
  { id: "3", title: "Full-stack Developer", company: "Bright Systems", status: "interview", relevance: 4, createdAt: "2025-12-12" },
  { id: "4", title: "Web Developer", company: "Pixel Studio", status: "rejected", relevance: 3, createdAt: "2025-12-10" },
  { id: "5", title: "Frontend Engineer", company: "InnoSoft", status: "offer", relevance: 5, createdAt: "2025-12-09" },
]

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00")
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

export default function PortalPage() {
  const [q, setQ] = useState("")
  const [tab, setTab] = useState<JobStatus | "all">("all")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const stats = countByStatus(data)

  const query = q.trim().toLowerCase()
  let items = data.slice()
  if (tab !== "all") items = items.filter((j) => j.status === tab)
  if (query) items = items.filter((j) => (`${j.title} ${j.company} ${j.status}`).toLowerCase().includes(query))

  items.sort((a, b) => {
    const d = sortDir === "asc" ? 1 : -1
    if (sortKey === "relevance") return (a.relevance - b.relevance) * d
    if (sortKey === "createdAt") return a.createdAt.localeCompare(b.createdAt) * d
    if (sortKey === "title") return a.title.localeCompare(b.title) * d
    return a.company.localeCompare(b.company) * d
  })

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

                  <Button className="h-10 rounded-2xl bg-stone-900 text-stone-50 hover:bg-stone-800">
                    <Plus className="h-4 w-4" />
                    New
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-10 rounded-2xl border-stone-200 bg-white">
                        Jakob <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl">
                      <DropdownMenuItem className="rounded-xl">Profile</DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl">Logout</DropdownMenuItem>
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

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <MiniStat label="Wishlist" value={stats.wishlist} />
                <MiniStat label="Applied" value={stats.applied} />
                <MiniStat label="Interview" value={stats.interview} />
                <MiniStat label="Offer" value={stats.offer} />
                <MiniStat label="Rejected" value={stats.rejected} />
              </div>

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
                      {items.map((j) => (
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
                              <Button variant="outline" className="h-9 rounded-2xl border-stone-200 bg-white px-4">
                                Edit
                              </Button>
                              <Button variant="outline" className="h-9 rounded-2xl border-stone-200 bg-white px-4">
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {!items.length ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center text-sm text-stone-600">
                            No results.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <div className="inline-flex items-center gap-2">
                    <Button variant="outline" className="h-9 rounded-2xl border-stone-200 bg-white px-4">Previous</Button>
                    <Button variant="outline" className="h-9 rounded-2xl border-stone-200 bg-white px-4">Next</Button>
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

