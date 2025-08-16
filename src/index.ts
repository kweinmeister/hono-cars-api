// src/index.ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { etag } from "hono/etag";
import { Firestore } from "@google-cloud/firestore";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const firestore = new Firestore();
const app = new Hono();
app.use(logger(), cors(), secureHeaders(), etag());
const carSchema = z.object({
  year: z.number().int().min(1900),
  make: z.string().min(1),
  model: z.string().min(1),
  vin: z.string().length(17).optional(),
});

app.get("/", (c) => {
  return c.text("Welcome to the Cars API!");
});

const carsApi = new Hono();

// POST /api/cars
carsApi.post("/", zValidator("json", carSchema), async (c) => {
  const car = c.req.valid("json");
  try {
    const docRef = await firestore.collection("cars").add({
      ...car,
      createdAt: new Date(),
    });
    const newCar = {
      id: docRef.id,
      ...car,
      createdAt: new Date().toISOString(),
    };
    return c.json(newCar, 201);
  } catch (error) {
    console.error("Firestore Create Error:", error);
    return c.json({ error: "Failed to create car" }, 500);
  }
});

// GET /api/cars
carsApi.get("/", async (c) => {
  try {
    const snapshot = await firestore
      .collection("cars")
      .orderBy("createdAt", "desc")
      .get();
    const cars = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (data) {
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate().toISOString(),
          };
        }
        return null;
      })
      .filter((car) => car !== null);
    return c.json(cars);
  } catch (error) {
    console.error("Firestore Read All Error:", error);
    return c.json({ error: "Failed to retrieve cars" }, 500);
  }
});

// Read One (GET /api/cars/:id)
carsApi.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const doc = await firestore.collection("cars").doc(id).get();
    if (!doc.exists) {
      return c.json({ error: "Car not found" }, 404);
    }
    const data = doc.data();
    if (data) {
      return c.json({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
      });
    }
    return c.json({ error: "Car data is missing" }, 404);
  } catch (error) {
    return c.json({ error: "Failed to retrieve car" }, 500);
  }
});

// Update (PUT /api/cars/:id)
carsApi.put("/:id", zValidator("json", carSchema), async (c) => {
  const id = c.req.param("id");
  const car = c.req.valid("json");
  try {
    const docRef = firestore.collection("cars").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return c.json({ error: "Car not found" }, 404);
    }
    await docRef.update({
      ...car,
      updatedAt: new Date(),
    });
    return c.json({ message: "Car updated successfully" });
  } catch (error) {
    return c.json({ error: "Failed to update car" }, 500);
  }
});

// Delete (DELETE /api/cars/:id)
carsApi.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await firestore.collection("cars").doc(id).delete();
    return c.json({ message: "Car deleted successfully" });
  } catch (error) {
    return c.json({ error: "Failed to delete car" }, 500);
  }
});

app.route("/api/cars", carsApi);

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
