import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

/*  CORS — ALLOW EVERYTHING (DEV ONLY) */
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);



/* Stripe raw body (must be before json) */
app.use(
    "/api/v1/stripe",
    express.raw({ type: "application/json" }),
    routes
);

/* Body parsers */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

export default app;