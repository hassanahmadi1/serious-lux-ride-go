import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import AdminOnlyNotice from "@/components/admin/AdminOnlyNotice";
import AdminTabs from "@/components/admin/AdminTabs";
import RideAdminCard from "@/components/admin/RideAdminCard";
import { adminSetRideStatus, assignDriverToRide, getViewer, listAllRides, listDrivers } from "@/lib/server-fns";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "همه" },
  { id: "pending", label: "در انتظار" },
  { id: "accepted", label: "پذیرفته" },
  { id: "on_the_way", label: "در راه" },
  { id: "in_progress", label: "در حال سفر" },
  { id: "completed", label: "پایانیافته" },
  { id: "cancelled", label: "لغو شده" },
];

export const Route = createFileRoute("/_authed/admin/rides")({
  validateSearch: (search) => ({ status: typeof search.status === "string" ? search.status : undefined }),
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: async ({ deps }) => {
    const viewer = await getViewer();
    if (!viewer.isAdmin) return { isAdmin: false, rides: [], drivers: [] };
    const [rides, drivers] = await Promise.all([
      listAllRides({ data: { status: deps.status ?? "all" } }),
      listDrivers(),
    ]);
    return { isAdmin: true, rides, drivers };
  },
  head: () => ({ meta: [{ title: "مدیریت سفرها | لوکس راید" }] }),
  component: AdminRidesPage,
});

function AdminRidesPage() {
  const { isAdmin, rides, drivers } = Route.useLoaderData();
  const { status } = Route.useSearch();
  const activeFilter = status ?? "all";
  const router = useRouter();
  const assign = useServerFn(assignDriverToRide);
  const setStatus = useServerFn(adminSetRideStatus);

  const assignMutation = useMutation({
    mutationFn: ({ rideId, driverId }) => assign({ data: { rideId, driverId } }),
    onSuccess: async () => {
      toast.success("راننده تخصیص یافت");
      await router.invalidate();
    },
    onError: (error) => toast.error(error?.message || "تخصیص انجام نشد"),
  });

  const statusMutation = useMutation({
    mutationFn: (rideId) => setStatus({ data: { rideId, status: "cancelled" } }),
    onSuccess: async () => {
      toast.success("سفر لغو شد");
      await router.invalidate();
    },
    onError: (error) => toast.error(error?.message || "لغو انجام نشد"),
  });

  if (!isAdmin) return <AdminOnlyNotice />;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">مدیریت سفرها</h1>
        <p className="mt-1 text-xs text-muted-foreground">تخصیص راننده و پیگیری وضعیت همهٔ سفارشها</p>
      </header>

      <AdminTabs />

      <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
        {FILTERS.map((item) => (
          <Link
            key={item.id}
            to="/admin/rides"
            search={{ status: item.id }}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors",
              activeFilter === item.id
                ? "border-foreground bg-foreground text-background"
                : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {rides.length === 0 ? (
        <div className="surface px-6 py-14 text-center text-xs text-muted-foreground">سفری با این وضعیت وجود ندارد.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rides.map((ride) => (
            <RideAdminCard
              key={ride.id}
              ride={ride}
              drivers={drivers}
              busy={assignMutation.isPending || statusMutation.isPending}
              onAssign={(rideId, driverId) => assignMutation.mutate({ rideId, driverId })}
              onCancel={(rideId) => statusMutation.mutate(rideId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}