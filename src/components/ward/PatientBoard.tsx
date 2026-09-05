import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { AREAS, type Job, type Patient } from "@/lib/ward-data";
import { useWard } from "@/lib/ward-store";
import { cn } from "@/lib/utils";
import { DoctorChip, DoneDrawer, JobRow, NewsPill, sortJobs } from "./bits";
import { AddJobDialog } from "./AddJobDialog";


export function PatientBoard({ patients }: { patients: Patient[] }) {
  const { jobs } = useWard();
  const areas = useMemo(
    () => AREAS.map((a) => ({ area: a, list: patients.filter((p) => p.area === a) })).filter((g) => g.list.length),
    [patients],
  );

  return (
    <div className="space-y-6">
      {areas.map(({ area, list }) => (
        <section key={area}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {area}
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {list.map((p, i) => (
              <PatientRow
                key={p.id}
                patient={p}
                jobs={jobs.filter((j) => j.patientId === p.id)}
                first={i === 0}
              />
            ))}
          </div>
        </section>
      ))}
      {areas.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No patients in this view.
        </p>
      )}
    </div>
  );
}

function PatientRow({ patient, jobs, first }: { patient: Patient; jobs: Job[]; first: boolean }) {
  const { doctorById, session } = useWard();
  const [open, setOpen] = useState(false);
  const doctor = doctorById(patient.doctorId);
  const isMe = patient.doctorId === session?.doctorId;

  const todo = jobs.filter((j) => j.status === "todo");
  const chase = jobs.filter((j) => j.status === "chase");
  const done = jobs.filter((j) => j.status === "done");

  return (
    <div className={cn(!first && "border-t border-border")}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
      >
        <span className="w-10 shrink-0 rounded bg-foreground py-1 text-center font-mono text-xs font-bold text-background">
          {patient.bed}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold">{patient.name}</span>
            <span className="text-xs text-muted-foreground">
              {patient.age}
              {patient.sex}
            </span>
            <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">
              {patient.nhs}
            </span>
          </span>
          <span className="block truncate text-xs text-muted-foreground">{patient.summary}</span>
        </span>
        <DoctorChip doctor={doctor} isMe={isMe} />
        <NewsPill score={patient.news} />
        <span className="hidden w-40 shrink-0 items-center justify-end gap-1.5 text-xs sm:flex">
          {todo.length > 0 && (
            <span className="rounded bg-todo/12 px-1.5 py-0.5 font-medium text-todo">
              {todo.length} to do
            </span>
          )}
          {chase.length > 0 && (
            <span className="rounded bg-chase/15 px-1.5 py-0.5 font-medium text-chase">
              {chase.length} to chase
            </span>
          )}
          {todo.length + chase.length === 0 && (
            <span className="text-muted-foreground">clear</span>
          )}
        </span>
        <span onClick={(e) => e.stopPropagation()} className="shrink-0">
          <AddJobDialog defaultPatientId={patient.id} compact />
        </span>
        <ChevronDown

          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </div>
      {open && (
        <div className="border-t border-border bg-surface/60 px-2 py-2">
          {sortJobs([...todo, ...chase]).map((j) => (
            <JobRow key={j.id} job={j} />
          ))}
          {todo.length + chase.length === 0 && (
            <p className="px-2 py-1 text-xs text-muted-foreground">No outstanding jobs.</p>
          )}
          <DoneDrawer jobs={done} />
        </div>
      )}
    </div>
  );
}
