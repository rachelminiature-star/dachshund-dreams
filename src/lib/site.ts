export const SITE = {
  name: "Rachel Miniature Dachshunds",
  shortName: "Rachel Dachshunds",
  domain: "rachelminiaturedachshunds.com",
  email: "info@rachelminiaturedachshunds.com",
  phone: "+1 (000) 000-0000",
  whatsappNumber: "100000000", // placeholder per user request
  whatsappUrl: "https://wa.me/100000000",
  tagline: "Heirloom miniature dachshunds, raised in our home.",
  description:
    "AKC-registered miniature dachshund puppies raised with love, health-tested, and matched to families who'll love them forever. Long-haired, short-haired, English cream, red, and rare coats.",
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
  formSubmitUrl: "https://formsubmit.co/ajax/info@rachelminiaturedachshunds.com",
} as const;

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/puppies", label: "Puppies" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/adoption-process", label: "Process" },
  { to: "/health-guarantee", label: "Health" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function puppyAge(birthDate: string | null | undefined): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  const now = new Date();
  const weeks = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  if (weeks < 12) return `${weeks} ${weeks === 1 ? "week" : "weeks"} old`;
  const months = Math.floor(weeks / 4.345);
  return `${months} ${months === 1 ? "month" : "months"} old`;
}
