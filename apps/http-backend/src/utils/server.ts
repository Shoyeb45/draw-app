import express, { json, type Express } from "express";
import cookiParser from "cookie-parser";
import morgan from "morgan";
import { logger } from "./loggeer";
import type { User } from "@repo/db";
import cors from "cors";

// change the request type to accomodate user
declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }
}

export const createServer = (): Express => {
  const app = express();
  app
    .use(json())
    .use(morgan("combined", {
      stream: {
        write: (msg) => logger.info(msg.trim())
      }
    }))
    .use(express.urlencoded())
    .use(cookiParser())
    .use(cors({
      origin: 'http://localhost:3000', // Frontend URL
      methods: 'GET, POST, PUT, DELETE',
      allowedHeaders: 'Content-Type, Authorization',
      credentials: true 
    }))
    .get("/health", (_, res) => {
      res.json({ ok: true });
      return;
    })

return app;
};