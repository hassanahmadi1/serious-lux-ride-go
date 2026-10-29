import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/admin", label: "نمای کلی" },
  { to: "/admin/rides", label: "سفرها" },
  { to: "/admin/drivers", label: "رانندگان" },
];

export default function AdminTabs() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
      {TABS.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
            pathname === tab.to
              ? "border-foreground bg-foreground text-background"
              : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}