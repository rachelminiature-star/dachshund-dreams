import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function getPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
  );
}

export const listPuppies = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getPublicClient();
  const { data, error } = await sb
    .from("puppies" as never)
    .select("*")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [] as any[], error: error.message };
  return { data: (data ?? []) as any[], error: null };
});

export const getPuppyBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const sb = getPublicClient();
    const { data: row, error } = await sb
      .from("puppies" as never)
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: row as any, error: null };
  });

export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getPublicClient();
  const { data, error } = await sb
    .from("gallery_images" as never)
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return { data: [] as any[], error: error.message };
  return { data: (data ?? []) as any[], error: null };
});

export const listTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getPublicClient();
  const { data, error } = await sb
    .from("testimonials" as never)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return { data: [] as any[], error: error.message };
  return { data: (data ?? []) as any[], error: null };
});

export const listFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getPublicClient();
  const { data, error } = await sb
    .from("faqs" as never)
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return { data: [] as any[], error: error.message };
  return { data: (data ?? []) as any[], error: null };
});

const messageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(160).optional(),
  body: z.string().trim().min(10).max(4000),
  puppy_id: z.string().uuid().optional().nullable(),
  honeypot: z.string().max(0).optional(),
});

export const submitMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => messageSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.honeypot) return { ok: true };
    const sb = getPublicClient();
    const { error } = await sb.from("messages" as never).insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      body: data.body,
      puppy_id: data.puppy_id || null,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Best-effort email forwarding via Web3Forms. Runs server-side so the browser
// never sees a CORS / network failure from the third-party email relay.
const WEB3FORMS_ACCESS_KEY = "b3da3eca-66b7-45f0-b9d1-1be7e78d3b30";

export const forwardEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ payload: z.record(z.string(), z.string()).and(z.object({})) }).parse(input)
  )
  .handler(async ({ data }) => {
    const { _subject, ...rest } = data.payload as Record<string, string>;
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: _subject || "New website submission",
          from_name: "Rachel Miniature Dachshunds",
          ...rest,
        }),
      });
      const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
      if (!res.ok || !json?.success) {
        return { ok: false, error: json?.message ?? `Email relay returned ${res.status}` };
      }
      return { ok: true, error: null };
    } catch (err: any) {
      return { ok: false, error: err?.message ?? "Email relay unreachable" };
    }
  });

