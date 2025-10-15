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

describe("Emails Endpoints", () => {
  beforeAll(async () => {
    await seed(data);
  });

  test("POST /api/emails/send - send email log", async () => {
    const emailData = {
      user_id: 1,
      event_id: 1,
      status: "sent",
    };
    const response = await request(app)
      .post("/api/emails/send")
      .send(emailData)
      .expect(201);
    expect(response.body.emailLog).toMatchObject({
      email_id: expect.any(Number),
      user_id: 1,
      event_id: 1,
      status: "sent",
      sent_at: expect.any(String),
    });
  });

  test("GET /api/emails/:id - get email status", async () => {
    const response = await request(app).get("/api/emails/1").expect(200);
    expect(response.body.emailLog).toMatchObject({
      email_id: 1,
      user_id: expect.any(Number),
      event_id: expect.any(Number),
      status: expect.any(String),
      sent_at: expect.any(String),
    });
  });
});

afterAll(async () => {
  await db.end();
});
