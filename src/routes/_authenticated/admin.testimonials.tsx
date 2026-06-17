import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTestimonials } from "@/lib/site-data.functions";
import { upsertTestimonial, deleteTestimonial } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: TestimonialsAdmin,
});

const EMPTY = { id: null as string | null, author_name: "", author_location: "", rating: 5, body: "", image_url: "", featured: false };

function TestimonialsAdmin() {
  const listFn = useServerFn(listTestimonials);
  const upFn = useServerFn(upsertTestimonial);
  const delFn = useServerFn(deleteTestimonial);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["testimonials"], queryFn: () => listFn() });
  const items = data?.data ?? [];
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: typeof EMPTY) => upFn({ data: v as any }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success("Saved"); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success("Deleted"); },
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Stories from puppy families.</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}><Plus className="h-4 w-4 mr-2" /> Add</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((t: any) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{t.author_name}</div>
                <div className="text-xs text-muted-foreground">{t.author_location}</div>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-sand text-sand" />)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setEditing({ ...EMPTY, ...t })}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) delMut.mutate(t.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground line-clamp-4">{t.body}</p>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit testimonial" : "New testimonial"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Author</Label><Input value={editing.author_name} onChange={(e) => setEditing({ ...editing, author_name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Location</Label><Input value={editing.author_location ?? ""} onChange={(e) => setEditing({ ...editing, author_location: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Rating (1–5)</Label><Input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Body</Label><Textarea rows={5} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Image URL (optional)</Label><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
              <div className="flex items-center gap-3"><Switch checked={editing.featured} onCheckedChange={(x) => setEditing({ ...editing, featured: x })} /><Label>Featured</Label></div>
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
