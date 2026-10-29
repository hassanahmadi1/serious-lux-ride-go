import { ShieldAlert } from "lucide-react";

export default function AdminOnlyNotice() {
  return (
    <div className="surface mx-auto max-w-xl px-6 py-14 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-foreground">
        <ShieldAlert className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-lg font-extrabold">دسترسی مدیریت لازم است</h1>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        این بخش فقط برای مدیر شرکت در دسترس است.
      </p>
    </div>
  );
}