export type ProposalStatus = "In review" | "Ready to decide" | "Listening"

export type Proposal = {
  id: number
  title: string
  category: string
  requestedAmount: number
  status: ProposalStatus
  sponsor: string
  reviewDate: string
  summary: string
}

export const dashboardSnapshot = {
  pooledSavings: 8450000,
  monthlyContributions: 620000,
  activeProposals: 3,
  annualDecisionDate: "15 November 2026",
}

export const savingsActivity = [
  { date: "2026-06-08", contributions: 180000, reserve: 6840000 },
  { date: "2026-06-15", contributions: 160000, reserve: 7000000 },
  { date: "2026-06-22", contributions: 210000, reserve: 7210000 },
  { date: "2026-06-29", contributions: 190000, reserve: 7400000 },
  { date: "2026-07-06", contributions: 240000, reserve: 7640000 },
  { date: "2026-07-13", contributions: 180000, reserve: 7820000 },
  { date: "2026-07-20", contributions: 220000, reserve: 8040000 },
  { date: "2026-07-27", contributions: 170000, reserve: 8210000 },
  { date: "2026-08-03", contributions: 210000, reserve: 8420000 },
  { date: "2026-08-10", contributions: 200000, reserve: 8620000 },
  { date: "2026-08-17", contributions: 180000, reserve: 8800000 },
  { date: "2026-08-24", contributions: 160000, reserve: 8960000 },
  { date: "2026-08-31", contributions: 190000, reserve: 9150000 },
]

export const proposals: Proposal[] = [
  {
    id: 1,
    title: "Kigali community garden lease",
    category: "Land use",
    requestedAmount: 2400000,
    status: "Ready to decide",
    sponsor: "Member working group",
    reviewDate: "12 November 2026",
    summary:
      "A discussion proposal for a shared growing space and community programming. No decision has been made.",
  },
  {
    id: 2,
    title: "Cold-storage cooperative inquiry",
    category: "Cooperative",
    requestedAmount: 1800000,
    status: "In review",
    sponsor: "Savings circle",
    reviewDate: "5 November 2026",
    summary:
      "An exploratory inquiry into joining a local cold-storage cooperative. Members are gathering questions before the annual meeting.",
  },
  {
    id: 3,
    title: "Affordable housing research pool",
    category: "Research",
    requestedAmount: 950000,
    status: "Listening",
    sponsor: "Member working group",
    reviewDate: "29 October 2026",
    summary:
      "A proposed research budget to compare locally available housing opportunities. This is not an investment recommendation.",
  },
  {
    id: 4,
    title: "Local produce distribution pilot",
    category: "Community enterprise",
    requestedAmount: 1250000,
    status: "Listening",
    sponsor: "Member working group",
    reviewDate: "22 October 2026",
    summary:
      "An early-stage member discussion about a small produce distribution pilot and its practical requirements.",
  },
]

export function formatRwf(value: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(value)
}
