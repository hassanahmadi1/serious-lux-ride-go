import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CAR_CLASSES } from "@/lib/rideClasses";

const empty = {
  full_name: "",
  phone: "",
  user_email: "",
  car_model: "",
  car_class: "luxury",
  plate_number: "",
  status: "available",
  active: true,
};

export default function DriverDialog({ driver, onClose, onSave, busy }) {
  const [form, setForm] = useState(() =>
    driver
      ? {
          full_name: driver.full_name ?? "",
          phone: driver.phone ?? "",
          user_email: driver.user_email ?? "",
          car_model: driver.car_model ?? "",
          car_class: driver.car_class ?? "luxury",
          plate_number: driver.plate_number ?? "",
          status: driver.status ?? "available",
          active: driver.active !== false,
        }
      : empty,
  );
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-right text-lg font-extrabold">
            {driver ? "ویرایش راننده" : "افزودن راننده"}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(driver ? { ...form, id: driver.id } : form);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="d-name" className="text-xs">نام و نام خانوادگی</Label>
              <Input id="d-name" value={form.full_name} onChange={(e) => set({ full_name: e.target.value })} required minLength={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-phone" className="text-xs">شماره تماس</Label>
              <Input id="d-phone" dir="ltr" value={form.phone} onChange={(e) => set({ phone: e.target.value })} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-car" className="text-xs">مدل خودرو</Label>
              <Input id="d-car" value={form.car_model} onChange={(e) => set({ car_model: e.target.value })} required minLength={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-plate" className="text-xs">پلاک</Label>
              <Input id="d-plate" value={form.plate_number} onChange={(e) => set({ plate_number: e.target.value })} required minLength={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-class" className="text-xs">کلاس خودرو</Label>
              <select
                id="d-class"
                value={form.car_class}
                onChange={(e) => set({ car_class: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {CAR_CLASSES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-status" className="text-xs">وضعیت</Label>
              <select
                id="d-status"
                value={form.status}
                onChange={(e) => set({ status: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="available">آماده</option>
                <option value="busy">در سفر</option>
                <option value="offline">آفلاین</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-email" className="text-xs">ایمیل حساب کاربری راننده</Label>
            <Input
              id="d-email"
              type="email"
              dir="ltr"
              value={form.user_email}
              onChange={(e) => set({ user_email: e.target.value })}
              placeholder="driver@example.com"
            />
            <p className="text-[11px] leading-5 text-muted-foreground">
              راننده با این ایمیل وارد حساب خود میشود و سفرها را میبیند.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set({ active: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
            />
            حساب راننده فعال باشد
          </label>

          <div className="flex justify-start gap-2 pt-2">
            <Button type="submit" disabled={busy} className="h-11 rounded-xl px-6 text-sm font-bold">
              {busy && <Loader2 className="ms-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              ذخیره
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="h-11 rounded-xl text-sm">
              انصراف
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}