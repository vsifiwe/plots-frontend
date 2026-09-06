"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Sprout,
} from "lucide-react"

import { ApiError, signIn } from "@/lib/auth"

const phonePattern = /^(078|079|072|073)\d{7}$/

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const trimmedIdentifier = identifier.trim()
    if (!trimmedIdentifier || !password) {
      setError("Enter your email or phone number and password.")
      return
    }

    if (
      !trimmedIdentifier.includes("@") &&
      !phonePattern.test(trimmedIdentifier)
    ) {
      setError(
        "Use a 10-digit mobile number beginning with 078, 079, 072, or 073."
      )
      return
    }

    setSubmitting(true)
    try {
      await signIn(trimmedIdentifier, password)
      router.replace("/member")
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)
      } else {
        setError("We could not reach member access. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-background px-5 py-6 text-foreground sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
      <div className="absolute -top-24 right-[12%] size-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <section className="relative flex min-h-[22rem] flex-col justify-between rounded-[24px] bg-primary p-7 text-primary-foreground sm:p-10 lg:min-h-full lg:p-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-semibold text-primary-foreground/80 transition hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground/70 focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Plots &amp; Prosper
        </Link>

        <div className="max-w-md py-12 lg:py-0">
          <div className="mb-7 flex size-11 items-center justify-center rounded-[14px] bg-primary-foreground/12">
            <Sprout aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </div>
          <p className="font-mono text-xs tracking-[0.14em] text-primary-foreground/65">
            MEMBER ACCESS
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-balance sm:text-5xl lg:text-6xl lg:leading-[0.96]">
            Return to the room.
          </h1>
          <p className="mt-6 max-w-sm text-lg leading-8 text-primary-foreground/75">
            Sign in to revisit the conversations and decisions you share with
            the collective.
          </p>
        </div>

        <p className="flex items-center gap-2 text-sm text-primary-foreground/65">
          <LockKeyhole aria-hidden="true" className="size-4" />
          Private access for current members.
        </p>
      </section>

      <section className="relative mx-auto flex w-full max-w-xl items-center py-12 lg:px-12 xl:px-20">
        <div className="w-full rounded-[20px] border border-border bg-card p-6 shadow-[0_24px_60px_-38px_rgba(13,39,31,0.45)] sm:p-9">
          <p className="text-sm font-semibold text-primary">Member sign in</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
            Welcome back
          </h2>
          <p className="mt-3 max-w-md leading-7 text-muted-foreground">
            Use the email address or mobile number registered by your collective
            administrator.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="identifier" className="text-sm font-semibold">
                Email or phone number
              </label>
              <input
                id="identifier"
                name="identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="name@example.com or 0781234567"
                aria-describedby="identifier-help"
                className="mt-2 h-12 w-full rounded-[10px] border border-input bg-background px-3 text-base transition outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
              <p
                id="identifier-help"
                className="mt-2 text-xs leading-5 text-muted-foreground"
              >
                Phone numbers use 10 digits and begin with 078, 079, 072, or
                073.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="h-12 w-full rounded-[10px] border border-input bg-background px-3 pr-12 text-base transition outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-[10px] text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                >
                  {isPasswordVisible ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-[10px] border border-destructive/25 bg-destructive/10 px-3 py-3 text-sm leading-6 text-destructive"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : null}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
