"use client"

import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MemberPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <LoaderCircle
          aria-hidden="true"
          className="size-4 animate-spin text-primary"
        />
        Opening your dashboard...
      </div>
    </main>
  )
}
