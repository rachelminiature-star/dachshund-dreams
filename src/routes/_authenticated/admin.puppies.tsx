import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPuppies } from "@/lib/site-data.functions";
import { upsertPuppy, deletePuppy } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { resolveImage } from "@/lib/images";
import { formatPrice } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/puppies")({
  component: PuppiesAdmin,
});

const EMPTY = {
  id: null as string | null,
  name: "", slug: "", gender: "female" as "male" | "female",
  color: "", coat: "", status: "available" as "available" | "reserved" | "sold",
  birth_date: "", price_cents: 350000, weight_estimate: "", parents: "",
  description: "", cover_image: "", images: [] as string[], featured: false,
  characteristics: {} as Record<string, any>,
};

function PuppiesAdmin() {
  const listFn = useServerFn(listPuppies);
  const upsertFn = useServerFn(upsertPuppy);
  const delFn = useServerFn(deletePuppy);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["puppies"], queryFn: () => listFn() });
  const puppies = data?.data ?? [];

  const [editing, setEditing] = useState<typeof EMPTY | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: typeof EMPTY) => upsertFn({ data: v as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["puppies"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Saved");
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["puppies"] });
      toast.success("Deleted");
    },
  });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Puppies</h1>
          <p className="text-muted-foreground mt-1">Manage litters, photos, and availability.</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}><Plus className="h-4 w-4 mr-2" /> New puppy</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {puppies.map((p: any) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card group">
            <div className="aspect-[4/3] bg-muted relative">
              {p.cover_image && (
                <img src={resolveImage(p.cover_image)} alt={p.name} className="h-full w-full object-cover" />
              )}
              <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide ${
                p.status === "available" ? "bg-emerald-600 text-white" :
                p.status === "reserved" ? "bg-amber-500 text-white" : "bg-foreground text-background"
              }`}>{p.status}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-lg truncate">{p.name}</h3>
                  <div className="text-xs text-muted-foreground">{p.color} · {p.gender}</div>
                </div>
                <div className="text-sm font-medium">{formatPrice(p.price_cents)}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing({ ...EMPTY, ...p, images: p.images ?? [], characteristics: p.characteristics ?? {}, birth_date: p.birth_date ?? "" })}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${p.name}?`)) delMut.mutate(p.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PuppyDialog
        open={!!editing}
        value={editing}
        onClose={() => setEditing(null)}
        onSave={(v) => saveMut.mutate(v)}
        saving={saveMut.isPending}
      />
    </div>
  );
}

function PuppyDialog({ open, value, onClose, onSave, saving }: {
  open: boolean; value: typeof EMPTY | null; onClose: () => void;
  onSave: (v: typeof EMPTY) => void; saving: boolean;
}) {
  const [v, setV] = useState<typeof EMPTY | null>(value);
  // sync when value changes
  if (open && value && (!v || v.id !== value.id || (!v.id && value.id === null && v !== value))) {
    // initialize on open
  }
  // simple: reset when dialog opens
  if (open && value && v === null) setV(value);
  if (!open && v !== null) setV(null);
  if (!v) return null;
  const set = <K extends keyof typeof EMPTY>(k: K, val: (typeof EMPTY)[K]) => setV({ ...v, [k]: val });

  async function handleUpload(file: File, target: "cover" | "gallery") {
    const path = `puppies/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
    const { error } = await supabase.storage.from("puppy-media").upload(path, file, { upsert: false });
    if (error) return toast.error(error.message);
    const { data: signed } = await supabase.storage.from("puppy-media").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (!signed?.signedUrl) return toast.error("Could not get URL");
    if (target === "cover") set("cover_image", signed.signedUrl);
    else set("images", [...v.images, signed.signedUrl]);
    toast.success("Uploaded");
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{v.id ? "Edit puppy" : "New puppy"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><Input value={v.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Slug"><Input value={v.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /></Field>
          <Field label="Gender">
            <Select value={v.gender} onValueChange={(x) => set("gender", x as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={v.status} onValueChange={(x) => set("status", x as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Color"><Input value={v.color} onChange={(e) => set("color", e.target.value)} /></Field>
          <Field label="Coat"><Input value={v.coat ?? ""} onChange={(e) => set("coat", e.target.value)} /></Field>
          <Field label="Birth date"><Input type="date" value={v.birth_date ?? ""} onChange={(e) => set("birth_date", e.target.value)} /></Field>
          <Field label="Price (USD)"><Input type="number" value={v.price_cents / 100} onChange={(e) => set("price_cents", Math.round(Number(e.target.value) * 100))} /></Field>
          <Field label="Weight estimate"><Input value={v.weight_estimate ?? ""} onChange={(e) => set("weight_estimate", e.target.value)} placeholder="9–11 lbs" /></Field>
          <Field label="Parents"><Input value={v.parents ?? ""} onChange={(e) => set("parents", e.target.value)} placeholder="Sire × Dam" /></Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea rows={5} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label>Cover image</Label>
            <div className="flex items-center gap-3">
              {v.cover_image && <img src={resolveImage(v.cover_image)} alt="" className="h-20 w-20 rounded-lg object-cover" />}
              <Input value={v.cover_image ?? ""} onChange={(e) => set("cover_image", e.target.value)} placeholder="Paste URL or upload" />
              <label className="cursor-pointer">
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "cover")} />
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"><Upload className="h-3.5 w-3.5" />Upload</span>
              </label>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label>Gallery images</Label>
            <div className="flex flex-wrap gap-2">
              {v.images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={resolveImage(url)} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button onClick={() => set("images", v.images.filter((_, j) => j !== i))}
                    className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-foreground text-background opacity-0 group-hover:opacity-100 transition">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="cursor-pointer grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:bg-accent">
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "gallery")} />
                <Upload className="h-5 w-5" />
              </label>
            </div>
          </div>

          <div className="sm:col-span-2 flex items-center gap-3">
            <Switch checked={v.featured} onCheckedChange={(x) => set("featured", x)} />
            <Label>Featured on home page</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(v)} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
