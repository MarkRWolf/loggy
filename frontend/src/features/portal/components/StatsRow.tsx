"use client"

import { Card } from "@/components/ui/card"
import type { JobStatus } from "@/lib/job/types"

export default function StatsRow({
  stats,
}: {
  stats: Record<JobStatus, number>
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-5">
      <MiniStat label="Wishlist" value={stats.wishlist} />
      <MiniStat label="Applied" value={stats.applied} />
      <MiniStat label="Interview" value={stats.interview} />
      <MiniStat label="Offer" value={stats.offer} />
      <MiniStat label="Rejected" value={stats.rejected} />
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="min-w-[140px] shrink-0 rounded-3xl border-border bg-card p-3 sm:min-w-0 sm:p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:mt-3">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">Last 30 days</div>
    </Card>
  )
}

