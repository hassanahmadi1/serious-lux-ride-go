import { Link, useRouterState } from "@tanstack/react-router";
import { Car, History, LayoutDashboard, LogOut, Route as RouteIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const linksFor = (viewer) => {
  const links = [
    { to: "/", label: "رزرو سفر", icon: Car },
    { to: "/rides", label: "سفرهای من", icon: History },
  ];
  if (viewer?.driver) links.push({ to: "/driver", label: "پنل راننده", icon: RouteIcon });
  if (viewer?.isAdmin) links.push({ to: "/admin", label: "مدیریت", icon: LayoutDashboard });
  return links;
};

const isActive = (pathname, to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

export default function AppShell({ viewer, children }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { logout } = useAuth();
  const links = linksFor(viewer);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Car className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight">لوکس راید</span>
              <span className="mt-1 text-[11px] font-medium text-muted-foreground">سفر لوکس شهری</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1 md:flex">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(pathname, to)
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight">{viewer?.user?.full_name || "کاربر"}</p>
              <p className="text-[11px] text-muted-foreground">{viewer?.user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              aria-label="خروج از حساب"
              className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-16 md:pt-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {links.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-transparent",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}