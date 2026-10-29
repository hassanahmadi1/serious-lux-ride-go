import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, ListChecks, Wallet } from "lucide-react";
import AdminOnlyNotice from "@/components/admin/AdminOnlyNotice";
import AdminTabs from "@/components/admin/AdminTabs";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/rides/StatusBadge";
import { getAdminOverview, getViewer } from "@/lib/server-fns";
import { formatToman } from "@/lib/rideClasses";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/")({
  loader: async () => {
    const viewer = await getViewer();
    if (!viewer.isAdmin) return { isAdmin: false, overview: null };
    return { isAdmin: true, overview: await getAdminOverview() };
  },
  head: () => ({ meta: [{ title: "پنل مدیریت | لوکس راید" }] }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { isAdmin, overview } = Route.useLoaderData();
  if (!isAdmin) return <AdminOnlyNotice />;

  const active = (overview.byStatus.accepted ?? 0) + (overview.byStatus.on_the_way ?? 0) + (overview.byStatus.in_progress ?? 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">پنل مدیریت شرکت</h1>
          <p className="mt-1 text-xs text-muted-foreground">نمای کلی سفارشها، رانندگان و درآمد</p>
        </div>
        <Link
          to="/admin/drivers"
          className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm"
        >
          مدیریت رانندگان
        </Link>
      </header>

      <AdminTabs />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="کل سفارشها" value={overview.total.toLocaleString("fa-IR")} icon={ListChecks} hint="همهٔ سفرهای ثبتشده" />
        <StatCard label="در انتظار راننده" value={(overview.byStatus.pending ?? 0).toLocaleString("fa-IR")} icon={Clock} hint="نیازمند تخصیص" />
        <StatCard label="در جریان" value={active.toLocaleString("fa-IR")} icon={CheckCircle2} hint="پذیرفته تا پایان سفر" />
        <StatCard label="درآمد تکمیلشده" value={formatToman(overview.revenue)} icon={Wallet} hint="مجموع سفرهای پایانیافته" />
      </div>

      <section className="surface overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <h2 className="text-sm font-extrabold">آخرین سفرها</h2>
          <Link to="/admin/rides" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground">
            مشاهدهٔ همه
          </Link>
        </div>
        {overview.recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-xs text-muted-foreground">هنوز سفری ثبت نشده است.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {overview.recent.map((ride) => (
              <li key={ride.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
                    {ride.pickup_address} <span className="text-muted-foreground">به</span> {ride.dropoff_address}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {ride.passenger_name || "مسافر"} · {formatDateTime(ride.created_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={ride.status} />
                  <span className="numeric text-xs font-bold">{formatToman(ride.price)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}