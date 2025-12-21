"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { createJobSchema, updateJobSchema } from "@/lib/job/jobSchema"
import type { Job, JobStatus, Me } from "@/lib/job/types"
import { useJobsQueryState } from "@/features/portal/state/useJobsQueryState"
import { useJobForm } from "@/features/portal/state/useJobForm"
import StatsRow from "@/features/portal/components/StatsRow"
import JobsToolbar from "@/features/portal/components/JobsToolbar"
import JobFormCard from "@/features/portal/components/JobFormCard"
import JobsTable from "@/features/portal/components/JobsTable"
import PortalSidebar from "@/features/portal/components/PortalSidebar"

type SortKey = "createdAt" | "title" | "company" | "relevance"
type SortDir = "asc" | "desc"
type TabKey = JobStatus | "all"

function countByStatus(items: Job[]) {
  const base = { wishlist: 0, applied: 0, interview: 0, rejected: 0, offer: 0 } as Record<JobStatus, number>
  for (const j of items) base[j.status] += 1
  return base
}

export default function PortalPageClient({
  me,
  initialJobs,
  initialSortKey,
  initialSortDir,
  initialTab,
  initialQ,
}: {
  me: Me
  initialJobs: Job[]
  initialSortKey: SortKey
  initialSortDir: SortDir
  initialTab: TabKey
  initialQ: string
}) {
  const router = useRouter()
  const [err, setErr] = useState<string | null>(null)

  const qs = useJobsQueryState({
    initialQ,
    initialTab,
    initialSortKey,
    initialSortDir,
  })

  const form = useJobForm()

  const query = qs.q.trim().toLowerCase()

  const jobs = useMemo(() => {
    let xs = initialJobs.slice()
    if (qs.tab !== "all") xs = xs.filter((j) => j.status === qs.tab)
    if (query) xs = xs.filter((j) => (`${j.title} ${j.company} ${j.status}`).toLowerCase().includes(query))
    return xs
  }, [initialJobs, qs.tab, query])

  const stats = useMemo(() => countByStatus(initialJobs), [initialJobs])

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)

    const payload = {
      title: form.title,
      company: form.company,
      url: form.url,
      status: form.status,
      relevance: form.relevance,
      notes: form.notes,
      appliedAt: form.appliedAt,
      applicationSource: form.applicationSource,
      location: form.location,
      contactName: form.contactName,
    }

    const schema = form.editingId ? updateJobSchema : createJobSchema
    const parsed = schema.safeParse(payload)

    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    form.setBusy(true)

    const body = JSON.stringify({
      Title: parsed.data.title,
      Company: parsed.data.company,
      Url: parsed.data.url ?? null,
      Status: parsed.data.status,
      Relevance: parsed.data.relevance,
      Notes: parsed.data.notes ?? null,
      AppliedAt: parsed.data.appliedAt ?? null,
      ApplicationSource: parsed.data.applicationSource,
      Location: parsed.data.location ?? null,
      ContactName: parsed.data.contactName ?? null,
    })

    const r = form.editingId
      ? await apiFetch<Job>(`/jobs/${form.editingId}`, { method: "PUT", body })
      : await apiFetch<Job>("/jobs", { method: "POST", body })

    form.setBusy(false)

    if (!r.ok) {
      if (r.error.status === 401) {
        router.replace("/login")
        return
      }
      setErr(r.error.message || "Save failed")
      return
    }

    form.close()
    router.refresh()
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
    router.refresh()
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
        <PortalSidebar />

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <JobsToolbar
                email={me.email}
                q={qs.q}
                tab={qs.tab}
                sortKey={qs.sortKey}
                sortDir={qs.sortDir}
                onQChange={qs.setQ}
                onTabChange={qs.setTab}
                onSortChange={qs.setSort}
                onToggleDir={qs.toggleDir}
                onRefresh={() => router.refresh()}
                onNew={() => {
                  setErr(null)
                  form.openCreate()
                }}
                onLogout={logout}
              />

              {err ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  {err}
                </div>
              ) : null}

              <StatsRow stats={stats} />

              {form.show ? (
                <JobFormCard
                  mode={form.editingId ? "edit" : "create"}
                  busy={form.busy}
                  title={form.title}
                  company={form.company}
                  url={form.url}
                  status={form.status}
                  relevance={form.relevance}
                  notes={form.notes}
                  appliedAt={form.appliedAt}
                  applicationSource={form.applicationSource}
                  location={form.location}
                  contactName={form.contactName}
                  setTitle={form.setTitle}
                  setCompany={form.setCompany}
                  setUrl={form.setUrl}
                  setStatus={form.setStatus}
                  setRelevance={form.setRelevance}
                  setNotes={form.setNotes}
                  setAppliedAt={form.setAppliedAt}
                  setApplicationSource={form.setApplicationSource}
                  setLocation={form.setLocation}
                  setContactName={form.setContactName}
                  onClose={form.close}
                  onSubmit={submitForm}
                />
              ) : null}

              <JobsTable
                jobs={jobs}
                onEdit={(j) => {
                  setErr(null)
                  form.openEdit(j)
                }}
                onDelete={onDelete}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

