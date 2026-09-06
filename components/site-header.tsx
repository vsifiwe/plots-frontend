"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()
  const isMemberDirectory = pathname === "/dashboard/members"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-[-0.03em]">
            {isMemberDirectory ? "Member directory" : "Collective overview"}
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {isMemberDirectory
              ? "A private view of everyone in the collective"
              : "A shared snapshot for Plots &amp; Prosper members"}
          </p>
        </div>
        {isMemberDirectory ? (
          <span className="ml-auto rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
            Private
          </span>
        ) : (
          <span className="ml-auto rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
            Demo data
          </span>
        )}
      </div>
    </header>
  )
}
