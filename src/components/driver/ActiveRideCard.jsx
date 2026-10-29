import { ArrowLeft, MapPin, Navigation, Phone, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import RideTimeline from "@/components/rides/RideTimeline";
import { formatToman } from "@/lib/rideClasses";

const NEXT_LABEL = {
  accepted: "شروع حرکت به سمت مسافر",
  on_the_way: "مسافر سوار شد",
  in_progress: "پایان سفر",
};

export default function ActiveRideCard({ ride, onAdvance, busy }) {
  const label = NEXT_LABEL[ride.status];

  return (
    <div className="overflow-hidden rounded-3xl bg-foreground text-background shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-background/10 px-5 py-4">
        <p className="text-sm font-bold">سفر جاری</p>
        <span className="numeric rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold text-primary-foreground">
          {formatToman(ride.price)}
        </span>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">{ride.pickup_address}</p>
          </div>
          <div className="flex items-start gap-2.5">
            <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-background/60" aria-hidden="true" />
            <p className="text-sm text-background/70">{ride.dropoff_address}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-background/60">
          <span className="inline-flex items-center gap-1.5">
            <RouteIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {Number(ride.distance_km || 0).toLocaleString("fa-IR")} کیلومتر
          </span>
          <span>{ride.passenger_name || "مسافر"}</span>
          {ride.passenger_phone && (
            <a href={`tel:${ride.passenger_phone}`} dir="ltr" className="inline-flex items-center gap-1.5 hover:text-background">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {ride.passenger_phone}
            </a>
          )}
        </div>

        <div className="rounded-2xl bg-background/5 p-4">
          <RideTimeline status={ride.status} />
        </div>

        {label && (
          <Button onClick={() => onAdvance(ride.id)} disabled={busy} className="h-12 w-full rounded-xl text-sm font-bold">
            {label}
            <ArrowLeft className="ms-2 h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}