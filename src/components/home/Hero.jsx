import { Sparkles } from "lucide-react";
import { Image } from "@/components/ui/image";

const FEATURES = ["قیمت شفاف", "راننده حرفهای", "پیگیری لحظهای", "پرداخت در پایان سفر"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-foreground text-background">
      <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:p-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/10 px-3 py-1.5 text-[11px] font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            سرویس تشریفات شهری، شبانهروزی
          </span>
          <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.3] tracking-tight sm:text-5xl sm:leading-[1.25]">
            سفری که از لحظهٔ سوار شدن <span className="text-primary">لوکس</span> است
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-background/70 sm:text-base">
            خودروهای روز، رانندههای آموزشدیده و کرایهٔ شفاف. مقصد را بگویید، بقیهاش با ما.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2 text-[11px]">
            {FEATURES.map((feature) => (
              <li key={feature} className="rounded-full border border-background/15 px-3 py-1.5 text-background/80">
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden h-64 overflow-hidden rounded-[1.5rem] ring-1 ring-background/10 lg:block">
          <Image
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80"
            alt="کابین خودروی لوکس"
            className="h-full w-full"
            fittingType="fill"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />
          <div className="absolute bottom-4 right-4 rounded-2xl bg-background px-4 py-3 text-foreground shadow-xl">
            <p className="text-[11px] text-muted-foreground">خودروی اختصاصی</p>
            <p className="mt-1 text-sm font-bold">با راننده تشریفات</p>
          </div>
        </div>
      </div>
    </section>
  );
}