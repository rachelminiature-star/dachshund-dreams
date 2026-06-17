import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/motion";
import { aboutImage, breederImage } from "@/lib/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Rachel Miniature Dachshunds" },
      { name: "description", content: "Two decades of devotion to the miniature dachshund. Meet Rachel and the family behind our breeding program." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <SiteLayout>
      <div className="pt-32 sm:pt-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Our story" title="A quiet promise, kept for twenty years." description="Rachel Miniature Dachshunds began with one extraordinary little dog and a love for this breed that has never wavered." />
          <Reveal className="mt-12 overflow-hidden rounded-3xl shadow-elegant">
            <img src={aboutImage} alt="" className="aspect-[16/9] w-full object-cover" />
          </Reveal>
          <article className="prose prose-lg mx-auto mt-12 max-w-none text-foreground">
            <p className="text-lg leading-relaxed text-muted-foreground">We're a small, family-run breeding program in the heart of dachshund country. Every puppy we raise is born inside our home — not a kennel — and stays nestled in the heart of our family until the day they go home.</p>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Over the past two decades we've been entrusted to send hundreds of puppies into loving homes across the country. We've stayed in touch with most of those families. We've watched their puppies grow into beloved seniors. That continuity is what we're most proud of.</p>
            <Reveal className="my-12 overflow-hidden rounded-3xl shadow-soft">
              <img src={breederImage} alt="" className="aspect-[4/3] w-full object-cover" />
            </Reveal>
            <h2 className="mt-12 font-display text-3xl">What we believe</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Ethical breeding means breeding less, not more. It means health testing every parent, choosing temperament over trend, and matching puppies to the right families — not the first applicant. It means standing behind every puppy we've ever bred, for the entirety of their life.</p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">That's the standard we hold ourselves to. It's also the standard miniature dachshunds deserve.</p>
          </article>
        </div>
      </div>
    </SiteLayout>
  ),
});
