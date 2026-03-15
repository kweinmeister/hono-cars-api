import { describe, it, expect, vi } from "vitest";
import app from "./index";

// Mock Firestore to avoid actual network calls
vi.mock("@google-cloud/firestore", () => {
  return {
    Firestore: vi.fn().mockImplementation(function() {
      return {
        collection: vi.fn().mockReturnThis(),
        add: vi.fn().mockResolvedValue({ id: "test-id" }),
        orderBy: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({ docs: [] }),
      };
    }),
  };
});

describe("Hono Cars API", () => {
  it("should return welcome message on GET /", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Welcome to the Cars API!");
  });

  it("should return 400 for invalid car data on POST /api/cars", async () => {
    const res = await app.request("/api/cars", {
      method: "POST",
      body: JSON.stringify({ make: "Toyota" }), // Missing year and model
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    expect(res.status).toBe(400);
  });

  it("should return 201 for valid car data on POST /api/cars", async () => {
    const res = await app.request("/api/cars", {
      method: "POST",
      body: JSON.stringify({
        year: 2024,
        make: "Tesla",
        model: "Model 3",
      }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id", "test-id");
    expect(data.make).toBe("Tesla");
  });
});
