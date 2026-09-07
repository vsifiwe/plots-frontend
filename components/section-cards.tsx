"use client"

import { useEffect, useState } from "react"
import { BanknoteIcon, HandCoinsIcon, LandmarkIcon, LoaderCircleIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSavingsSummary, type SavingsSummary } from "@/lib/auth"

function formatRwf(amount: number) {
  return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(amount)
}

export function SectionCards() {
  const [summary, setSummary] = useState<SavingsSummary | null>(null)

  useEffect(() => {
    getSavingsSummary().then(setSummary).catch(() => setSummary(null))
  }, [])

  const cards = summary ? [
    { label: "Your current value", value: formatRwf(summary.member.current_value), detail: "Pending cash and RNIT units at the latest recorded NAV.", icon: LandmarkIcon },
    { label: "RNIT unit value", value: formatRwf(summary.member.rnit_value), detail: `${summary.member.units_held} units currently held in your name.`, icon: TrendingUpIcon },
    { label: "Pending contribution cash", value: formatRwf(summary.member.pending_cash), detail: "Received funds awaiting RNIT purchase.", icon: HandCoinsIcon },
    { label: "Available to commit", value: formatRwf(summary.member.available_value), detail: `${formatRwf(summary.member.reserved_value)} is reserved for open assets.`, icon: BanknoteIcon },
  ] : []

  return <section className="px-4 lg:px-6" aria-labelledby="snapshot-heading">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">Member home</p><h1 id="snapshot-heading" className="mt-1 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">A clearer view of your shared savings.</h1></div><Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">Live RNIT position</Badge></div>
    {cards.length === 0 ? <div className="flex min-h-48 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground"><LoaderCircleIcon className="mr-2 size-4 animate-spin" />Loading your savings position...</div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <Card key={card.label} className="min-h-48 bg-linear-to-b from-primary/[0.06] to-card shadow-xs dark:from-primary/[0.09]"><CardHeader><div className="flex items-start justify-between gap-4"><CardDescription>{card.label}</CardDescription><span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-4" /></span></div><CardTitle className="mt-4 text-2xl font-semibold tracking-[-0.04em] tabular-nums @min-[260px]/card:text-3xl">{card.value}</CardTitle></CardHeader><CardContent className="mt-auto text-sm leading-5 text-muted-foreground">{card.detail}</CardContent></Card> })}</div>}
  </section>
}
