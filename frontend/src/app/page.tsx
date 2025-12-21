import { redirect } from "next/navigation"
import PortalPageClient from "@/features/portal/PortalPageClient"
import { serverApiFetch } from "@/lib/api/server"
import type { Job, Me, JobStatus } from "@/lib/job/types"

type SortKey = "createdAt" | "title" | "company" | "relevance"
type SortDir = "asc" | "desc"
type TabKey = JobStatus | "all"

function normalizeSort(raw: unknown): SortKey {
  const s = String(raw ?? "").trim().toLowerCase()
  if (s === "title") return "title"
  if (s === "company") return "company"
  if (s === "relevance") return "relevance"
  if (s === "createdat") return "createdAt"
  return "createdAt"
}

function normalizeDir(raw: unknown): SortDir {
  const d = String(raw ?? "").trim().toLowerCase()
  if (d === "asc") return "asc"
  return "desc"
}

function normalizeTab(raw: unknown): TabKey {
  const t = String(raw ?? "").trim().toLowerCase()
  if (t === "wishlist") return "wishlist"
  if (t === "applied") return "applied"
  if (t === "interview") return "interview"
  if (t === "rejected") return "rejected"
  if (t === "offer") return "offer"
  return "all"
}

function normalizeQ(raw: unknown): string {
  const q = String(raw ?? "")
  return q.length > 200 ? q.slice(0, 200) : q
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const sort = normalizeSort(sp.sort)
  const dir = normalizeDir(sp.dir)
  const tab = normalizeTab(sp.tab)
  const q = normalizeQ(sp.q)

  const meRes = await serverApiFetch<Me>("/auth/me", { method: "GET" })
  if (!meRes.ok) redirect("/login")

  const params = new URLSearchParams()
  params.set("sort", sort)
  params.set("dir", dir)
  if (tab !== "all") params.set("tab", tab)
  if (q.trim()) params.set("q", q)

  const jobsRes = await serverApiFetch<Job[]>(`/jobs?${params.toString()}`, { method: "GET" })
  if (!jobsRes.ok) redirect("/login")

  return (
    <PortalPageClient
      me={meRes.data}
      initialJobs={jobsRes.data ?? []}
      initialSortKey={sort}
      initialSortDir={dir}
      initialTab={tab}
      initialQ={q}
    />
  )
}

