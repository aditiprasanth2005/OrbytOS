const express = require("express");
const morgan = require("morgan");

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────
app.use(express.json());
app.use(morgan("combined")); // HTTP request logging

// ─── ROUTES ──────────────────────────────────────────────

// Root — quick sanity check
app.get("/", (req, res) => {
    res.json({
        message: "OrbytOS Backend 🚀",
        status: "running",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

// Health check — Jenkins + Docker probes hit this
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.stack || err.message}`);
    res.status(500).json({ error: "Internal server error" });
});

// ─── 404 HANDLER ─────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── START ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ OrbytOS server running on port ${PORT}`);
    console.log(`📋 Routes: GET / | GET /health`);
});

// ─── GRACEFUL SHUTDOWN ───────────────────────────────────
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received — shutting down gracefully");
    server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("🛑 SIGINT received — shutting down gracefully");
    server.close(() => {
        process.exit(0);
    });
});
