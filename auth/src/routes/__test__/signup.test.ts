import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "test@example.com", password: "password" })
    .expect(201);
});

it("returns a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "testexample.com", password: "asasdasd" })
    .expect(400);
});

it("returns a 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "test@example.com", password: "aaa" })
    .expect(400);
});

it("returns a 400 with an missing email and password", async () => {
  // Running two request in on one handler
  await request(app).post("/api/users/signup").send({}).expect(400);

  await request(app)
    .post("/api/users/signup")
    .send({ password: "a" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@example.com", password: "asssda" })
    .expect(201);
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@example.com", password: "asssda" })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "test@example.com", password: "asssda" })
    .expect(201);
  expect(response.get("Set-Cookie")).toBeDefined();
});
