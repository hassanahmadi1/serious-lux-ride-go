// کلاسهای خودرو و محاسبه کرایه. هم سمت سرور و هم سمت مرورگر استفاده میشود.
export const CAR_CLASSES = [
  {
    id: "business",
    label: "بیزینس",
    description: "سدانهای اجرایی، آرام و شیک",
    base: 90000,
    perKm: 28000,
    seats: 4,
  },
  {
    id: "luxury",
    label: "لوکس",
    description: "مرسدس E-Class، BMW سری ۵",
    base: 150000,
    perKm: 42000,
    seats: 4,
  },
  {
    id: "vip",
    label: "ویآیپی",
    description: "تشریفات با راننده اختصاصی",
    base: 240000,
    perKm: 62000,
    seats: 4,
  },
  {
    id: "suv",
    label: "شاسیبلند",
    description: "فضای بیشتر برای گروه و بار",
    base: 180000,
    perKm: 48000,
    seats: 6,
  },
];

export function carClass(classId) {
  return CAR_CLASSES.find((item) => item.id === classId) ?? CAR_CLASSES[0];
}

export function quoteRide(classId, distanceKm) {
  const selected = carClass(classId);
  const km = Math.max(1, Number(distanceKm) || 0);
  return Math.round((selected.base + selected.perKm * km) / 1000) * 1000;
}

export function formatToman(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("fa-IR")} تومان`;
}