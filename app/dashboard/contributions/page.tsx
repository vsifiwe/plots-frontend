"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import {
  BanIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  HandCoinsIcon,
  LoaderCircleIcon,
  PlusIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
} from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  ApiError,
  createContribution,
  listContributions,
  listMembers,
  voidContribution,
  type Contribution,
  type DirectoryMember,
  type NewContribution,
  type PaginatedContributions,
} from "@/lib/auth"

const pageSize = 20

type ContributionForm = {
  member: string
  amount: string
  received_on: string
  note: string
}

function todayValue() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function emptyContributionForm(): ContributionForm {
  return { member: "", amount: "", received_on: todayValue(), note: "" }
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
  }).format(new Date(`${value}T12:00:00`))
}

function StatusBadge({ contribution }: { contribution: Contribution }) {
  const isVoided = contribution.status === "voided"

  return (
    <Badge
      variant="outline"
      className={
        isVoided
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-primary/25 bg-primary/10 text-primary"
      }
    >
      {isVoided ? (
        <BanIcon aria-hidden="true" />
      ) : (
        <HandCoinsIcon aria-hidden="true" />
      )}
      {isVoided ? "Voided" : "Recorded"}
    </Badge>
  )
}

function RNITStatusBadge({ contribution }: { contribution: Contribution }) {
  const labels = {
    pending_cash: "Pending RNIT purchase",
    invested: "Invested in RNIT",
    purchase_reversed: "Purchase reversed",
  } as const
  const isInvested = contribution.rnit_status === "invested"

  return <Badge variant="outline" className={isInvested ? "border-primary/25 bg-primary/10 text-primary" : "border-muted-foreground/20 bg-muted text-muted-foreground"}>{labels[contribution.rnit_status]}</Badge>
}

