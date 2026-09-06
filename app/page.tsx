import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  Check,
  Landmark,
  LockKeyhole,
  Sprout,
} from "lucide-react"

const principles = [
  "Every member has a voice in the yearly decision.",
  "Savings remain focused on the group's short-term horizon.",
  "Choices are discussed together before they are made.",
  "The collective stays private and member-led.",
]

export default function Page() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <header className="flex h-[72px] items-center justify-between border-b border-border/80">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-md text-[15px] font-semibold tracking-[-0.03em] text-foreground transition-opacity outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            aria-label="Plots and Prosper home"
          >
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
              <Sprout aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </span>
            <span>Plots &amp; Prosper</span>
          </Link>
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-5 sm:gap-7"
          >
            <a
              href="#how-it-works"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline"
            >
              How it works
            </a>
            <a
              href="#principles"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline"
            >
              Our principles
            </a>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:translate-y-px"
            >
              Member login
            </Link>
          </nav>
        </header>

        <section className="grid min-h-[calc(100dvh-72px)] items-center gap-12 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:py-16">
          <div className="relative z-10 max-w-xl">
            <p className="reveal text-xs font-semibold tracking-[0.15em] text-primary">
              A private member collective
            </p>
            <h1 className="reveal mt-5 text-5xl font-semibold tracking-[-0.065em] text-balance delay-1 sm:text-6xl lg:text-[clamp(3.8rem,5.6vw,5.6rem)] lg:leading-[0.94]">
              Save together. Decide together.
            </h1>
            <p className="reveal mt-6 max-w-md text-lg leading-8 text-muted-foreground delay-2">
              A shared savings practice for members who want to make thoughtful
              annual investment decisions together.
            </p>
            <div className="reveal mt-8 flex flex-wrap items-center gap-4 delay-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:translate-y-px"
              >
                Member login{" "}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={1.8}
                />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center rounded-[10px] px-1 text-sm font-semibold text-foreground underline decoration-border underline-offset-8 transition-colors hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Explore the model
              </a>
            </div>
          </div>

          <div className="reveal relative mx-auto w-full max-w-2xl delay-2 lg:max-w-none">
            <div className="absolute -inset-6 -z-10 rounded-[32px] bg-primary/10 blur-3xl dark:bg-primary/15" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-muted shadow-[0_22px_60px_-32px_rgba(13,39,31,0.48)]">
              <Image
                src="/images/member-planning.png"
                alt="Members of a collective meeting around a table to plan together"
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 left-5 flex max-w-[235px] items-start gap-3 rounded-[16px] border border-white/30 bg-background/92 p-4 shadow-lg shadow-primary/10 backdrop-blur-sm sm:bottom-8 sm:-left-7 dark:border-white/10 dark:bg-card/90">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
                strokeWidth={1.8}
              />
              <p className="text-sm leading-5 text-foreground">
                Deliberate, private, and shaped by the people in the room.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section
        id="how-it-works"
        className="scroll-mt-8 border-y border-border/80 bg-muted/45 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">
              A simple yearly rhythm
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              A shared practice with room for real conversation.
            </h2>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-12 lg:gap-6">
            <article className="group rounded-[20px] border border-border bg-background p-7 lg:col-span-4 lg:mt-16">
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                <Landmark
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={1.7}
                />
              </div>
              <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">
                Contribute steadily
              </h3>
              <p className="mt-3 max-w-sm leading-7 text-muted-foreground">
                Members gather funds into a shared short-term savings pool
                throughout the year.
              </p>
            </article>
            <article className="rounded-[20px] bg-primary p-7 text-primary-foreground lg:col-span-5">
              <div className="flex min-h-[194px] flex-col justify-between">
                <span className="font-mono text-xs tracking-[0.13em] text-primary-foreground/70">
                  TIME TO PAUSE
                </span>
                <h3 className="max-w-sm text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                  Let savings do their quiet work.
                </h3>
              </div>
              <p className="mt-8 max-w-sm leading-7 text-primary-foreground/75">
                The group keeps the focus on a clear, short-term savings horizon
                while members prepare for the annual discussion.
              </p>
            </article>
            <article className="rounded-[20px] border border-border bg-background p-7 lg:col-span-3 lg:mt-28">
              <div className="font-mono text-xs tracking-[0.13em] text-primary">
                THE YEARLY MEETING
              </div>
              <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">
                Choose together
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Each year, members decide which opportunities deserve the
                collective&apos;s attention.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24 lg:px-10">
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="absolute -inset-5 rounded-[28px] bg-primary/8" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-muted">
            <Image
              src="/images/annual-gathering.png"
              alt="Members gathered for an annual planning conversation in a leafy courtyard"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div id="principles" className="scroll-mt-8">
          <p className="text-sm font-semibold text-primary">
            Decisions belong to members
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Prosperity is more meaningful when the process is shared.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Plots &amp; Prosper makes space for careful discussion, individual
            perspective, and collective responsibility.
          </p>
          <ul
            className="mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2"
            aria-label="Collective principles"
          >
            {principles.map((principle) => (
              <li
                key={principle}
                className="flex gap-3 text-sm leading-6 text-foreground"
              >
                <Check
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-primary"
                  strokeWidth={2.2}
                />
                <span>{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border/80 bg-muted/45">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-end lg:px-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Your collective is waiting for you.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              Sign in to stay connected with the conversations and decisions
              that shape the year ahead.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted focus-visible:outline-none active:translate-y-px"
          >
            Member login{" "}
            <ArrowUpRight
              aria-hidden="true"
              className="size-4"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>Plots &amp; Prosper</p>
        <p>A private, member-led savings collective.</p>
      </footer>
    </main>
  )
}
