import { useMemo, useState } from "react";
import { Stethoscope, Check } from "lucide-react";

import { AREAS, initialsOf } from "@/lib/ward-data";
import { useWard } from "@/lib/ward-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NewsPill } from "./bits";

const WARDS = ["Ward 31 — Acute Medicine", "Ward 12 — Respiratory", "Ward 8 — Surgery"];

export function SetupScreen() {
  const { patients, startShift } = useWard();
  const [ward, setWard] = useState(WARDS[0]!);
  const [name, setName] = useState("");
  const [bleep, setBleep] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const byArea = useMemo(
    () => AREAS.map((a) => ({ area: a, list: patients.filter((p) => p.area === a) })),
    [patients],
  );

  const ready = name.trim().length > 1 && bleep.trim().length > 2 && selected.length > 0;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Ward Round Board</h1>
            <p className="text-sm text-muted-foreground">
              Start your shift — pick a ward, sign in, and take your patients.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-3">
          <div className="md:col-span-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ward</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {WARDS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWard(w)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-colors",
                    ward === w
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border bg-background hover:bg-accent",
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground">
              Your name
            </Label>
            <Input
              id="name"
              value={name}
              placeholder="e.g. Ellie Sanderson"
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label
              htmlFor="bleep"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Bleep number
            </Label>
            <Input
              id="bleep"
              value={bleep}
              placeholder="e.g. 2276"
              onChange={(e) => setBleep(e.target.value)}
              className="mt-2 font-mono"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Initials
            </Label>
            <div className="mt-2 flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {name ? initialsOf(name) : "—"}
              </span>
              <span className="text-muted-foreground">shown on every patient you hold</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">Assign your patients</h2>
            <p className="text-xs text-muted-foreground">
              {ward.split(" — ")[0]} has {AREAS.length} bays of 12. Tap the beds you are covering.
            </p>
          </div>
          <p className="font-mono text-sm text-muted-foreground">{selected.length} selected</p>
        </div>

        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {byArea.map(({ area, list }) => (
            <div key={area} className="rounded-xl border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{area}</h3>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() =>
                    setSelected((prev) => {
                      const ids = list.map((p) => p.id);
                      const all = ids.every((i) => prev.includes(i));
                      return all
                        ? prev.filter((i) => !ids.includes(i))
                        : [...new Set([...prev, ...ids])];
                    })
                  }
                >
                  Select bay
                </button>
              </div>
              <div className="grid gap-1">
                {list.map((p) => {
                  const on = selected.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggle(p.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                        on
                          ? "border-primary bg-primary/8"
                          : "border-transparent hover:bg-accent/60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border",
                          on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {on && <Check className="h-3 w-3" />}
                      </span>
                      <span className="rounded bg-foreground px-1.5 py-0.5 font-mono text-[11px] font-bold text-background">
                        {p.bed}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                      <span className="hidden truncate text-xs text-muted-foreground sm:block sm:max-w-[10rem]">
                        {p.summary}
                      </span>
                      <NewsPill score={p.news} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 mt-6 flex justify-end">
          <Button
            size="lg"
            disabled={!ready}
            onClick={() =>
              startShift({ ward, name: name.trim(), bleep: bleep.trim(), patientIds: selected })
            }
          >
            Start shift on {ward.split(" — ")[0]}
          </Button>
        </div>
      </div>
    </main>
  );
}
