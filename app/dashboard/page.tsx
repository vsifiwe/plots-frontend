import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import { proposals } from "./demo-data"

export default function DashboardPage() {
  return (
    <div className="@container/main mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 py-4 md:gap-7 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={proposals} />
    </div>
  )
}
