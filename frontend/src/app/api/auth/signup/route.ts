import { bffFetch } from "@/lib/api/bff"

export async function POST(req: Request) {
  const body = await req.text()
  const upstream = await bffFetch("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  const outHeaders = new Headers()
  const setCookie = upstream.headers.get("set-cookie")
  if (setCookie) outHeaders.set("set-cookie", setCookie)

  const text = await upstream.text().catch(() => "")
  return new Response(text, { status: upstream.status, headers: outHeaders })
}

