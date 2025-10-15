import request from "supertest";
import app from "../src/api";
import db from "../src/db/connection";
import data from "../src/db/Development-Data/development_Data";
import seed from "../src/db/seeds/seeds";

// Mock Stripe to avoid needing real API key in tests
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest
          .fn()
          .mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
      },
    },
  }));
});

describe("Payments Endpoints", () => {
  let token: string;
  beforeAll(async () => {
    await seed(data);
    // Login as a user to get token
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@example.com", password: "hashed_pw1" });
    token = loginResponse.body.token;
  });

  test("POST /api/payments/create - create payment", async () => {
    const paymentData = {
      user_id: 1,
      event_id: 1,
      amount: 100,
    };
    const response = await request(app)
      .post("/api/payments/create")
      .set("Authorization", `Bearer ${token}`)
      .send(paymentData)
      .expect(201);
    expect(response.body.payment).toMatchObject({
      payment_id: expect.any(Number),
      user_id: 1,
      event_id: 1,
      amount: "100",
      status: "pending",
      created_at: expect.any(String),
    });
  });

  test("GET /api/payments/:id - get payment status", async () => {
    const response = await request(app).get("/api/payments/1").expect(200);
    expect(response.body.payment).toMatchObject({
      payment_id: 1,
      user_id: expect.any(Number),
      event_id: expect.any(Number),
      amount: expect.any(Number),
      status: expect.any(String),
      created_at: expect.any(String),
    });
  });

  test("GET /api/users/:id/payments - get user payments", async () => {
    const response = await request(app)
      .get("/api/users/1/payments")
      .expect(200);
    expect(Array.isArray(response.body.payments)).toBe(true);
  });

  test("PATCH /api/payments/:id - update payment status to success", async () => {
    // First create a payment
    const paymentData = {
      user_id: 1,
      event_id: 1,
      amount: 100,
    };
    const createResponse = await request(app)
      .post("/api/payments/create")
      .set("Authorization", `Bearer ${token}`)
      .send(paymentData)
      .expect(201);
    const paymentId = createResponse.body.payment.payment_id;

    // Now patch it to success
    const patchResponse = await request(app)
      .patch(`/api/payments/${paymentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "success" })
      .expect(200);
    expect(patchResponse.body.payment.status).toBe("success");
  });

  test("PATCH /api/payments/:id - should fail if status is not success", async () => {
    const response = await request(app)
      .patch("/api/payments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "failed" })
      .expect(400);
    expect(response.body.msg).toBe("Status must be 'success'");
  });

  test("PATCH /api/payments/:id - should fail if payment not pending", async () => {
    // First create and update a payment to success
    const paymentData = {
      user_id: 1,
      event_id: 1,
      amount: 100,
    };
    const createResponse = await request(app)
      .post("/api/payments/create")
      .set("Authorization", `Bearer ${token}`)
      .send(paymentData)
      .expect(201);
    const paymentId = createResponse.body.payment.payment_id;

    await request(app)
      .patch(`/api/payments/${paymentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "success" })
      .expect(200);

    // Try to patch again
    const response = await request(app)
      .patch(`/api/payments/${paymentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "success" })
      .expect(400);
    expect(response.body.msg).toBe(
      "Payment status can only be updated from 'pending' to 'success'"
    );
  });
});

afterAll(async () => {
  await db.end();
});
