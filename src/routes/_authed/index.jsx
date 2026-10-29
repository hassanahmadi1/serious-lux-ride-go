import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Car } from "lucide-react";
import BookingForm from "@/components/booking/BookingForm";
import Hero from "@/components/home/Hero";
import RideCard from "@/components/rides/RideCard";
import { listMyRides } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed/")({
  loader: () => listMyRides(),
  head: () => ({ meta: [{ title: "رزرو سفر لوکس | لوکس راید" }] }),
  component: HomePage,
});

function HomePage() {
  const rides = Route.useLoaderData();
  const recent = rides.slice(0, 3);

  return (
    <div className="space-y-8">
      <Hero />

      <div className="relative z-10 -mt-4 md:-mt-8">
        <BookingForm />
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">سفرهای اخیر شما</h2>
            <p className="mt-1 text-xs text-muted-foreground">وضعیت هر سفر را از همینجا پیگیری کنید</p>
          </div>
          <Link
            to="/rides"
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary"
          >
            همه سفرها
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-foreground">
              <Car className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold">هنوز سفری ثبت نکردهاید</p>
            <p className="max-w-xs text-xs leading-6 text-muted-foreground">
              فرم بالا را پر کنید تا اولین سفر لوکس شما ثبت شود.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recent.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}