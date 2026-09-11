export type Member = {
  id: number
  full_name: string
  email: string | null
  phone: string | null
  role: "member" | "steward"
  can_manage_members: boolean
}

export type DirectoryMember = {
  id: number
  full_name: string
  role: "member" | "steward"
  is_active: boolean
  date_joined: string
}

export type NewMember = {
  full_name: string
  email?: string
  phone?: string
  password: string
  password_confirmation: string
}

export type ContributionStatus = "recorded" | "voided"
export type ContributionRnitStatus =
  "pending_cash" | "invested" | "purchase_reversed"

export type ContributionMember = {
  id: number
  full_name: string
}

export type Contribution = {
  id: number
  member?: ContributionMember
  amount: number
  received_on: string
  status: ContributionStatus
  note?: string
  recorded_by?: ContributionMember | null
  created_at: string
  voided_at: string | null
  void_reason?: string | null
  voided_by?: ContributionMember | null
  rnit_status: ContributionRnitStatus
}

export type PaginatedContributions = {
  count: number
  next: string | null
  previous: string | null
  results: Contribution[]
}

export type NewContribution = {
  member: number
  amount: number
  received_on: string
  note?: string
}

export type AssetStatus = "draft" | "open" | "acquired" | "cancelled"
export type AssetType = "fixed" | "variable"

export type AssetCommitmentMember = {
  id: number
  full_name: string
}

export type AssetCommitment = {
  id: number
  member: AssetCommitmentMember
  amount: number
  ownership_percentage: number
  is_reserved: boolean
  created_at: string
  reserved_at: string | null
  released_at: string | null
  release_reason: string
  reserved_cash: number
  reserved_units: string
  reservation_nav: string | null
  redeemed_at: string | null
  redemption_nav: string | null
  live_reserved_value: number
  current_value: number | null
  growth: number | null
}

export type AssetValuation = {
  id: number
  as_of_date: string
  total_value: string | null
  unit_price: string | null
  recorded_by: AssetCommitmentMember
  created_at: string
}

export type AssetFundingIssue =
  | {
      type: "cost_mismatch"
      message: string
      committed_total: number
      total_cost: number
    }
  | {
      type: "insufficient_balance"
      member: AssetCommitmentMember
      required: number
      available_balance: number
    }
  | {
      type: "nav_required"
      message: string
    }

export type Asset = {
  id: number
  title: string
  description: string
  total_cost: number
  asset_type: AssetType
  status: AssetStatus
  total_committed: number
  total_reserved: number
  your_commitment: AssetCommitment | null
  commitments?: AssetCommitment[]
  funding_issues?: AssetFundingIssue[]
  acquired_at: string | null
  acquired_units: string | null
  acquisition_unit_price: string | null
  current_value: number | null
  growth: number | null
  growth_percentage: number | null
  latest_valuation_date: string | null
  latest_unit_price: string | null
  valuations?: AssetValuation[]
  created_at: string
  updated_at: string
  cancelled_at: string | null
  cancellation_reason?: string
  created_as_draft?: boolean
}

export type RNITNav = {
  id: number
  as_of_date: string
  nav_per_unit: string
  recorded_by: ContributionMember
  created_at: string
}

export type RNITPurchase = {
  id: number
  contribution_id: number
  member: ContributionMember
  purchased_on: string
  nav_per_unit: string
  units: string
  status: "invested" | "reversed"
  created_at: string
  reversed_at: string | null
  reversal_reason: string
}

export type SavingsPosition = {
  pending_cash: number
  units_held: string
  available_cash: number
  available_units: string
  reserved_cash: number
  reserved_units: string
  reserved_value: number
  latest_nav: { as_of_date: string; nav_per_unit: string } | null
  rnit_value: number
  current_value: number
  available_value: number
  unrealized_growth: number
}

export type SavingsSummary = {
  member: SavingsPosition
  collective?: {
    pending_cash: number
    rnit_value: number
    current_value: number
    reserved_value: number
    members: number
  }
}

export type OverviewAllocationKey =
  "pending_cash" | "rnit" | "fixed_assets" | "variable_assets"

export type OverviewSegmentKey =
  "cornerstone" | "growth" | "emerging" | "legacy"

export type OverviewSummary = {
  generated_on: string
  valuation_as_of: string | null
  portfolio: {
    total_value: number
    allocation: Array<{
      key: OverviewAllocationKey
      label: string
      value: number
      percentage: number
    }>
  }
  membership: {
    total_members: number
    active_members: number
    inactive_members: number
    average_active_portfolio: number
    top_five_concentration: number
  }
  contributions: {
    current_window: {
      month: string
      active_members: number
      contributing_members: number
      health_percentage: number
      healthy_threshold: number
      is_healthy: boolean
    }
    history: Array<{
      month: string
      total_received: number
      contributing_members: number
    }>
  }
  holdings: Array<{
    id: number
    title: string
    asset_type: AssetType
    cost: number
    current_value: number
    growth: number
    growth_percentage: number
    acquired_on: string | null
    latest_valuation_date: string | null
    acquisition_units: string | null
    acquisition_unit_price: number | null
    current_unit_price: number | null
    unit_price_change: number | null
    unit_price_change_percentage: number | null
    rnit_benchmark_percentage: number | null
  }>
  segments: Array<{
    key: OverviewSegmentKey
    label: string
    range_label: string
    member_count: number
    total_value: number
    percentage: number
    members: Array<{ id: number; full_name: string }>
  }>
}

