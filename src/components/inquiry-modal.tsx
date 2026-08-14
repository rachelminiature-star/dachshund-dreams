"use client";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { resolveImage } from "@/lib/images";
import { formatPrice, SITE } from "@/lib/site";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

type Puppy = {
  id: string;
  name: string;
  slug: string;
  color: string;
  gender: string;
  price_cents: number;
  cover_image?: string | null;
};

type CartLine = {
  id: string;
  name: string;
  slug: string;
  color?: string;
  gender?: string;
  price_cents: number;
  image?: string | null;
  qty: number;
};

type Props =
  | { puppy: Puppy; items?: never; onSubmitted?: () => void; open: boolean; onOpenChange: (v: boolean) => void }
  | { items: CartLine[]; puppy?: never; onSubmitted?: () => void; open: boolean; onOpenChange: (v: boolean) => void };

export function InquiryModal(props: Props) {
  const { open, onOpenChange, onSubmitted } = props;
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", address: "", city: "", country: "", message: "",
  });

  const lines: CartLine[] = useMemo(() => {
    if ("items" in props && props.items) return props.items;
    const p = (props as any).puppy as Puppy;
    return [{
      id: p.id, name: p.name, slug: p.slug, color: p.color, gender: p.gender,
      price_cents: p.price_cents, image: p.cover_image ?? null, qty: 1,
    }];
  }, [props]);

  const isCart = lines.length > 1 || ("items" in props);
  const total = lines.reduce((s, l) => s + l.price_cents * l.qty, 0);
  const heading = isCart
    ? `Checkout — ${lines.length} ${lines.length === 1 ? "puppy" : "puppies"}`
    : `Inquire about ${lines[0]?.name}`;
  const subject = isCart
    ? `Checkout inquiry: ${lines.map((l) => l.name).join(", ")}`
    : `Inquiry: ${lines[0]?.name} (${lines[0]?.color})`;

  const defaultMessage = isCart
    ? `Hello, I'd like to reserve the following puppies:\n\n${lines.map((l) => `• ${l.name} (${l.color}${l.gender ? `, ${l.gender === "male" ? "boy" : "girl"}` : ""}) × ${l.qty} — ${formatPrice(l.price_cents * l.qty)}`).join("\n")}\n\nTotal: ${formatPrice(total)}\n\nPlease share next steps for reservation and pickup.`
    : `Hello, I'm interested in adopting ${lines[0]?.name} (${lines[0]?.color} ${lines[0]?.gender === "male" ? "boy" : "girl"}, ${formatPrice(lines[0]?.price_cents ?? 0)}). Please share next steps and availability.`;

  function update<K extends keyof typeof form>(k: K, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please fill in your name and email");
      return;
    }
    setSubmitting(true);
    try {
      const itemsSummary = lines.map((l, i) => ({
        [`item_${i + 1}`]: `${l.name} · ${l.color ?? ""}${l.gender ? ` · ${l.gender === "male" ? "Boy" : "Girl"}` : ""} · Qty ${l.qty} · ${formatPrice(l.price_cents * l.qty)} · https://${SITE.domain}/puppies/${l.slug}`,
      })).reduce((acc, cur) => ({ ...acc, ...cur }), {} as Record<string, string>);

      const res = await fetch(SITE.formSubmitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: subject,
          _template: "table",
          _captcha: "false",
          inquiry_type: isCart ? "Cart checkout" : "Single puppy",
          ...itemsSummary,
          total: formatPrice(total),
          name: form.name,
          email: form.email,
          address: form.address,
          city: form.city,
          country: form.country,
          message: form.message || defaultMessage,
        }),
      });
      if (!res.ok) throw new Error(`Submission failed (${res.status})`);
      setDone(true);
      toast.success("Inquiry sent — we'll be in touch shortly.");
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Could not send inquiry");
    } finally {
      setSubmitting(false);
    }
  }

  function close(v: boolean) {
    onOpenChange(v);
    if (!v) setTimeout(() => { setDone(false); }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        {done ? (
          <div className="px-8 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage/20 text-sand-dark">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-display text-3xl text-foreground">Inquiry received</h2>
            <p className="mt-3 text-muted-foreground">Thank you. We'll respond personally within 24 hours.</p>
            <Button className="mt-8 rounded-full" onClick={() => close(false)}>Close</Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border bg-surface px-6 py-5">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="font-display text-2xl">{heading}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Fill in your details — we'll confirm reservation and next steps by email.
                </DialogDescription>
              </DialogHeader>

              <ul className="mt-4 space-y-2">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 rounded-xl bg-card p-2.5">
                    {l.image && <img src={resolveImage(l.image)} alt={l.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{l.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{l.color}{l.gender ? ` · ${l.gender === "male" ? "Boy" : "Girl"}` : ""} · Qty {l.qty}</p>
                    </div>
                    <span className="text-sm font-medium text-sand-dark tabular-nums">{formatPrice(l.price_cents * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</span>
                <span className="font-display text-xl text-foreground tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            <form onSubmit={submit} className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <Field label="Full name *"><Input required value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
              <Field label="Email *"><Input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
              <Field label="Country"><Input value={form.country} onChange={(e) => update("country", e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="Address"><Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street address" /></Field></div>
              <Field label="City"><Input value={form.city} onChange={(e) => update("city", e.target.value)} /></Field>
              <div className="sm:col-span-2">
                <Field label="Message">
                  <Textarea rows={5} placeholder={defaultMessage} value={form.message} onChange={(e) => update("message", e.target.value)} />
                </Field>
              </div>
              <div className="sm:col-span-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => close(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <Button type="submit" disabled={submitting} className="h-12 rounded-full px-8 bg-foreground text-background hover:bg-foreground/90">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCart ? "Submit checkout" : "Send inquiry"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>{children}</div>;
}
