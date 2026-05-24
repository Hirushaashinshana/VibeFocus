import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Track active visual visitor connections
  interface SSEClient {
    id: number;
    res: express.Response;
  }
  
  let clients: SSEClient[] = [];
  let nextClientId = 1;

  function broadcastViewerCount() {
    const data = JSON.stringify({ count: clients.length });
    clients.forEach((client) => {
      try {
        client.res.write(`data: ${data}\n\n`);
      } catch (err) {
        console.error("Error writing to connection:", err);
      }
    });
  }

  // Live viewers SSE endpoint
  app.get("/api/live-viewers", (req, res) => {
    // Standard headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const clientId = nextClientId++;
    const newClient: SSEClient = { id: clientId, res };
    clients.push(newClient);

    // Broadcast the updated count to everyone immediately
    broadcastViewerCount();

    // Remove client from the registry when connection closes
    req.on("close", () => {
      clients = clients.filter((c) => c.id !== clientId);
      broadcastViewerCount();
    });
  });

  // REST health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", activeViewers: clients.length });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VibeFocus Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
