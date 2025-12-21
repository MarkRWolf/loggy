import { cookies, headers } from "next/headers"

const API_BASE =
  (process.env.API_BASE_URL ?? "").replace(/\/+$/, "") ||
  "http://localhost:5000"

export async function serverApiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const cookieStore = await cookies()
  const hdrs = await headers()

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ")

  const forwardedHost = hdrs.get("host") ?? ""

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(forwardedHost ? { "X-Forwarded-Host": forwardedHost } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    return { ok: false, status: res.status, message: msg || res.statusText }
  }

  const raw = await res.text().catch(() => "")
  if (!raw) return { ok: true, data: undefined as T }
  return { ok: true, data: JSON.parse(raw) as T }
}

