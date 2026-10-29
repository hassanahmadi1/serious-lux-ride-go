import { MapPin, Navigation, Route as RouteIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { carClass, formatToman } from "@/lib/rideClasses";
import { formatDateTime } from "@/lib/format";

export default function JobCard({ ride, onAccept, busy }) {
  return (
    <article className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">{formatDateTime(ride.scheduled_at || ride.created_date)}</p>
          <p className="mt-1 text-sm font-bold">{carClass(ride.car_class).label}</p>
        </div>
        <p className="numeric text-sm font-extrabold">{formatToman(ride.price)}</p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm">{ride.pickup_address}</p>
        </div>
        <div className="flex items-start gap-2.5">
          <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{ride.dropoff_address}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <RouteIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {Number(ride.distance_km || 0).toLocaleString("fa-IR")} کیلومتر
        </span>
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" aria-hidden="true" />
          {ride.passenger_name || "مسافر"}
        </span>
      </div>

      <Button onClick={() => onAccept(ride.id)} disabled={busy} className="mt-4 h-11 w-full rounded-xl text-sm font-bold">
        پذیرش سفر
      </Button>
    </article>
  );
}