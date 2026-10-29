const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { quoteRide } from "@/lib/rideClasses";

const asList = (result) => (Array.isArray(result) ? result : (result?.items ?? []));
const httpError = (message, status) => Object.assign(new Error(message), { status });
const carClassSchema = z.enum(["business", "luxury", "vip", "suv"]);

function assertAdmin(user) {
  if (user?.role !== "admin") throw httpError("این بخش فقط برای مدیر شرکت در دسترس است", 403);
}

async function findDriver(base44, email) {
  const drivers = asList(await db.entities.Driver.filter({ user_email: email }));
  return drivers[0] ?? null;
}

async function requireDriver(base44, user) {
  const driver = await findDriver(base44, user.email);
  if (!driver || driver.active === false) throw httpError("حساب شما به عنوان راننده فعال ثبت نشده است", 403);
  return driver;
}

/* ---------------- viewer ---------------- */

export const getViewer = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const user = context.user;
    const driver = await findDriver(context.getBase44(), user.email);
    return {
      user: { id: user.id, full_name: user.full_name ?? "", email: user.email, role: user.role },
      isAdmin: user.role === "admin",
      driver:
        driver && driver.active !== false
          ? {
              id: driver.id,
              full_name: driver.full_name,
              status: driver.status ?? "available",
              car_model: driver.car_model,
              plate_number: driver.plate_number,
            }
          : null,
    };
  });

/* ---------------- passenger ---------------- */

export const createRide = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      pickup_address: z.string().min(3).max(200),
      dropoff_address: z.string().min(3).max(200),
      car_class: carClassSchema,
      distance_km: z.number().min(1).max(500),
      passenger_phone: z.string().min(8).max(20),
      payment_method: z.enum(["cash", "online"]),
      scheduled_at: z.string().optional().nullable(),
      notes: z.string().max(400).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const user = context.user;
    const price = quoteRide(data.car_class, data.distance_km);
    return context.getBase44().entities.Ride.create({
      pickup_address: data.pickup_address.trim(),
      dropoff_address: data.dropoff_address.trim(),
      car_class: data.car_class,
      distance_km: data.distance_km,
      passenger_phone: data.passenger_phone.trim(),
      passenger_name: user.full_name ?? "",
      payment_method: data.payment_method,
      scheduled_at: data.scheduled_at || null,
      notes: data.notes ?? "",
      price,
      status: "pending",
    });
  });

export const listMyRides = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const page = await context.getBase44().entities.Ride.filter(
      { created_by_id: context.user.id },
      { sort: "-created_date", limit: 50 },
    );
    return asList(page);
  });

export const getRide = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    try {
      return await context.getBase44().entities.Ride.get(data.id);
    } catch (error) {
      if (error?.status === 404) return null;
      throw error;
    }
  });

export const cancelRide = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const ride = await db.entities.Ride.get(data.id);
    const isOwner = ride.created_by_id === context.user.id;
    if (!isOwner && context.user.role !== "admin") throw httpError("اجازه لغو این سفر را ندارید", 403);
    if (!["pending", "accepted"].includes(ride.status)) throw httpError("این سفر در این مرحله قابل لغو نیست", 400);

    const updated = await db.asServiceRole.entities.Ride.update(ride.id, { status: "cancelled" });
    if (ride.driver_id) {
      await db.asServiceRole.entities.Driver.update(ride.driver_id, { status: "available" }).catch(() => null);
    }
    return updated;
  });

/* ---------------- driver ---------------- */

export const getDriverFeed = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const driver = await findDriver(base44, context.user.email);
    if (!driver || driver.active === false) return { driver: null, available: [], assigned: [], history: [] };

    const service = db.asServiceRole;
    const [available, assigned, history] = await Promise.all([
      service.entities.Ride.filter({ status: "pending" }, { sort: "created_date", limit: 30 }),
      service.entities.Ride.filter(
        { driver_id: driver.id, status: { $in: ["accepted", "on_the_way", "in_progress"] } },
        { sort: "-created_date", limit: 10 },
      ),
      service.entities.Ride.filter(
        { driver_id: driver.id, status: { $in: ["completed", "cancelled"] } },
        { sort: "-updated_date", limit: 20 },
      ),
    ]);

    return {
      driver: {
        id: driver.id,
        full_name: driver.full_name,
        status: driver.status ?? "available",
        car_model: driver.car_model,
        plate_number: driver.plate_number,
        rating: driver.rating ?? 5,
      },
      available: asList(available).filter((ride) => !ride.driver_id),
      assigned: asList(assigned),
      history: asList(history),
    };
  });

