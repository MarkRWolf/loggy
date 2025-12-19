"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signupSchema } from "@/lib/user/userSchema"
import { apiFetch } from "@/lib/api/client"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = signupSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setBusy(true)
    const res = await apiFetch<void>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        Email: parsed.data.email,
        Password: parsed.data.password,
      }),
    })
    setBusy(false)

    if (!res.ok) {
      setError(res.error.message)
      return
    }

    router.replace("/")
  }

  return (
    <form onSubmit={submit}>
      <h1>Signup</h1>

      {error && <p>{error}</p>}

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="password"
      />

      <button disabled={busy}>Create account</button>
      <br/><br/>
      <Link className="hover:underline" href={"/login"}>
        Login instead
      </Link>
    </form>
  )
}

