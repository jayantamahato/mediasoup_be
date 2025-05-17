import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import signalling from "./services/socket.js";
import { liveRouter } from "./routes/live.js";
import appError from "./middleware/error.js";
import { createWorker } from "./services/mediaSoup.js";

const app = express();
let worker;

const startServer = async () => {
  try {
    app.use(cors());
    app.use(express.json());

    const appServer = http.createServer(app);
    const IO = new Server(appServer, {
      cors: {
        origin: "*",
      },
    });
    signalling(IO);

    await mongoose.connect(
      "mongodb+srv://jmahato686:qSroxbDMHeWnYXTk@webrtc.xigqz.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    worker = await createWorker();

    app.use("/live", liveRouter);
    app.use(appError);

    appServer.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log("ERROR IN STARTING SERVER", error);
    process.exit(1);
  }
};

await startServer();
