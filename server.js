const express = require("express");

const app = express();

// Parse incoming JSON bodies
app.use(express.json());

// ─── ROUTES ──────────────────────────────────────────────

// Root — quick sanity check
app.get("/", (req, res) => {
    res.json({ message: "OrbytOS Backend 🚀", status: "running" });
});

// Health check — Jenkins + Docker probes hit this
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
});

// ─── START ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ OrbytOS server running on port ${PORT}`);
});
