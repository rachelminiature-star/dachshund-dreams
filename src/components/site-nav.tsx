"use client";

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteNav({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || !transparentOnTop;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        solid ? "glass-strong shadow-soft" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group" aria-label={SITE.name}>
          <span className={cn(
            "grid h-9 w-9 place-items-center rounded-full transition-colors",
            solid ? "bg-foreground text-background" : "bg-white/90 text-foreground"
          )}>
            <span className="font-display text-lg font-semibold">R</span>
          </span>
          <span className={cn(
            "hidden font-display text-lg font-medium tracking-tight transition-colors sm:block",
            solid ? "text-foreground" : "text-white drop-shadow"
          )}>
            Rachel <span className="text-sand">Dachshunds</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-sand" }}
              inactiveProps={{
                className: cn(
                  "transition-colors",
                  solid ? "text-muted-foreground hover:text-foreground" : "text-white/85 hover:text-white"
                ),
              }}
              activeOptions={{ exact: link.to === "/" }}
              className="px-3 py-2 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="ml-3 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-soft transition-transform hover:scale-[1.03]"
          >
            Inquire
          </Link>
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={cn(
            "lg:hidden grid h-11 w-11 place-items-center rounded-full transition-colors",
            solid ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10"
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 top-16 z-40 bg-background sm:top-20"
          >
            <motion.nav
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-1 px-6 py-8"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "text-sand bg-accent/40" }}
                  activeOptions={{ exact: link.to === "/" }}
                  className="rounded-xl px-4 py-4 text-lg font-medium text-foreground transition-colors hover:bg-accent/40"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-4 text-base font-medium text-background"
              >
                Inquire about a puppy
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