export const acceptRide = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ rideId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const driver = await requireDriver(base44, context.user);
    const service = db.asServiceRole;
    const ride = await service.entities.Ride.get(data.rideId);
    if (ride.status !== "pending" || ride.driver_id) throw httpError("این سفر دیگر در دسترس نیست", 400);

    const updated = await service.entities.Ride.update(ride.id, {
      status: "accepted",
      driver_id: driver.id,
      driver_name: driver.full_name,
      driver_phone: driver.phone,
      driver_email: driver.user_email ?? context.user.email,
      car_name: driver.car_model,
      plate_number: driver.plate_number,
    });
    await service.entities.Driver.update(driver.id, { status: "busy" });
    return updated;
  });

const NEXT_DRIVER_STATUS = {
  accepted: "on_the_way",
  on_the_way: "in_progress",
  in_progress: "completed",
};

export const advanceRide = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ rideId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const driver = await requireDriver(base44, context.user);
    const service = db.asServiceRole;
    const ride = await service.entities.Ride.get(data.rideId);
    if (ride.driver_id !== driver.id) throw httpError("این سفر به شما تخصیص نیافته است", 403);
    const next = NEXT_DRIVER_STATUS[ride.status];
    if (!next) throw httpError("این سفر در مرحلهای نیست که قابل بهروزرسانی باشد", 400);

    const updated = await service.entities.Ride.update(ride.id, { status: next });
    if (next === "completed") await service.entities.Driver.update(driver.id, { status: "available" });
    return updated;
  });

/* ---------------- admin ---------------- */

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context.user);
    const service = context.getBase44().asServiceRole;
    const [grouped, recent] = await Promise.all([
      service.entities.Ride.aggregate({ query: {}, groupBy: "status", sum: ["price"] }),
      service.entities.Ride.filter({}, { sort: "-created_date", limit: 6 }),
    ]);

    const byStatus = {};
    let revenue = 0;
    for (const row of grouped?.rows ?? []) {
      const key = row.status ?? row._id;
      byStatus[key] = row.count ?? 0;
      if (key === "completed") revenue = row.sum_price ?? 0;
    }
    return {
      byStatus,
      revenue,
      total: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
      recent: asList(recent),
    };
  });

export const listAllRides = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ status: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const status = data?.status;
    const query = status && status !== "all" ? { status } : {};
    const page = await context.getBase44().asServiceRole.entities.Ride.filter(query, {
      sort: "-created_date",
      limit: 100,
    });
    return asList(page);
  });

export const listDrivers = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context.user);
    const page = await context.getBase44().asServiceRole.entities.Driver.filter({}, { sort: "created_date", limit: 100 });
    return asList(page);
  });

export const saveDriver = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().optional(),
      full_name: z.string().min(2).max(80),
      phone: z.string().min(8).max(20),
      user_email: z.string().email().or(z.literal("")).optional(),
      car_model: z.string().min(2).max(80),
      car_class: carClassSchema,
      plate_number: z.string().min(3).max(20),
      status: z.enum(["available", "busy", "offline"]),
      active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const service = context.getBase44().asServiceRole;
    const { id, ...fields } = data;
    const payload = { ...fields, user_email: fields.user_email ?? "" };
    return id ? service.entities.Driver.update(id, payload) : service.entities.Driver.create({ ...payload, active: true });
  });

export const deleteDriver = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    await context.getBase44().asServiceRole.entities.Driver.delete(data.id);
    return { ok: true };
  });

export const assignDriverToRide = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ rideId: z.string(), driverId: z.string() }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const service = context.getBase44().asServiceRole;
    const [ride, driver] = await Promise.all([
      service.entities.Ride.get(data.rideId),
      service.entities.Driver.get(data.driverId),
    ]);
    if (ride.status !== "pending") throw httpError("فقط سفرهای در انتظار قابل تخصیص هستند", 400);

    const updated = await service.entities.Ride.update(ride.id, {
      status: "accepted",
      driver_id: driver.id,
      driver_name: driver.full_name,
      driver_phone: driver.phone,
      driver_email: driver.user_email ?? "",
      car_name: driver.car_model,
      plate_number: driver.plate_number,
    });
    await service.entities.Driver.update(driver.id, { status: "busy" });
    return updated;
  });

export const adminSetRideStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ rideId: z.string(), status: z.enum(["cancelled", "completed"]) }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const service = context.getBase44().asServiceRole;
    const ride = await service.entities.Ride.get(data.rideId);
    if (["completed", "cancelled"].includes(ride.status)) throw httpError("وضعیت این سفر نهایی شده است", 400);

    const updated = await service.entities.Ride.update(ride.id, { status: data.status });
    if (ride.driver_id) {
      await service.entities.Driver.update(ride.driver_id, { status: "available" }).catch(() => null);
    }
    return updated;
  });