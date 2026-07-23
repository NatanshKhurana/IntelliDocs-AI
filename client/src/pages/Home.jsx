import { Link } from "react-router"
import { ArrowRight, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

const Home = () => {
  return (
    <main>
      {/* Hero — one composition: brand, line, CTA, product visual */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
        {/* Atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.72_0.1_190/0.22),transparent_55%),radial-gradient(ellipse_at_90%_20%,oklch(0.55_0.08_220/0.12),transparent_45%),linear-gradient(180deg,var(--background)_0%,oklch(0.96_0.02_195)_45%,var(--background)_100%)] dark:bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.45_0.08_190/0.25),transparent_55%),radial-gradient(ellipse_at_85%_30%,oklch(0.35_0.06_230/0.2),transparent_50%),linear-gradient(180deg,var(--background)_0%,oklch(0.2_0.025_240)_50%,var(--background)_100%)]"
        />
        <div
          aria-hidden
          className="hero-drift pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-14 pb-8 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="hero-rise font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              IntelliDocs
              <span className="text-primary"> AI</span>
            </p>

            <h1 className="hero-rise hero-rise-delay-1 mt-5 font-heading text-xl font-medium tracking-tight text-foreground/90 sm:text-2xl md:text-3xl">
              Ask your PDFs. No account needed.
            </h1>

            <p className="hero-rise hero-rise-delay-2 mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
              Start a temporary chat right away. Sign in only when you want to
              keep your conversations.
            </p>

            <div className="hero-rise hero-rise-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-11 px-5 text-base"
                render={<Link to="/chat" />}
              >
                Start chatting
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-5 text-base"
                render={<Link to="/login" />}
              >
                Login to save chats
              </Button>
            </div>
          </div>

          {/* Product visual — full-bleed plane under copy */}
          <div className="hero-preview relative mt-auto w-full pt-12 md:pt-16">
            <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-t-2xl border border-b-0 border-border/70 bg-card/70 shadow-[0_-20px_60px_-30px_oklch(0.45_0.08_195/0.35)] backdrop-blur-sm dark:bg-card/50">
              <div className="grid min-h-[220px] grid-cols-1 md:min-h-[280px] md:grid-cols-[1.1fr_1fr]">
                {/* Doc pane */}
                <div className="border-b border-border/60 p-5 md:border-r md:border-b-0 md:p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <FileText className="size-3.5 text-primary" />
                    research-notes.pdf
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-[92%] rounded-full bg-muted" />
                    <div className="h-2.5 w-[78%] rounded-full bg-muted" />
                    <div className="h-2.5 w-[85%] rounded-full bg-primary/25" />
                    <div className="h-2.5 w-[70%] rounded-full bg-muted" />
                    <div className="h-2.5 w-[88%] rounded-full bg-muted" />
                    <div className="mt-4 h-2.5 w-[60%] rounded-full bg-muted" />
                    <div className="h-2.5 w-[74%] rounded-full bg-muted" />
                  </div>
                </div>

                {/* Chat pane */}
                <div className="flex flex-col p-5 md:p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MessageSquare className="size-3.5 text-primary" />
                    Guest chat
                    <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      Temporary
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="max-w-[90%] self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-left text-sm text-primary-foreground">
                      What does section 2 conclude?
                    </div>
                    <div className="max-w-[95%] self-start rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-left text-sm text-foreground">
                      It summarizes the findings and recommends next steps for
                      the study.
                    </div>
                    <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
                      <span className="pulse-dot size-1.5 rounded-full bg-primary" />
                      Ready when you are
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One job: guest vs save */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:gap-16 md:py-20">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Try freely
            </h2>
            <p className="mt-3 text-muted-foreground">
              Upload a PDF and chat as a guest. Nothing is stored in your
              account — perfect for quick questions.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Save when it matters
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create an account to keep chat history, revisit documents, and
              continue where you left off.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
