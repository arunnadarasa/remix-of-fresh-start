import { useMemo } from "react";
import { ClipboardList } from "lucide-react";

import { CATEGORY_META, CATEGORY_ORDER, type Patient } from "@/lib/ward-data";
import { useWard } from "@/lib/ward-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function HandoverDialog({ patients, scope }: { patients: Patient[]; scope: string }) {
  const { jobs, patientById, doctorById, me } = useWard();
  const ids = useMemo(() => new Set(patients.map((p) => p.id)), [patients]);
  const outstanding = jobs.filter((j) => ids.has(j.patientId) && j.status !== "done");

  const grouped = CATEGORY_ORDER.map((c) => ({
    cat: c,
    list: outstanding
      .filter((j) => j.category === c)
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "todo" ? -1 : 1)),
  })).filter((g) => g.list.length);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ClipboardList className="h-4 w-4" /> Handover
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Handover — {scope}</DialogTitle>
          <DialogDescription>
            {outstanding.length} outstanding jobs
            {me ? ` · from ${me.name}, bleep ${me.bleep}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {grouped.map(({ cat, list }) => (
            <section key={cat}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {CATEGORY_META[cat].label} ({list.length})
              </h3>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {list.map((j) => {
                  const p = patientById(j.patientId);
                  const d = doctorById(p?.doctorId ?? null);
                  return (
                    <li key={j.id} className="flex gap-3 px-3 py-2 text-sm">
                      <span className="w-10 shrink-0 rounded bg-foreground py-0.5 text-center font-mono text-[11px] font-bold text-background">
                        {p?.bed}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{p?.name}</span>
                        <span className="text-muted-foreground"> — {j.title}</span>
                        {j.timing && (
                          <span className="text-muted-foreground"> ({j.timing})</span>
                        )}
                        {j.detail && (
                          <span className="block text-xs text-muted-foreground">{j.detail}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {j.status === "todo" ? "To do" : "To chase"}
                        {d ? ` · ${d.initials}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {grouped.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing outstanding — clean handover.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
