import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import "./Navbar.css";

const publicLinks = [
  { label: "Product", href: "#features" },
  { label: "AI", href: "#ai" },
  { label: "How it works", href: "#how" }
];

const authLinks = [
  { label: "Dashboard", to: "/dashboard" }
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "tp-glass border-b border-tp-border"
          : "border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-tp-foreground"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-tp-accent text-tp-accent-foreground">
            <Activity className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] tracking-tight">TaskPulse</span>
        </Link>

        {/* Center nav links — desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {isAuthenticated
            ? authLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="rounded-md px-3 py-2 text-sm text-tp-muted transition-colors hover:text-tp-foreground"
                >
                  {l.label}
                </Link>
              ))
            : publicLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="rounded-md px-3 py-2 text-sm text-tp-muted transition-colors hover:text-tp-foreground"
                >
                  {l.label}
                </a>
              ))}
        </div>

        {/* Right side — desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-tp-muted">
                {user?.name}
              </span>
              <div className="h-3 w-px bg-tp-border" />
              <button
                onClick={handleLogout}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-tp-border bg-tp-surface px-3.5 text-sm font-medium text-tp-foreground transition-colors hover:border-tp-border-strong hover:bg-tp-elevated cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm text-tp-muted transition-colors hover:text-tp-foreground hover:bg-tp-accent-soft"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-tp-accent px-3.5 text-sm font-medium text-tp-accent-foreground shadow-tp-sm transition-all hover:bg-tp-accent-hover"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg text-tp-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-tp-border bg-tp-surface px-4 py-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {isAuthenticated
                ? authLinks.map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm text-tp-muted hover:bg-tp-accent-soft hover:text-tp-foreground"
                    >
                      {l.label}
                    </Link>
                  ))
                : publicLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm text-tp-muted hover:bg-tp-accent-soft hover:text-tp-foreground"
                    >
                      {l.label}
                    </a>
                  ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-tp-border bg-tp-surface px-3.5 text-sm font-medium text-tp-foreground transition-colors hover:border-tp-border-strong"
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-tp-border bg-tp-surface px-3.5 text-sm font-medium text-tp-foreground transition-colors hover:border-tp-border-strong"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-tp-accent px-3.5 text-sm font-medium text-tp-accent-foreground shadow-tp-sm transition-all hover:bg-tp-accent-hover"
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
