"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, LoaderCircle, LogOut, Sprout } from "lucide-react"

import { getCurrentMember, signOut, type Member } from "@/lib/auth"

export default function MemberPage() {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [isSigningOut, setSigningOut] = useState(false)

  useEffect(() => {
    let isMounted = true

    getCurrentMember()
      .then((currentMember) => {
        if (isMounted) {
          setMember(currentMember)
        }
      })
      .catch(() => {
        router.replace("/login")
      })

    return () => {
      isMounted = false
    }
  }, [router])

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.replace("/")
  }

  if (!member) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin text-primary"
          />
          Opening your member space...
        </div>
      </main>
    )
  }

  const identifier = member.email ?? member.phone

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <header className="flex h-[72px] items-center justify-between border-b border-border/80">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-md text-[15px] font-semibold tracking-[-0.03em] transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
              <Sprout aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </span>
            <span>Plots &amp; Prosper</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-semibold transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSigningOut ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <LogOut aria-hidden="true" className="size-4" />
            )}
            Sign out
          </button>
        </header>

        <section className="grid min-h-[calc(100dvh-72px)] place-items-center py-12">
          <div className="w-full max-w-2xl rounded-[24px] border border-border bg-card p-7 shadow-[0_24px_60px_-38px_rgba(13,39,31,0.45)] sm:p-10">
            <p className="text-xs font-semibold tracking-[0.15em] text-primary">
              MEMBER SPACE
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-balance sm:text-5xl">
              You&apos;re signed in.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Welcome back. The collective&apos;s member portal is taking shape.
            </p>

            <div className="mt-9 rounded-[16px] border border-border bg-muted/45 p-5">
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">
                SIGNED IN AS
              </p>
              <p className="mt-2 font-mono text-sm text-foreground">
                {identifier}
              </p>
            </div>

            <Link
              href="/"
              className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-8 transition hover:decoration-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Return to the collective homepage
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
