const BFF_PREFIX = "/api"

type Ok<T> = { ok: true; data: T }
type Err = { ok: false; error: { status: number; message: string } }

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<Ok<T> | Err> {
  const url = `${BFF_PREFIX}${path.startsWith("/") ? path : `/${path}`}`

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    return { ok: false, error: { status: res.status, message: msg || res.statusText } }
  }

  const raw = await res.text().catch(() => "")
  if (!raw) return { ok: true, data: undefined as T }

  try {
    return { ok: true, data: JSON.parse(raw) as T }
  } catch {
    return { ok: true, data: raw as unknown as T }
  }
}

