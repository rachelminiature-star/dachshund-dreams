import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listGallery } from "@/lib/site-data.functions";
import { upsertGallery, deleteGallery } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { resolveImage } from "@/lib/images";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: GalleryAdmin,
});

const EMPTY = { id: null as string | null, url: "", caption: "", category: "general", sort_order: 0, width: null as number | null, height: null as number | null };

function GalleryAdmin() {
  const listFn = useServerFn(listGallery);
  const upsertFn = useServerFn(upsertGallery);
  const delFn = useServerFn(deleteGallery);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["gallery"], queryFn: () => listFn() });
  const items = data?.data ?? [];
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: typeof EMPTY) => upsertFn({ data: v as any }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gallery"] }); qc.invalidateQueries({ queryKey: ["admin"] }); toast.success("Saved"); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gallery"] }); toast.success("Deleted"); },
  });

  async function upload(file: File) {
    const path = `gallery/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
    const { error } = await supabase.storage.from("puppy-media").upload(path, file);
    if (error) return toast.error(error.message);
    const { data: signed } = await supabase.storage.from("puppy-media").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signed?.signedUrl) setEditing((e) => e ? { ...e, url: signed.signedUrl } : e);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Gallery</h1>
          <p className="text-muted-foreground mt-1">Photos featured across the site.</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}><Plus className="h-4 w-4 mr-2" /> Add image</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((g: any) => (
          <div key={g.id} className="group relative overflow-hidden rounded-xl border border-border bg-card">
            <img src={resolveImage(g.url)} alt={g.caption ?? ""} className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing({ ...EMPTY, ...g })}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) delMut.mutate(g.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit image" : "Add image"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              {editing.url && <img src={resolveImage(editing.url)} alt="" className="w-full aspect-video object-cover rounded-lg" />}
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <div className="flex gap-2">
                  <Input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="URL or upload" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"><Upload className="h-3.5 w-3.5" />Upload</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Caption</Label><Input value={editing.caption ?? ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} /></div>
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
