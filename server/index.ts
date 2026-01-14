import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  searchAlibabaProducts,
  getAlibabaProductDetail,
  estimateShipping,
} from "./routes/alibaba";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Alibaba API routes
  app.post("/api/alibaba/search", searchAlibabaProducts);
  app.get("/api/alibaba/product/:productId", getAlibabaProductDetail);
  app.post("/api/alibaba/shipping-estimate", estimateShipping);

  return app;
}
