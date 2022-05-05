import { Ticket } from "../ticket";
import mongoose from "mongoose";

const fakeUserId = new mongoose.Types.ObjectId().toHexString();

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 4,
    userId: fakeUserId,
  });
  // Save the ticket to the database
  await ticket.save();
  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separae change to the ticket we changed
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 25 });
  // save the first fetched ticket
  await firstInstance!.save();
  // save the second fetched ticket an expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
});

it("incremenets the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 4,
    userId: fakeUserId,
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
