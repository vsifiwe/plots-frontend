"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { formatRwf, savingsActivity } from "@/app/dashboard/demo-data"
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const chartConfig = {
  contributions: {
    label: "Member contributions",
    color: "var(--primary)",
  },
  reserve: {
    label: "Savings reserve",
    color: "color-mix(in oklab, var(--primary) 48%, var(--muted-foreground))",
  },
} satisfies ChartConfig

const dayRanges = { "7d": 7, "30d": 30, "90d": 90 } as const

function formatShortDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-RW", {
    month: "short",
    day: "numeric",
  })
}

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] =
    React.useState<keyof typeof dayRanges>("90d")

  const filteredData = React.useMemo(() => {
    const endDate = new Date("2026-09-06T12:00:00")
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - dayRanges[timeRange])
    return savingsActivity.filter(
      (item) => new Date(`${item.date}T12:00:00`) >= startDate
    )
  }, [timeRange])

  return (
    <Card className="@container/card overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-muted/20">
        <CardTitle className="text-lg font-semibold tracking-[-0.03em]">
          Savings activity
        </CardTitle>
        <CardDescription>
          Demo contributions and a short-term savings reserve, shown in Rwandan
          francs.
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[timeRange]}
            onValueChange={(value) =>
              setTimeRange((value[0] as keyof typeof dayRanges) ?? "90d")
            }
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
            aria-label="Savings activity time range"
          >
            <ToggleGroupItem value="90d">Last 90 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) =>
              setTimeRange(value as keyof typeof dayRanges)
            }
          >
            <SelectTrigger
              className="flex w-36 @[767px]/card:hidden"
              size="sm"
              aria-label="Savings activity time range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 90 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-5 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[270px] w-full"
        >
          <AreaChart
            data={filteredData}
            margin={{ left: 12, right: 12, top: 8 }}
          >
            <defs>
              <linearGradient
                id="fillContributions"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-contributions)"
                  stopOpacity={0.55}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-contributions)"
                  stopOpacity={0.04}
                />
              </linearGradient>
              <linearGradient id="fillReserve" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-reserve)"
                  stopOpacity={0.26}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-reserve)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={formatShortDate}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => formatShortDate(String(value))}
                  formatter={(value, name) => (
                    <div className="flex flex-1 items-center justify-between gap-6">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono font-medium tabular-nums">
                        {formatRwf(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="reserve"
              type="natural"
              fill="url(#fillReserve)"
              stroke="var(--color-reserve)"
              strokeWidth={2}
            />
            <Area
              dataKey="contributions"
              type="natural"
              fill="url(#fillContributions)"
              stroke="var(--color-contributions)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
