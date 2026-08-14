import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMessages, markMessageRead, deleteMessage } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Trash2, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const listFn = useServerFn(listMessages);
  const markFn = useServerFn(markMessageRead);
  const delFn = useServerFn(deleteMessage);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin", "messages"], queryFn: () => listFn() });

  const markMut = useMutation({
    mutationFn: (vars: { id: string; read: boolean }) => markFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Message deleted");
    },
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Inquiries</h1>
        <p className="text-muted-foreground mt-1">Messages submitted through the contact form.</p>
      </div>
      <div className="space-y-3">
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {(data ?? []).map((m: any) => (
          <article key={m.id} className={`rounded-2xl border bg-card p-5 transition ${m.read ? "border-border" : "border-foreground/20 shadow-soft"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{m.name}</h3>
                  {!m.read && <span className="rounded-full bg-foreground text-background px-2 py-0.5 text-[10px] uppercase tracking-wide">New</span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-foreground"><Mail className="h-3 w-3" />{m.email}</a>
                  {m.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
                  <span>{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</span>
                </div>
                {m.subject && <div className="mt-2 text-sm font-medium">{m.subject}</div>}
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => markMut.mutate({ id: m.id, read: !m.read })}>
                  <Check className="h-3.5 w-3.5 mr-1" /> {m.read ? "Mark unread" : "Mark read"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this message?")) delMut.mutate(m.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </article>
        ))}
        {data && data.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            No inquiries yet.
          </div>
        )}
      </div>
    </div>
  );
}
