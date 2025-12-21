"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Job, JobStatus } from "@/lib/job/types"

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

export default function JobsTable({
  jobs,
  onEdit,
  onDelete,
}: {
  jobs: Job[]
  onEdit: (j: Job) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card className="rounded-3xl border-stone-200/80 bg-white p-4">
      <Separator className="my-1 bg-stone-200/70" />

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
                      onClick={() => onEdit(j)}
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
                  No results.
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
  )
}

