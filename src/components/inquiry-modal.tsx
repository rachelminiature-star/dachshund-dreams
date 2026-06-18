"use client";
import { useState } from "react";
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

export function InquiryModal({ puppy, open, onOpenChange }: {
  puppy: Puppy;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "", message: "",
  });

  const subject = `Inquiry: ${puppy.name} (${puppy.color})`;
  const defaultMessage = `Hello, I'm interested in adopting ${puppy.name} (${puppy.color} ${puppy.gender === "male" ? "boy" : "girl"}, ${formatPrice(puppy.price_cents)}). Please share next steps and availability.`;

  function update<K extends keyof typeof form>(k: K, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please fill in your name and email");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(SITE.formSubmitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: subject,
          _template: "table",
          _captcha: "false",
          puppy_name: puppy.name,
          puppy_slug: puppy.slug,
          puppy_color: puppy.color,
          puppy_gender: puppy.gender,
          puppy_price: formatPrice(puppy.price_cents),
          puppy_link: `https://${SITE.domain}/puppies/${puppy.slug}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          country: form.country,
          message: form.message || defaultMessage,
        }),
      });
      if (!res.ok) throw new Error(`Submission failed (${res.status})`);
      setDone(true);
      toast.success("Inquiry sent — we'll be in touch shortly.");
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
            <p className="mt-3 text-muted-foreground">Thank you for your interest in {puppy.name}. We'll respond personally within 24 hours.</p>
            <Button className="mt-8 rounded-full" onClick={() => close(false)}>Close</Button>
          </div>
        ) : (
          <>
            <div className="flex items-stretch gap-4 border-b border-border bg-surface px-6 py-5">
              {puppy.cover_image && (
                <img src={resolveImage(puppy.cover_image)} alt={puppy.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              )}
              <div className="min-w-0">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="font-display text-2xl">Inquire about {puppy.name}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {puppy.color} · {puppy.gender === "male" ? "Boy" : "Girl"} · <span className="font-medium text-sand-dark">{formatPrice(puppy.price_cents)}</span>
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <form onSubmit={submit} className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <Field label="Full name *"><Input required value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
              <Field label="Email *"><Input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
              <Field label="Phone"><Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
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
                <Button type="submit" disabled={submitting} className="h-12 rounded-full px-8">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send inquiry
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
