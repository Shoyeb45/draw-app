import express, { json, type Express } from "express";

export const createServer=  () : Express => {
    const app = express();
    app
      .use(json())
      .use(express.urlencoded())
      .get("/health", (_, res) => {
        res.json({ ok: true });
        return;
      })
    
    return app;
};