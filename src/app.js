import express from "express";
import cors from "cors";
import { successResponse, errorResponse } from "./utils/response.js";
import routes from "./routes/index.js";

const app = express();

app.use(
    "/api/v1/stripe",
    express.raw({ type: "application/json" })
    ,routes
  );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    }
));

app.use("/api/v1", routes);

app.get("/", (req, res) => {
    return successResponse(res, 200, "Server is running");
});


// Fallback for any unmatched route
app.use((req, res) => {
    return errorResponse(res, 404, "Route not found");
});

export default app;

