import { cookies, headers } from "next/headers"

const API_BASE =
  (process.env.API_BASE_URL ?? "").replace(/\/+$/, "") ||
  "http://localhost:5143"

function originFromRequestHeaders(h: Headers) {
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").trim()
  const xfProto = (h.get("x-forwarded-proto") ?? "").trim().toLowerCase()

  if (!host) {
    return process.env.NODE_ENV === "production"
      ? "https://portal.loggy.dk"
      : "http://localhost:3000"
  }

  const isLocalhost =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0")

  const proto = xfProto || (isLocalhost ? "http" : "https")
  return `${proto}://${host}`
}

export async function bffFetch(path: string, init?: RequestInit) {
  const c = await cookies()
  const h = await headers()

  const cookieHeader = c.toString()
  const host = h.get("host") ?? ""

  const method = (init?.method ?? "GET").toUpperCase()
  const isMutation = method !== "GET" && method !== "HEAD"

  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(host ? { "X-Forwarded-Host": host } : {}),
      ...(isMutation ? { Origin: originFromRequestHeaders(h) } : {}),
    },
    cache: "no-store",
  })
}

