"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginSchema } from "@/lib/user/userSchema"
import { apiFetch } from "@/lib/api/client"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setBusy(true)
    const res = await apiFetch<void>("/auth/login", {
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
      <h1>Login</h1>
      
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

      <button disabled={busy}>Login</button>
      <br/><br/>
      <Link className="hover:underline" href={"/signup"}>
        Signup instead
      </Link>
    </form>
  )
}

