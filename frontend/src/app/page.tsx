import { redirect } from "next/navigation"
import PortalClient from "./portalClient"
import { serverApiFetch } from "@/lib/api/server"
import type { Job, Me } from "@/lib/job/types"

type SortKey = "createdAt" | "title" | "company" | "relevance"
type SortDir = "asc" | "desc"

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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const sort = normalizeSort(sp.sort)
  const dir = normalizeDir(sp.dir)

  const meRes = await serverApiFetch<Me>("/auth/me", { method: "GET" })
  if (!meRes.ok) redirect("/login")

  const jobsRes = await serverApiFetch<Job[]>(
    `/jobs?sort=${encodeURIComponent(sort)}&dir=${encodeURIComponent(dir)}`,
    { method: "GET" }
  )
  if (!jobsRes.ok) redirect("/login")

  return (
    <PortalClient
      me={meRes.data}
      initialJobs={jobsRes.data ?? []}
      initialSortKey={sort}
      initialSortDir={dir}
    />
  )
}

