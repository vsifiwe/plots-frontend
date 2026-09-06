"use client"

import * as React from "react"
import {
  ArrowDownUpIcon,
  CheckIcon,
  ChevronDownIcon,
  SlidersHorizontalIcon,
} from "lucide-react"

import {
  formatRwf,
  type Proposal,
  type ProposalStatus,
} from "@/app/dashboard/demo-data"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"

type SortKey = "title" | "requestedAmount" | "reviewDate"
type VisibleColumn = "category" | "sponsor" | "reviewDate"

const statuses: ProposalStatus[] = ["In review", "Ready to decide", "Listening"]

const statusClassNames: Record<ProposalStatus, string> = {
  "In review":
    "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  "Ready to decide": "border-primary/25 bg-primary/10 text-primary",
  Listening: "border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-300",
}

function ProposalDetails({ proposal }: { proposal: Proposal }) {
  const isMobile = useIsMobile()

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger render={<Button variant="outline" size="sm" />}>
        View
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={statusClassNames[proposal.status]}
            >
              {proposal.status}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              Demo proposal
            </span>
          </div>
          <DrawerTitle className="text-xl tracking-[-0.03em]">
            {proposal.title}
          </DrawerTitle>
          <DrawerDescription>{proposal.summary}</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-4 px-4 pb-3 text-sm">
          <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Requested
              </p>
              <p className="mt-1 font-mono font-medium tabular-nums">
                {formatRwf(proposal.requestedAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Review date
              </p>
              <p className="mt-1 font-medium">{proposal.reviewDate}</p>
            </div>
          </div>
          <Separator />
          <p className="leading-6 text-muted-foreground">
            This is illustrative dashboard content only. It does not record a
            real proposal, commitment, or investment decision.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <Badge variant="outline" className={statusClassNames[status]}>
      {status}
    </Badge>
  )
}

export function DataTable({ data }: { data: Proposal[] }) {
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<
    ProposalStatus | "All"
  >("All")
  const [sort, setSort] = React.useState<{
    key: SortKey
    direction: "asc" | "desc"
  }>({
    key: "reviewDate",
    direction: "asc",
  })
  const [selected, setSelected] = React.useState<number[]>([])
  const [visibleColumns, setVisibleColumns] = React.useState<
    Record<VisibleColumn, boolean>
  >({
    category: true,
    sponsor: true,
    reviewDate: true,
  })

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const rows = data.filter((proposal) => {
      const matchesSearch =
        !normalizedQuery ||
        [proposal.title, proposal.category, proposal.sponsor]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      const matchesStatus =
        statusFilter === "All" || proposal.status === statusFilter
      return matchesSearch && matchesStatus
    })

    return [...rows].sort((first, second) => {
      const firstValue = first[sort.key]
      const secondValue = second[sort.key]
      const comparison =
        typeof firstValue === "number" && typeof secondValue === "number"
          ? firstValue - secondValue
          : String(firstValue).localeCompare(String(secondValue))
      return sort.direction === "asc" ? comparison : -comparison
    })
  }, [data, query, sort, statusFilter])

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((proposal) => selected.includes(proposal.id))

  function changeSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    )
  }

  function toggleSelected(id: number) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  function toggleAllVisible() {
    setSelected((current) => {
      const visibleIds = filteredRows.map((proposal) => proposal.id)
      return allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    })
  }

  return (
    <section className="px-4 pb-4 lg:px-6" aria-labelledby="proposal-heading">
      <div className="rounded-xl border bg-card shadow-xs">
        <div className="flex flex-col gap-4 border-b p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="proposal-heading"
                  className="text-lg font-semibold tracking-[-0.03em]"
                >
                  Investment proposals
                </h2>
                <Badge variant="outline" className="text-primary">
                  Demo data
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Example discussion items for the collective&apos;s annual
                decision cycle.
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Changes reset when you leave this page.
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Label htmlFor="proposal-search" className="sr-only">
                Search proposals
              </Label>
              <Input
                id="proposal-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search proposals, categories, or sponsors"
                className="h-10"
              />
            </div>
            <label className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium">
              <SlidersHorizontalIcon
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <span className="sr-only">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as ProposalStatus | "All")
                }
                className="min-w-32 bg-transparent text-sm outline-none"
              >
                <option value="All">All statuses</option>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <details className="relative">
              <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium marker:hidden hover:bg-muted">
                Columns{" "}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              </summary>
              <div className="bg-popover absolute right-0 z-20 mt-2 w-48 rounded-lg border p-2 shadow-lg">
                {(Object.keys(visibleColumns) as VisibleColumn[]).map(
                  (column) => (
                    <label
                      key={column}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[column]}
                        onChange={() =>
                          setVisibleColumns((current) => ({
                            ...current,
                            [column]: !current[column],
                          }))
                        }
                        className="size-4 accent-primary"
                      />
                      {column === "reviewDate"
                        ? "Review date"
                        : column[0].toUpperCase() + column.slice(1)}
                    </label>
                  )
                )}
              </div>
            </details>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    aria-label="Select all visible proposals"
                    className="size-4 accent-primary"
                  />
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => changeSort("title")}
                    className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                  >
                    Proposal{" "}
                    <ArrowDownUpIcon aria-hidden="true" className="size-3.5" />
                  </button>
                </TableHead>
                {visibleColumns.category && <TableHead>Category</TableHead>}
                <TableHead>
                  <button
                    type="button"
                    onClick={() => changeSort("requestedAmount")}
                    className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                  >
                    Requested{" "}
                    <ArrowDownUpIcon aria-hidden="true" className="size-3.5" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                {visibleColumns.sponsor && <TableHead>Sponsor</TableHead>}
                {visibleColumns.reviewDate && (
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => changeSort("reviewDate")}
                      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      Review date{" "}
                      <ArrowDownUpIcon
                        aria-hidden="true"
                        className="size-3.5"
                      />
                    </button>
                  </TableHead>
                )}
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((proposal) => (
                <TableRow
                  key={proposal.id}
                  data-state={
                    selected.includes(proposal.id) ? "selected" : undefined
                  }
                >
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(proposal.id)}
                      onChange={() => toggleSelected(proposal.id)}
                      aria-label={`Select ${proposal.title}`}
                      className="size-4 accent-primary"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {proposal.title}
                  </TableCell>
                  {visibleColumns.category && (
                    <TableCell>{proposal.category}</TableCell>
                  )}
                  <TableCell className="font-mono text-sm tabular-nums">
                    {formatRwf(proposal.requestedAmount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={proposal.status} />
                  </TableCell>
                  {visibleColumns.sponsor && (
                    <TableCell>{proposal.sponsor}</TableCell>
                  )}
                  {visibleColumns.reviewDate && (
                    <TableCell>{proposal.reviewDate}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <ProposalDetails proposal={proposal} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {filteredRows.map((proposal) => (
            <article
              key={proposal.id}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold tracking-[-0.02em]">
                    {proposal.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {proposal.category} · {proposal.reviewDate}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selected.includes(proposal.id)}
                  onChange={() => toggleSelected(proposal.id)}
                  aria-label={`Select ${proposal.title}`}
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={proposal.status} />
                  <span className="font-mono text-sm tabular-nums">
                    {formatRwf(proposal.requestedAmount)}
                  </span>
                </div>
                <ProposalDetails proposal={proposal} />
              </div>
            </article>
          ))}
        </div>

        {filteredRows.length === 0 && (
          <div className="grid min-h-40 place-items-center p-6 text-center text-sm text-muted-foreground">
            No demo proposals match those filters.
          </div>
        )}
        <div className="flex items-center gap-2 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <CheckIcon aria-hidden="true" className="size-3.5 text-primary" />
          {selected.length} selected · local demo interactions only
        </div>
      </div>
    </section>
  )
}
