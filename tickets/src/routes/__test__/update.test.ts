import request from "supertest";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({ title: "asdasd", price: 20 })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "asdasd", price: 20 })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "asdasd", price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.newTicket.id}`)
    .set("Cookie", global.signin())
    .send({ title: "asdasd", price: 20 })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "asdasd", price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.newTicket.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: -1 })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "asdasd", price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.newTicket.id}`)
    .set("Cookie", cookie)
    .send({ title: "asdasd", price: 10 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.newTicket.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.ticket.title).toEqual("asdasd");
  expect(ticketResponse.body.ticket.price).toEqual(10);
});

it("publishes a update event", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "asdasd", price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.newTicket.id}`)
    .set("Cookie", cookie)
    .send({ title: "asdasd", price: 10 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it("reject updates if the ticket is reserved", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "asdasd", price: 20 })
    .expect(201);

    const ticket = await Ticket.findById(response.body.id);
    ticket?.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket?.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "asdasd", price: 10 })
    .expect(400);
});
