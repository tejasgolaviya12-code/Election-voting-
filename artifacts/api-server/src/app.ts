import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env["SESSION_SECRET"] || "india_election_portal_secret_key_2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.session as any).userId;
  if (userId) {
    const [user] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (user) {
      (req as any).userRole = user.role;
    }
  }
  next();
});

app.use("/api", router);

export default app;
