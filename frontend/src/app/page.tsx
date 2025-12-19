import { redirect } from "next/navigation"
import PortalClient from "./portalClient"
import { serverApiFetch } from "@/lib/api/server"

type JobStatus = "wishlist" | "applied" | "interview" | "rejected" | "offer"

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

export default async function Page() {
  const meRes = await serverApiFetch<Me>("/auth/me", { method: "GET" })
  if (!meRes.ok) redirect("/login")

  const jobsRes = await serverApiFetch<Job[]>("/jobs?sort=createdAt&dir=desc", { method: "GET" })
  if (!jobsRes.ok) redirect("/login")

  return <PortalClient me={meRes.data} initialJobs={jobsRes.data ?? []} />
}

