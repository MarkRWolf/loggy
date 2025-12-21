"use client"

import { Card } from "@/components/ui/card"
import type { JobStatus } from "@/lib/job/types"

export default function StatsRow({
  stats,
}: {
  stats: Record<JobStatus, number>
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
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
    <Card className="rounded-3xl border-border bg-card p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">Last 30 days</div>
    </Card>
  )
}

