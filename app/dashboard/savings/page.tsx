"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import {
  ArrowUpRightIcon,
  BanknoteIcon,
  CircleAlertIcon,
  LandmarkIcon,
  LoaderCircleIcon,
  PlusIcon,
  ReceiptTextIcon,
  TrendingUpIcon,
} from "lucide-react"

import { useDashboardMember } from "@/components/member-dashboard-shell"
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import {
  ApiError,
  createRNITNav,
  getSavingsSummary,
  listPendingRNITContributions,
  listPublishedRNITNavs,
  listRNITPurchases,
  listRNITNavs,
  purchaseContributionRNIT,
  reverseRNITPurchase,
  type Contribution,
  type RNITNav,
  type RNITNavValues,
  type RNITPurchase,
  type SavingsSummary,
} from "@/lib/auth"

function todayValue() {
  return new Date().toISOString().slice(0, 10)
}

function formatRwf(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatUnits(value: string) {
  return new Intl.NumberFormat("en-RW", { maximumFractionDigits: 4 }).format(Number(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-RW", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`))
}

function NavDrawer({
  navs,
  onSaved,
}: {
  navs: RNITNav[]
  onSaved: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [publishedNavs, setPublishedNavs] = useState<
    RNITNavValues[] | "unavailable" | null
  >(null)
  const [selection, setSelection] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const recordedDates = new Set(navs.map((entry) => entry.as_of_date))
  const options = Array.isArray(publishedNavs) ? publishedNavs : []
  const items = options.map((entry) => ({
    value: entry.as_of_date,
    label: `${formatDate(entry.as_of_date)} · ${entry.nav_per_unit} RWF${recordedDates.has(entry.as_of_date) ? " (recorded)" : ""}`,
  }))
  items.push({ value: "custom", label: "Enter custom NAV" })
  const custom = selection === "custom"
  const selectedNav = options.find((entry) => entry.as_of_date === selection)

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    async function loadPublishedNavs() {
      try {
        const entries = await listPublishedRNITNavs(controller.signal)
        if (!controller.signal.aborted) setPublishedNavs(entries)
      } catch {
        if (!controller.signal.aborted) setPublishedNavs("unavailable")
      }
    }

    void loadPublishedNavs()
    return () => controller.abort()
  }, [open])

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      setPublishedNavs(null)
      setSelection(null)
      setError("")
    }
    setOpen(nextOpen)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values = custom
      ? {
          as_of_date: String(form.get("as_of_date") ?? ""),
          nav_per_unit: String(form.get("nav_per_unit") ?? ""),
        }
      : selectedNav
    if (!values) return
    if (
      !values.as_of_date ||
      !/^\d+(\.\d+)?$/.test(values.nav_per_unit) ||
      Number(values.nav_per_unit) <= 0
    ) {
      setError("Enter a valid dated RNIT NAV greater than zero.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await createRNITNav(values)
      await onSaved()
      toast.add({ type: "success", title: "RNIT NAV recorded" })
      setOpen(false)
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "We could not record this NAV. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={changeOpen}>
      <DrawerTrigger
        render={<Button><PlusIcon aria-hidden="true" />Record NAV</Button>}
      />
      <DrawerContent className="sm:[--drawer-content-width:34rem] sm:max-w-none">
        <DrawerHeader>
          <DrawerTitle>Record RNIT NAV</DrawerTitle>
          <DrawerDescription>
            Choose a recent published NAV or enter one manually.
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={submit} className="grid gap-5 px-5 pb-4">
          <div className="grid gap-2">
            <Label htmlFor="nav-selection">NAV to record</Label>
            <Select
              items={items}
              value={selection}
              onValueChange={(value) => {
                setSelection(value)
                setError("")
              }}
              disabled={saving}
            >
              <SelectTrigger id="nav-selection" className="w-full">
                <SelectValue placeholder="Choose a NAV" />
              </SelectTrigger>
              <SelectContent>
                {items.map(({ value, label }) => (
                  <SelectItem
                    key={value}
                    value={value}
                    disabled={recordedDates.has(value)}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground" role="status">
                {publishedNavs === null
                  ? "Loading published NAVs…"
                  : publishedNavs === "unavailable"
                    ? "Published NAVs are unavailable. You can still enter a custom NAV."
                    : "No published NAVs are available."}
              </p>
            ) : null}
          </div>
          <fieldset hidden={!custom} disabled={!custom || saving}>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="nav-date">NAV date</Label>
                <Input
                  id="nav-date"
                  name="as_of_date"
                  type="date"
                  max={todayValue()}
                  defaultValue={todayValue()}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nav-price">NAV per unit (RWF)</Label>
                <Input
                  id="nav-price"
                  name="nav_per_unit"
                  inputMode="decimal"
                  placeholder="e.g. 286.77"
                  required
                />
              </div>
            </div>
          </fieldset>
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
          <DrawerFooter>
            <Button type="submit" disabled={saving || (!custom && !selectedNav)}>
              {saving ? <LoaderCircleIcon className="animate-spin" /> : null}
              {saving ? "Recording..." : "Record NAV"}
            </Button>
            <DrawerClose render={<Button variant="outline" type="button">Cancel</Button>} />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

function PurchaseDrawer({ contribution, navs, onSaved, onClose }: { contribution: Contribution | null; navs: RNITNav[]; onSaved: () => Promise<void>; onClose: () => void }) {
  const [date, setDate] = useState(todayValue())
  const [navId, setNavId] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contribution || !navId || !date) { setError("Choose the purchase date and the RNIT NAV used."); return }
    setSaving(true); setError("")
    try {
      const purchase = await purchaseContributionRNIT(contribution.id, { purchased_on: date, nav_id: Number(navId) })
      await onSaved()
      toast.add({ type: "success", title: "RNIT units purchased", description: `${formatUnits(purchase.units)} units were recorded for ${contribution.member?.full_name ?? "this member"}.` })
      onClose()
      setNavId("")
    } catch (caught) { setError(caught instanceof ApiError ? caught.message : "We could not record this purchase. Please try again.") } finally { setSaving(false) }
  }

  return <Drawer open={Boolean(contribution)} onOpenChange={(next) => { if (!next) { setError(""); onClose() } }}>
    <DrawerContent className="sm:[--drawer-content-width:34rem] sm:max-w-none">
      <DrawerHeader><DrawerTitle>Purchase RNIT units</DrawerTitle><DrawerDescription>{contribution ? `${formatRwf(contribution.amount)} from ${contribution.member?.full_name ?? "this contribution"} will be converted in full at the selected NAV.` : ""}</DrawerDescription></DrawerHeader>
      <form onSubmit={submit} className="grid gap-5 px-5 pb-4">
        <div className="grid gap-2"><Label htmlFor="purchase-date">Purchase date</Label><Input id="purchase-date" type="date" max={todayValue()} value={date} onChange={(event) => setDate(event.target.value)} /></div>
        <div className="grid gap-2"><Label>RNIT NAV</Label><Select value={navId} onValueChange={(value) => setNavId(value ?? "")}><SelectTrigger aria-label="RNIT NAV used for purchase"><SelectValue placeholder={navs.length ? "Choose a recorded NAV" : "Record a NAV first"} /></SelectTrigger><SelectContent>{navs.map((nav) => <SelectItem key={nav.id} value={String(nav.id)}>{formatDate(nav.as_of_date)} · {Number(nav.nav_per_unit).toLocaleString("en-RW", { maximumFractionDigits: 4 })} RWF</SelectItem>)}</SelectContent></Select></div>
        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        <DrawerFooter><Button type="submit" disabled={saving || !navs.length}>{saving ? <LoaderCircleIcon className="animate-spin" /> : null}{saving ? "Purchasing..." : "Record purchase"}</Button><DrawerClose render={<Button variant="outline" type="button">Cancel</Button>} /></DrawerFooter>
      </form>
    </DrawerContent>
  </Drawer>
}

function ReversePurchaseDrawer({ purchase, onSaved, onClose }: { purchase: RNITPurchase | null; onSaved: () => Promise<void>; onClose: () => void }) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!purchase || !reason.trim()) { setError("Enter a reason for reversing this purchase."); return }
    setSaving(true); setError("")
    try {
      await reverseRNITPurchase(purchase.id, reason.trim())
      await onSaved()
      toast.add({ type: "success", title: "RNIT purchase reversed", description: "The contribution is available as pending cash again." })
      setReason(""); onClose()
    } catch (caught) { setError(caught instanceof ApiError ? caught.message : "We could not reverse this purchase. Please try again.") } finally { setSaving(false) }
  }

  return <Drawer open={Boolean(purchase)} onOpenChange={(next) => { if (!next) { setError(""); onClose() } }}><DrawerContent className="sm:[--drawer-content-width:34rem] sm:max-w-none"><DrawerHeader><DrawerTitle>Reverse RNIT purchase</DrawerTitle><DrawerDescription>{purchase ? `${formatUnits(purchase.units)} RNIT units for ${purchase.member.full_name} will be removed from their holding. This preserves the original purchase history.` : ""}</DrawerDescription></DrawerHeader><form onSubmit={submit} className="grid gap-5 px-5 pb-4"><div className="grid gap-2"><Label htmlFor="purchase-reversal-reason">Reason</Label><textarea id="purchase-reversal-reason" rows={4} value={reason} onChange={(event) => { setReason(event.target.value); setError("") }} className="flex w-full resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" aria-invalid={Boolean(error)} /></div>{error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}<DrawerFooter><Button type="submit" variant="destructive" disabled={saving}>{saving ? <LoaderCircleIcon className="animate-spin" /> : null}{saving ? "Reversing..." : "Reverse purchase"}</Button><DrawerClose render={<Button variant="outline" type="button">Cancel</Button>} /></DrawerFooter></form></DrawerContent></Drawer>
}

