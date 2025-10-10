import request from "supertest";
import app from "../src/api";
import db from "../src/db/connection";
import data from "../src/db/Development-Data/development_Data";
import seed from "../src/db/seeds/seeds";

describe("Join Event", () => {
  beforeAll(async () => {
    await seed(data);
  });

  test("Join Event", async () => {
    // Login as member
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "charlie@example.com", password: "hashed_pw3" })
      .expect(200);
    const token = loginResponse.body.token;

    const result = await request(app)
      .post("/api/events/2/register")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);
    const event_member = result.body.event_member;
    console.log(event_member);
    expect(event_member).toMatchObject({
      event_member_id: expect.any(Number),
      event_id: 2,
      user_id: expect.any(Number),
      joined_at: expect.any(String),
    });
  });
});

describe("Delete Event", () => {
  let token: string;
  beforeAll(async () => {
    await seed(data);
    // Login as staff to get token
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "bob@example.com", password: "hashed_pw2" });
    token = loginResponse.body.token;
  });

  test("delete /api/events/:event_id", async () => {
    const result = await request(app)
      .delete("/api/events/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    const event = result.body;
    expect(event).toEqual({});
  });
});

describe("Event Dates", () => {
  beforeAll(async () => {
    await seed(data);
  });

  test("GET /api/events includes start_date and end_date", async () => {
    const result = await request(app).get("/api/events").expect(200);
    const events = result.body.events;
    expect(events).toHaveLength(2);
    events.forEach((event: any) => {
      expect(event).toHaveProperty("start_date");
      expect(event).toHaveProperty("end_date");
      expect(typeof event.start_date).toBe("string");
      expect(typeof event.end_date).toBe("string");
    });
  });
});

afterAll(async () => {
  await db.end();
});