export type AssetCommitmentInput = {
  member: number
  amount: number
}

export type NewAsset = {
  title: string
  asset_type: AssetType
  description?: string
  total_cost: number
  commitments: AssetCommitmentInput[]
}

export type AssetAcquisition = {
  units?: string
  unit_price?: string
}

export type NewAssetValuation = {
  as_of_date: string
  total_value?: string
  unit_price?: string
}

export type MemberAvailableBalance = {
  id: number
  full_name: string
  available_balance: number
}

type StoredSession = {
  access: string
  refresh: string
  user: Member
}

type TokenResponse = {
  access: string
  refresh?: string
  user?: Member
}

const storageKey = "plots-and-prosper-session"
const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "")

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {}
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`
}

function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const value = window.localStorage.getItem(storageKey)
  if (!value) {
    return null
  }

  try {
    const session = JSON.parse(value) as StoredSession
    if (!session.access || !session.refresh || !session.user) {
      throw new Error("Invalid stored session")
    }
    return session
  } catch {
    clearSession()
    return null
  }
}

function storeSession(session: StoredSession) {
  window.localStorage.setItem(storageKey, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(storageKey)
  }
}

function messageFromResponse(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback
  }

  const data = payload as Record<string, unknown>
  if (typeof data.detail === "string") {
    return data.detail
  }

  for (const value of Object.values(data)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0]
    }
  }

  return fallback
}

function fieldErrorsFromResponse(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return {}
  }

  return Object.fromEntries(
    Object.entries(payload as Record<string, unknown>).flatMap(
      ([key, value]) =>
        Array.isArray(value) && typeof value[0] === "string"
          ? [[key, value[0]]]
          : []
    )
  )
}

async function errorFromResponse(response: Response, fallback: string) {
  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  return new ApiError(
    messageFromResponse(payload, fallback),
    response.status,
    fieldErrorsFromResponse(payload)
  )
}

export async function signIn(identifier: string, password: string) {
  const response = await fetch(apiUrl("/api/auth/login/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  })

  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to sign in with those details."
    )
  }

  const data = (await response.json()) as TokenResponse
  if (!data.access || !data.refresh || !data.user) {
    throw new ApiError("The sign-in response was incomplete.", response.status)
  }

  storeSession({ access: data.access, refresh: data.refresh, user: data.user })
  return data.user
}

async function refreshAccessToken() {
  const session = getStoredSession()
  if (!session) {
    return false
  }

  const response = await fetch(apiUrl("/api/auth/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: session.refresh }),
  })

  if (!response.ok) {
    clearSession()
    return false
  }

  const data = (await response.json()) as TokenResponse
  if (!data.access) {
    clearSession()
    return false
  }

  storeSession({
    ...session,
    access: data.access,
    refresh: data.refresh ?? session.refresh,
  })
  return true
}

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  const session = getStoredSession()
  if (!session) {
    throw new ApiError("Your session has ended. Please sign in again.", 401)
  }

  const request = (access: string) => {
    const headers = new Headers(init.headers)
    headers.set("Authorization", `Bearer ${access}`)
    return fetch(apiUrl(path), { ...init, headers })
  }

  let response = await request(session.access)
  if (response.status !== 401) {
    return response
  }

  if (!(await refreshAccessToken())) {
    throw new ApiError("Your session has ended. Please sign in again.", 401)
  }

  const refreshedSession = getStoredSession()
  if (!refreshedSession) {
    throw new ApiError("Your session has ended. Please sign in again.", 401)
  }

  response = await request(refreshedSession.access)
  if (response.status === 401) {
    clearSession()
  }
  return response
}

export async function getCurrentMember() {
  const response = await authenticatedFetch("/api/auth/me/")
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to load your member space.")
  }
  return (await response.json()) as Member
}

export async function listMembers() {
  const response = await authenticatedFetch("/api/members/")
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to load the member directory."
    )
  }
  return (await response.json()) as DirectoryMember[]
}

export async function createMember(member: NewMember) {
  const response = await authenticatedFetch("/api/members/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  })

  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to create this member.")
  }
  return (await response.json()) as DirectoryMember
}

export async function listContributions(page = 1) {
  const response = await authenticatedFetch(`/api/contributions/?page=${page}`)
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to load contribution records."
    )
  }
  return (await response.json()) as PaginatedContributions
}

export async function createContribution(contribution: NewContribution) {
  const response = await authenticatedFetch("/api/contributions/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contribution),
  })

  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to record this contribution."
    )
  }
  return (await response.json()) as Contribution
}

export async function voidContribution(id: number, reason: string) {
  const response = await authenticatedFetch(`/api/contributions/${id}/void/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to void this contribution.")
  }
  return (await response.json()) as Contribution
}

