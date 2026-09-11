"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRightIcon,
  ChartPieIcon,
  CircleAlertIcon,
  HeartPulseIcon,
  LandmarkIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersRoundIcon,
  WalletCardsIcon,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ApiError,
  getOverviewSummary,
  type OverviewAllocationKey,
  type OverviewSegmentKey,
  type OverviewSummary,
} from "@/lib/auth"
import { cn } from "@/lib/utils"

const allocationColors: Record<OverviewAllocationKey, string> = {
  pending_cash: "var(--chart-3)",
  rnit: "var(--chart-1)",
  fixed_assets: "var(--chart-2)",
  variable_assets: "var(--chart-4)",
}

const allocationConfig = {
  pending_cash: { label: "Pending cash", color: "var(--chart-3)" },
  rnit: { label: "RNIT holdings", color: "var(--chart-1)" },
  fixed_assets: { label: "Fixed assets", color: "var(--chart-2)" },
  variable_assets: { label: "Shares and units", color: "var(--chart-4)" },
} satisfies ChartConfig

const contributionConfig = {
  total_received: {
    label: "Amount received",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const segmentStyles: Record<
  OverviewSegmentKey,
  { border: string; icon: string; Icon: typeof LandmarkIcon }
> = {
  cornerstone: {
    border: "border-t-chart-3",
    icon: "bg-chart-3/10 text-chart-3",
    Icon: LandmarkIcon,
  },
  growth: {
    border: "border-t-chart-2",
    icon: "bg-chart-2/10 text-chart-2",
    Icon: TrendingUpIcon,
  },
  emerging: {
    border: "border-t-chart-1",
    icon: "bg-chart-1/10 text-chart-1",
    Icon: WalletCardsIcon,
  },
  legacy: {
    border: "border-t-muted-foreground/40",
    icon: "bg-muted text-muted-foreground",
    Icon: UsersRoundIcon,
  },
}

function formatRwf(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCompactRwf(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    currencyDisplay: "code",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("en-RW", {
    maximumFractionDigits: 1,
  }).format(value)}%`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-RW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`))
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-RW", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`))
}

function OverviewSkeleton() {
  return (
    <div className="@container/main mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-[34rem] max-w-full" />
      </div>
      <Skeleton className="h-[410px] rounded-xl" />
      <div className="grid gap-4 @3xl/main:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[390px] rounded-xl" />
        <Skeleton className="h-[390px] rounded-xl" />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: typeof UsersRoundIcon
}) {
  return (
    <Card className="bg-linear-to-b from-primary/[0.045] to-card shadow-xs dark:from-primary/[0.08]">
      <CardContent className="flex h-full items-start justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] tabular-nums sm:text-3xl">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {detail}
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </CardContent>
    </Card>
  )
}

