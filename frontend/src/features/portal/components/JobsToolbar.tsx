"use client"

import Link from "next/link"
import { Bell, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function JobsToolbar({
  email,
  q,
  onQChange,
  onLogout,
}: {
  email: string
  q: string
  onQChange: (v: string) => void
  onLogout: () => void
}) {
  return (
    <div className="sticky top-0 z-20 py-2 border-b border-stone-200 bg-[#fbf7ef]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="relative hidden w-[320px] sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            className="h-9 rounded-xl border-stone-200 bg-white pl-9"
            placeholder="Search jobs, companies…"
          />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="outline" className="h-9 rounded-xl border-stone-200 bg-white">
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 rounded-xl border-stone-200 bg-white">
                {email}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem className="rounded-lg">
                <Link href="#" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg" onClick={onLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

