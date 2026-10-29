export const RIDE_STATUS = {
  pending: { label: "در انتظار راننده", tone: "bg-amber-100 text-amber-900 border-amber-200" },
  accepted: { label: "راننده پذیرفت", tone: "bg-sky-100 text-sky-900 border-sky-200" },
  on_the_way: { label: "در راه مبدأ", tone: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  in_progress: { label: "در حال سفر", tone: "bg-violet-100 text-violet-900 border-violet-200" },
  completed: { label: "پایان یافته", tone: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  cancelled: { label: "لغو شده", tone: "bg-rose-100 text-rose-900 border-rose-200" },
};

export const STATUS_STEPS = ["pending", "accepted", "on_the_way", "in_progress", "completed"];

export const ACTIVE_STATUSES = ["pending", "accepted", "on_the_way", "in_progress"];

export function statusMeta(status) {
  return RIDE_STATUS[status] ?? RIDE_STATUS.pending;
}

export function DriverStatusMeta(status) {
  if (status === "available") return { label: "آماده", dot: "bg-emerald-500" };
  if (status === "busy") return { label: "در سفر", dot: "bg-amber-500" };
  return { label: "آفلاین", dot: "bg-neutral-400" };
}