import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const ticket = await Ticket.find();
  console.log(ticket);
  res.status(200).json({ status: "success", data: ticket });
});

export { router as indexTicketRouter };
