import { NotFoundError } from "@lg4tickets/common";
import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if(!ticket) {
        throw new NotFoundError();
    }

    res.status(200).json({status: "success", ticket});
});

export { router as showTicketRouter };
