"use client"

import { useState } from "react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, Plus, RefreshCw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SortKey = "createdAt" | "title" | "company" | "relevance"
type SortDir = "asc" | "desc"
type TabKey = JobStatus | "all"

const TAB_LABEL: Record<TabKey, string> = {
  all: "All",
  wishlist: "Wishlist",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
}

const SORT_LABEL: Record<SortKey, string> = {
  createdAt: "Date added",
  title: "Title",
  company: "Company",
  relevance: "Relevance",
}

export default function PortalPageClient({
  me,
  initialJobs,
  pipelineStats,
  initialSortKey,
  initialSortDir,
  initialTab,
  initialQ,
}: {
  me: Me
  initialJobs: Job[]
  pipelineStats: Record<JobStatus, number>
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
    <div className="min-h-screen bg-background">
      <PortalSidebar />

      <main className="min-h-screen lg:pl-[280px]">
        <JobsToolbar
          email={me.email}
          q={qs.q}
          onQChange={qs.setQ}
          onLogout={logout}
        />

        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            {err ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {err}
              </div>
            ) : null}

            <StatsRow stats={pipelineStats} />

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

            <div className="flex flex-col mt-3 gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="sm:hidden">
                <Select value={qs.tab} onValueChange={(v) => qs.setTab(v as TabKey)}>
                  <SelectTrigger className="relative h-10 w-full rounded-2xl border-input bg-card">
                    <SelectValue placeholder="Filter" />
                    <span className="pointer-events-none absolute inset-y-0 left-3 right-10 flex items-center truncate">
                      {TAB_LABEL[qs.tab]}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="wishlist">Wishlist</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden sm:block">
                <Tabs value={qs.tab} onValueChange={(v) => qs.setTab(v as any)}>
                  <TabsList className="h-10 rounded-2xl bg-secondary p-1">
                    <TabsTrigger value="all" className="rounded-2xl data-[state=active]:bg-card">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="wishlist" className="rounded-2xl data-[state=active]:bg-card">
                      Wishlist
                    </TabsTrigger>
                    <TabsTrigger value="applied" className="rounded-2xl data-[state=active]:bg-card">
                      Applied
                    </TabsTrigger>
                    <TabsTrigger value="interview" className="rounded-2xl data-[state=active]:bg-card">
                      Interview
                    </TabsTrigger>
                    <TabsTrigger value="offer" className="rounded-2xl data-[state=active]:bg-card">
                      Offer
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="rounded-2xl data-[state=active]:bg-card">
                      Rejected
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
                <div className="min-w-0 flex-1 sm:flex-none">
                  <Select value={qs.sortKey} onValueChange={(v) => qs.setSort(v as SortKey)}>
                    <SelectTrigger className="relative h-10 w-full min-w-0 rounded-2xl border-input bg-card sm:w-[170px]">
                      <SelectValue placeholder="Sort" />
                      <span className="pointer-events-none absolute inset-y-0 left-3 right-10 flex items-center truncate">
                        {SORT_LABEL[qs.sortKey]}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="createdAt">Date added</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="relevance">Relevance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-none items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    className="h-10 rounded-2xl border-input bg-card px-3"
                    onClick={qs.toggleDir}
                    aria-label="Toggle sort direction"
                    title={qs.sortDir === "asc" ? "Ascending" : "Descending"}
                  >
                    <ArrowDownUp className="h-4 w-4" />
                    <span className="text-sm">{qs.sortDir === "asc" ? "Asc" : "Desc"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-10 w-10 rounded-2xl border-input bg-card p-0"
                    onClick={() => router.refresh()}
                    aria-label="Refresh"
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <Button
                    className="h-10 w-10 rounded-2xl bg-stone-900 p-0 text-stone-50 hover:bg-stone-800"
                    onClick={() => {
                      setErr(null)
                      form.openCreate()
                    }}
                    aria-label="New"
                    title="New"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <JobsTable
              jobs={initialJobs}
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
  )
}

