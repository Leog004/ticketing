import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest, BadRequestError } from "@lg4tickets/common";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";

import { User } from "../models/user";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password must be supplied"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email });

    if (!existingUser)
      throw new BadRequestError("Log in information incorrect");

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

        // Generate JWT
        const userJWT = jwt.sign(
          {
            id: existingUser.id,
            email: existingUser.email,
          },
          process.env.JWT_KEY || ""
        );
    
        // Store session
        req.session = {
          jwt: userJWT,
        };
    
        res.status(200).json({
          status: "success",
          existingUser,
        });
  }
);

export { router as signInUserRouter };
