export type JobStatus = "wishlist" | "applied" | "interview" | "rejected" | "offer"

export type ApplicationSource =
  | "posted"
  | "unsolicited"
  | "referral"
  | "recruiter"
  | "internal"
  | "other"

export type Job = {
  id: string
  title: string
  company: string
  url?: string
  status: JobStatus
  relevance: 1 | 2 | 3 | 4 | 5
  notes?: string
  appliedAt?: string | null
  applicationSource: ApplicationSource
  location?: string | null
  contactName?: string | null
  createdAt: string
  updatedAt: string
}

export type Me = { id: string; email: string }

