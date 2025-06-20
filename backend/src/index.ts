import { Hono } from "hono";
import { Env } from "./types.js";
import { WebhooksStorage } from "./storage.js";
import {
  corsMiddleware,
  loggingMiddleware,
  authMiddleware,
  errorHandler,
  notFoundHandler,
} from "./middleware.js";
import { setupRoutes } from "./routes.js";

export { WebhooksStorage };

const app = new Hono<{ Bindings: Env }>();

app.use("*", corsMiddleware);
app.use("*", loggingMiddleware);
app.use("*", authMiddleware);

setupRoutes(app);

app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
