import { bffFetch } from "@/lib/api/bff"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const qs = url.search ? url.search : ""
  const upstream = await bffFetch(`/jobs${qs}`, { method: "GET" })
  const text = await upstream.text().catch(() => "")
  return new Response(text, { status: upstream.status })
}

export async function POST(req: Request) {
  const body = await req.text()
  const upstream = await bffFetch("/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  const text = await upstream.text().catch(() => "")
  return new Response(text, { status: upstream.status })
}

