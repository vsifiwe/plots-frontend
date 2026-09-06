import { MemberDashboardShell } from "@/components/member-dashboard-shell"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MemberDashboardShell>{children}</MemberDashboardShell>
}
