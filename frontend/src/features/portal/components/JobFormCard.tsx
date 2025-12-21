"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { jobStatusSchema } from "@/lib/job/jobSchema"
import type { ApplicationSource, JobStatus } from "@/lib/job/types"

const applicationSourceLabel: Record<ApplicationSource, string> = {
  posted: "Posted position",
  unsolicited: "Unsolicited",
  referral: "Referral",
  recruiter: "Recruiter",
  internal: "Internal",
  other: "Other",
}

export default function JobFormCard({
  mode,
  busy,
  title,
  company,
  url,
  status,
  relevance,
  notes,
  appliedAt,
  applicationSource,
  location,
  contactName,
  setTitle,
  setCompany,
  setUrl,
  setStatus,
  setRelevance,
  setNotes,
  setAppliedAt,
  setApplicationSource,
  setLocation,
  setContactName,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit"
  busy: boolean
  title: string
  company: string
  url: string
  status: JobStatus
  relevance: 1 | 2 | 3 | 4 | 5
  notes: string
  appliedAt: string
  applicationSource: ApplicationSource
  location: string
  contactName: string
  setTitle: (v: string) => void
  setCompany: (v: string) => void
  setUrl: (v: string) => void
  setStatus: (v: JobStatus) => void
  setRelevance: (v: 1 | 2 | 3 | 4 | 5) => void
  setNotes: (v: string) => void
  setAppliedAt: (v: string) => void
  setApplicationSource: (v: ApplicationSource) => void
  setLocation: (v: string) => void
  setContactName: (v: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <Card className="rounded-3xl border-stone-200/80 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-stone-900">{mode === "edit" ? "Edit job" : "New job"}</div>
        <Button
          variant="outline"
          className="h-9 rounded-2xl border-stone-200 bg-white px-4"
          onClick={onClose}
          disabled={busy}
        >
          Close
        </Button>
      </div>

      <Separator className="my-4 bg-stone-200/70" />

      <form className="grid gap-3" onSubmit={onSubmit}>
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

        <div className="grid gap-2">
          <div className="text-xs font-medium text-stone-600">Applied at (ISO)</div>
          <Input
            value={appliedAt}
            onChange={(e) => setAppliedAt(e.target.value)}
            className="h-10 rounded-2xl border-stone-200 bg-white"
            placeholder="2024-03-01T12:00:00Z"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <div className="text-xs font-medium text-stone-600">Source</div>
            <Select value={applicationSource} onValueChange={(v) => setApplicationSource(v as ApplicationSource)}>
              <SelectTrigger className="h-10 rounded-2xl border-stone-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="posted">{applicationSourceLabel.posted}</SelectItem>
                <SelectItem value="unsolicited">{applicationSourceLabel.unsolicited}</SelectItem>
                <SelectItem value="referral">{applicationSourceLabel.referral}</SelectItem>
                <SelectItem value="recruiter">{applicationSourceLabel.recruiter}</SelectItem>
                <SelectItem value="internal">{applicationSourceLabel.internal}</SelectItem>
                <SelectItem value="other">{applicationSourceLabel.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-medium text-stone-600">Location</div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 rounded-2xl border-stone-200 bg-white"
              placeholder="Copenhagen"
            />
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-medium text-stone-600">Contact</div>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="h-10 rounded-2xl border-stone-200 bg-white"
              placeholder="Jane Doe"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-2xl border-stone-200 bg-white px-4"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 rounded-2xl bg-stone-900 text-stone-50 hover:bg-stone-800"
            disabled={busy}
          >
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

