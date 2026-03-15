import { describe, it, expect, vi, beforeEach } from "vitest";

// We must mock the module before importing app
vi.mock("@google-cloud/firestore", () => {
  const mockCollection = vi.fn().mockReturnThis();
  const mockAdd = vi.fn();
  const mockGet = vi.fn();
  const mockDoc = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockOrderBy = vi.fn().mockReturnThis();

  return {
    Firestore: vi.fn().mockImplementation(function () {
      return {
        collection: mockCollection,
        add: mockAdd,
        orderBy: mockOrderBy,
        get: mockGet,
        doc: mockDoc,
        update: mockUpdate,
        delete: mockDelete,
      };
    }),
    __mocks: {
      mockCollection,
      mockAdd,
      mockGet,
      mockDoc,
      mockUpdate,
      mockDelete,
      mockOrderBy,
    },
  };
});

import app from "./index";

// Helper to access our mocks
import * as firestoreModule from "@google-cloud/firestore";
const { mockAdd, mockGet, mockUpdate, mockDelete } = (firestoreModule as any).__mocks;

describe("Hono Cars API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return welcome message on GET /", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Welcome to the Cars API!");
  });

  describe("POST /api/cars", () => {
    it("should return 400 for invalid car data", async () => {
      const res = await app.request("/api/cars", {
        method: "POST",
        body: JSON.stringify({ make: "Toyota" }), // Missing year and model
        headers: new Headers({ "Content-Type": "application/json" }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 201 for valid car data", async () => {
      mockAdd.mockResolvedValueOnce({ id: "test-id" });

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
      expect(data).toHaveProperty("createdAt");
    });
  });

  describe("GET /api/cars", () => {
    it("should return a list of cars", async () => {
      mockGet.mockResolvedValueOnce({
        docs: [
          {
            id: "car1",
            data: () => ({ make: "Ford", createdAt: { toDate: () => new Date() } }),
          },
          {
            id: "car2",
            data: () => ({ make: "Honda", createdAt: { toDate: () => new Date() } }),
          },
        ],
      });

      const res = await app.request("/api/cars");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe("car1");
    });
  });

  describe("GET /api/cars/:id", () => {
    it("should return 404 if car not found", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });

      const res = await app.request("/api/cars/999");
      expect(res.status).toBe(404);
    });

    it("should return car details if found", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: "123",
        data: () => ({ make: "BMW", createdAt: { toDate: () => new Date() } }),
      });

      const res = await app.request("/api/cars/123");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe("123");
      expect(data.make).toBe("BMW");
    });
  });

  describe("PUT /api/cars/:id", () => {
    it("should return 404 if car not found to update", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });

      const res = await app.request("/api/cars/999", {
        method: "PUT",
        body: JSON.stringify({ year: 2024, make: "Tesla", model: "Model S" }),
        headers: new Headers({ "Content-Type": "application/json" }),
      });
      expect(res.status).toBe(404);
    });

    it("should update and return success for valid data", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockUpdate.mockResolvedValueOnce({});

      const res = await app.request("/api/cars/123", {
        method: "PUT",
        body: JSON.stringify({ year: 2024, make: "Tesla", model: "Model S" }),
        headers: new Headers({ "Content-Type": "application/json" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("Car updated successfully");
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/cars/:id", () => {
    it("should delete and return success message", async () => {
      mockDelete.mockResolvedValueOnce({});

      const res = await app.request("/api/cars/123", {
        method: "DELETE",
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("Car deleted successfully");
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
