import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

/* ================================
   Stripe Webhook (RAW BODY FIRST)
   ================================ */
app.use(
  "/api/v1/stripe",
  express.raw({ type: "application/json" })
);

/* ================================
   CORS CONFIGURATION
   ================================ */
const allowedOrigins = [
  "http://localhost:3000",   // React (CRA)
  "http://localhost:5173",   // React (Vite)
  "http://172.252.13.97:8011", // Backend direct access (optional)
  "https://your-frontend-domain.com" // Production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`),
        false
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ================================
   BODY PARSERS (AFTER WEBHOOK)
   ================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================
   API ROUTES
   ================================ */
app.use("/api/v1", routes);

app.use("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Rory Backend" });
});
/* ================================
   HEALTH CHECK (OPTIONAL)
   ================================ */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
