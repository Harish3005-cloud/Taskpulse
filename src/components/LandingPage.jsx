import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Zap,
  Users,
  Bell,
  Filter,
  TrendingUp,
  CalendarClock,
  MessageSquare,
} from "lucide-react";
import { cn } from "../lib/utils";
import "./LandingPage.css";
import DashboardPreview from "../assets/assets/dashboard-hero.png";

/* ------------------------------------------------------------------ */
/*  Shared framer-motion presets                                       */
/* ------------------------------------------------------------------ */
const EASE_SPRING = [0.22, 1, 0.36, 1];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SPRING } },
};

const fadeUpCard = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SPRING } },
};

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      {/* Ambient AI glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-10 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)" }}
      />
      <div
        aria-hidden="true"
        className="landing-section-gradient-line pointer-events-none absolute inset-x-0 top-0 h-px"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          {/* AI badge */}
          <motion.a
            variants={fadeUpItem}
            href="#ai"
            className="inline-flex items-center gap-2 rounded-full border border-tp-border-strong bg-tp-surface/30 px-3.5 py-1.5 text-xs font-medium text-tp-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-tp-surface/60"
          >
            <Sparkles className="h-3.5 w-3.5 text-tp-text" />
            <span className="font-semibold text-tp-text">New</span>
            <span className="text-tp-muted">Priority scoring for every task</span>
          </motion.a>

          {/* Headline */}
          <motion.h1
            variants={fadeUpItem}
            className="mt-6 font-heading text-balance text-5xl font-bold leading-[1.05] tracking-tight text-tp-foreground sm:text-6xl lg:text-7xl"
          >
            Task management that
            <br className="hidden sm:block" /> thinks{" "}
            <span className="bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent drop-shadow-sm">a step ahead</span>.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUpItem}
            className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-tp-muted"
          >
            TaskPulse scores what matters, drafts your day, and keeps every team
            in sync in real time — so your work moves at the speed of your ideas.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUpItem}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/signup"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-tp-accent px-6 text-base font-medium text-tp-accent-foreground shadow-tp-sm transition-all hover:bg-tp-accent-hover"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-tp-border bg-tp-surface px-6 text-base font-medium text-tp-foreground transition-all hover:border-tp-border-strong hover:bg-tp-elevated"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p variants={fadeUpItem} className="mt-4 text-sm text-tp-subtle">
            Free for small teams · No credit card required
          </motion.p>
        </motion.div>

        {/* Product screenshot placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE_SPRING }}
          className="relative mx-auto mt-16 max-w-6xl"
        >
          <div className="tp-ai-glow overflow-hidden rounded-xl border border-tp-border bg-tp-surface shadow-tp-lg">
            <img
              src={DashboardPreview}
              alt="TaskPulse dashboard preview"
              className="w-full"
              loading="eager"
            />
          </div>
          {/* Fade bottom edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-1 h-32 bg-gradient-to-t from-tp-bg to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  LOGO CLOUD                                                         */
/* ------------------------------------------------------------------ */
const logos = ["Northwind", "Acme", "Lumen", "Cobalt", "Vertex", "Halcyon"];

function LogoCloud() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-tp-subtle">
        Trusted by fast-moving teams
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
        {logos.map((name) => (
          <span
            key={name}
            className="text-lg font-semibold tracking-tight text-tp-subtle transition-colors hover:text-tp-muted"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FEATURE BENTO                                                      */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: LayoutGrid,
    title: "Views that fit how you work",
    body: "List, board, and calendar — save filtered views per team and switch instantly.",
    className: "sm:col-span-2",
  },
  {
    icon: Zap,
    title: "Real-time by default",
    body: "Changes sync live across every device and teammate. No refresh, ever.",
  },
  {
    icon: Users,
    title: "Multi-tenant workspaces",
    body: "Separate teams, projects, and permissions — cleanly isolated.",
  },
  {
    icon: Bell,
    title: "An inbox that respects focus",
    body: "Notifications grouped by project, with mentions surfaced first.",
  },
  {
    icon: Filter,
    title: "Powerful command palette",
    body: "Jump to anything and run actions from the keyboard in milliseconds.",
    className: "sm:col-span-2",
  },
];

function FeatureBento() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-tp-accent">Built for velocity</p>
        <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-tp-foreground sm:text-4xl">
          Everything your team needs, nothing it doesn&apos;t
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-tp-muted">
          The structure of a serious project tool, with the speed and calm of a
          product you actually enjoy opening.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ staggerChildren: 0.08 }}
        className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUpCard}
            className={cn(
              "group rounded-xl border border-tp-border bg-tp-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-tp-border-strong hover:shadow-tp-md",
              f.className
            )}
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-tp-accent-soft text-tp-accent">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-tp-foreground">
              {f.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-tp-muted">{f.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  AI SHOWCASE                                                        */
/* ------------------------------------------------------------------ */
const capabilities = [
  {
    icon: TrendingUp,
    title: "Priority scoring",
    body: "Every task gets a 0–100 score from deadlines, dependencies, and impact.",
  },
  {
    icon: CalendarClock,
    title: "Weekly digests",
    body: "A Monday brief of what shipped, what slipped, and what needs you.",
  },
  {
    icon: MessageSquare,
    title: "Ask AI, anywhere",
    body: "Query your workspace in plain language and act on the answer.",
  },
];

function AIShowcase() {
  return (
    <section id="ai" className="relative overflow-hidden py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)" }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-tp-border-strong bg-tp-surface/30 px-3 py-1 text-xs font-semibold text-tp-foreground shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-tp-text" />
            <span className="text-tp-text">TaskPulse Intelligence</span>
          </span>
          <h2 className="mt-5 text-balance font-heading text-3xl font-bold tracking-tight text-tp-foreground sm:text-4xl">
            The layer that decides{" "}
            <span className="bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">what matters next</span>
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-tp-muted">
            TaskPulse reads the signals your team creates and turns them into a
            clear, ranked plan — with reasoning you can trust and override.
          </p>

          <div className="mt-8 flex flex-col gap-5">
            {capabilities.map((c) => (
              <div key={c.title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-tp-border bg-tp-surface text-tp-foreground shadow-sm">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-tp-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-tp-muted">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock AI card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE_SPRING }}
          className="tp-ai-border tp-ai-glow rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-tp-foreground">
              <Sparkles className="h-4 w-4 text-tp-ai-to" /> AI daily summary
            </span>
            <span className="rounded-full bg-tp-accent-soft px-2.5 py-1 text-xs font-medium text-tp-accent">
              Today
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-tp-muted">
            You have{" "}
            <span className="font-semibold text-tp-foreground">3 high-priority</span>{" "}
            tasks. The{" "}
            <span className="font-semibold text-tp-foreground">API migration</span>{" "}
            is blocking two teammates — I&apos;d start there.
          </p>

          <div className="mt-5 space-y-3">
            {[
              {
                name: "Ship API v2 migration",
                score: 94,
                tone: "text-tp-priority-urgent",
              },
              {
                name: "Review onboarding flow",
                score: 78,
                tone: "text-tp-priority-high",
              },
              {
                name: "Draft Q3 roadmap",
                score: 61,
                tone: "text-tp-priority-medium",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-lg border border-tp-border bg-tp-surface px-4 py-3"
              >
                <span className="text-sm text-tp-foreground">{t.name}</span>
                <span className={`text-sm font-semibold ${t.tone}`}>
                  {t.score}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                       */
/* ------------------------------------------------------------------ */
const steps = [
  {
    n: "01",
    title: "Create your workspace",
    body: "Spin up a team, invite people, and organize work into projects in minutes.",
  },
  {
    n: "02",
    title: "Capture and connect tasks",
    body: "Add tasks with owners, deadlines, and dependencies — or import what you have.",
  },
  {
    n: "03",
    title: "Let AI rank the day",
    body: "TaskPulse scores priority and drafts a focused plan you can adjust anytime.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="border-y border-tp-border bg-tp-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-tp-accent">How it works</p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-tp-foreground sm:text-4xl">
            From zero to in-flow in three steps
          </h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: EASE_SPRING,
              }}
              className="relative"
            >
              <span className="text-sm font-semibold text-tp-accent">
                {s.n}
              </span>
              <div className="mt-2 h-px w-full bg-tp-border" />
              <h3 className="mt-4 text-lg font-semibold text-tp-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-tp-muted">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TESTIMONIALS                                                       */
/* ------------------------------------------------------------------ */
const quotes = [
  {
    quote:
      "The AI priority score is uncanny. Standups got shorter because everyone already knows what matters.",
    name: "Maya Chen",
    role: "Head of Product, Northwind",
  },
  {
    quote:
      "We replaced three tools with TaskPulse. Real-time sync and views per team were the tipping point.",
    name: "Daniel Okafor",
    role: "Engineering Lead, Cobalt",
  },
  {
    quote:
      "The weekly digest is the first email I read on Monday. It's like a chief of staff for the whole team.",
    name: "Priya Nair",
    role: "COO, Lumen",
  },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-heading text-3xl font-bold tracking-tight text-tp-foreground sm:text-4xl">
          Teams move faster with TaskPulse
        </h2>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.figure
            key={q.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: EASE_SPRING,
            }}
            className="flex flex-col justify-between rounded-xl border border-tp-border bg-tp-surface p-6"
          >
            <blockquote className="text-pretty text-[15px] leading-relaxed text-tp-foreground">
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-tp-accent-soft text-sm font-semibold text-tp-accent">
                {q.name.charAt(0)}
              </span>
              <div>
                <div className="text-sm font-semibold text-tp-foreground">
                  {q.name}
                </div>
                <div className="text-xs text-tp-muted">{q.role}</div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}


/* ------------------------------------------------------------------ */
/*  CTA                                                                */
/* ------------------------------------------------------------------ */
function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE_SPRING }}
        className="relative overflow-hidden rounded-3xl border border-tp-border bg-tp-surface px-6 py-16 text-center sm:px-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[560px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{ background: "var(--tp-ai-gradient)" }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance font-heading text-3xl font-bold tracking-tight text-tp-foreground sm:text-4xl">
            Give your team an unfair advantage
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-tp-muted">
            Start free today. Bring AI-ranked focus to every project in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-tp-accent px-6 text-base font-medium text-tp-accent-foreground shadow-tp-sm transition-all hover:bg-tp-accent-hover"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-tp-border bg-tp-surface px-6 text-base font-medium text-tp-foreground transition-all hover:border-tp-border-strong hover:bg-tp-elevated"
            >
              Book a demo
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                             */
/* ------------------------------------------------------------------ */
const footerColumns = [
  {
    title: "Product",
    links: ["Features", "AI", "Changelog", "Roadmap"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["Docs", "Guides", "API", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

function Footer() {
  return (
    <footer className="border-t border-tp-border">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold text-tp-foreground"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-tp-accent text-tp-accent-foreground">
                <Activity className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </span>
              <span className="text-[15px] tracking-tight">TaskPulse</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-tp-muted">
              AI-powered task management for high-velocity teams.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-tp-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-tp-muted transition-colors hover:text-tp-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-tp-border pt-8 sm:flex-row">
          <p className="text-sm text-tp-subtle">
            © {new Date().getFullYear()} TaskPulse. All rights reserved.
          </p>
          <p className="text-sm text-tp-subtle">Made for teams that ship.</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  LANDING PAGE (composed)                                            */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-tp-bg text-tp-foreground">
      <main>
        <Hero />
        <LogoCloud />
        <FeatureBento />
        <AIShowcase />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
