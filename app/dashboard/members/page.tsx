"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserRoundPlusIcon,
  UsersRoundIcon,
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
import { toast } from "@/components/ui/toast"
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
  createMember,
  listMembers,
  type DirectoryMember,
  type NewMember,
} from "@/lib/auth"

type MemberForm = NewMember & { email: string; phone: string }

const emptyMemberForm: MemberForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
}

const roleLabels: Record<DirectoryMember["role"], string> = {
  member: "Member",
  steward: "Steward",
}

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en-RW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function RoleBadge({ role }: { role: DirectoryMember["role"] }) {
  return (
    <Badge
      variant="outline"
      className={
        role === "steward"
          ? "border-primary/25 bg-primary/10 text-primary"
          : "bg-muted/45 text-muted-foreground"
      }
    >
      {role === "steward" ? <ShieldCheckIcon aria-hidden="true" /> : null}
      {roleLabels[role]}
    </Badge>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-muted-foreground/20 bg-muted text-muted-foreground"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

function MemberCreationDrawer({
  onCreated,
}: {
  onCreated: (member: DirectoryMember) => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<MemberForm>(emptyMemberForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const [isConfirmationVisible, setConfirmationVisible] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)

  function updateField<Key extends keyof MemberForm>(
    field: Key,
    value: MemberForm[Key]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => {
      const { [field]: removed, non_field_errors, ...remaining } = current
      void removed
      void non_field_errors
      return remaining
    })
  }

  function resetForm() {
    setForm(emptyMemberForm)
    setFieldErrors({})
    setPasswordVisible(false)
    setConfirmationVisible(false)
  }

  function validate() {
    const errors: Record<string, string> = {}

    if (!form.full_name.trim()) {
      errors.full_name = "Enter the member's full name."
    }
    if (!form.email.trim() && !form.phone.trim()) {
      errors.non_field_errors = "Enter an email address or mobile number."
    }
    if (
      form.phone.trim() &&
      !/^(078|079|072|073)\d{7}$/.test(form.phone.trim())
    ) {
      errors.phone =
        "Use a 10-digit mobile number beginning with 078, 079, 072, or 073."
    }
    if (!form.password) {
      errors.password = "Enter an initial password."
    }
    if (form.password !== form.password_confirmation) {
      errors.password_confirmation = "Passwords do not match."
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const member = await createMember({
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      })
      onCreated(member)
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
            "We could not create this member. Please try again.",
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
      <DrawerTrigger render={<Button size="lg" />}>
        <PlusIcon aria-hidden="true" />
        Add member
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRoundPlusIcon aria-hidden="true" className="size-4" />
          </div>
          <DrawerTitle className="text-xl tracking-[-0.03em]">
            Add a member
          </DrawerTitle>
          <DrawerDescription>
            Give a current collective member private sign-in access. New
            accounts begin with the member role.
          </DrawerDescription>
        </DrawerHeader>

        <form
          className="min-h-0 overflow-y-auto px-4 pb-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="member-full-name">Full name</Label>
              <Input
                id="member-full-name"
                value={form.full_name}
                onChange={(event) =>
                  updateField("full_name", event.target.value)
                }
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.full_name)}
                aria-describedby={
                  fieldErrors.full_name ? "member-full-name-error" : undefined
                }
              />
              {fieldErrors.full_name ? (
                <p
                  id="member-full-name-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.full_name}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-email">
                Email address{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="member-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? "member-email-error" : undefined
                }
              />
              {fieldErrors.email ? (
                <p id="member-email-error" className="text-sm text-destructive">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-phone">
                Mobile number{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="member-phone"
                inputMode="numeric"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                autoComplete="tel"
                placeholder="0781234567"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={
                  fieldErrors.phone ? "member-phone-error" : "member-phone-help"
                }
              />
              <p
                id="member-phone-help"
                className="text-xs leading-5 text-muted-foreground"
              >
                Use 10 digits beginning with 078, 079, 072, or 073.
              </p>
              {fieldErrors.phone ? (
                <p id="member-phone-error" className="text-sm text-destructive">
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>

            {fieldErrors.non_field_errors ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm leading-5 text-destructive"
              >
                {fieldErrors.non_field_errors}
              </p>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="member-password">Initial password</Label>
              <div className="relative">
                <Input
                  id="member-password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  autoComplete="new-password"
                  className="pr-10"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "member-password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                >
                  {isPasswordVisible ? (
                    <EyeOffIcon aria-hidden="true" className="size-4" />
                  ) : (
                    <EyeIcon aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p
                  id="member-password-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-password-confirmation">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="member-password-confirmation"
                  type={isConfirmationVisible ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={(event) =>
                    updateField("password_confirmation", event.target.value)
                  }
                  autoComplete="new-password"
                  className="pr-10"
                  aria-invalid={Boolean(fieldErrors.password_confirmation)}
                  aria-describedby={
                    fieldErrors.password_confirmation
                      ? "member-password-confirmation-error"
                      : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setConfirmationVisible((visible) => !visible)}
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={
                    isConfirmationVisible
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                >
                  {isConfirmationVisible ? (
                    <EyeOffIcon aria-hidden="true" className="size-4" />
                  ) : (
                    <EyeIcon aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password_confirmation ? (
                <p
                  id="member-password-confirmation-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.password_confirmation}
                </p>
              ) : null}
            </div>
          </div>

          <DrawerFooter className="px-0 pt-6">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
              ) : (
                <UserRoundPlusIcon aria-hidden="true" />
              )}
              {isSubmitting ? "Adding member..." : "Add member"}
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

export default function MembersPage() {
  const currentMember = useDashboardMember()
  const [members, setMembers] = useState<DirectoryMember[]>([])
  const [query, setQuery] = useState("")
  const [loadError, setLoadError] = useState("")
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    listMembers()
      .then((directory) => {
        if (active) setMembers(directory)
      })
      .catch(() => {
        if (active)
          setLoadError(
            "We could not load the member directory. Please refresh and try again."
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const visibleMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return normalizedQuery
      ? members.filter((member) =>
          member.full_name.toLowerCase().includes(normalizedQuery)
        )
      : members
  }, [members, query])

  function handleCreated(member: DirectoryMember) {
    setMembers((current) =>
      [...current, member].sort((first, second) =>
        first.full_name.localeCompare(second.full_name)
      )
    )
    toast.add({
      type: "success",
      title: "Member added",
      description: `${member.full_name} can now sign in to the member space.`,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6 lg:p-8">
      <section
        className="rounded-xl border bg-card shadow-xs"
        aria-labelledby="members-heading"
      >
        <div className="flex flex-col gap-5 border-b p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <UsersRoundIcon aria-hidden="true" className="size-4" />
                </span>
                <Badge variant="outline" className="text-primary">
                  Private directory
                </Badge>
              </div>
              <h1
                id="members-heading"
                className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              >
                The people behind the collective
              </h1>
              <p className="mt-2 leading-6 text-muted-foreground">
                Names, roles, and membership status are shared here. Contact
                details stay private.
              </p>
            </div>
            {currentMember.can_manage_members ? (
              <MemberCreationDrawer onCreated={handleCreated} />
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Label htmlFor="member-search" className="sr-only">
                Search members
              </Label>
              <Input
                id="member-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search members by name"
                className="h-10 pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading members..."
                : `${visibleMembers.length} ${visibleMembers.length === 1 ? "member" : "members"}`}
            </p>
          </div>

          {!currentMember.can_manage_members ? (
            <p className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-3 text-sm leading-5 text-muted-foreground">
              <ShieldCheckIcon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              Stewards manage new member access. Your directory view does not
              include contact details.
            </p>
          ) : null}
        </div>

        {loadError ? (
          <p
            role="alert"
            className="m-5 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-3 text-sm leading-6 text-destructive"
          >
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
        ) : visibleMembers.length === 0 ? (
          <div className="grid min-h-48 place-items-center p-6 text-center">
            <div>
              <UsersRoundIcon
                aria-hidden="true"
                className="mx-auto size-5 text-muted-foreground"
              />
              <p className="mt-3 font-medium">No members found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different name.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="pl-6 font-medium">
                        {member.full_name}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={member.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge isActive={member.is_active} />
                      </TableCell>
                      <TableCell className="pr-6 text-muted-foreground">
                        {formatJoinedDate(member.date_joined)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid divide-y md:hidden">
              {visibleMembers.map((member) => (
                <article key={member.id} className="grid gap-3 p-5">
                  <p className="font-medium">{member.full_name}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <RoleBadge role={member.role} />
                    <StatusBadge isActive={member.is_active} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Joined {formatJoinedDate(member.date_joined)}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