function RecordContributionDrawer({
  members,
  isLoadingMembers,
  onRecorded,
}: {
  members: DirectoryMember[]
  isLoadingMembers: boolean
  onRecorded: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ContributionForm>(emptyContributionForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setSubmitting] = useState(false)

  const activeMembers = useMemo(
    () => members.filter((member) => member.is_active),
    [members]
  )

  function resetForm() {
    setForm(emptyContributionForm())
    setFieldErrors({})
  }

  function updateField<Key extends keyof ContributionForm>(
    field: Key,
    value: ContributionForm[Key]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => {
      const { [field]: removed, non_field_errors, ...remaining } = current
      void removed
      void non_field_errors
      return remaining
    })
  }

  function validate() {
    const errors: Record<string, string> = {}
    const amount = Number(form.amount)

    if (!form.member) {
      errors.member = "Choose the member who made this contribution."
    }
    if (
      !/^\d+$/.test(form.amount) ||
      !Number.isSafeInteger(amount) ||
      amount < 1
    ) {
      errors.amount = "Enter a positive whole amount in RWF."
    }
    if (!form.received_on) {
      errors.received_on = "Enter the date this contribution was received."
    } else if (form.received_on > todayValue()) {
      errors.received_on = "The received date cannot be in the future."
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const contribution: NewContribution = {
        member: Number(form.member),
        amount: Number(form.amount),
        received_on: form.received_on,
        note: form.note.trim(),
      }
      const recorded = await createContribution(contribution)
      await onRecorded()
      toast.add({
        type: "success",
        title: "Contribution recorded",
        description: `${formatRwf(recorded.amount)} has been added to the ledger.`,
      })
      resetForm()
      setOpen(false)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setFieldErrors(
          Object.keys(caughtError.fieldErrors).length > 0
            ? caughtError.fieldErrors
            : { non_field_errors: caughtError.message }
        )
      } else {
        setFieldErrors({
          non_field_errors:
            "We could not record this contribution. Please try again.",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) resetForm()
      }}
      swipeDirection="right"
    >
      <DrawerTrigger render={<Button size="lg" disabled={isLoadingMembers} />}>
        {isLoadingMembers ? (
          <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
        ) : (
          <PlusIcon aria-hidden="true" />
        )}
        Record contribution
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HandCoinsIcon aria-hidden="true" className="size-4" />
          </div>
          <DrawerTitle className="text-xl tracking-[-0.03em]">
            Record a contribution
          </DrawerTitle>
          <DrawerDescription>
            Add a received payment to the collective’s contribution ledger. This
            record can later be voided, not edited or removed.
          </DrawerDescription>
        </DrawerHeader>

        <form
          className="min-h-0 overflow-y-auto px-4 pb-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contribution-member">Member</Label>
              <Select
                value={form.member || null}
                onValueChange={(value) =>
                  updateField("member", String(value ?? ""))
                }
                disabled={activeMembers.length === 0}
              >
                <SelectTrigger
                  id="contribution-member"
                  className="w-full"
                  aria-invalid={Boolean(fieldErrors.member)}
                  aria-describedby={
                    fieldErrors.member ? "contribution-member-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {activeMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.member ? (
                <p
                  id="contribution-member-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.member}
                </p>
              ) : null}
              {activeMembers.length === 0 && !isLoadingMembers ? (
                <p className="text-sm text-muted-foreground">
                  There are no active members available to select.
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contribution-amount">Amount received (RWF)</Label>
              <Input
                id="contribution-amount"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="25000"
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                aria-invalid={Boolean(fieldErrors.amount)}
                aria-describedby={
                  fieldErrors.amount
                    ? "contribution-amount-error"
                    : "contribution-amount-help"
                }
              />
              <p
                id="contribution-amount-help"
                className="text-xs leading-5 text-muted-foreground"
              >
                Enter a positive whole amount in Rwandan francs.
              </p>
              {fieldErrors.amount ? (
                <p
                  id="contribution-amount-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.amount}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contribution-received-on">Received date</Label>
              <Input
                id="contribution-received-on"
                type="date"
                max={todayValue()}
                value={form.received_on}
                onChange={(event) =>
                  updateField("received_on", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.received_on)}
                aria-describedby={
                  fieldErrors.received_on
                    ? "contribution-received-on-error"
                    : undefined
                }
              />
              {fieldErrors.received_on ? (
                <p
                  id="contribution-received-on-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.received_on}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contribution-note">
                Internal reference{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <textarea
                id="contribution-note"
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
                maxLength={500}
                rows={3}
                className="flex w-full resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="Optional receipt or collection reference"
              />
            </div>

            {fieldErrors.non_field_errors ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm leading-5 text-destructive"
              >
                {fieldErrors.non_field_errors}
              </p>
            ) : null}
          </div>

          <DrawerFooter className="px-0 pt-6">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || activeMembers.length === 0}
            >
              {isSubmitting ? (
                <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
              ) : (
                <HandCoinsIcon aria-hidden="true" />
              )}
              {isSubmitting ? "Recording..." : "Record contribution"}
            </Button>
            <DrawerClose
              render={<Button type="button" variant="outline" size="lg" />}
            >
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

function VoidContributionDrawer({
  contribution,
  onClose,
  onVoided,
}: {
  contribution: Contribution | null
  onClose: () => void
  onVoided: () => Promise<void>
}) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)

  function close() {
    setReason("")
    setError("")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contribution) return

    if (!reason.trim()) {
      setError("Enter a reason for voiding this entry.")
      return
    }

    setSubmitting(true)
    try {
      await voidContribution(contribution.id, reason.trim())
      await onVoided()
      toast.add({
        type: "success",
        title: "Contribution voided",
        description: `${formatRwf(contribution.amount)} remains in the ledger with its void status.`,
      })
      close()
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "We could not void this contribution. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={Boolean(contribution)}
      onOpenChange={(open) => {
        if (!open) {
          close()
          onClose()
        }
      }}
      swipeDirection="right"
    >
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <BanIcon aria-hidden="true" className="size-4" />
          </div>
          <DrawerTitle className="text-xl tracking-[-0.03em]">
            Void contribution
          </DrawerTitle>
          <DrawerDescription>
            This preserves the original record and marks it void. It cannot be
            undone.
          </DrawerDescription>
        </DrawerHeader>
        <form className="grid gap-4 p-4" onSubmit={handleSubmit} noValidate>
          <p className="rounded-lg border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            {contribution ? formatRwf(contribution.amount) : null}
            {contribution?.member
              ? ` from ${contribution.member.full_name}`
              : null}
          </p>
          <div className="grid gap-2">
            <Label htmlFor="contribution-void-reason">Reason</Label>
            <textarea
              id="contribution-void-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                setError("")
              }}
              maxLength={500}
              rows={3}
              className="flex w-full resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="Why should this entry be voided?"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? "contribution-void-reason-error" : undefined
              }
            />
            {error ? (
              <p
                id="contribution-void-reason-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
          </div>
          <DrawerFooter className="px-0 pt-2">
            <Button
              type="submit"
              variant="destructive"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
              ) : (
                <BanIcon aria-hidden="true" />
              )}
              {isSubmitting ? "Voiding..." : "Void contribution"}
            </Button>
            <DrawerClose
              render={<Button type="button" variant="outline" size="lg" />}
            >
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default function ContributionsPage() {
  const currentMember = useDashboardMember()
  const [ledger, setLedger] = useState<PaginatedContributions | null>(null)
  const [members, setMembers] = useState<DirectoryMember[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setLoading] = useState(true)
  const [isLoadingMembers, setLoadingMembers] = useState(
    currentMember.can_manage_members
  )
  const [loadError, setLoadError] = useState("")
  const [voidingContribution, setVoidingContribution] =
    useState<Contribution | null>(null)

  const refreshLedger = useCallback(async (requestedPage: number) => {
    setLoading(true)
    setLoadError("")
    try {
      const response = await listContributions(requestedPage)
      setLedger(response)
    } catch (caughtError) {
      setLoadError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "We could not load contribution records. Please refresh and try again."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    listContributions(page)
      .then((response) => {
        if (active) setLedger(response)
      })
      .catch((caughtError) => {
        if (active) {
          setLoadError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "We could not load contribution records. Please refresh and try again."
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page])

  useEffect(() => {
    if (!currentMember.can_manage_members) return

    let active = true
    listMembers()
      .then((directory) => {
        if (active) setMembers(directory)
      })
      .catch(() => {
        if (active) {
          toast.add({
            type: "error",
            title: "Members unavailable",
            description: "Refresh the page before recording a contribution.",
          })
        }
      })
      .finally(() => {
        if (active) setLoadingMembers(false)
      })

    return () => {
      active = false
    }
  }, [currentMember.can_manage_members])

  async function refreshFirstPage() {
    if (page !== 1) {
      setLoading(true)
      setLoadError("")
      setPage(1)
      return
    }
    await refreshLedger(1)
  }

  async function refreshCurrentPage() {
    await refreshLedger(page)
  }

  function goToPage(nextPage: number) {
    setLoading(true)
    setLoadError("")
    setPage(nextPage)
  }

  function closeVoidDrawer() {
    setVoidingContribution(null)
  }

  const contributions = ledger?.results ?? []
  const totalPages = Math.max(1, Math.ceil((ledger?.count ?? 0) / pageSize))
  const isSteward = currentMember.can_manage_members

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6 lg:p-8">
      <section
        className="rounded-xl border bg-card shadow-xs"
        aria-labelledby="contributions-heading"
      >
        <div className="flex flex-col gap-5 border-b p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ReceiptTextIcon aria-hidden="true" className="size-4" />
                </span>
                <Badge variant="outline" className="text-primary">
                  Contribution ledger
                </Badge>
              </div>
              <h1
                id="contributions-heading"
                className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              >
                {isSteward ? "Collective contributions" : "Your contributions"}
              </h1>
              <p className="mt-2 leading-6 text-muted-foreground">
                {isSteward
                  ? "Record received contributions and preserve a clear, voidable history for the collective."
                  : "A private history of contributions recorded in your name."}
              </p>
            </div>
            {isSteward ? (
              <RecordContributionDrawer
                members={members}
                isLoadingMembers={isLoadingMembers}
                onRecorded={refreshFirstPage}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading contributions..."
                : `${ledger?.count ?? 0} ${(ledger?.count ?? 0) === 1 ? "record" : "records"}`}
            </p>
            {isSteward ? (
              <p className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm leading-5 text-muted-foreground">
                <ShieldCheckIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                Only stewards can record or void entries. Notes and void reasons
                stay internal.
              </p>
            ) : (
              <p className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm leading-5 text-muted-foreground">
                <ShieldCheckIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                Stewards record contributions. You can view only entries
                credited to you.
              </p>
            )}
          </div>
        </div>

        {loadError ? (
          <p
            role="alert"
            className="m-5 flex gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-3 text-sm leading-6 text-destructive"
          >
            <CircleAlertIcon
              aria-hidden="true"
              className="mt-1 size-4 shrink-0"
            />
            {loadError}
          </p>
        ) : isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="h-12 animate-pulse rounded-md bg-muted/60"
              />
            ))}
          </div>
        ) : contributions.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-6 text-center">
            <div>
              <CalendarDaysIcon
                aria-hidden="true"
                className="mx-auto size-5 text-muted-foreground"
              />
              <p className="mt-3 font-medium">No contributions recorded</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSteward
                  ? "Record the first received contribution when you are ready."
                  : "Entries credited to you will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Received</TableHead>
                    {isSteward ? <TableHead>Member</TableHead> : null}
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>RNIT</TableHead>
                    {isSteward ? (
                      <TableHead>Internal reference</TableHead>
                    ) : null}
                    {isSteward ? (
                      <TableHead className="pr-6 text-right">Action</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution) => (
                    <TableRow
                      key={contribution.id}
                      className={
                        contribution.status === "voided"
                          ? "bg-muted/25"
                          : undefined
                      }
                    >
                      <TableCell className="pl-6 text-muted-foreground">
                        {formatDate(contribution.received_on)}
                      </TableCell>
                      {isSteward ? (
                        <TableCell className="font-medium">
                          {contribution.member?.full_name ?? "—"}
                        </TableCell>
                      ) : null}
                      <TableCell
                        className={
                          contribution.status === "voided"
                            ? "font-mono text-muted-foreground tabular-nums line-through"
                            : "font-mono font-medium tabular-nums"
                        }
                      >
                        {formatRwf(contribution.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge contribution={contribution} />
                      </TableCell>
                      <TableCell><RNITStatusBadge contribution={contribution} /></TableCell>
                      {isSteward ? (
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {contribution.note || "—"}
                        </TableCell>
                      ) : null}
                      {isSteward ? (
                        <TableCell className="pr-6 text-right">
                          {contribution.status === "recorded" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setVoidingContribution(contribution)
                              }
                            >
                              Void
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Preserved
                            </span>
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid divide-y md:hidden">
              {contributions.map((contribution) => (
                <article
                  key={contribution.id}
                  className={
                    contribution.status === "voided"
                      ? "grid gap-3 bg-muted/25 p-5"
                      : "grid gap-3 p-5"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(contribution.received_on)}
                      </p>
                      {isSteward ? (
                        <p className="mt-1 font-medium">
                          {contribution.member?.full_name ?? "—"}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge contribution={contribution} />
                  </div>
                  <p
                    className={
                      contribution.status === "voided"
                        ? "font-mono text-lg font-medium text-muted-foreground tabular-nums line-through"
                        : "font-mono text-lg font-semibold tabular-nums"
                    }
                  >
                    {formatRwf(contribution.amount)}
                  </p>
                  <div><RNITStatusBadge contribution={contribution} /></div>
                  {isSteward && contribution.note ? (
                    <p className="text-sm leading-5 text-muted-foreground">
                      {contribution.note}
                    </p>
                  ) : null}
                  {isSteward && contribution.status === "recorded" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => setVoidingContribution(contribution)}
                    >
                      <BanIcon aria-hidden="true" />
                      Void entry
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        )}

        {!loadError && !isLoading && ledger && ledger.count > 0 ? (
          <div className="flex items-center justify-between gap-3 border-t p-4 sm:px-6">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!ledger.previous}
                onClick={() => goToPage(Math.max(1, page - 1))}
              >
                <ChevronLeftIcon aria-hidden="true" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!ledger.next}
                onClick={() => goToPage(page + 1)}
              >
                Next
                <ChevronRightIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <VoidContributionDrawer
        contribution={voidingContribution}
        onClose={closeVoidDrawer}
        onVoided={async () => {
          await refreshCurrentPage()
          closeVoidDrawer()
        }}
      />
    </div>
  )
}
