import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from 'mongoose';

const buildTicket = async (title: string, price: number) => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({ id, title, price });
  await ticket.save();
  return ticket;
};

const createOrder = async (cookie: string[], ticketId: string) => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticketId })
    .expect(201);
};

it("fetches order for an particular user", async () => {
  // create two users
  const userOne = global.signin();
  const userTwo = global.signin();
  // Create three tickets
  const ticketOne = await buildTicket("concert", 20);
  const ticketTwo = await buildTicket("baseball game", 220);
  const ticketThree = await buildTicket("music", 10);
  // Create one order as User #1
  await createOrder(userOne, ticketOne.id);
  // create two orders as User #2
  await createOrder(userTwo, ticketTwo.id);
  await createOrder(userTwo, ticketThree.id);
  // Make request to get orders for User #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body).toHaveLength(2);
  expect(response.body[0].ticket.title).toEqual(ticketTwo.title);
  expect(response.body[1].ticket.title).toEqual(ticketThree.title);
});

it("fetches order for an particular user", async () => {});
