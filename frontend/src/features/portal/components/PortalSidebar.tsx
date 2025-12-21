"use client"

import Link from "next/link"
import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Settings,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

function NavItem({
  label,
  icon,
  active,
  href,
}: {
  label: string
  icon: React.ReactNode
  active?: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
        active ? "bg-stone-900 text-stone-50" : "text-stone-700 hover:bg-stone-100"
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-2xl",
          active ? "bg-white/10" : "bg-white border border-stone-200"
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  )
}

export default function PortalSidebar() {
  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-stone-200/70 bg-emerald-50/40 lg:block">
      <div className="flex h-full flex-col px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-900 text-stone-50">
            <span className="text-sm font-semibold">L</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-900">Loggy</div>
            <div className="text-xs text-stone-500">Portal</div>
          </div>
        </div>

        <Separator className="my-5 bg-stone-200/70" />

        <nav className="grid gap-1">
          <NavItem href="/" label="Home" active icon={<LayoutDashboard className="h-4 w-4" />} />
          <NavItem href="#" label="Jobs" icon={<BriefcaseBusiness className="h-4 w-4" />} />
          <NavItem href="#" label="Companies" icon={<Building2 className="h-4 w-4" />} />
          <NavItem href="#" label="Settings" icon={<Settings className="h-4 w-4" />} />
        </nav>

        <div className="mt-auto pt-6">
          <Card className="rounded-3xl border-stone-200 bg-white/80 p-4">
            <div className="text-xs font-semibold text-stone-900">Daily target</div>
            <div className="mt-2 text-sm text-stone-600">3 high-fit applications</div>
            <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
              <span>Progress</span>
              <span>1 / 3</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full w-1/3 rounded-full bg-stone-900" />
            </div>
          </Card>
        </div>
      </div>
    </aside>
  )
}

