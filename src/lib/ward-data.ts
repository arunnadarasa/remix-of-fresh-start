export type JobCategory =
  | "bedside"
  | "imaging"
  | "review"
  | "referral"
  | "discharge"
  | "tto"
  | "communication";

export type JobStatus = "todo" | "chase" | "done";

export const CATEGORY_META: Record<
  JobCategory,
  { label: string; short: string; hint: string }
> = {
  bedside: {
    label: "Bedside jobs",
    short: "Bedside",
    hint: "Bloods, cannulas, catheters, ECGs, ABG/VBG, DRE",
  },
  imaging: { label: "Imaging", short: "Imaging", hint: "Ordering and chasing scans" },
  review: { label: "Clinical reviews", short: "Review", hint: "Unwell patients, high NEWS" },
  referral: { label: "Referrals", short: "Referral", hint: "Discussions with other specialties" },
  discharge: { label: "Discharge letters", short: "Discharge", hint: "Discharge summaries" },
  tto: { label: "TTOs", short: "TTO", hint: "To take out medications" },
  communication: {
    label: "Communications",
    short: "Comms",
    hint: "Family updates, DNACPR discussions",
  },
};

export const CATEGORY_ORDER: JobCategory[] = [
  "bedside",
  "imaging",
  "review",
  "referral",
  "discharge",
  "tto",
  "communication",
];

export const STATUS_META: Record<JobStatus, { label: string }> = {
  todo: { label: "To do" },
  chase: { label: "To chase" },
  done: { label: "Done" },
};

export type Job = {
  id: string;
  patientId: string;
  category: JobCategory;
  title: string;
  detail?: string | undefined;
  status: JobStatus;
  /** e.g. "After 14:00" / "Before ward round" */
  timing?: string | undefined;
  /** true when the job auto-spawned a follow-up chase job */
  spawnedChase?: boolean | undefined;
};

export type Doctor = {
  id: string;
  name: string;
  initials: string;
  bleep: string;
};

export type Patient = {
  id: string;
  name: string;
  nhs: string;
  age: number;
  sex: "M" | "F";
  area: string;
  bed: string;
  news: number;
  summary: string;
  doctorId: string | null;
};

export const AREAS = ["Bay A", "Bay B", "Bay C", "Bay D"];

export const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr Amara Osei", initials: "AO", bleep: "2214" },
  { id: "d2", name: "Dr Rahul Menon", initials: "RM", bleep: "2187" },
  { id: "d3", name: "Dr Sofia Lindqvist", initials: "SL", bleep: "2301" },
];

