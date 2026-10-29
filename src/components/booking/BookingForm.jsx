import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Banknote, CalendarClock, CreditCard, MapPin, Navigation, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClassPicker from "@/components/booking/ClassPicker";
import PriceSummary from "@/components/booking/PriceSummary";
import { createRide } from "@/lib/server-fns";
import { cn } from "@/lib/utils";

const initialForm = {
  pickup_address: "",
  dropoff_address: "",
  distance_km: 12,
  passenger_phone: "",
  car_class: "luxury",
  payment_method: "cash",
};

export default function BookingForm() {
  const navigate = useNavigate();
  const router = useRouter();
  const create = useServerFn(createRide);
  const [form, setForm] = useState(initialForm);
  const [timing, setTiming] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const mutation = useMutation({
    mutationFn: (payload) => create({ data: payload }),
    onSuccess: async (ride) => {
      toast.success("درخواست سفر ثبت شد", { description: "در حال یافتن راننده مناسب…" });
      setForm(initialForm);
      setTiming("now");
      setScheduledAt("");
      await router.invalidate();
      navigate({ to: "/rides/$rideId", params: { rideId: ride.id } });
    },
    onError: (error) => toast.error(error?.message || "ثبت سفر انجام نشد"),
  });

  function submit(event) {
    event.preventDefault();
    const distance = Number(form.distance_km);
    if (!Number.isFinite(distance) || distance < 1) {
      toast.error("مسافت سفر را به کیلومتر وارد کنید");
      return;
    }
    if (timing === "later" && !scheduledAt) {
      toast.error("زمان سفر را انتخاب کنید");
      return;
    }
    mutation.mutate({
      ...form,
      distance_km: distance,
      scheduled_at: timing === "later" ? new Date(scheduledAt).toISOString() : null,
    });
  }

  return (
    <form onSubmit={submit} className="surface overflow-hidden">
      <div className="border-b border-border/70 px-5 py-5 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">رزرو سریع</p>
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight">سفر خود را ثبت کنید</h2>
          <p className="text-xs text-muted-foreground">تأیید راننده معمولاً کمتر از ۵ دقیقه</p>
        </div>
      </div>

      <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-3 py-2 transition-colors focus-within:border-foreground/30">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <Label htmlFor="pickup" className="text-[11px] font-medium text-muted-foreground">
                  مبدأ
                </Label>
                <Input
                  id="pickup"
                  value={form.pickup_address}
                  onChange={(event) => set({ pickup_address: event.target.value })}
                  placeholder="مثلاً خیابان ولیعصر، برج تجاری"
                  className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                  required
                  minLength={3}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-3 py-2 transition-colors focus-within:border-foreground/30">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
                <Navigation className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <Label htmlFor="dropoff" className="text-[11px] font-medium text-muted-foreground">
                  مقصد
                </Label>
                <Input
                  id="dropoff"
                  value={form.dropoff_address}
                  onChange={(event) => set({ dropoff_address: event.target.value })}
                  placeholder="مثلاً فرودگاه مهرآباد، ترمینال ۴"
                  className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                  required
                  minLength={3}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="distance" className="text-xs font-medium">
                مسافت تقریبی (کیلومتر)
              </Label>
              <Input
                id="distance"
                type="number"
                min={1}
                max={500}
                step={1}
                value={form.distance_km}
                onChange={(event) => set({ distance_km: event.target.value })}
                className="h-11 numeric"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium">
                شماره تماس
              </Label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  maxLength={20}
                  value={form.passenger_phone}
                  onChange={(event) => set({ passenger_phone: event.target.value })}
                  placeholder="09123456789"
                  className="h-11 ps-10 text-left"
                  required
                  minLength={8}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">کلاس خودرو</Label>
              <span className="text-[11px] text-muted-foreground">{form.distance_km || 0} کیلومتر</span>
            </div>
            <ClassPicker value={form.car_class} onChange={(value) => set({ car_class: value })} distance={form.distance_km} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">زمان سفر</Label>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/60 p-1">
                {[
                  { id: "now", label: "همین حالا" },
                  { id: "later", label: "زمانبندی" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTiming(option.id)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                      timing === option.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled" className="text-xs font-medium">
                {timing === "later" ? "تاریخ و ساعت" : "پرداخت"}
              </Label>
              {timing === "later" ? (
                <div className="relative">
                  <CalendarClock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="scheduled"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    className="h-11 ps-10"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/60 p-1">
                  {[
                    { id: "cash", label: "نقدی", icon: Banknote },
                    { id: "online", label: "آنلاین", icon: CreditCard },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => set({ payment_method: option.id })}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                        form.payment_method === option.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <PriceSummary classId={form.car_class} distance={form.distance_km} busy={mutation.isPending} />
      </div>
    </form>
  );
}