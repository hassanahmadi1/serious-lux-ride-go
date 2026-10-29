import { Car, Pencil, Star, Trash2 } from "lucide-react";
import { DriverStatusMeta } from "@/lib/rideStatus";
import { carClass } from "@/lib/rideClasses";

export default function DriverCard({ driver, onEdit, onDelete }) {
  const meta = DriverStatusMeta(driver.status);

  return (
    <article className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
            <Car className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold">{driver.full_name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {driver.car_model} · {carClass(driver.car_class).label}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[11px] font-extrabold text-primary-foreground">
          <Star className="h-3 w-3" aria-hidden="true" />
          {Number(driver.rating || 5).toLocaleString("fa-IR")}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 font-semibold">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
          {meta.label}
        </span>
        <span className="text-muted-foreground" dir="ltr">
          {driver.plate_number}
        </span>
        {driver.active === false && (
          <span className="rounded-full bg-rose-100 px-2 py-1 font-semibold text-rose-900">غیرفعال</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
        <p className="truncate text-[11px] text-muted-foreground" dir="ltr">
          {driver.user_email || "بدون حساب کاربری"}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(driver)}
            aria-label="ویرایش راننده"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(driver)}
            aria-label="حذف راننده"
            className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}