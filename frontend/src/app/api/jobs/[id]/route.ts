import { bffFetch } from "@/lib/api/bff"

type Ctx = { params: Promise<{ id: string }> }

function passthrough(upstream: Response, bodyText: string) {
  if (upstream.status === 204 || upstream.status === 205 || upstream.status === 304) {
    return new Response(null, { status: upstream.status })
  }
  return new Response(bodyText, { status: upstream.status })
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body = await req.text()

  const upstream = await bffFetch(`/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  })

  const text = await upstream.text().catch(() => "")
  return passthrough(upstream, text)
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const upstream = await bffFetch(`/jobs/${id}`, { method: "DELETE" })
  const text = await upstream.text().catch(() => "")
  return passthrough(upstream, text)
}

