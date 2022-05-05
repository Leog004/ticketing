import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";

const createTicket = async (title: string, price: number) => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const newTicket = Ticket.build({ id, title, price });
  await newTicket.save();
  return newTicket;
};

const buildOrderRequest = async (cookie: string[], ticketId: string) => {
  return await request(app)
    .post(`/api/orders`)
    .set("Cookie", cookie)
    .send({ ticketId: ticketId })
    .expect(201);
};

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`/api/orders/${id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("fetches the order", async () => {
  // userCookie
  const user = global.signin();
  // Create a ticket
  const ticket = await createTicket("concert", 100);
  // Make a request to build an order with this ticket
  const { body: order } = await buildOrderRequest(user, ticket.id);
  // make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
  const user1 = global.signin();
  const user2 = global.signin();

  // Create a ticket
  const ticket = await createTicket("concert", 100);

  // Make a request to build an order with this ticket
  const { body: order } = await buildOrderRequest(user1, ticket.id);

  // make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user2)
    .send()
    .expect(401);
});

it.todo("emits a order cancelled event");
