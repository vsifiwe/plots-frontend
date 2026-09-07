"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRightIcon,
  CircleAlertIcon,
  LandmarkIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { AssetCommitmentDrawer } from "@/components/asset-commitment-drawer"
import { useDashboardMember } from "@/components/member-dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError, listAssets, type Asset, type AssetStatus } from "@/lib/auth"

const statusLabel: Record<AssetStatus, string> = {
  draft: "Draft",
  open: "Reserved",
  acquired: "Acquired",
  cancelled: "Cancelled",
}

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

function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const style =
    status === "acquired"
      ? "border-primary/25 bg-primary/10 text-primary"
      : status === "open"
        ? "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300"
        : status === "cancelled"
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-muted-foreground/20 bg-muted text-muted-foreground"

  return (
    <Badge variant="outline" className={style}>
      {statusLabel[status]}
    </Badge>
  )
}

function Coverage({ asset }: { asset: Asset }) {
  const percentage = asset.total_cost
    ? Math.min(100, Math.round((asset.total_reserved / asset.total_cost) * 100))
    : 0

  return (
    <div className="min-w-36">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Covered</span>
        <span className="font-mono tabular-nums">{percentage}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function AssetsPage() {
  const member = useDashboardMember()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setAssets(await listAssets())
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "We could not load assets. Please refresh and try again."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    listAssets()
      .then((nextAssets) => {
        if (active) setAssets(nextAssets)
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "We could not load assets. Please refresh and try again."
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

  const isSteward = member.can_manage_members

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6 lg:p-8">
      <section className="rounded-xl border bg-card shadow-xs" aria-labelledby="assets-heading">
        <div className="flex flex-col gap-5 border-b p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <LandmarkIcon aria-hidden="true" className="size-4" />
                </span>
                <Badge variant="outline" className="text-primary">
                  Asset register
                </Badge>
              </div>
              <h1 id="assets-heading" className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                Collective assets
              </h1>
              <p className="mt-2 leading-6 text-muted-foreground">
                Assets are covered by member contribution commitments. Your
                available balance cannot be reserved more than once.
              </p>
            </div>
            {isSteward ? <AssetCommitmentDrawer onSaved={refresh} /> : null}
          </div>

          <p className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm leading-5 text-muted-foreground">
            <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            {isSteward
              ? "Stewards record commitments. Fully covered assets reserve each participating member’s balance."
              : "Stewards record commitments. You can see collective progress and only your own participation."}
          </p>
        </div>

        {error ? (
          <div className="m-5 flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-3 text-sm leading-6 text-destructive" role="alert">
            <CircleAlertIcon aria-hidden="true" className="mt-1 size-4 shrink-0" />
            <div>
              <p>{error}</p>
              <Button variant="link" className="mt-1 h-auto p-0 text-destructive" onClick={() => void refresh()}>
                Try again
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-16 animate-pulse rounded-md bg-muted/60" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-6 text-center">
            <div>
              <LandmarkIcon aria-hidden="true" className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 font-medium">No assets recorded</p>
              <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
                {isSteward
                  ? "Create an asset when member contributions are ready to be committed."
                  : "Assets shared with the collective will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Asset</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Your commitment</TableHead>
                    <TableHead className="pr-6 text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="pl-6">
                        <Link href={`/dashboard/assets/${asset.id}`} className="font-medium hover:underline">
                          {asset.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">Created {formatDate(asset.created_at)}</p>
                      </TableCell>
                      <TableCell><AssetStatusBadge status={asset.status} /></TableCell>
                      <TableCell className="font-mono font-medium tabular-nums">{formatRwf(asset.total_cost)}</TableCell>
                      <TableCell><Coverage asset={asset} /></TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {asset.your_commitment ? formatRwf(asset.your_commitment.amount) : "—"}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button size="sm" variant="ghost" render={<Link href={`/dashboard/assets/${asset.id}`} />}>
                          View <ArrowUpRightIcon aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid divide-y md:hidden">
              {assets.map((asset) => (
                <Link key={asset.id} href={`/dashboard/assets/${asset.id}`} className="grid gap-4 p-5 transition-colors hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{asset.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Created {formatDate(asset.created_at)}</p>
                    </div>
                    <AssetStatusBadge status={asset.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-muted-foreground">Total cost</p><p className="mt-1 font-mono text-sm font-medium tabular-nums">{formatRwf(asset.total_cost)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Your commitment</p><p className="mt-1 font-mono text-sm font-medium tabular-nums">{asset.your_commitment ? formatRwf(asset.your_commitment.amount) : "—"}</p></div>
                  </div>
                  <Coverage asset={asset} />
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
