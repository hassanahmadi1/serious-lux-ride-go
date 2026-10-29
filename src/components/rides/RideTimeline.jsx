import { Check } from "lucide-react";
import { STATUS_STEPS, statusMeta } from "@/lib/rideStatus";
import { cn } from "@/lib/utils";

export default function RideTimeline({ status }) {
  if (status === "cancelled") {
    return <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-900">این سفر لغو شده است.</p>;
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <ol>
      {STATUS_STEPS.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-bold",
                  done ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
              </span>
              {index < STATUS_STEPS.length - 1 && (
                <span className={cn("my-1 w-px flex-1", index < currentIndex ? "bg-foreground" : "bg-border")} />
              )}
            </div>
            <p className={cn("pb-4 pt-1 text-xs", done ? "font-semibold" : "text-muted-foreground")}>
              {statusMeta(step).label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}