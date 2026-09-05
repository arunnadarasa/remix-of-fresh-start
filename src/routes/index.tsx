import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, LayoutList, Rows3, LogOut, Search, AlertCircle } from "lucide-react";

import { CATEGORY_META, CATEGORY_ORDER, newsTone, type JobCategory } from "@/lib/ward-data";
import { WardProvider, useWard } from "@/lib/ward-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetupScreen } from "@/components/ward/SetupScreen";
import { PatientBoard } from "@/components/ward/PatientBoard";
import { JobsBoard } from "@/components/ward/JobsBoard";
import { AddJobDialog } from "@/components/ward/AddJobDialog";
import { HandoverDialog } from "@/components/ward/HandoverDialog";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ward Round Board — Ward 31 patient and jobs list" },
      {
        name: "description",
        content:
          "A ward round board for hospital doctors: patients by bed, NEWS scores, and jobs sorted by type and status, with handover in one click.",
      },
      { property: "og:title", content: "Ward Round Board — Ward 31" },
      {
        property: "og:description",
        content:
          "Patients by bed, NEWS scores, and ward round jobs organised by type, status and timing.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <WardProvider>
      <Shell />
    </WardProvider>
  );
}

function Shell() {
  const { session, me, patients, endShift } = useWard();
  const [scope, setScope] = useState<"mine" | "ward">("mine");
  const [view, setView] = useState<"patients" | "jobs">("patients");
  const [filter, setFilter] = useState<JobCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [newsFilter, setNewsFilter] = useState<"all" | "high" | "raised">("all");

  const visible = useMemo(() => {
    const base =
      scope === "mine" && session
        ? patients.filter((p) => session.myPatientIds.includes(p.id))
        : patients;
    const q = search.trim().toLowerCase();
    return base.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.bed.toLowerCase().includes(q) ||
        p.nhs.replace(/\s/g, "").includes(q.replace(/\s/g, ""));
      const tone = newsTone(p.news);
      const matchesNews =
        newsFilter === "all" ||
        (newsFilter === "high" && tone === "high") ||
        (newsFilter === "raised" && (tone === "high" || tone === "med"));
      return matchesSearch && matchesNews;
    });
  }, [scope, session, patients, search, newsFilter]);

  if (!session) return <SetupScreen />;


  return (
    <main className="min-h-screen bg-surface pb-16">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{session.ward.split(" — ")[0]}</p>
              <p className="text-[11px] text-muted-foreground">
                {me?.name} · bleep <span className="font-mono">{me?.bleep}</span>
              </p>
            </div>
          </div>

          <Segmented
            value={scope}
            onChange={(v) => setScope(v as "mine" | "ward")}
            options={[
              { value: "mine", label: `My patients (${session.myPatientIds.length})` },
              { value: "ward", label: `Whole ward (${patients.length})` },
            ]}
          />

          <Segmented
            value={view}
            onChange={(v) => setView(v as "patients" | "jobs")}
            options={[
              { value: "patients", label: "Patients", icon: <Rows3 className="h-3.5 w-3.5" /> },
              { value: "jobs", label: "Jobs", icon: <LayoutList className="h-3.5 w-3.5" /> },
            ]}
          />

          <div className="ml-auto flex items-center gap-2">
            <AddJobDialog />
            <HandoverDialog
              patients={visible}
              scope={scope === "mine" ? `${me?.initials} patients` : session.ward.split(" — ")[0]!}
            />
            <Button size="sm" variant="ghost" onClick={endShift} title="End shift">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {view === "jobs" && (
          <div className="mx-auto flex max-w-7xl flex-wrap gap-1.5 px-4 pb-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              All jobs
            </FilterChip>
            {CATEGORY_ORDER.map((c) => (
              <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
                {CATEGORY_META[c].label}
              </FilterChip>
            ))}
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5">
        {view === "patients" ? (
          <PatientBoard patients={visible} />
        ) : (
          <JobsBoard patients={visible} filter={filter} />
        )}
      </div>
    </main>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="flex rounded-lg border border-border bg-background p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}
