import { bffFetch } from "@/lib/api/bff"

export async function GET() {
  const upstream = await bffFetch("/auth/me", { method: "GET" })
  const text = await upstream.text().catch(() => "")
  return new Response(text, { status: upstream.status })
}

