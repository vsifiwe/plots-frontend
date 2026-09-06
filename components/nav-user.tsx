"use client"

import { useState } from "react"
import { LoaderCircleIcon, LogOutIcon, SproutIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { Member } from "@/lib/auth"

export function NavUser({
  member,
  onSignOut,
}: {
  member: Member
  onSignOut: () => Promise<void>
}) {
  const { isMobile } = useSidebar()
  const [isSigningOut, setSigningOut] = useState(false)
  const identifier = member.email ?? member.phone ?? "Private member"

  async function handleSignOut() {
    setSigningOut(true)
    await onSignOut()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-sidebar-accent"
              />
            }
          >
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <SproutIcon aria-hidden="true" className="size-4" />
            </span>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{member.full_name}</span>
              <span className="text-sidebar-foreground/60 truncate text-xs">
                {identifier}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-60"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Signed in as
              </p>
              <p className="mt-1.5 truncate text-sm font-medium text-foreground">
                {member.full_name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {identifier}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isSigningOut} onClick={handleSignOut}>
              {isSigningOut ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <LogOutIcon />
              )}
              {isSigningOut ? "Signing out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
