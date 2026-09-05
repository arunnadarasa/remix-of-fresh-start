import { useState } from "react";
import { Plus } from "lucide-react";

import { CATEGORY_META, CATEGORY_ORDER, type JobCategory, type JobStatus } from "@/lib/ward-data";
import { useWard } from "@/lib/ward-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddJobDialog({ defaultPatientId }: { defaultPatientId?: string }) {
  const { patients, addJob } = useWard();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [category, setCategory] = useState<JobCategory>("bedside");
  const [status, setStatus] = useState<JobStatus>("todo");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [timing, setTiming] = useState("");


  const submit = () => {
    if (!patientId || !title.trim()) return;
    addJob({
      patientId,
      category,
      status,
      title: title.trim(),
      ...(detail.trim() ? { detail: detail.trim() } : {}),
      ...(timing.trim() ? { timing: timing.trim() } : {}),
    });
    setTitle("");
    setDetail("");
    setTiming("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a job</DialogTitle>
          <DialogDescription>
            Jobs pulled from the record can be topped up with anything new from the round.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Patient / bed
            </Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choose a bed" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.bed} — {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Category
            </Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {CATEGORY_ORDER.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs transition-colors",
                    category === c
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border hover:bg-accent",
                  )}
                >
                  {CATEGORY_META[c].short}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="job-title" className="text-xs uppercase tracking-wide text-muted-foreground">
              Job
            </Label>
            <Input
              id="job-title"
              className="mt-1.5"
              value={title}
              placeholder="e.g. Cannula and repeat lactate"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="job-timing" className="text-xs uppercase tracking-wide text-muted-foreground">
                Timing (optional)
              </Label>
              <Input
                id="job-timing"
                className="mt-1.5"
                value={timing}
                placeholder="e.g. After 14:00"
                onChange={(e) => setTiming(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as JobStatus)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="chase">To chase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="job-detail" className="text-xs uppercase tracking-wide text-muted-foreground">
              Extra information (optional)
            </Label>
            <Textarea
              id="job-detail"
              className="mt-1.5"
              rows={2}
              value={detail}
              placeholder="Anything the next person needs to know"
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!patientId || !title.trim()}>
            Add job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
