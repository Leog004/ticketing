import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";

import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

const buildTicket = async (title: string, price: number) => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({ id, title, price });
  await ticket.save();
  return ticket;
};

it("returns an error if the ticket does not exists", async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = await buildTicket("concert", 20);

  const order = Order.build({
    ticket,
    userId: "asdasdasdaf",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = await buildTicket("concert", 20);

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order created event", async () => {
  const ticket = await buildTicket("concert", 20);
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
