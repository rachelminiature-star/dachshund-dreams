import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listFaqs } from "@/lib/site-data.functions";
import { upsertFaq, deleteFaq } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  component: FaqsAdmin,
});

const EMPTY = { id: null as string | null, question: "", answer: "", category: "general", sort_order: 0 };

function FaqsAdmin() {
  const listFn = useServerFn(listFaqs);
  const upFn = useServerFn(upsertFaq);
  const delFn = useServerFn(deleteFaq);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["faqs"], queryFn: () => listFn() });
  const items = data?.data ?? [];
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: typeof EMPTY) => upFn({ data: v as any }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["faqs"] }); toast.success("Saved"); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["faqs"] }); toast.success("Deleted"); },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">FAQs</h1>
          <p className="text-muted-foreground mt-1">Answer common questions from families.</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}><Plus className="h-4 w-4 mr-2" /> Add FAQ</Button>
      </div>

      <div className="space-y-3">
        {items.map((f: any) => (
          <div key={f.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{f.category}</div>
                <h3 className="font-medium mt-1">{f.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{f.answer}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setEditing({ ...EMPTY, ...f })}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) delMut.mutate(f.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit FAQ" : "New FAQ"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Question</Label><Input value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Answer</Label><Textarea rows={6} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Category</Label><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => editing && saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
