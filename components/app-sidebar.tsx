"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenTextIcon,
  ChartNoAxesCombinedIcon,
  CircleHelpIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SproutIcon,
  UsersRoundIcon,
  VoteIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { Member } from "@/lib/auth"

const memberTools = [
  { title: "Overview", icon: LayoutDashboardIcon, href: "/dashboard" },
  { title: "Savings", icon: HandCoinsIcon },
  {
    title: "Contributions",
    icon: ReceiptTextIcon,
    href: "/dashboard/contributions",
  },
  { title: "Investment cycle", icon: VoteIcon },
  { title: "Proposals", icon: ChartNoAxesCombinedIcon },
  { title: "Members", icon: UsersRoundIcon, href: "/dashboard/members" },
]

const resources = [
  { title: "Shared principles", icon: BookOpenTextIcon },
  { title: "Get help", icon: CircleHelpIcon },
]

export function AppSidebar({
  member,
  onSignOut,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  member: Member
  onSignOut: () => Promise<void>
}) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-sidebar-border/70 border-b px-3 py-3">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-sm">
            <SproutIcon
              aria-hidden="true"
              className="size-4"
              strokeWidth={1.8}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[-0.03em]">
              Plots &amp; Prosper
            </p>
            <p className="text-sidebar-foreground/55 text-[11px] font-medium tracking-[0.1em] uppercase">
              Member space
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your collective</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {memberTools.map((item) => {
                const Icon = item.icon
                const isActive = item.href === pathname
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={item.href ? <Link href={item.href} /> : undefined}
                      isActive={isActive}
                      tooltip={item.title}
                      aria-current={isActive ? "page" : undefined}
                      className={
                        !item.href
                          ? "text-sidebar-foreground/70 cursor-default"
                          : undefined
                      }
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.title}</span>
                      {!item.href && (
                        <span className="text-sidebar-foreground/45 ml-auto text-[10px] font-medium">
                          Soon
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resources.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="text-sidebar-foreground/70 cursor-default"
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border/70 border-t p-2">
        <NavUser member={member} onSignOut={onSignOut} />
      </SidebarFooter>
    </Sidebar>
  )
}
