import express, { json, type Express } from "express";
import cookiParser from "cookie-parser";
import morgan from "morgan";
import { logger } from "./loggeer";
import type { User } from "@repo/db";

// change the request type to accomodate user
declare global {
  namespace Express {
    interface Request {
      user?: User | null
    }
  }
}

export const createServer = () : Express => {
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
      .get("/health", (_, res) => {
        res.json({ ok: true });
        return;
      })
    
    return app;
};