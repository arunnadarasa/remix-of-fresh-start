import { useMemo } from "react";

import { CATEGORY_META, CATEGORY_ORDER, type JobCategory, type Patient } from "@/lib/ward-data";
import { useWard } from "@/lib/ward-store";
import { cn } from "@/lib/utils";
import { DoneDrawer, JobRow, sortJobs } from "./bits";

export function JobsBoard({
  patients,
  filter,
}: {
  patients: Patient[];
  filter: JobCategory | "all";
}) {
  const { jobs } = useWard();
  const ids = useMemo(() => new Set(patients.map((p) => p.id)), [patients]);
  const scoped = useMemo(() => jobs.filter((j) => ids.has(j.patientId)), [jobs, ids]);
  const columns = filter === "all" ? CATEGORY_ORDER : [filter];

  return (
    <div
      className={cn(
        "grid gap-3",
        filter === "all" ? "md:grid-cols-2 xl:grid-cols-3" : "max-w-3xl grid-cols-1",
      )}
    >
      {columns.map((cat) => {
        const list = scoped.filter((j) => j.category === cat);
        const open = sortJobs(list.filter((j) => j.status !== "done"));
        const done = list.filter((j) => j.status === "done");
        return (
          <section key={cat} className="rounded-xl border border-border bg-card">
            <header className="flex items-baseline justify-between border-b border-border px-3 py-2">
              <div>
                <h2 className="text-sm font-semibold">{CATEGORY_META[cat].label}</h2>
                <p className="text-[11px] text-muted-foreground">{CATEGORY_META[cat].hint}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{open.length}</span>
            </header>
            <div className="p-1.5">
              {open.map((j) => (
                <JobRow key={j.id} job={j} showPatient />
              ))}
              {open.length === 0 && (
                <p className="px-2 py-3 text-xs text-muted-foreground">Nothing outstanding.</p>
              )}
              <DoneDrawer jobs={done} showPatient />
            </div>
          </section>
        );
      })}
    </div>
  );
}
