"use client"

import Link from "next/link"
import Image from "next/image"
import logo from "@/assets/logo.png"
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
        active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-accent"
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-2xl",
          active ? "bg-primary-foreground/10" : "bg-card border border-border"
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] max-h-screen border-r border-sidebar-border bg-sidebar lg:block">
      <div className="flex h-full max-h-screen flex-col overflow-hidden px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center">
            <Image
              src={logo}
              alt="Loggy logo"
              className="h-8 object-contain"
              priority
            />
          </div>
          <div className="-mt-1">
            <div className="text-sm font-semibold text-sidebar-foreground">Loggy</div>
            <div className="text-xs text-muted-foreground">Portal</div>
          </div>
        </div>

        <Separator className="my-4 bg-border" />

        <nav className="grid gap-1">
          <NavItem href="/" label="Home" active icon={<LayoutDashboard className="h-4 w-4" />} />
          <NavItem href="#" label="Jobs" icon={<BriefcaseBusiness className="h-4 w-4" />} />
          <NavItem href="#" label="Companies" icon={<Building2 className="h-4 w-4" />} />
          <NavItem href="#" label="Settings" icon={<Settings className="h-4 w-4" />} />
        </nav>

        <div className="mt-auto pt-6">
          <Card className="rounded-3xl border-border bg-card/80 p-4">
            <div className="text-xs font-semibold text-foreground">Daily target</div>
            <div className="mt-2 text-sm text-muted-foreground">3 high-fit applications</div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>1 / 3</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/3 rounded-full bg-primary" />
            </div>
          </Card>
        </div>
      </div>
    </aside>
  )
}