export default function SavingsPage() {
  const member = useDashboardMember()
  const isSteward = member.can_manage_members
  const [summary, setSummary] = useState<SavingsSummary | null>(null)
  const [navs, setNavs] = useState<RNITNav[]>([])
  const [pending, setPending] = useState<Contribution[]>([])
  const [purchases, setPurchases] = useState<RNITPurchase[]>([])
  const [purchaseTarget, setPurchaseTarget] = useState<Contribution | null>(null)
  const [reversalTarget, setReversalTarget] = useState<RNITPurchase | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const [nextSummary, nextNavs, nextPending, nextPurchases] = await Promise.all([
        getSavingsSummary(), listRNITNavs(), isSteward ? listPendingRNITContributions() : Promise.resolve([]),
        isSteward ? listRNITPurchases() : Promise.resolve([]),
      ])
      setSummary(nextSummary); setNavs(nextNavs); setPending(nextPending); setPurchases(nextPurchases)
    } catch (caught) { setError(caught instanceof ApiError ? caught.message : "We could not load RNIT savings. Please refresh and try again.") } finally { setLoading(false) }
  }, [isSteward])

  useEffect(() => {
    Promise.all([
      getSavingsSummary(),
      listRNITNavs(),
      isSteward ? listPendingRNITContributions() : Promise.resolve([]),
      isSteward ? listRNITPurchases() : Promise.resolve([]),
    ]).then(([nextSummary, nextNavs, nextPending, nextPurchases]) => {
      setSummary(nextSummary)
      setNavs(nextNavs)
      setPending(nextPending)
      setPurchases(nextPurchases)
    }).catch((caught) => {
      setError(caught instanceof ApiError ? caught.message : "We could not load RNIT savings. Please refresh and try again.")
    }).finally(() => setLoading(false))
  }, [isSteward])

  if (loading) return <div className="grid flex-1 place-items-center"><div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircleIcon className="size-4 animate-spin" />Loading RNIT savings...</div></div>
  if (error || !summary) return <div className="grid flex-1 place-items-center p-6 text-center"><div><CircleAlertIcon className="mx-auto size-5 text-destructive" /><p className="mt-3 font-medium">{error || "Savings are unavailable."}</p><Button className="mt-4" variant="outline" onClick={() => void load()}>Try again</Button></div></div>

  const position = summary.member
  const cards = [
    { label: "Your current value", value: formatRwf(position.current_value), detail: "Pending cash plus RNIT units at the latest NAV.", icon: LandmarkIcon },
    { label: "RNIT units held", value: formatUnits(position.units_held), detail: position.latest_nav ? `${formatRwf(position.rnit_value)} at ${Number(position.latest_nav.nav_per_unit).toLocaleString("en-RW", { maximumFractionDigits: 4 })} RWF per unit.` : "Record a NAV to value your units.", icon: TrendingUpIcon },
    { label: "Pending cash", value: formatRwf(position.pending_cash), detail: "Received contributions not yet converted to RNIT units.", icon: ReceiptTextIcon },
    { label: "Available to commit", value: formatRwf(position.available_value), detail: `${formatRwf(position.reserved_value)} currently reserved for open assets.`, icon: BanknoteIcon },
  ]

  return <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-4 md:gap-7 md:p-6">
    <section className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">RNIT savings</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">Your member position</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Contributions remain as cash until a steward records their RNIT purchase. Values change only when a newer published NAV is recorded.</p></div>{isSteward ? <NavDrawer navs={navs} onSaved={load} /> : null}</section>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <Card key={card.label} className="bg-linear-to-b from-primary/[0.06] to-card shadow-xs dark:from-primary/[0.09]"><CardHeader><div className="flex justify-between gap-3"><CardDescription>{card.label}</CardDescription><span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span></div><CardTitle className="mt-4 text-2xl tabular-nums">{card.value}</CardTitle></CardHeader><CardContent className="mt-auto text-sm text-muted-foreground">{card.detail}</CardContent></Card> })}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,.75fr)]">
      <Card><CardHeader><CardTitle>RNIT value and growth</CardTitle><CardDescription>Unrealized change is based on the latest NAV and the average cost of your remaining units.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div className="rounded-lg border bg-muted/30 p-4"><p className="text-xs font-medium text-muted-foreground">Latest NAV</p><p className="mt-2 text-xl font-semibold tabular-nums">{position.latest_nav ? `${Number(position.latest_nav.nav_per_unit).toLocaleString("en-RW", { maximumFractionDigits: 4 })} RWF` : "Not recorded"}</p><p className="mt-1 text-xs text-muted-foreground">{position.latest_nav ? `Published ${formatDate(position.latest_nav.as_of_date)}` : "A steward will add the first NAV."}</p></div><div className="rounded-lg border bg-muted/30 p-4"><p className="text-xs font-medium text-muted-foreground">Unrealized RNIT growth</p><p className={`mt-2 text-xl font-semibold tabular-nums ${position.unrealized_growth < 0 ? "text-destructive" : "text-primary"}`}>{position.latest_nav ? formatRwf(position.unrealized_growth) : "—"}</p><p className="mt-1 text-xs text-muted-foreground">This excludes pending cash and acquired assets.</p></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Reservations</CardTitle><CardDescription>Funds already set aside for open collective assets.</CardDescription></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Cash reserved</span><span className="font-medium tabular-nums">{formatRwf(position.reserved_cash)}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Units reserved</span><span className="font-medium tabular-nums">{formatUnits(position.reserved_units)}</span></div><div className="border-t pt-3 text-xs text-muted-foreground">Unit reservation values move with NAV; they are protected from being committed twice.</div></CardContent></Card>
    </div>
    {isSteward ? <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>Pending contributions</CardTitle><CardDescription>Record the full RNIT purchase for each received contribution when it is completed.</CardDescription></div><Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">{pending.length} awaiting purchase</Badge></div></CardHeader><CardContent>{pending.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No pending contributions. All recorded funds have been purchased or voided.</p> : <><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Received</TableHead><TableHead className="text-right">Amount</TableHead><TableHead><span className="sr-only">Action</span></TableHead></TableRow></TableHeader><TableBody>{pending.map((contribution) => <TableRow key={contribution.id}><TableCell className="font-medium">{contribution.member?.full_name}</TableCell><TableCell>{formatDate(contribution.received_on)}</TableCell><TableCell className="text-right font-mono tabular-nums">{formatRwf(contribution.amount)}</TableCell><TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setPurchaseTarget(contribution)}>Purchase units<ArrowUpRightIcon /></Button></TableCell></TableRow>)}</TableBody></Table></div><PurchaseDrawer contribution={purchaseTarget} navs={navs} onClose={() => setPurchaseTarget(null)} onSaved={async () => { setPurchaseTarget(null); await load() }} /></>}</CardContent></Card> : null}
    {isSteward ? <Card><CardHeader><CardTitle>Recent RNIT purchases</CardTitle><CardDescription>Purchase reversals are audit entries. They cannot proceed while units are reserved or have funded an acquired asset.</CardDescription></CardHeader><CardContent>{purchases.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No RNIT purchases recorded yet.</p> : <><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Purchased</TableHead><TableHead className="text-right">Units</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Action</span></TableHead></TableRow></TableHeader><TableBody>{purchases.map((purchase) => <TableRow key={purchase.id}><TableCell className="font-medium">{purchase.member.full_name}</TableCell><TableCell>{formatDate(purchase.purchased_on)}</TableCell><TableCell className="text-right font-mono tabular-nums">{formatUnits(purchase.units)}</TableCell><TableCell><Badge variant="outline" className={purchase.status === "invested" ? "border-primary/25 bg-primary/10 text-primary" : "border-muted-foreground/20 bg-muted text-muted-foreground"}>{purchase.status === "invested" ? "Invested" : "Reversed"}</Badge></TableCell><TableCell className="text-right">{purchase.status === "invested" ? <Button size="sm" variant="ghost" onClick={() => setReversalTarget(purchase)}>Reverse</Button> : <span className="text-xs text-muted-foreground">Preserved</span>}</TableCell></TableRow>)}</TableBody></Table></div><ReversePurchaseDrawer purchase={reversalTarget} onClose={() => setReversalTarget(null)} onSaved={async () => { setReversalTarget(null); await load() }} /></>}</CardContent></Card> : null}
    {isSteward && summary.collective ? <p className="text-xs text-muted-foreground">Collective live value: <span className="font-medium text-foreground">{formatRwf(summary.collective.current_value)}</span> across {summary.collective.members} active members. This reflects pending cash and RNIT value at the latest recorded NAV.</p> : null}
  </div>
}
