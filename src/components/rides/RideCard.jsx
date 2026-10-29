import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, CalendarClock, User } from "lucide-react";
import StatusBadge from "@/components/rides/StatusBadge";
import { carClass, formatToman } from "@/lib/rideClasses";
import { formatDateTime } from "@/lib/format";

export default function RideCard({ ride }) {
  return (
    <Link
      to="/rides/$rideId"
      params={{ rideId: ride.id }}
      className="surface group block p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
    >
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={ride.status} />
        <span className="numeric text-sm font-bold">{formatToman(ride.price)}</span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
          <p className="line-clamp-1 text-sm font-medium">{ride.pickup_address}</p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-hidden="true" />
          <p className="line-clamp-1 text-sm text-muted-foreground">{ride.dropoff_address}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDateTime(ride.scheduled_at || ride.created_date)}
        </span>
        <span>{carClass(ride.car_class).label}</span>
        {ride.driver_name && (
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            {ride.driver_name}
          </span>
        )}
        <span className="mr-auto inline-flex items-center gap-1 font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
          جزئیات
          <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}