export function initialsOf(name: string) {
  const parts = name.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

const FIRST = [
  "Margaret", "Ivor", "Bernadette", "Colin", "Priya", "Wilfred", "Doreen", "Hassan",
  "Eunice", "Terence", "Gwen", "Malcolm", "Aisha", "Norman", "Sylvia", "Errol",
  "Joyce", "Frank", "Nadia", "Stanley", "Beryl", "Dev", "Mavis", "Alan",
  "Rita", "Godfrey", "Yvonne", "Peter", "Lily", "Omar", "Vera", "Kenneth",
  "Grace", "Duncan", "Marta", "Roy", "Edna", "Tomas", "Pauline", "Baxter",
  "Irene", "Nigel", "Fatima", "Harold", "Sheila", "Jonty", "Agnes", "Clive",
];
const LAST = [
  "Whitcombe", "Adeyemi", "Kowalski", "Brennan", "Nair", "Featherstone", "Okonkwo",
  "Rahman", "Balfour", "Marchetti", "Pryce", "Donnelly", "Salim", "Hargreaves",
  "Ferreira", "Baptiste", "Tulloch", "Sandhu", "Novak", "Ellery", "Achebe",
  "Kaur", "Strachan", "Lindberg",
];
const SUMMARIES = [
  "CAP, day 3 IV co-amoxiclav",
  "Decompensated heart failure",
  "#NOF, post-op day 2",
  "Infective exacerbation COPD",
  "AKI on CKD 3b",
  "Upper GI bleed, stable",
  "Delirium, ?source",
  "Cellulitis right leg",
  "New AF with fast ventricular rate",
  "Pulmonary embolism, on apixaban",
  "Sepsis, urinary source",
  "Hyponatraemia, Na 124",
  "Alcohol withdrawal, CIWA scored",
  "DKA resolved, back on s/c insulin",
  "Fall, awaiting POC restart",
  "Small bowel obstruction, conservative",
];

type Seed = { c: JobCategory; t: string; s: JobStatus; d?: string; time?: string };
const JOB_SEEDS: Seed[] = [
  { c: "bedside", t: "Cannula — 20G, pink tissued", s: "todo" },
  { c: "bedside", t: "Repeat FBC, U&E, CRP", s: "todo", time: "Before 11:00" },
  { c: "bedside", t: "ECG — palpitations overnight", s: "todo" },
  { c: "bedside", t: "VBG — check lactate", s: "todo" },
  { c: "bedside", t: "Male catheter — retention 600ml", s: "todo" },
  { c: "bedside", t: "ABG on 4L", s: "chase", d: "Sample sent to blood gas machine" },
  { c: "bedside", t: "Digital rectal exam — melaena?", s: "todo" },
  { c: "bedside", t: "Chase morning bloods", s: "chase", d: "Taken 07:40" },
  { c: "imaging", t: "Request CT abdo/pelvis with contrast", s: "todo" },
  { c: "imaging", t: "Chase CXR report", s: "chase", d: "Performed 08:15" },
  { c: "imaging", t: "Book USS doppler — ?DVT", s: "todo", time: "Before 15:00" },
  { c: "imaging", t: "Chase CT head report", s: "chase" },
  { c: "imaging", t: "Discuss MRI spine with radiology", s: "todo" },
  { c: "review", t: "Clinical review — NEWS 7", s: "todo" },
  { c: "review", t: "Review post-transfusion obs", s: "chase", time: "After 14:00" },
  { c: "review", t: "Review fluid balance and output", s: "todo" },
  { c: "referral", t: "Refer to cardiology — new AF", s: "todo" },
  { c: "referral", t: "Discuss with microbiology re: abx", s: "chase" },
  { c: "referral", t: "Refer to SALT — unsafe swallow", s: "todo" },
  { c: "referral", t: "Gastro opinion re: endoscopy", s: "chase" },
  { c: "discharge", t: "Discharge summary", s: "todo", time: "Before 16:00" },
  { c: "discharge", t: "Discharge letter — GP follow-up 1/52", s: "todo" },
  { c: "tto", t: "TTO — 5 days co-amoxiclav", s: "todo" },
  { c: "tto", t: "TTO — chase pharmacy screen", s: "chase" },
  { c: "communication", t: "Update daughter (NOK) by phone", s: "todo", time: "After 13:00" },
  { c: "communication", t: "DNACPR discussion with patient", s: "todo" },
  { c: "communication", t: "Family meeting re: ceiling of care", s: "todo", time: "After 15:00" },
  { c: "communication", t: "Call GP for collateral history", s: "chase" },
];

const DONE_SEEDS: Seed[] = [
  { c: "bedside", t: "Bloods taken", s: "done" },
  { c: "imaging", t: "CXR requested", s: "done" },
  { c: "tto", t: "TTO written and signed", s: "done" },
  { c: "communication", t: "Spoke to son, updated", s: "done" },
];

/** Deterministic pseudo-random so SSR and client agree. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

export function buildWard() {
  const rand = rng(31);
  const patients: Patient[] = [];
  const jobs: Job[] = [];

  AREAS.forEach((area, ai) => {
    for (let i = 0; i < 12; i++) {
      const bedNum = ai * 12 + i + 1;
      const id = `p${bedNum}`;
      const name = `${FIRST[(ai * 12 + i) % FIRST.length]} ${
        LAST[Math.floor(rand() * LAST.length)]
      }`;
      const news = [0, 0, 1, 1, 2, 2, 3, 4, 5, 7][Math.floor(rand() * 10)] ?? 0;
      patients.push({
        id,
        name,
        nhs: `${400 + bedNum} ${Math.floor(100 + rand() * 899)} ${Math.floor(
          1000 + rand() * 8999,
        )}`,
        age: 42 + Math.floor(rand() * 50),
        sex: rand() > 0.5 ? "F" : "M",
        area,
        bed: `${area.replace("Bay ", "")}${i + 1}`,
        news,
        summary: SUMMARIES[Math.floor(rand() * SUMMARIES.length)] ?? "Medical inpatient",
        doctorId: null,
      });

      const count = Math.floor(rand() * 4); // 0-3 open jobs
      const used = new Set<number>();
      for (let j = 0; j < count; j++) {
        let k = Math.floor(rand() * JOB_SEEDS.length);
        while (used.has(k)) k = (k + 1) % JOB_SEEDS.length;
        used.add(k);
        const seed = JOB_SEEDS[k]!;
        jobs.push({
          id: `${id}-j${j}`,
          patientId: id,
          category: seed.c,
          title: seed.t,
          status: seed.s,
          ...(seed.d ? { detail: seed.d } : {}),
          ...(seed.time ? { timing: seed.time } : {}),
        });
      }
      if (rand() > 0.6) {
        const seed = DONE_SEEDS[Math.floor(rand() * DONE_SEEDS.length)]!;
        jobs.push({
          id: `${id}-jd`,
          patientId: id,
          category: seed.c,
          title: seed.t,
          status: "done",
        });
      }
      if (news >= 5) {
        jobs.push({
          id: `${id}-jn`,
          patientId: id,
          category: "review",
          title: `Clinical review — NEWS ${news}`,
          detail: "Escalated by nursing staff",
          status: "todo",
        });
      }

    }
  });

  return { patients, jobs };
}

/** Jobs that create a follow-up "chase" job when marked done. */
export function chaseFollowUp(job: Job): Omit<Job, "id"> | null {
  const t = job.title.toLowerCase();
  if (job.category === "imaging" && /(request|order|book|arrange)/.test(t)) {
    return {
      patientId: job.patientId,
      category: "imaging",
      title: `Chase result — ${job.title.replace(/^(request|order|book|arrange)\s*/i, "")}`,
      detail: "Auto-created after scan was requested",
      status: "chase",
    };
  }
  if (job.category === "bedside" && /(blood|fbc|u&e|crp|culture|abg|vbg|gas)/.test(t)) {
    return {
      patientId: job.patientId,
      category: "bedside",
      title: `Chase results — ${job.title}`,
      detail: "Auto-created after sample was taken",
      status: "chase",
    };
  }
  if (job.category === "referral" && /(refer|discuss|opinion)/.test(t)) {
    return {
      patientId: job.patientId,
      category: "referral",
      title: `Chase response — ${job.title}`,
      detail: "Auto-created after referral was made",
      status: "chase",
    };
  }
  return null;
}

export function newsTone(news: number) {
  if (news >= 5) return "high" as const;
  if (news >= 3) return "med" as const;
  return "low" as const;
}
