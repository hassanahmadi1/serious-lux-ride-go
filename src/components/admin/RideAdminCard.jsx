import { Link } from "@tanstack/react-router";
import { MapPin, Navigation, Phone, User } from "lucide-react";
import StatusBadge from "@/components/rides/StatusBadge";
import { carClass, formatToman } from "@/lib/rideClasses";
import { formatDateTime } from "@/lib/format";

export default function RideAdminCard({ ride, drivers, onAssign, onCancel, busy }) {
  return (
    <article className="surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
            <User className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold">{ride.passenger_name || "مسافر"}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {formatDateTime(ride.scheduled_at || ride.created_date)} · {carClass(ride.car_class).label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ride.status} />
          <span className="numeric text-sm font-extrabold">{formatToman(ride.price)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span className="line-clamp-1">{ride.pickup_address}</span>
        </p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />
          <span className="line-clamp-1">{ride.dropoff_address}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
        {ride.driver_name ? (
          <span className="text-[11px] text-muted-foreground">
            راننده: <span className="font-semibold text-foreground">{ride.driver_name}</span>
            {ride.car_name ? ` · ${ride.car_name}` : ""}
          </span>
        ) : ride.status === "pending" ? (
          <select
            defaultValue=""
            disabled={busy}
            onChange={(event) => event.target.value && onAssign(ride.id, event.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs"
            aria-label="انتخاب راننده"
          >
            <option value="">تخصیص راننده…</option>
            {drivers
              .filter((driver) => driver.active !== false)
              .map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name} — {driver.car_model}
                </option>
              ))}
          </select>
        ) : null}

        {ride.passenger_phone && (
          <a
            href={`tel:${ride.passenger_phone}`}
            dir="ltr"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Phone className="h-3 w-3" aria-hidden="true" />
            {ride.passenger_phone}
          </a>
        )}

        <div className="mr-auto flex items-center gap-2">
          <Link
            to="/rides/$rideId"
            params={{ rideId: ride.id }}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            جزئیات
          </Link>
          {!["completed", "cancelled"].includes(ride.status) && (
            <button
              type="button"
              onClick={() => onCancel(ride.id)}
              disabled={busy}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
            >
              لغو سفر
            </button>
          )}
        </div>
      </div>
    </article>
  );
}