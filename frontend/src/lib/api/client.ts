export type ApiError = {
  status: number
  message: string
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "") ||
  "http://localhost:5000"

async function readError(res: Response): Promise<string> {
  try {
    const t = await res.text()
    return t || res.statusText
  } catch {
    return res.statusText
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    return {
      ok: false,
      error: { status: res.status, message: await readError(res) },
    }
  }

  const raw = await res.text()
  if (!raw) {
    return { ok: true, data: undefined as T }
  }

  return { ok: true, data: JSON.parse(raw) as T }
}

