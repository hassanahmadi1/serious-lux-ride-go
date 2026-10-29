import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import AdminOnlyNotice from "@/components/admin/AdminOnlyNotice";
import AdminTabs from "@/components/admin/AdminTabs";
import DriverCard from "@/components/admin/DriverCard";
import DriverDialog from "@/components/admin/DriverDialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDriver, getViewer, listDrivers, saveDriver } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed/admin/drivers")({
  loader: async () => {
    const viewer = await getViewer();
    if (!viewer.isAdmin) return { isAdmin: false, drivers: [] };
    return { isAdmin: true, drivers: await listDrivers() };
  },
  head: () => ({ meta: [{ title: "مدیریت رانندگان | لوکس راید" }] }),
  component: AdminDriversPage,
});

function AdminDriversPage() {
  const { isAdmin, drivers } = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(saveDriver);
  const remove = useServerFn(deleteDriver);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const saveMutation = useMutation({
    mutationFn: (payload) => save({ data: payload }),
    onSuccess: async () => {
      toast.success("اطلاعات راننده ذخیره شد");
      setEditing(null);
      await router.invalidate();
    },
    onError: (error) => toast.error(error?.message || "ذخیره انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => remove({ data: { id } }),
    onSuccess: async () => {
      toast.success("راننده حذف شد");
      setDeleteTarget(null);
      await router.invalidate();
    },
    onError: (error) => toast.error(error?.message || "حذف انجام نشد"),
  });

  if (!isAdmin) return <AdminOnlyNotice />;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">رانندگان</h1>
          <p className="mt-1 text-xs text-muted-foreground">خودروها، وضعیت و دسترسی حساب رانندگان</p>
        </div>
        <Button onClick={() => setEditing({})} className="h-11 rounded-xl text-xs font-bold">
          <Plus className="ms-1.5 h-4 w-4" aria-hidden="true" />
          افزودن راننده
        </Button>
      </header>

      <AdminTabs />

      {drivers.length === 0 ? (
        <div className="surface px-6 py-14 text-center text-xs text-muted-foreground">
          هنوز رانندهای ثبت نشده است.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} onEdit={setEditing} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {editing && (
        <DriverDialog
          driver={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSave={(payload) => saveMutation.mutate(payload)}
          busy={saveMutation.isPending}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">حذف راننده</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-xs leading-6">
              «{deleteTarget?.full_name}» از فهرست رانندگان حذف میشود. این کار قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl text-xs">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              className="rounded-xl bg-rose-600 text-xs hover:bg-rose-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}