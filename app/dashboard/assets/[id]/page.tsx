"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  BanIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  LandmarkIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { AssetCommitmentDrawer } from "@/components/asset-commitment-drawer"
import { useDashboardMember } from "@/components/member-dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import {
  acquireAsset,
  ApiError,
  cancelAsset,
  createAssetValuation,
  getAsset,
  openAsset,
  reopenAsset,
  type Asset,
  type AssetFundingIssue,
  type AssetStatus,
} from "@/lib/auth"

function formatRwf(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-RW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatUnits(value: string | null) {
  return value
    ? Number(value).toLocaleString("en-RW", { maximumFractionDigits: 8 })
    : "—"
}

const statusLabel: Record<AssetStatus, string> = {
  draft: "Draft",
  open: "Reserved",
  acquired: "Acquired",
  cancelled: "Cancelled",
}

function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const style =
    status === "acquired"
      ? "border-primary/25 bg-primary/10 text-primary"
      : status === "open"
        ? "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300"
        : status === "cancelled"
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-muted-foreground/20 bg-muted text-muted-foreground"
  return <Badge variant="outline" className={style}>{statusLabel[status]}</Badge>
}

function FundingIssue({ issue }: { issue: AssetFundingIssue }) {
  if (issue.type === "cost_mismatch") {
    return (
      <li>
        Commitments total {formatRwf(issue.committed_total)}; the stated cost
        is {formatRwf(issue.total_cost)}.
      </li>
    )
  }

  if (issue.type === "nav_required") {
    return <li>{issue.message}</li>
  }

  return (
    <li>
      {issue.member.full_name} needs {formatRwf(issue.required)} but has
      {" "}{formatRwf(issue.available_balance)} available.
    </li>
  )
}

