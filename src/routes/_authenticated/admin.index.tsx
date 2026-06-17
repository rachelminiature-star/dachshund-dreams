import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useServerFn } from "@tanstack/react-query";
import { useServerFn as useSrv } from "@tanstack/react-start";
import { getAdminStats, listMessages } from "@/lib/admin.functions";
import { Dog, MessageSquare, Image as ImageIcon, Star, HelpCircle, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const statsFn = useSrv(getAdminStats);
  const messagesFn = useSrv(listMessages);
  const { data: stats } = useQuery({ queryKey: ["admin", "stats"], queryFn: () => statsFn() });
  const { data: messages } = useQuery({ queryKey: ["admin", "messages"], queryFn: () => messagesFn() });

  const cards = stats
    ? [
        { label: "Available Puppies", value: stats.puppies.available, hint: `${stats.puppies.total} total`, icon: Dog, accent: "from-emerald-500/10 to-emerald-500/0" },
        { label: "Unread Messages", value: stats.messages.unread, hint: `${stats.messages.total} total`, icon: MessageSquare, accent: "from-amber-500/10 to-amber-500/0" },
        { label: "Reserved", value: stats.puppies.reserved, hint: `${stats.puppies.sold} sold`, icon: Sparkles, accent: "from-blue-500/10 to-blue-500/0" },
        { label: "Gallery Items", value: stats.gallery, hint: `${stats.testimonials} testimonials · ${stats.faqs} FAQs`, icon: ImageIcon, accent: "from-rose-500/10 to-rose-500/0" },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening at the kennel.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} pointer-events-none`} />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
                <div className="mt-3 font-display text-4xl">{c.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
              </div>
              <c.icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        ))}
        {!stats && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl border border-border bg-card animate-pulse" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent Inquiries</h2>
            <Link to="/admin/messages" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="space-y-3">
            {(messages ?? []).slice(0, 6).map((m: any) => (
              <div key={m.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.name}</span>
                    {!m.read && <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sand" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{m.body}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
            {messages && messages.length === 0 && (
              <div className="text-sm text-muted-foreground py-8 text-center">No inquiries yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickLink to="/admin/puppies" icon={Dog} label="Manage puppies" />
            <QuickLink to="/admin/gallery" icon={ImageIcon} label="Edit gallery" />
            <QuickLink to="/admin/testimonials" icon={Star} label="Add testimonial" />
            <QuickLink to="/admin/faqs" icon={HelpCircle} label="Update FAQs" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 hover:bg-accent transition-colors">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
