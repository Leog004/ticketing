import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";

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

it("Marks an order as cancelled", async () => {
  const user = global.signin();
  // create a ticket with Ticket Model
  const ticket = await createTicket("concert", 200);
  // make a request to create an order
  const order = await buildOrderRequest(user, ticket.id);
  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.body.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.body.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits a cancelled event", async () => {
  const user = global.signin();

  const ticket = await createTicket("concert", 200);

  const order = await buildOrderRequest(user, ticket.id);
  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.body.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