function AcquireAssetDrawer({ asset, onAcquired }: { asset: Asset; onAcquired: (asset: Asset) => void }) {
  const [open, setOpen] = useState(false)
  const [units, setUnits] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)
  const isVariable = asset.asset_type === "variable"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isVariable && (!Number(units) || !Number(unitPrice))) {
      setError("Enter the units acquired and their initial unit price.")
      return
    }
    setSubmitting(true)
    try {
      const acquired = await acquireAsset(
        asset.id,
        isVariable ? { units, unit_price: unitPrice } : {}
      )
      onAcquired(acquired)
      toast.add({
        type: "success",
        title: "Asset marked acquired",
        description: isVariable
          ? "The unit holding now starts at its recorded purchase price."
          : "Reserved cash and RNIT units have been redeemed.",
      })
      setOpen(false)
      setUnits("")
      setUnitPrice("")
      setError("")
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "We could not mark this asset acquired. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger render={<Button size="lg" />}>
        <CheckCircle2Icon aria-hidden="true" />Mark acquired
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><LandmarkIcon aria-hidden="true" className="size-4" /></div>
          <DrawerTitle className="text-xl tracking-[-0.03em]">Acquire {asset.title}</DrawerTitle>
          <DrawerDescription>
            {isVariable
              ? "Enter the actual unit purchase. Units × initial price must exactly equal the committed asset cost."
              : "This redeems the currently reserved cash and RNIT units and establishes the asset’s cost basis."}
          </DrawerDescription>
        </DrawerHeader>
        <form className="min-h-0 overflow-y-auto px-4 pb-4" onSubmit={submit} noValidate>
          {isVariable ? (
            <div className="grid gap-4">
              <div className="grid gap-2"><Label htmlFor="asset-acquisition-units">Units acquired</Label><Input id="asset-acquisition-units" type="number" min="0.00000001" step="0.00000001" inputMode="decimal" value={units} onChange={(event) => { setUnits(event.target.value); setError("") }} aria-invalid={Boolean(error)} /></div>
              <div className="grid gap-2"><Label htmlFor="asset-acquisition-price">Initial unit price (RWF)</Label><Input id="asset-acquisition-price" type="number" min="0.00000001" step="0.00000001" inputMode="decimal" value={unitPrice} onChange={(event) => { setUnitPrice(event.target.value); setError("") }} aria-invalid={Boolean(error)} /></div>
              <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">Purchase total: {formatRwf((Number(units) || 0) * (Number(unitPrice) || 0))} · committed cost: {formatRwf(asset.total_cost)}</p>
            </div>
          ) : <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm leading-5 text-muted-foreground">Cost basis: {formatRwf(asset.total_cost)}. A steward can add a professional valuation after acquisition.</p>}
          {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
          <DrawerFooter className="px-0 pt-6"><Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <LoaderCircleIcon aria-hidden="true" className="animate-spin" /> : <CheckCircle2Icon aria-hidden="true" />}{isSubmitting ? "Acquiring…" : "Confirm acquisition"}</Button><DrawerClose render={<Button type="button" variant="outline" size="lg" />}>Keep asset open</DrawerClose></DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

function AddValuationDrawer({ asset, onRecorded }: { asset: Asset; onRecorded: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [asOfDate, setAsOfDate] = useState("")
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)
  const isVariable = asset.asset_type === "variable"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!asOfDate || !Number(value)) { setError("Enter an effective date and a positive value."); return }
    setSubmitting(true)
    try {
      await createAssetValuation(asset.id, isVariable ? { as_of_date: asOfDate, unit_price: value } : { as_of_date: asOfDate, total_value: value })
      await onRecorded()
      toast.add({ type: "success", title: isVariable ? "Unit price recorded" : "Professional valuation recorded", description: "The latest entry now drives this asset’s current value." })
      setOpen(false); setAsOfDate(""); setValue(""); setError("")
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "We could not record this valuation. Please try again.")
    } finally { setSubmitting(false) }
  }

  return <Drawer open={open} onOpenChange={setOpen} swipeDirection="right"><DrawerTrigger render={<Button variant="outline" size="lg" />}><PlusIcon aria-hidden="true" />{isVariable ? "Record unit price" : "Record valuation"}</DrawerTrigger><DrawerContent className="sm:max-w-md"><DrawerHeader className="gap-2"><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><PlusIcon aria-hidden="true" className="size-4" /></div><DrawerTitle className="text-xl tracking-[-0.03em]">{isVariable ? "Record unit price" : "Record professional valuation"}</DrawerTitle><DrawerDescription>{isVariable ? "The latest dated unit price drives the live value of the collective holding." : "This total RWF value becomes the recorded value of the fixed asset."}</DrawerDescription></DrawerHeader><form className="min-h-0 overflow-y-auto px-4 pb-4" onSubmit={submit} noValidate><div className="grid gap-4"><div className="grid gap-2"><Label htmlFor="asset-valuation-date">Effective date</Label><Input id="asset-valuation-date" type="date" value={asOfDate} onChange={(event) => { setAsOfDate(event.target.value); setError("") }} aria-invalid={Boolean(error)} /></div><div className="grid gap-2"><Label htmlFor="asset-valuation-value">{isVariable ? "Unit price (RWF)" : "Total valuation (RWF)"}</Label><Input id="asset-valuation-value" type="number" min="0.00000001" step="0.00000001" inputMode="decimal" value={value} onChange={(event) => { setValue(event.target.value); setError("") }} aria-invalid={Boolean(error)} /></div>{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}</div><DrawerFooter className="px-0 pt-6"><Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <LoaderCircleIcon aria-hidden="true" className="animate-spin" /> : <PlusIcon aria-hidden="true" />}{isSubmitting ? "Recording…" : "Record value"}</Button><DrawerClose render={<Button type="button" variant="outline" size="lg" />}>Cancel</DrawerClose></DrawerFooter></form></DrawerContent></Drawer>
}

function ReopenAssetDrawer({ asset, onReopened }: { asset: Asset; onReopened: (asset: Asset) => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!reason.trim()) { setError("Enter a reason for reopening this asset."); return }
    setSubmitting(true)
    try {
      const reopened = await reopenAsset(asset.id, reason.trim())
      onReopened(reopened)
      toast.add({ type: "success", title: "Asset reopened", description: "Its prior reservations were released so the draft can be revised." })
      setOpen(false); setReason(""); setError("")
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "We could not reopen this asset. Please try again.")
    } finally { setSubmitting(false) }
  }

  return <Drawer open={open} onOpenChange={setOpen} swipeDirection="right"><DrawerTrigger render={<Button variant="outline" size="lg" />}><PencilIcon aria-hidden="true" />Reopen to revise</DrawerTrigger><DrawerContent className="sm:max-w-md"><DrawerHeader className="gap-2"><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><PencilIcon aria-hidden="true" className="size-4" /></div><DrawerTitle className="text-xl tracking-[-0.03em]">Reopen {asset.title}</DrawerTitle><DrawerDescription>This releases the current cash and unit reservations, then returns the asset to a private editable draft.</DrawerDescription></DrawerHeader><form className="min-h-0 overflow-y-auto px-4 pb-4" onSubmit={submit} noValidate><div className="grid gap-2"><Label htmlFor="asset-reopen-reason">Reason for revision</Label><textarea id="asset-reopen-reason" rows={4} value={reason} onChange={(event) => { setReason(event.target.value); setError("") }} className="flex w-full resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" aria-invalid={Boolean(error)} />{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}</div><DrawerFooter className="px-0 pt-6"><Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <LoaderCircleIcon aria-hidden="true" className="animate-spin" /> : <PencilIcon aria-hidden="true" />}{isSubmitting ? "Reopening…" : "Reopen asset"}</Button><DrawerClose render={<Button type="button" variant="outline" size="lg" />}>Keep asset open</DrawerClose></DrawerFooter></form></DrawerContent></Drawer>
}

