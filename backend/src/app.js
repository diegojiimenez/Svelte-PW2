const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "svelte-pw2-backend" }));

app.use("/api/auth", authRoutes);

module.exports = app;