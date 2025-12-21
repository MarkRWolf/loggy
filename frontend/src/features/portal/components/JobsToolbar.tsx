"use client"

import Link from "next/link"
import { Bell, ChevronDown, Plus, Search } from "lucide-react"
import type { JobStatus } from "@/lib/job/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SortKey = "createdAt" | "title" | "company" | "relevance"
type SortDir = "asc" | "desc"
type TabKey = JobStatus | "all"

export default function JobsToolbar({
  email,
  q,
  tab,
  sortKey,
  sortDir,
  onQChange,
  onTabChange,
  onSortChange,
  onToggleDir,
  onRefresh,
  onNew,
  onLogout,
}: {
  email: string
  q: string
  tab: TabKey
  sortKey: SortKey
  sortDir: SortDir
  onQChange: (v: string) => void
  onTabChange: (v: TabKey) => void
  onSortChange: (v: SortKey) => void
  onToggleDir: () => void
  onRefresh: () => void
  onNew: () => void
  onLogout: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-stone-900">Hello</div>
          <div className="mt-1 text-sm text-stone-600">
            Keep your application pipeline honest and searchable.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden w-[360px] sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={q}
              onChange={(e) => onQChange(e.target.value)}
              className="h-10 rounded-2xl border-stone-200 bg-white pl-9"
              placeholder="Search jobs, companies…"
            />
          </div>

          <Button variant="outline" className="h-10 rounded-2xl border-stone-200 bg-white">
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            className="h-10 rounded-2xl bg-stone-900 text-stone-50 hover:bg-stone-800"
            onClick={onNew}
          >
            <Plus className="h-4 w-4" />
            New
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 rounded-2xl border-stone-200 bg-white">
                {email} <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem className="rounded-xl">
                <Link href="#" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl" onClick={onLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            className="h-10 rounded-2xl border-stone-200 bg-white pl-9"
            placeholder="Search jobs, companies…"
          />
        </div>
      </div>

      <Separator className="bg-stone-200/70" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as any)}>
          <TabsList className="h-10 rounded-2xl bg-stone-100 p-1">
            <TabsTrigger value="all" className="rounded-2xl data-[state=active]:bg-white">All</TabsTrigger>
            <TabsTrigger value="wishlist" className="rounded-2xl data-[state=active]:bg-white">Wishlist</TabsTrigger>
            <TabsTrigger value="applied" className="rounded-2xl data-[state=active]:bg-white">Applied</TabsTrigger>
            <TabsTrigger value="interview" className="rounded-2xl data-[state=active]:bg-white">Interview</TabsTrigger>
            <TabsTrigger value="offer" className="rounded-2xl data-[state=active]:bg-white">Offer</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-2xl data-[state=active]:bg-white">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => onSortChange(v as SortKey)}>
            <SelectTrigger className="h-10 w-[170px] rounded-2xl border-stone-200 bg-white">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="createdAt">Date added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="h-10 rounded-2xl border-stone-200 bg-white px-4"
            onClick={onToggleDir}
          >
            {sortDir === "asc" ? "Asc" : "Desc"}
          </Button>

          <Button
            variant="outline"
            className="h-10 rounded-2xl border-stone-200 bg-white px-4"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}

