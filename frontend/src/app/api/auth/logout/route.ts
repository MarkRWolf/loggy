import { bffFetch } from "@/lib/api/bff"

export async function POST() {
  const upstream = await bffFetch("/auth/logout", { method: "POST" })

  const outHeaders = new Headers()
  const setCookie = upstream.headers.get("set-cookie")
  if (setCookie) outHeaders.set("set-cookie", setCookie)

  const text = await upstream.text().catch(() => "")
  return new Response(text, { status: upstream.status, headers: outHeaders })
}

