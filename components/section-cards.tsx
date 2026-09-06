import {
  CalendarDaysIcon,
  HandCoinsIcon,
  LandmarkIcon,
  VoteIcon,
} from "lucide-react"

import { dashboardSnapshot, formatRwf } from "@/app/dashboard/demo-data"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const cards = [
  {
    label: "Pooled short-term savings",
    value: formatRwf(dashboardSnapshot.pooledSavings),
    detail: "Held together while members consider the next annual decision.",
    icon: LandmarkIcon,
  },
  {
    label: "Contributions this month",
    value: formatRwf(dashboardSnapshot.monthlyContributions),
    detail: "An illustrative contribution snapshot for this demo workspace.",
    icon: HandCoinsIcon,
  },
  {
    label: "Active proposals",
    value: `${dashboardSnapshot.activeProposals} to review`,
    detail:
      "Member ideas stay open for questions before a collective decision.",
    icon: VoteIcon,
  },
  {
    label: "Next annual decision",
    value: dashboardSnapshot.annualDecisionDate,
    detail: "A shared date to revisit the collective's priorities together.",
    icon: CalendarDaysIcon,
  },
]

export function SectionCards() {
  return (
    <section className="px-4 lg:px-6" aria-labelledby="snapshot-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Member home
          </p>
          <h1
            id="snapshot-heading"
            className="mt-1 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl"
          >
            A calmer way to decide together.
          </h1>
        </div>
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/5 text-primary"
        >
          Illustrative only
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.label}
              className="min-h-48 bg-linear-to-b from-primary/[0.06] to-card shadow-xs dark:from-primary/[0.09]"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardDescription>{card.label}</CardDescription>
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                </div>
                <CardTitle className="mt-4 text-2xl font-semibold tracking-[-0.04em] tabular-nums @min-[260px]/card:text-3xl">
                  {card.value}
                </CardTitle>
              </CardHeader>
              <CardFooter className="mt-auto text-sm leading-5 text-muted-foreground">
                {card.detail}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
