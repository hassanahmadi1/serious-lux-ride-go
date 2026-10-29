import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import RideCard from "@/components/rides/RideCard";
import { listMyRides } from "@/lib/server-fns";
import { ACTIVE_STATUSES } from "@/lib/rideStatus";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";

export const Route = createFileRoute("/_authed/rides/")({
  loader: () => listMyRides(),
  head: () => ({ meta: [{ title: "سفرهای من | لوکس راید" }] }),
  component: RidesPage,
});

const FILTERS = [
  { id: "all", label: "همه" },
  { id: "active", label: "در جریان" },
  { id: "completed", label: "پایانیافته" },
  { id: "cancelled", label: "لغو شده" },
];

function RidesPage() {
  const rides = Route.useLoaderData();
  const [filter, setFilter] = useState("all");

  const visible = rides.filter((ride) => {
    if (filter === "all") return true;
    if (filter === "active") return ACTIVE_STATUSES.includes(ride.status);
    return ride.status === filter;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">سفرهای من</h1>
        <p className="mt-1 text-xs text-muted-foreground">همهٔ سفرهای ثبتشده با وضعیت لحظهای</p>
      </header>

      <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              filter === item.id
                ? "border-foreground bg-foreground text-background"
                : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-foreground">
            <Car className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold">سفری در این بخش نیست</p>
          <p className="max-w-xs text-xs leading-6 text-muted-foreground">
            از صفحهٔ رزرو سفر میتوانید درخواست جدید ثبت کنید.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}
    </div>
  );
}