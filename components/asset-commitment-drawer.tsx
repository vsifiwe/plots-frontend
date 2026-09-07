"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  LandmarkIcon,
  LoaderCircleIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

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
import { toast } from "@/components/ui/toast"
import {
  ApiError,
  createAsset,
  listAssetAvailableBalances,
  updateAsset,
  type Asset,
  type MemberAvailableBalance,
  type NewAsset,
} from "@/lib/auth"

type CommitmentRow = {
  key: string
  member: string
  amount: string
}

type AssetForm = {
  title: string
  description: string
  total_cost: string
  commitments: CommitmentRow[]
}

function rowKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function emptyForm(): AssetForm {
  return {
    title: "",
    description: "",
    total_cost: "",
    commitments: [{ key: rowKey(), member: "", amount: "" }],
  }
}

function formFromAsset(asset: Asset): AssetForm {
  return {
    title: asset.title,
    description: asset.description,
    total_cost: String(asset.total_cost),
    commitments:
      asset.commitments?.map((commitment) => ({
        key: String(commitment.id),
        member: String(commitment.member.id),
        amount: String(commitment.amount),
      })) ?? [],
  }
}

function formatRwf(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function AssetCommitmentDrawer({
  asset,
  onSaved,
  trigger,
}: {
  asset?: Asset
  onSaved: (asset: Asset) => void | Promise<void>
  trigger?: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<AssetForm>(emptyForm)
  const [balances, setBalances] = useState<MemberAvailableBalance[]>([])
  const [isLoadingBalances, setLoadingBalances] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return

    setForm(asset ? formFromAsset(asset) : emptyForm())
    setErrors({})
    setLoadingBalances(true)
    listAssetAvailableBalances()
      .then(setBalances)
      .catch((error) => {
        setErrors({
          non_field_errors:
            error instanceof ApiError
              ? error.message
              : "We could not load member balances. Please try again.",
        })
      })
      .finally(() => setLoadingBalances(false))
  }, [asset, open])

  const balanceByMember = useMemo(
    () => new Map(balances.map((member) => [member.id, member])),
    [balances]
  )
  const committedTotal = form.commitments.reduce(
    (total, commitment) => total + (Number(commitment.amount) || 0),
    0
  )
  const totalCost = Number(form.total_cost) || 0

  function updateForm<Key extends keyof Omit<AssetForm, "commitments">>(
    key: Key,
    value: AssetForm[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const { [key]: removed, non_field_errors, ...remaining } = current
      void removed
      void non_field_errors
      return remaining
    })
  }

  function updateCommitment(
    key: string,
    field: "member" | "amount",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      commitments: current.commitments.map((commitment) =>
        commitment.key === key ? { ...commitment, [field]: value } : commitment
      ),
    }))
    setErrors({})
  }

  function removeCommitment(key: string) {
    setForm((current) => ({
      ...current,
      commitments: current.commitments.filter((commitment) => commitment.key !== key),
    }))
    setErrors({})
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = "Enter an asset title."
    if (!/^\d+$/.test(form.total_cost) || totalCost < 1) {
      nextErrors.total_cost = "Enter a positive whole amount in RWF."
    }
    if (form.commitments.length === 0) {
      nextErrors.commitments = "Add at least one member commitment."
    }

    const memberIds = form.commitments.map((commitment) => commitment.member)
    if (memberIds.some((member) => !member)) {
      nextErrors.commitments = "Choose a member for each commitment."
    } else if (new Set(memberIds).size !== memberIds.length) {
      nextErrors.commitments = "Each member can appear only once."
    }
    if (
      form.commitments.some(
        (commitment) =>
          !/^\d+$/.test(commitment.amount) || Number(commitment.amount) < 1
      )
    ) {
      nextErrors.commitments = "Every commitment must be a positive whole RWF amount."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    const payload: NewAsset = {
      title: form.title.trim(),
      description: form.description.trim(),
      total_cost: totalCost,
      commitments: form.commitments.map((commitment) => ({
        member: Number(commitment.member),
        amount: Number(commitment.amount),
      })),
    }

    setSubmitting(true)
    try {
      const saved = asset
        ? await updateAsset(asset.id, payload)
        : await createAsset(payload)
      await onSaved(saved)
      toast.add(
        saved.status === "draft"
          ? {
              type: "warning",
              title: "Asset saved as a draft",
              description:
                "Correct the balance or cost coverage issues before opening it.",
            }
          : {
              type: "success",
              title: asset ? "Draft updated" : "Asset opened",
              description: `${saved.title} is covered by the recorded member commitments.`,
            }
      )
      setOpen(false)
    } catch (error) {
      setErrors(
        error instanceof ApiError && Object.keys(error.fieldErrors).length > 0
          ? error.fieldErrors
          : {
              non_field_errors:
                error instanceof ApiError
                  ? error.message
                  : "We could not save this asset. Please try again.",
            }
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger
        render={
          trigger ?? (
            <Button size="lg">
              <PlusIcon aria-hidden="true" />
              Create asset
            </Button>
          )
        }
      />
      <DrawerContent className="sm:[--drawer-content-width:75vw] xl:[--drawer-content-width:56rem] sm:max-w-none">
        <DrawerHeader className="gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LandmarkIcon aria-hidden="true" className="size-4" />
          </div>
          <DrawerTitle className="text-xl tracking-[-0.03em]">
            {asset ? "Edit asset draft" : "Create an asset"}
          </DrawerTitle>
          <DrawerDescription>
            Record each participating member’s commitment. Available balances
            are calculated from received contributions less other active asset
            commitments.
          </DrawerDescription>
        </DrawerHeader>

        <form
          className="min-h-0 overflow-y-auto px-4 pb-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-title">Asset name</Label>
              <Input
                id="asset-title"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title ? (
                <p className="text-sm text-destructive">{errors.title}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asset-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <textarea
                id="asset-description"
                rows={3}
                maxLength={2000}
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                className="flex w-full resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="A concise description for the collective"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asset-total-cost">Total cost (RWF)</Label>
              <Input
                id="asset-total-cost"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={form.total_cost}
                onChange={(event) => updateForm("total_cost", event.target.value)}
                aria-invalid={Boolean(errors.total_cost)}
              />
              {errors.total_cost ? (
                <p className="text-sm text-destructive">{errors.total_cost}</p>
              ) : null}
            </div>

            <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">Member commitments</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    An asset opens only when commitments exactly match its cost
                    and every member has sufficient available balance.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      commitments: [
                        ...current.commitments,
                        { key: rowKey(), member: "", amount: "" },
                      ],
                    }))
                  }
                >
                  <PlusIcon aria-hidden="true" />
                  Add
                </Button>
              </div>

              <div className="mt-4 grid gap-3">
                {form.commitments.map((commitment, index) => {
                  const selectedMembers = form.commitments
                    .filter((item) => item.key !== commitment.key)
                    .map((item) => item.member)
                  const memberBalance = commitment.member
                    ? balanceByMember.get(Number(commitment.member))
                    : undefined
                  const amount = Number(commitment.amount) || 0
                  const isShort = Boolean(
                    memberBalance && amount > memberBalance.available_balance
                  )

                  return (
                    <div
                      key={commitment.key}
                      className="grid gap-3 rounded-md border bg-card p-3"
                    >
                      <div className="grid gap-2">
                        <Label htmlFor={`asset-member-${commitment.key}`}>
                          Member {index + 1}
                        </Label>
                        <Select
                          value={commitment.member || null}
                          onValueChange={(value) =>
                            updateCommitment(
                              commitment.key,
                              "member",
                              String(value ?? "")
                            )
                          }
                          disabled={isLoadingBalances}
                        >
                          <SelectTrigger
                            id={`asset-member-${commitment.key}`}
                            className="w-full"
                          >
                            <SelectValue
                              placeholder={
                                isLoadingBalances
                                  ? "Loading members…"
                                  : "Select member"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {balances
                              .filter(
                                (member) =>
                                  String(member.id) === commitment.member ||
                                  !selectedMembers.includes(String(member.id))
                              )
                              .map((member) => (
                                <SelectItem key={member.id} value={String(member.id)}>
                                  {member.full_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {memberBalance ? (
                          <p
                            className={
                              isShort
                                ? "text-xs text-destructive"
                                : "text-xs text-muted-foreground"
                            }
                          >
                            Available: {formatRwf(memberBalance.available_balance)}
                          </p>
                        ) : null}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`asset-amount-${commitment.key}`}>
                          Commitment (RWF)
                        </Label>
                        <Input
                          id={`asset-amount-${commitment.key}`}
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          value={commitment.amount}
                          onChange={(event) =>
                            updateCommitment(
                              commitment.key,
                              "amount",
                              event.target.value
                            )
                          }
                          aria-invalid={isShort}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="justify-self-end"
                        disabled={form.commitments.length === 1}
                        onClick={() => removeCommitment(commitment.key)}
                        aria-label={`Remove member ${index + 1}`}
                      >
                        <Trash2Icon aria-hidden="true" />
                      </Button>
                    </div>
                  )
                })}
              </div>
              {errors.commitments ? (
                <p className="mt-3 text-sm text-destructive">{errors.commitments}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                <span className="text-muted-foreground">Committed total</span>
                <span
                  className={
                    totalCost > 0 && committedTotal !== totalCost
                      ? "font-mono font-medium text-destructive tabular-nums"
                      : "font-mono font-medium tabular-nums"
                  }
                >
                  {formatRwf(committedTotal)} / {totalCost ? formatRwf(totalCost) : "—"}
                </span>
              </div>
            </div>

            {errors.non_field_errors ? (
              <p role="alert" className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {errors.non_field_errors}
              </p>
            ) : null}
          </div>

          <DrawerFooter className="px-0 pt-6">
            <Button type="submit" size="lg" disabled={isSubmitting || isLoadingBalances}>
              {isSubmitting ? (
                <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
              ) : (
                <LandmarkIcon aria-hidden="true" />
              )}
              {isSubmitting
                ? "Saving…"
                : asset
                  ? "Save draft"
                  : "Create asset"}
            </Button>
            <DrawerClose render={<Button type="button" variant="outline" size="lg" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
