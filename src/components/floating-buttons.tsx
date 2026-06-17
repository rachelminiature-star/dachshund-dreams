"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE } from "@/lib/site";

export function FloatingWhatsApp() {
  return (
    <a
      href={SITE.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elegant transition-transform hover:scale-110 sm:h-16 sm:w-16"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" aria-hidden />
      <MessageCircle className="relative h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full glass shadow-soft text-foreground transition-transform hover:scale-110 sm:h-14 sm:w-14"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