export async function getSavingsSummary() {
  const response = await authenticatedFetch("/api/savings/summary/")
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to load your RNIT position."
    )
  }
  return (await response.json()) as SavingsSummary
}

export async function getOverviewSummary() {
  const response = await authenticatedFetch("/api/overview/")
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to load the collective overview."
    )
  }
  return (await response.json()) as OverviewSummary
}

export async function listRNITNavs() {
  const response = await authenticatedFetch("/api/savings/navs/")
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to load RNIT NAV history.")
  }
  return (await response.json()) as RNITNav[]
}

export async function createRNITNav(nav: {
  as_of_date: string
  nav_per_unit: string
}) {
  const response = await authenticatedFetch("/api/savings/navs/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nav),
  })
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to record this RNIT NAV.")
  }
  return (await response.json()) as RNITNav
}

export async function listPendingRNITContributions() {
  const response = await authenticatedFetch(
    "/api/savings/pending-contributions/"
  )
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to load pending contributions."
    )
  }
  return (await response.json()) as Contribution[]
}

export async function listRNITPurchases() {
  const response = await authenticatedFetch("/api/savings/purchases/")
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to load RNIT purchase history."
    )
  }
  return (await response.json()) as RNITPurchase[]
}

export async function purchaseContributionRNIT(
  contributionId: number,
  purchase: { purchased_on: string; nav_id: number }
) {
  const response = await authenticatedFetch(
    `/api/savings/contributions/${contributionId}/purchase/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(purchase),
    }
  )
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to record this RNIT purchase."
    )
  }
  return (await response.json()) as RNITPurchase
}

export async function reverseRNITPurchase(purchaseId: number, reason: string) {
  const response = await authenticatedFetch(
    `/api/savings/purchases/${purchaseId}/reverse/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }
  )
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to reverse this RNIT purchase."
    )
  }
  return (await response.json()) as RNITPurchase
}

export async function listAssets() {
  const response = await authenticatedFetch("/api/assets/")
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to load assets.")
  }
  return (await response.json()) as Asset[]
}

export async function getAsset(id: number) {
  const response = await authenticatedFetch(`/api/assets/${id}/`)
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to load this asset.")
  }
  return (await response.json()) as Asset
}

export async function createAsset(asset: NewAsset) {
  const response = await authenticatedFetch("/api/assets/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  })
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to create this asset.")
  }
  return (await response.json()) as Asset
}

export async function updateAsset(id: number, asset: NewAsset) {
  const response = await authenticatedFetch(`/api/assets/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  })
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to update this draft.")
  }
  return (await response.json()) as Asset
}

export async function openAsset(id: number) {
  const response = await authenticatedFetch(`/api/assets/${id}/open/`, {
    method: "POST",
  })
  if (!response.ok) {
    throw await errorFromResponse(response, "This asset is not ready to open.")
  }
  return (await response.json()) as Asset
}

export async function acquireAsset(
  id: number,
  acquisition: AssetAcquisition = {}
) {
  const response = await authenticatedFetch(`/api/assets/${id}/acquire/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(acquisition),
  })
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to mark this asset acquired."
    )
  }
  return (await response.json()) as Asset
}

export async function listAssetValuations(id: number) {
  const response = await authenticatedFetch(`/api/assets/${id}/valuations/`)
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to load valuation history.")
  }
  return (await response.json()) as AssetValuation[]
}

export async function createAssetValuation(
  id: number,
  valuation: NewAssetValuation
) {
  const response = await authenticatedFetch(`/api/assets/${id}/valuations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(valuation),
  })
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to record this valuation.")
  }
  return (await response.json()) as AssetValuation
}

export async function cancelAsset(id: number, reason: string) {
  const response = await authenticatedFetch(`/api/assets/${id}/cancel/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  })
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to cancel this asset.")
  }
  return (await response.json()) as Asset
}

export async function reopenAsset(id: number, reason: string) {
  const response = await authenticatedFetch(`/api/assets/${id}/reopen/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  })
  if (!response.ok) {
    throw await errorFromResponse(response, "Unable to reopen this asset.")
  }
  return (await response.json()) as Asset
}

export async function listAssetAvailableBalances() {
  const response = await authenticatedFetch("/api/assets/available-balances/")
  if (!response.ok) {
    throw await errorFromResponse(
      response,
      "Unable to load available balances."
    )
  }
  return (await response.json()) as MemberAvailableBalance[]
}

export async function signOut() {
  const session = getStoredSession()

  try {
    if (session) {
      await fetch(apiUrl("/api/auth/logout/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: session.refresh }),
      })
    }
  } finally {
    clearSession()
  }
}
