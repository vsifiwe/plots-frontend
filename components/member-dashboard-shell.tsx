"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentMember, signOut, type Member } from "@/lib/auth"

const DashboardMemberContext = createContext<Member | null>(null)

export function useDashboardMember() {
  const member = useContext(DashboardMemberContext)
  if (!member) {
    throw new Error(
      "useDashboardMember must be used inside MemberDashboardShell."
    )
  }
  return member
}

export function MemberDashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)

  useEffect(() => {
    let active = true

    getCurrentMember()
      .then((currentMember) => {
        if (active) setMember(currentMember)
      })
      .catch(() => router.replace("/login"))

    return () => {
      active = false
    }
  }, [router])

  async function handleSignOut() {
    await signOut()
    router.replace("/")
  }

  if (!member) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin text-primary"
          />
          Opening your member dashboard...
        </div>
      </main>
    )
  }

  return (
    <DashboardMemberContext.Provider value={member}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar member={member} onSignOut={handleSignOut} variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardMemberContext.Provider>
  )
}