function CancelAssetDrawer({
  asset,
  onCancelled,
}: {
  asset: Asset
  onCancelled: (asset: Asset) => void
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!reason.trim()) {
      setError("Enter a reason for cancelling this asset.")
      return
    }
    setSubmitting(true)
    try {
      const cancelled = await cancelAsset(asset.id, reason.trim())
      onCancelled(cancelled)
      toast.add({
        type: "success",
        title: "Asset cancelled",
        description: "Active member commitments have been released.",
      })
      setOpen(false)
      setReason("")
      setError("")
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "We could not cancel this asset. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" size="lg" />}>
        <BanIcon aria-hidden="true" />
        Cancel asset
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><BanIcon aria-hidden="true" className="size-4" /></div>
          <DrawerTitle className="text-xl tracking-[-0.03em]">Cancel {asset.title}</DrawerTitle>
          <DrawerDescription>
            This preserves the asset record and releases every active member commitment.
          </DrawerDescription>
        </DrawerHeader>
        <form className="min-h-0 overflow-y-auto px-4 pb-4" onSubmit={submit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="asset-cancellation-reason">Cancellation reason</Label>
            <textarea
              id="asset-cancellation-reason"
              rows={4}
              value={reason}
              onChange={(event) => { setReason(event.target.value); setError("") }}
              className="flex w-full resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              aria-invalid={Boolean(error)}
            />
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DrawerFooter className="px-0 pt-6">
            <Button type="submit" variant="destructive" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircleIcon aria-hidden="true" className="animate-spin" /> : <BanIcon aria-hidden="true" />}
              {isSubmitting ? "Cancelling…" : "Cancel asset"}
            </Button>
            <DrawerClose render={<Button type="button" variant="outline" size="lg" />}>Keep asset</DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const member = useDashboardMember()
  const assetId = Number(id)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isActing, setActing] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isSafeInteger(assetId) || assetId < 1) {
      setError("This asset could not be found.")
      setLoading(false)
      return
    }
    setLoading(true)
    setError("")
    try {
      setAsset(await getAsset(assetId))
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 404) {
        setError("This asset is unavailable.")
      } else {
        setError(caughtError instanceof ApiError ? caughtError.message : "We could not load this asset.")
      }
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => {
    let active = true
    if (!Number.isSafeInteger(assetId) || assetId < 1) {
      Promise.resolve().then(() => {
        if (active) {
          setError("This asset could not be found.")
          setLoading(false)
        }
      })
      return () => {
        active = false
      }
    }

    getAsset(assetId)
      .then((nextAsset) => {
        if (active) setAsset(nextAsset)
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof ApiError && caughtError.status === 404
              ? "This asset is unavailable."
              : caughtError instanceof ApiError
                ? caughtError.message
                : "We could not load this asset."
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [assetId])

  async function markOpen() {
    if (!asset) return
    setActing(true)
    try {
      const opened = await openAsset(asset.id)
      setAsset(opened)
      toast.add({ type: "success", title: "Asset opened", description: "Member commitments are now reserved." })
    } catch (caughtError) {
      toast.add({ type: "error", title: "Asset is not ready", description: caughtError instanceof ApiError ? caughtError.message : "Please review the draft." })
      await load()
    } finally {
      setActing(false)
    }
  }

  if (isLoading) {
    return <div className="grid flex-1 place-items-center p-6"><div className="flex items-center gap-3 text-sm text-muted-foreground"><LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin text-primary" />Loading asset…</div></div>
  }

  if (!asset) {
    return <div className="mx-auto grid w-full max-w-3xl flex-1 place-items-center p-6 text-center"><div><CircleAlertIcon aria-hidden="true" className="mx-auto size-5 text-muted-foreground" /><p className="mt-3 font-medium">{error}</p><Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard/assets")}>Back to assets</Button></div></div>
  }

  const isSteward = member.can_manage_members
  const commitment = asset.your_commitment
  const coverage = asset.total_cost ? Math.min(100, Math.round((asset.total_reserved / asset.total_cost) * 100)) : 0

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6 lg:p-8">
      <Link href="/dashboard/assets" className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon aria-hidden="true" className="size-4" />All assets</Link>
      <section className="rounded-xl border bg-card shadow-xs">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="text-primary">{asset.asset_type === "variable" ? "Variable asset" : "Fixed asset"}</Badge><AssetStatusBadge status={asset.status} /></div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{asset.title}</h1>
              {asset.description ? <p className="mt-3 leading-6 text-muted-foreground">{asset.description}</p> : null}
              <p className="mt-3 text-sm text-muted-foreground">Created {formatDate(asset.created_at)}</p>
            </div>
            {isSteward ? (
              <div className="flex flex-wrap gap-2">
                {asset.status === "draft" ? <AssetCommitmentDrawer asset={asset} onSaved={setAsset} trigger={<Button size="lg"><PencilIcon aria-hidden="true" />Edit draft</Button>} /> : null}
                {asset.status === "draft" ? <Button size="lg" onClick={() => void markOpen()} disabled={isActing}>{isActing ? <LoaderCircleIcon aria-hidden="true" className="animate-spin" /> : <CheckCircle2Icon aria-hidden="true" />}Open asset</Button> : null}
                {asset.status === "open" ? <AcquireAssetDrawer asset={asset} onAcquired={setAsset} /> : null}
                {asset.status === "open" ? <ReopenAssetDrawer asset={asset} onReopened={setAsset} /> : null}
                {asset.status === "acquired" ? <AddValuationDrawer asset={asset} onRecorded={load} /> : null}
                {(asset.status === "draft" || asset.status === "open") ? <CancelAssetDrawer asset={asset} onCancelled={setAsset} /> : null}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 border-t pt-5 sm:grid-cols-3">
            <div><p className="text-sm text-muted-foreground">Total cost</p><p className="mt-1 font-mono text-xl font-semibold tabular-nums">{formatRwf(asset.total_cost)}</p></div>
            {asset.status === "acquired" ? (
              <>
                <div><p className="text-sm text-muted-foreground">Current value</p><p className="mt-1 font-mono text-xl font-semibold tabular-nums">{asset.current_value === null ? "Not recorded" : formatRwf(asset.current_value)}</p><p className="mt-1 text-xs text-muted-foreground">{asset.latest_valuation_date ? `As of ${formatDate(asset.latest_valuation_date)}` : "At acquisition cost basis"}</p></div>
                <div><p className="text-sm text-muted-foreground">Recorded growth</p><p className={asset.growth !== null && asset.growth < 0 ? "mt-1 font-mono text-xl font-semibold tabular-nums text-destructive" : "mt-1 font-mono text-xl font-semibold tabular-nums text-primary"}>{asset.growth === null ? "—" : formatRwf(asset.growth)}</p><p className="mt-1 text-xs text-muted-foreground">{asset.growth_percentage === null ? "No valuation yet" : `${asset.growth_percentage}% from cost basis`}</p></div>
              </>
            ) : (
              <>
                <div><p className="text-sm text-muted-foreground">Reserved from contributions</p><p className="mt-1 font-mono text-xl font-semibold tabular-nums">{formatRwf(asset.total_reserved)}</p></div>
                <div><p className="text-sm text-muted-foreground">Collective coverage</p><p className="mt-1 font-mono text-xl font-semibold tabular-nums">{coverage}%</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${coverage}%` }} /></div></div>
              </>
            )}
          </div>
        </div>

        {asset.status === "draft" && isSteward && asset.funding_issues?.length ? (
          <div className="border-t bg-amber-500/5 p-5 sm:p-6">
            <div className="flex gap-3"><CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" /><div><p className="font-medium">This draft cannot open yet</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-5 text-muted-foreground">{asset.funding_issues.map((issue, index) => <FundingIssue key={`${issue.type}-${index}`} issue={issue} />)}</ul></div></div>
          </div>
        ) : null}
      </section>

      {asset.status === "acquired" ? (
        <section className="rounded-xl border bg-card p-5 shadow-xs sm:p-6" aria-labelledby="valuation-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 id="valuation-heading" className="font-semibold">{asset.asset_type === "variable" ? "Unit-based valuation" : "Professional valuation"}</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">{asset.asset_type === "variable" ? "Current value is acquired units × the latest recorded unit price." : "Current value remains at cost basis until a steward records a professional evaluation."}</p></div>{asset.asset_type === "variable" ? <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Units held</p><p className="mt-1 font-mono font-medium tabular-nums">{formatUnits(asset.acquired_units)}</p></div><div><p className="text-muted-foreground">Latest price</p><p className="mt-1 font-mono font-medium tabular-nums">{asset.latest_unit_price ? formatRwf(Number(asset.latest_unit_price)) : "—"}</p></div></div> : null}</div>
          {isSteward && asset.valuations?.length ? <div className="mt-5 overflow-x-auto border-t pt-5"><Table><TableHeader><TableRow><TableHead>Effective date</TableHead><TableHead>{asset.asset_type === "variable" ? "Unit price" : "Total value"}</TableHead><TableHead>Recorded by</TableHead></TableRow></TableHeader><TableBody>{asset.valuations.map((valuation) => <TableRow key={valuation.id}><TableCell>{formatDate(valuation.as_of_date)}</TableCell><TableCell className="font-mono tabular-nums">{asset.asset_type === "variable" ? formatRwf(Number(valuation.unit_price)) : formatRwf(Number(valuation.total_value))}</TableCell><TableCell>{valuation.recorded_by.full_name}</TableCell></TableRow>)}</TableBody></Table></div> : isSteward ? <p className="mt-5 border-t pt-5 text-sm text-muted-foreground">No {asset.asset_type === "variable" ? "unit-price updates" : "professional valuations"} have been recorded yet.</p> : null}
        </section>
      ) : null}

      {commitment ? (
        <section className="rounded-xl border bg-card p-5 shadow-xs sm:p-6" aria-labelledby="your-commitment-heading">
          <div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><LandmarkIcon aria-hidden="true" className="size-4" /></span><div><h2 id="your-commitment-heading" className="font-semibold">Your planned participation</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">This is the commitment recorded in your name. Other members’ individual commitments remain private.</p></div></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-4"><div><p className="text-sm text-muted-foreground">Commitment</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums">{formatRwf(commitment.amount)}</p></div><div><p className="text-sm text-muted-foreground">Planned ownership</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums">{commitment.ownership_percentage}%</p></div>{asset.status === "acquired" ? <><div><p className="text-sm text-muted-foreground">Your current value</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums">{commitment.current_value === null ? "—" : formatRwf(commitment.current_value)}</p></div><div><p className="text-sm text-muted-foreground">Your growth</p><p className={commitment.growth !== null && commitment.growth < 0 ? "mt-1 font-mono text-lg font-semibold tabular-nums text-destructive" : "mt-1 font-mono text-lg font-semibold tabular-nums text-primary"}>{commitment.growth === null ? "—" : formatRwf(commitment.growth)}</p></div></> : <><div><p className="text-sm text-muted-foreground">Cash reserved</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums">{formatRwf(commitment.reserved_cash)}</p></div><div><p className="text-sm text-muted-foreground">Units reserved</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums">{Number(commitment.reserved_units).toLocaleString("en-RW", { maximumFractionDigits: 4 })}</p></div></>}</div>
        </section>
      ) : null}

      {isSteward ? (
        <section className="rounded-xl border bg-card shadow-xs" aria-labelledby="commitments-heading">
          <div className="border-b p-5 sm:p-6"><div className="flex items-start gap-3"><ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-4 text-primary" /><div><h2 id="commitments-heading" className="font-semibold">Steward commitment register</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">Individual balances and commitments are visible only to stewards.</p></div></div></div>
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="pl-6">Member</TableHead><TableHead>Commitment</TableHead><TableHead>Cash / units reserved</TableHead><TableHead>Planned ownership</TableHead><TableHead>Reservation</TableHead></TableRow></TableHeader><TableBody>{asset.commitments?.map((item) => <TableRow key={item.id}><TableCell className="pl-6 font-medium">{item.member.full_name}</TableCell><TableCell className="font-mono tabular-nums">{formatRwf(item.amount)}</TableCell><TableCell className="font-mono tabular-nums">{formatRwf(item.reserved_cash)} / {Number(item.reserved_units).toLocaleString("en-RW", { maximumFractionDigits: 4 })}</TableCell><TableCell className="font-mono tabular-nums">{item.ownership_percentage}%</TableCell><TableCell>{item.is_reserved ? <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">Reserved</Badge> : item.redeemed_at ? <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">Redeemed</Badge> : item.released_at ? <Badge variant="outline">Released</Badge> : <Badge variant="outline">Draft</Badge>}</TableCell></TableRow>)}</TableBody></Table></div>
        </section>
      ) : null}
    </div>
  )
}
