import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowRight, CalendarClock, CreditCard, MapPin, Navigation, Phone, User, X } from "lucide-react";
import StatusBadge from "@/components/rides/StatusBadge";
import RideTimeline from "@/components/rides/RideTimeline";
import { Button } from "@/components/ui/button";
import { cancelRide, getRide } from "@/lib/server-fns";
import { carClass, formatToman } from "@/lib/rideClasses";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/rides/$rideId")({
  loader: async ({ params }) => {
    const ride = await getRide({ data: { id: params.rideId } });
    if (!ride) throw notFound();
    return ride;
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `سفر به ${loaderData.dropoff_address}` : "جزئیات سفر" }] }),
  component: RideDetailPage,
});

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function RideDetailPage() {
  const ride = Route.useLoaderData();
  const router = useRouter();
  const cancel = useServerFn(cancelRide);

  const mutation = useMutation({
    mutationFn: () => cancel({ data: { id: ride.id } }),
    onSuccess: async () => {
      toast.success("سفر لغو شد");
      await router.invalidate();
    },
    onError: (error) => toast.error(error?.message || "لغو سفر انجام نشد"),
  });

  const cancellable = ["pending", "accepted"].includes(ride.status);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/rides" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        بازگشت به سفرها
      </Link>

      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-5 sm:px-7">
          <div>
            <StatusBadge status={ride.status} />
            <h1 className="mt-3 text-xl font-extrabold tracking-tight">
              {ride.pickup_address} <span className="text-muted-foreground">به</span> {ride.dropoff_address}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(ride.scheduled_at || ride.created_date)}</p>
          </div>
          <div className="text-left">
            <p className="text-[11px] text-muted-foreground">کرایه</p>
            <p className="numeric text-xl font-extrabold">{formatToman(ride.price)}</p>
          </div>
        </div>

        <div className="grid gap-7 px-5 py-6 sm:px-7 md:grid-cols-2">
          <div className="space-y-5">
            <InfoRow icon={MapPin} label="مبدأ" value={ride.pickup_address} />
            <InfoRow icon={Navigation} label="مقصد" value={ride.dropoff_address} />
            <InfoRow icon={CalendarClock} label="زمان" value={formatDateTime(ride.scheduled_at || ride.created_date)} />
            <InfoRow icon={Phone} label="شماره تماس" value={ride.passenger_phone || "—"} />
            <InfoRow icon={CreditCard} label="پرداخت" value={ride.payment_method === "online" ? "آنلاین" : "نقدی"} />
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="text-[11px] text-muted-foreground">کلاس خودرو و مسافت</p>
              <p className="mt-1 text-sm font-semibold">
                {carClass(ride.car_class).label} · {Number(ride.distance_km || 0).toLocaleString("fa-IR")} کیلومتر
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="mb-4 text-xs font-bold">وضعیت سفر</p>
              <RideTimeline status={ride.status} />
            </div>

            {ride.driver_name ? (
              <div className="rounded-2xl border border-border/70 p-4">
                <p className="mb-3 text-xs font-bold">راننده شما</p>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{ride.driver_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {[ride.car_name, ride.plate_number].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                {ride.driver_phone && (
                  <a
                    href={`tel:${ride.driver_phone}`}
                    dir="ltr"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {ride.driver_phone}
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-4 text-xs leading-6 text-muted-foreground">
                در حال یافتن راننده مناسب برای این سفر هستیم.
              </div>
            )}

            {cancellable && (
              <Button
                variant="outline"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="w-full rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              >
                <X className="ms-2 h-4 w-4" aria-hidden="true" />
                لغو سفر
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}