import { Car, Crown, Sparkles, Truck } from "lucide-react";
import { CAR_CLASSES, quoteRide, formatToman } from "@/lib/rideClasses";
import { cn } from "@/lib/utils";

const ICONS = { business: Car, luxury: Crown, vip: Sparkles, suv: Truck };

export default function ClassPicker({ value, onChange, distance }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CAR_CLASSES.map((item) => {
        const Icon = ICONS[item.id];
        const active = value === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-pressed={active}
            className={cn(
              "rounded-2xl border p-4 text-right transition-all",
              active
                ? "border-foreground bg-foreground text-background shadow-lg shadow-foreground/10"
                : "border-border/70 bg-card text-foreground hover:border-foreground/30 hover:bg-muted/40",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className={cn("numeric text-xs font-bold", active ? "text-primary" : "text-foreground")}>
                {formatToman(quoteRide(item.id, distance))}
              </span>
            </div>
            <p className="mt-3 text-sm font-bold">{item.label}</p>
            <p className={cn("mt-1 text-[11px] leading-5", active ? "text-background/70" : "text-muted-foreground")}>
              {item.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}