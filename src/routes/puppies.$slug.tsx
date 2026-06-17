import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { puppyQuery } from "@/lib/queries";
import { resolveImage } from "@/lib/images";
import { formatPrice, puppyAge, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/puppies/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(puppyQuery(params.slug));
    if (!data?.data) throw notFound();
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: `Meet a Puppy — Rachel Miniature Dachshunds` },
      { name: "description", content: `A health-tested AKC miniature dachshund puppy from Rachel Miniature Dachshunds.` },
      { property: "og:url", content: `/puppies/${params.slug}` },
      { property: "og:type", content: "product" },
    ],
    links: [{ rel: "canonical", href: `/puppies/${params.slug}` }],
  }),
  component: PuppyDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-40 text-center">
        <h1 className="font-display text-4xl">Puppy not found</h1>
        <Link to="/puppies" className="mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-sm text-background">Back to puppies</Link>
      </div>
    </SiteLayout>
  ),
});

function PuppyDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(puppyQuery(slug));
  const p = data?.data;
  if (!p) return null;

  const characteristics: string[] = Array.isArray(p.characteristics) ? p.characteristics : [];
  const images: string[] = (p.images && p.images.length > 0) ? p.images : [p.cover_image];

  return (
    <SiteLayout>
      <article className="pt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/puppies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to all puppies
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl bg-muted">
                <img src={resolveImage(images[0])} alt={p.name} className="aspect-[4/5] w-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.slice(1, 4).map((img: string, i: number) => (
                    <div key={i} className="overflow-hidden rounded-2xl bg-muted">
                      <img src={resolveImage(img)} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className={cn(
                "inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                p.status === "available" && "bg-sage/15 text-[oklch(0.42_0.06_145)]",
                p.status === "reserved" && "bg-sand/20 text-sand-dark",
                p.status === "sold" && "bg-muted text-muted-foreground"
              )}>{p.status}</span>
              <h1 className="mt-4 font-display text-5xl text-foreground sm:text-6xl">{p.name}</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                {p.gender === "male" ? "Boy" : "Girl"} · {p.color} · {p.coat} · {puppyAge(p.birth_date)}
              </p>

              <p className="mt-3 font-display text-3xl text-sand-dark">{formatPrice(p.price_cents)}</p>

              <p className="mt-8 text-base leading-relaxed text-foreground">{p.description}</p>

              {characteristics.length > 0 && (
                <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {characteristics.map((c) => (
                    <li key={c} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="h-4 w-4 text-sand-dark" /> {c}
                    </li>
                  ))}
                </ul>
              )}

              {p.parents && (
                <p className="mt-8 rounded-2xl bg-surface p-5 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Pedigree:</span> {p.parents}
                </p>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background">
                  Inquire about {p.name}
                </Link>
                <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium text-foreground hover:bg-accent">
                  WhatsApp
                </a>
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-2xl bg-surface p-4 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-sand-dark" />
                Comes with our 2-year health guarantee, AKC registration, and lifetime breeder support.
              </div>
            </div>
          </div>
        </div>
      </article>
    </SiteLayout>
  );
}
