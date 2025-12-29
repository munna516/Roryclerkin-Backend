import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://soundtrackmynight.com",   // React (CRA)
  "https://m-music-lory.vercel.app" // Production frontend
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


app.use(
  "/api/v1/stripe/payment",
  paymentRoutes
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Rory Backend" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
