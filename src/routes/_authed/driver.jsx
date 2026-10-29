import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Car, Star } from "lucide-react";
import ActiveRideCard from "@/components/driver/ActiveRideCard";
import JobCard from "@/components/driver/JobCard";
import StatusBadge from "@/components/rides/StatusBadge";
import { acceptRide, advanceRide, getDriverFeed } from "@/lib/server-fns";
import { DriverStatusMeta } from "@/lib/rideStatus";
import { formatToman } from "@/lib/rideClasses";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/driver")({
  loader: () => getDriverFeed(),
  head: () => ({ meta: [{ title: "پنل راننده | لوکس راید" }] }),
  component: DriverPage,
});

function DriverPage() {
  const feed = Route.useLoaderData();
  const router = useRouter();
  const accept = useServerFn(acceptRide);
  const advance = useServerFn(advanceRide);

  const acceptMutation = useMutation({
    mutationFn: (rideId) => accept({ data: { rideId } }),
    onSuccess: async () => {
      toast.success("سفر پذیرفته شد");
      await router.invalidate();
    },
    onError: (error) => toast.error(error?.message || "پذیرش سفر انجام نشد"),
  });

  const advanceMutation = useMutation({
    mutationFn: (rideId) => advance({ data: { rideId } }),
    onSuccess: async () => {
      toast.success("وضعیت سفر بهروزرسانی شد");
      await router.invalidate();
    },
    onError: (error) => toast.error(error?.message || "بهروزرسانی انجام نشد"),
  });

  if (!feed.driver) {
    return (
      <div className="surface mx-auto max-w-xl px-6 py-14 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-foreground">
          <Car className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-lg font-extrabold">حساب راننده فعال نیست</h1>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          برای دریافت سفر، مدیر شرکت باید ایمیل حساب شما را در فهرست رانندگان ثبت کند.
        </p>
      </div>
    );
  }

  const status = DriverStatusMeta(feed.driver.status);
  const active = feed.assigned[0] ?? null;

  return (
    <div className="space-y-6">
      <header className="surface flex flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-foreground text-background">
            <Car className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">{feed.driver.full_name}</h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {feed.driver.car_model} · {feed.driver.plate_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold">
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
            {status.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-extrabold text-primary-foreground">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            {Number(feed.driver.rating || 5).toLocaleString("fa-IR")}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-base font-extrabold">درخواستهای در دسترس</h2>
            <span className="numeric text-[11px] text-muted-foreground">
              {feed.available.length.toLocaleString("fa-IR")} سفر
            </span>
          </div>

          {feed.available.length === 0 ? (
            <div className="surface px-6 py-12 text-center text-xs text-muted-foreground">
              در حال حاضر سفری در انتظار پذیرش نیست.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {feed.available.map((ride) => (
                <JobCard
                  key={ride.id}
                  ride={ride}
                  onAccept={(rideId) => acceptMutation.mutate(rideId)}
                  busy={acceptMutation.isPending}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-extrabold">سفر جاری</h2>
          {active ? (
            <ActiveRideCard
              ride={active}
              onAdvance={(rideId) => advanceMutation.mutate(rideId)}
              busy={advanceMutation.isPending}
            />
          ) : (
            <div className="surface px-6 py-10 text-center text-xs text-muted-foreground">
              سفری به شما تخصیص نیافته است.
            </div>
          )}

          <h2 className="pt-2 text-base font-extrabold">سابقهٔ سفرها</h2>
          {feed.history.length === 0 ? (
            <div className="surface px-6 py-8 text-center text-xs text-muted-foreground">سابقهای ثبت نشده است.</div>
          ) : (
            <ul className="surface divide-y divide-border/70 overflow-hidden">
              {feed.history.map((ride) => (
                <li key={ride.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{ride.dropoff_address}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDateTime(ride.updated_date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={ride.status} />
                    <span className="numeric text-[11px] font-semibold">{formatToman(ride.price)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}