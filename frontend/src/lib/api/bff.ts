import { cookies, headers } from "next/headers"

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "") ||
  "http://localhost:5143"

function portalOrigin() {
  return process.env.NODE_ENV === "production"
    ? "https://portal.loggy.dk"
    : "http://localhost:3000"
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
      ...(isMutation ? { Origin: portalOrigin() } : {}),
    },
    cache: "no-store",
  })
}