function PortfolioOverview({ summary }: { summary: OverviewSummary }) {
  const chartData = summary.portfolio.allocation
    .filter((entry) => entry.value > 0)
    .map((entry) => ({
      ...entry,
      fill: allocationColors[entry.key],
    }))

  return (
    <Card className="overflow-hidden shadow-xs">
      <CardContent className="grid p-0 @5xl/main:grid-cols-[1.25fr_0.75fr]">
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary"
            >
              <ChartPieIcon aria-hidden="true" />
              Live collective value
            </Badge>
            <span className="text-xs text-muted-foreground">
              Generated {formatDate(summary.generated_on)}
            </span>
          </div>
          <p className="mt-7 text-sm font-medium text-muted-foreground">
            Total portfolio value
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.065em] tabular-nums sm:text-5xl lg:text-6xl">
            {formatRwf(summary.portfolio.total_value)}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {summary.valuation_as_of
              ? `Using the latest recorded values through ${formatDate(summary.valuation_as_of)}.`
              : "No NAV or asset valuation has been recorded yet."}
          </p>

          <div className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {summary.portfolio.allocation.map((entry) => (
              <div key={entry.key} className="flex items-start gap-3">
                <span
                  className="mt-1 size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: allocationColors[entry.key] }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{entry.label}</p>
                  <p className="mt-1 font-mono text-sm text-muted-foreground tabular-nums">
                    {formatCompactRwf(entry.value)} ·{" "}
                    {formatPercent(entry.percentage)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid min-h-72 place-items-center border-t bg-muted/20 p-6 @5xl/main:border-t-0 @5xl/main:border-l">
          {chartData.length ? (
            <div className="relative w-full max-w-[300px]">
              <ChartContainer
                config={allocationConfig}
                className="mx-auto aspect-square h-[270px] w-full"
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex min-w-44 items-center justify-between gap-6">
                            <span className="text-muted-foreground">
                              {name}
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {formatRwf(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={74}
                    outerRadius={112}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Allocated</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    100%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xs text-center">
              <ChartPieIcon
                aria-hidden="true"
                className="mx-auto size-5 text-muted-foreground"
              />
              <p className="mt-3 font-medium">No portfolio value recorded</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Contributions, RNIT purchases, and acquired assets will appear
                here as they are recorded.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ContributionHealth({ summary }: { summary: OverviewSummary }) {
  const window = summary.contributions.current_window
  const health = Math.max(0, Math.min(100, window.health_percentage))
  const hasHistory = summary.contributions.history.some(
    (entry) => entry.total_received > 0
  )

  return (
    <Card className="overflow-hidden shadow-xs">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Contribution health</CardTitle>
            <CardDescription>
              {formatMonth(window.month)} participation among active members.
            </CardDescription>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <HeartPulseIcon aria-hidden="true" className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-7 p-5 sm:p-6 @5xl/main:grid-cols-[0.62fr_1.38fr]">
        <div className="flex flex-col items-center justify-center text-center">
          <div
            className="grid size-36 place-items-center rounded-full p-3"
            style={{
              background: `conic-gradient(var(--primary) ${health}%, var(--muted) 0)`,
            }}
          >
            <div className="grid size-full place-items-center rounded-full bg-card">
              <span className="text-3xl font-semibold tracking-[-0.05em] tabular-nums">
                {formatPercent(window.health_percentage)}
              </span>
            </div>
          </div>
          <p className="mt-4 font-medium">
            {window.contributing_members} of {window.active_members} active
            members
          </p>
          <Badge
            variant="outline"
            className={cn(
              "mt-3",
              window.is_healthy
                ? "border-primary/25 bg-primary/10 text-primary"
                : "border-chart-3/30 bg-chart-3/10 text-foreground"
            )}
          >
            {window.is_healthy ? "Healthy participation" : "Below target"}
          </Badge>
          <p className="mt-2 text-xs text-muted-foreground">
            Healthy threshold: {formatPercent(window.healthy_threshold)}
          </p>
        </div>

        <div className="min-w-0 border-t pt-6 @5xl/main:border-t-0 @5xl/main:border-l @5xl/main:pt-0 @5xl/main:pl-7">
          <p className="text-sm font-semibold">Amount received per month</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The latest eight completed calendar months.
          </p>
          {hasHistory ? (
            <ChartContainer
              config={contributionConfig}
              className="mt-4 h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={summary.contributions.history}
                layout="vertical"
                margin={{ left: 0, right: 12, top: 0, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="month"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={54}
                  tickFormatter={(value) =>
                    new Intl.DateTimeFormat("en-RW", { month: "short" }).format(
                      new Date(`${value}T12:00:00`)
                    )
                  }
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatMonth(String(value))}
                      formatter={(value) => (
                        <div className="flex min-w-48 items-center justify-between gap-6">
                          <span className="text-muted-foreground">
                            Received
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {formatRwf(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="total_received"
                  fill="var(--color-total_received)"
                  radius={[0, 5, 5, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="mt-4 grid h-[250px] place-items-center rounded-lg border border-dashed bg-muted/15 p-6 text-center">
              <div>
                <WalletCardsIcon
                  aria-hidden="true"
                  className="mx-auto size-5 text-muted-foreground"
                />
                <p className="mt-3 font-medium">
                  No contributions in this period
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recorded monthly totals will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function HoldingsPerformance({ summary }: { summary: OverviewSummary }) {
  const holdings = summary.holdings.slice(0, 5)

  return (
    <Card className="overflow-hidden shadow-xs">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Holdings performance</CardTitle>
            <CardDescription>
              Current recorded value for the collective&apos;s largest acquired
              holdings.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/assets" />}
          >
            View assets
            <ArrowUpRightIcon aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {holdings.length ? (
          <>
            <div className="hidden overflow-x-auto @4xl/main:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Holding</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Current value</TableHead>
                    <TableHead>Gain / loss</TableHead>
                    <TableHead>RNIT benchmark</TableHead>
                    <TableHead className="pr-6">Value basis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((holding) => {
                    const isNegative = holding.growth < 0
                    const TrendIcon = isNegative
                      ? TrendingDownIcon
                      : TrendingUpIcon
                    return (
                      <TableRow key={holding.id}>
                        <TableCell className="pl-6">
                          <Link
                            href={`/dashboard/assets/${holding.id}`}
                            className="font-medium hover:underline"
                          >
                            {holding.title}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {holding.asset_type === "variable"
                              ? holding.current_unit_price !== null &&
                                holding.acquisition_unit_price !== null
                                ? `${formatRwf(holding.acquisition_unit_price)} to ${formatRwf(holding.current_unit_price)} per unit`
                                : "Variable asset"
                              : "Fixed asset"}
                          </p>
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {formatRwf(holding.cost)}
                        </TableCell>
                        <TableCell className="font-mono font-medium tabular-nums">
                          {formatRwf(holding.current_value)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-mono font-medium tabular-nums",
                              isNegative ? "text-destructive" : "text-primary"
                            )}
                          >
                            <TrendIcon
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            {formatPercent(holding.growth_percentage)}
                          </span>
                          <p className="mt-1 font-mono text-xs text-muted-foreground tabular-nums">
                            {formatRwf(holding.growth)}
                          </p>
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {holding.rnit_benchmark_percentage === null
                            ? "Not available"
                            : formatPercent(holding.rnit_benchmark_percentage)}
                        </TableCell>
                        <TableCell className="pr-6 text-xs text-muted-foreground">
                          {holding.latest_valuation_date
                            ? formatDate(holding.latest_valuation_date)
                            : "Acquisition value"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid divide-y @4xl/main:hidden">
              {holdings.map((holding) => {
                const isNegative = holding.growth < 0
                return (
                  <Link
                    key={holding.id}
                    href={`/dashboard/assets/${holding.id}`}
                    className="grid gap-4 p-5 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{holding.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {holding.asset_type === "variable"
                            ? "Shares or units"
                            : "Fixed asset"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          isNegative
                            ? "border-destructive/25 bg-destructive/10 text-destructive"
                            : "border-primary/25 bg-primary/10 text-primary"
                        }
                      >
                        {formatPercent(holding.growth_percentage)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                          {formatRwf(holding.current_value)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Gain / loss
                        </p>
                        <p
                          className={cn(
                            "mt-1 font-mono text-sm font-medium tabular-nums",
                            isNegative ? "text-destructive" : "text-primary"
                          )}
                        >
                          {formatRwf(holding.growth)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {holding.rnit_benchmark_percentage === null
                        ? "RNIT comparison is not available for this acquisition."
                        : `RNIT benchmark: ${formatPercent(holding.rnit_benchmark_percentage)}`}
                    </p>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <div className="grid min-h-56 place-items-center p-6 text-center">
            <div>
              <LandmarkIcon
                aria-hidden="true"
                className="mx-auto size-5 text-muted-foreground"
              />
              <p className="mt-3 font-medium">No acquired holdings yet</p>
              <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
                Reserved and draft assets stay off performance reporting until
                acquisition is complete.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MemberSegments({ summary }: { summary: OverviewSummary }) {
  return (
    <section aria-labelledby="segments-heading">
      <div>
        <h2
          id="segments-heading"
          className="text-xl font-semibold tracking-[-0.035em]"
        >
          Member distribution
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current portfolio bands across active members, with inactive members
          kept in Legacy.
        </p>
      </div>
      <div className="mt-4 grid gap-4 @3xl/main:grid-cols-2">
        {summary.segments.map((segment) => {
          const style = segmentStyles[segment.key]
          const Icon = style.Icon
          return (
            <Card
              key={segment.key}
              className={cn("border-t-4 shadow-xs", style.border)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-lg",
                        style.icon
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <CardTitle>{segment.label}</CardTitle>
                      <CardDescription>{segment.range_label}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums">
                      {segment.member_count}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {segment.member_count === 1 ? "member" : "members"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg bg-muted/45 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Segment value
                    </p>
                    <p className="mt-1 text-xl font-semibold tracking-[-0.03em] tabular-nums">
                      {formatRwf(segment.total_value)}
                    </p>
                  </div>
                  <p className="font-mono font-semibold text-primary tabular-nums">
                    {formatPercent(segment.percentage)}
                  </p>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Members
                  </p>
                  {segment.members.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {segment.members.map((member) => (
                        <Badge key={member.id} variant="outline">
                          {member.full_name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No members in this segment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<OverviewSummary | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setSummary(await getOverviewSummary())
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "We could not load the collective overview. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    getOverviewSummary()
      .then((nextSummary) => {
        if (active) setSummary(nextSummary)
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "We could not load the collective overview. Please try again."
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const memberStats = useMemo(() => {
    if (!summary) return []
    return [
      {
        label: "Active membership",
        value: String(summary.membership.active_members),
        detail: `${summary.membership.total_members} total · ${summary.membership.inactive_members} inactive`,
        icon: UsersRoundIcon,
      },
      {
        label: "Average active portfolio",
        value: formatCompactRwf(summary.membership.average_active_portfolio),
        detail: "Average current value across active members.",
        icon: WalletCardsIcon,
      },
      {
        label: "Top five concentration",
        value: formatPercent(summary.membership.top_five_concentration),
        detail: "Share of collective value held by the five largest positions.",
        icon: ChartPieIcon,
      },
    ]
  }, [summary])

  if (isLoading) return <OverviewSkeleton />

  if (error || !summary) {
    return (
      <div className="grid flex-1 place-items-center p-6 text-center">
        <div>
          <CircleAlertIcon
            aria-hidden="true"
            className="mx-auto size-5 text-destructive"
          />
          <p className="mt-3 font-medium">
            {error || "The collective overview is unavailable."}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => void load()}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="@container/main mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-4 md:gap-7 md:p-6 lg:p-8">
      <section>
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/5 text-primary"
        >
          Group performance
        </Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">
          The collective at a glance
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Portfolio value, contribution participation, acquired holdings, and
          member distribution from the latest recorded data.
        </p>
      </section>

      <PortfolioOverview summary={summary} />

      <section
        className="grid gap-4 @3xl/main:grid-cols-3"
        aria-label="Membership summary"
      >
        {memberStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <ContributionHealth summary={summary} />
      <HoldingsPerformance summary={summary} />
      <MemberSegments summary={summary} />
    </div>
  )
}
