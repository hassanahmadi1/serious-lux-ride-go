export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-muted text-foreground">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="numeric mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}