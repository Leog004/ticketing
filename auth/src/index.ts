import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("Starting up..")
  if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be defined");
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be defined");

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
  });
    console.log("running auth mongoose")
  } catch (err) {
    console.log(err);
  }
};

app.listen(3000, () => {
  console.log("listening on port 3000");
});

start();
