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
