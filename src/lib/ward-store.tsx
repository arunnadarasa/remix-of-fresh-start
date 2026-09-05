import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  buildWard,
  chaseFollowUp,
  DOCTORS,
  initialsOf,
  type Doctor,
  type Job,
  type JobCategory,
  type JobStatus,
  type Patient,
} from "./ward-data";

export type Session = {
  ward: string;
  doctorId: string;
  myPatientIds: string[];
};

type Ctx = {
  patients: Patient[];
  jobs: Job[];
  doctors: Doctor[];
  session: Session | null;
  me: Doctor | null;
  startShift: (input: {
    ward: string;
    name: string;
    bleep: string;
    patientIds: string[];
  }) => void;
  endShift: () => void;
  setJobStatus: (jobId: string, status: JobStatus) => void;
  updateJob: (jobId: string, patch: Partial<Pick<Job, "timing" | "detail" | "category">>) => void;
  addJob: (input: {
    patientId: string;
    category: JobCategory;
    title: string;
    detail?: string;
    timing?: string;
    status: JobStatus;
  }) => void;
  patientById: (id: string) => Patient | undefined;
  doctorById: (id: string | null) => Doctor | undefined;
};

const WardContext = createContext<Ctx | null>(null);

const seed = buildWard();

export function WardProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(seed.patients);
  const [jobs, setJobs] = useState<Job[]>(seed.jobs);
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS);
  const [session, setSession] = useState<Session | null>(null);

  const startShift: Ctx["startShift"] = useCallback((input) => {
    const id = "me";
    const doc: Doctor = {
      id,
      name: input.name.startsWith("Dr") ? input.name : `Dr ${input.name}`,
      initials: initialsOf(input.name),
      bleep: input.bleep,
    };
    setDoctors((prev) => [doc, ...prev.filter((d) => d.id !== id)]);
    setPatients((prev) =>
      prev.map((p, i) => {
        if (input.patientIds.includes(p.id)) return { ...p, doctorId: id };
        // give the rest of the ward a covering doctor so the ward view reads true
        return { ...p, doctorId: p.doctorId ?? DOCTORS[i % DOCTORS.length]!.id };
      }),
    );
    setSession({ ward: input.ward, doctorId: id, myPatientIds: input.patientIds });
  }, []);

  const endShift = useCallback(() => setSession(null), []);

  const setJobStatus: Ctx["setJobStatus"] = useCallback((jobId, status) => {
    setJobs((prev) => {
      const job = prev.find((j) => j.id === jobId);
      if (!job) return prev;
      const next = prev.map((j) => (j.id === jobId ? { ...j, status } : j));
      if (status === "done" && !job.spawnedChase) {
        const follow = chaseFollowUp(job);
        if (follow) {
          next.splice(
            next.findIndex((j) => j.id === jobId) + 1,
            0,
            { ...follow, id: `${jobId}-chase-${Date.now()}` },
          );
          return next.map((j) => (j.id === jobId ? { ...j, spawnedChase: true } : j));
        }
      }
      return next;
    });
  }, []);

  const updateJob: Ctx["updateJob"] = useCallback((jobId, patch) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...patch } : j)));
  }, []);

  const addJob: Ctx["addJob"] = useCallback((input) => {
    setJobs((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        patientId: input.patientId,
        category: input.category,
        title: input.title,
        status: input.status,
        ...(input.detail ? { detail: input.detail } : {}),
        ...(input.timing ? { timing: input.timing } : {}),
      },
    ]);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      patients,
      jobs,
      doctors,
      session,
      me: session ? (doctors.find((d) => d.id === session.doctorId) ?? null) : null,
      startShift,
      endShift,
      setJobStatus,
      updateJob,
      addJob,
      patientById: (id) => patients.find((p) => p.id === id),
      doctorById: (id) => (id ? doctors.find((d) => d.id === id) : undefined),
    }),
    [patients, jobs, doctors, session, startShift, endShift, setJobStatus, updateJob, addJob],
  );

  return <WardContext.Provider value={value}>{children}</WardContext.Provider>;
}

export function useWard() {
  const ctx = useContext(WardContext);
  if (!ctx) throw new Error("useWard must be used inside WardProvider");
  return ctx;
}
