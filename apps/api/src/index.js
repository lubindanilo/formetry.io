const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Charger le .env à la racine du monorepo (ai-form-coach/.env).
// __dirname = apps/api/src → ../.. = apps → ../../.. = racine du repo.
dotenv.config({
  path: path.resolve(__dirname, "..", "..", "..", ".env")
});

const { connectMongo } = require("./db");
const { authOptional } = require("./middleware/auth");
const uploadsRouter = require("./routes/uploads");
const poseRouter = require("./routes/pose");
const authRouter = require("./routes/auth");

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/uploads", authOptional, uploadsRouter);
app.use("/api/pose", authOptional, poseRouter);

async function main() {
  const port = Number(process.env.PORT || 3000);
  await connectMongo(process.env.MONGO_URL);
  app.listen(port, () => console.log(`[api] listening on :${port}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
