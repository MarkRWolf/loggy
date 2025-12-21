"use client"

import { useCallback, useState } from "react"
import type { ApplicationSource, Job, JobStatus } from "@/lib/job/types"
import { jobStatusSchema } from "@/lib/job/jobSchema"

type Relevance = 1 | 2 | 3 | 4 | 5

export function useJobForm() {
  const [show, setShow] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [url, setUrl] = useState("")
  const [status, setStatus] = useState<JobStatus>("wishlist")
  const [relevance, setRelevance] = useState<Relevance>(3)
  const [notes, setNotes] = useState("")
  const [appliedAt, setAppliedAt] = useState<string>(new Date().toISOString())
  const [applicationSource, setApplicationSource] = useState<ApplicationSource>("posted")
  const [location, setLocation] = useState("")
  const [contactName, setContactName] = useState("")
  const [busy, setBusy] = useState(false)

  const reset = useCallback(() => {
    setEditingId(null)
    setTitle("")
    setCompany("")
    setUrl("")
    setStatus("wishlist")
    setRelevance(3)
    setNotes("")
    setAppliedAt(new Date().toISOString())
    setApplicationSource("posted")
    setLocation("")
    setContactName("")
  }, [])

  const openCreate = useCallback(() => {
    reset()
    setShow(true)
  }, [reset])

  const openEdit = useCallback((j: Job) => {
    setEditingId(j.id)
    setTitle(j.title)
    setCompany(j.company)
    setUrl(j.url ?? "")
    setStatus(jobStatusSchema.safeParse(j.status).success ? j.status : "wishlist")
    setRelevance((j.relevance ?? 3) as Relevance)
    setNotes(j.notes ?? "")
    setAppliedAt(j.appliedAt ?? new Date().toISOString())
    setApplicationSource((j.applicationSource ?? "posted") as ApplicationSource)
    setLocation(j.location ?? "")
    setContactName(j.contactName ?? "")
    setShow(true)
  }, [])

  const close = useCallback(() => {
    setShow(false)
    reset()
  }, [reset])

  return {
    show,
    editingId,
    title,
    company,
    url,
    status,
    relevance,
    notes,
    appliedAt,
    applicationSource,
    location,
    contactName,
    busy,
    setTitle,
    setCompany,
    setUrl,
    setStatus,
    setRelevance,
    setNotes,
    setAppliedAt,
    setApplicationSource,
    setLocation,
    setContactName,
    setBusy,
    openCreate,
    openEdit,
    close,
  }
}

