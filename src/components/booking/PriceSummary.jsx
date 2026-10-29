import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { carClass, formatToman, quoteRide } from "@/lib/rideClasses";

export default function PriceSummary({ classId, distance, busy }) {
  const selected = carClass(classId);
  const km = Math.max(1, Number(distance) || 0);
  const total = quoteRide(classId, km);

  return (
    <div className="rounded-3xl border border-border/70 bg-muted/50 p-5">
      <h3 className="text-sm font-bold">خلاصه سفارش</h3>

      <dl className="mt-4 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">کلاس خودرو</dt>
          <dd className="font-semibold">{selected.label}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">مسافت</dt>
          <dd className="numeric font-semibold">{km.toLocaleString("fa-IR")} کیلومتر</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">کرایه پایه</dt>
          <dd className="numeric">{formatToman(selected.base)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">هزینه هر کیلومتر</dt>
          <dd className="numeric">{formatToman(selected.perKm)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">مبلغ تقریبی</span>
        <span className="numeric text-xl font-extrabold">{formatToman(total)}</span>
      </div>

      <Button type="submit" disabled={busy} className="mt-5 h-12 w-full rounded-xl text-sm font-bold">
        {busy ? (
          <>
            <Loader2 className="ms-2 h-4 w-4 animate-spin" aria-hidden="true" />
            در حال ثبت…
          </>
        ) : (
          <>
            ثبت درخواست سفر
            <ArrowLeft className="ms-2 h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        پرداخت پس از پایان سفر
      </p>
    </div>
  );
}