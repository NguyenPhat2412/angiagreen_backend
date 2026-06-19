const request = require("supertest");
const app = require("../app");

describe("app", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toMatchObject({
      status: "ok",
      service: "angiagreen-api",
    });
    expect(response.body.requestId).toBeTruthy();
  });

  it("returns structured validation errors before controller logic", async () => {
    const response = await request(app).post("/api/auth/register").send({}).expect(400);

    expect(response.body.message).toBe("Dữ liệu không hợp lệ");
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(Array.isArray(response.body.details)).toBe(true);
  });
});
