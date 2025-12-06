const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { initializeSocketIO } = require("./lib/socket/server");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

console.log(`[Server] Starting in ${dev ? "development" : "production"} mode`);
console.log(`[Server] Hostname: ${hostname}, Port: ${port}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("[Server] Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io with the HTTP server
  const io = initializeSocketIO(httpServer);
  console.log(`[Server] Socket.IO initialized on path: /api/socket.io`);

  httpServer.once("error", (err) => {
    console.error("[Server] HTTP server error:", err);
    process.exit(1);
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log("[Server] Shutting down gracefully...");
    httpServer.close(() => {
      console.log("[Server] HTTP server closed");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("[Server] Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  httpServer.listen(port, hostname, () => {
    console.log(`[Server] ✓ Ready on http://${hostname}:${port}`);
    console.log(`[Server] ✓ Socket.IO available at ws://${hostname}:${port}/api/socket.io`);
  });
});
