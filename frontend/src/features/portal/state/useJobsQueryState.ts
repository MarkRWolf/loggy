"use client"

import { useRouter } from "next/navigation"
import { useCallback, useMemo, useRef, useState } from "react"
import type { JobStatus } from "@/lib/job/types"

type SortKey = "createdAt" | "title" | "company" | "relevance"
type SortDir = "asc" | "desc"
type TabKey = JobStatus | "all"

function clampQ(q: string) {
  return q.length > 200 ? q.slice(0, 200) : q
}

export function useJobsQueryState({
  initialQ,
  initialTab,
  initialSortKey,
  initialSortDir,
}: {
  initialQ: string
  initialTab: TabKey
  initialSortKey: SortKey
  initialSortDir: SortDir
}) {
  const router = useRouter()

  const [q, _setQ] = useState(initialQ)
  const [tab, _setTab] = useState<TabKey>(initialTab)

  const sortKey = initialSortKey
  const sortDir = initialSortDir

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buildUrl = useCallback(
    (next: { q?: string; tab?: TabKey; sort?: SortKey; dir?: SortDir }) => {
      const params = new URLSearchParams()
      const nq = clampQ(next.q ?? q)
      const nt = next.tab ?? tab
      const ns = next.sort ?? sortKey
      const nd = next.dir ?? sortDir

      if (nq.trim()) params.set("q", nq)
      if (nt !== "all") params.set("tab", nt)

      params.set("sort", ns)
      params.set("dir", nd)

      const qs = params.toString()
      return qs ? `/?${qs}` : "/"
    },
    [q, tab, sortKey, sortDir]
  )

  const setQ = useCallback(
    (nextQ: string) => {
      const nq = clampQ(nextQ)
      _setQ(nq)

      if (debounceRef.current) clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        router.push(buildUrl({ q: nq }))
      }, 300)
    },
    [router, buildUrl]
  )

  const setTab = useCallback(
    (nextTab: TabKey) => {
      _setTab(nextTab)
      router.push(buildUrl({ tab: nextTab }))
    },
    [router, buildUrl]
  )

  const setSort = useCallback(
    (nextSort: SortKey) => {
      router.push(buildUrl({ sort: nextSort }))
    },
    [router, buildUrl]
  )

  const toggleDir = useCallback(() => {
    const nextDir: SortDir = sortDir === "asc" ? "desc" : "asc"
    router.push(buildUrl({ dir: nextDir }))
  }, [router, buildUrl, sortDir])

  return useMemo(
    () => ({
      q,
      tab,
      sortKey,
      sortDir,
      setQ,
      setTab,
      setSort,
      toggleDir,
    }),
    [q, tab, sortKey, sortDir, setQ, setTab, setSort, toggleDir]
  )
}

