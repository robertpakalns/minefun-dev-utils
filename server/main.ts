import { preparePacket } from "./packet";

const PORT = 3000;

const clients = new Set<Bun.ServerWebSocket>();

const server = Bun.serve({
  port: PORT,

  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response(null, { status: 500 });
  },

  websocket: {
    open(ws) {
      clients.add(ws);
      console.log("user connected");
    },

    message(ws, message) {},

    close(ws) {
      clients.delete(ws);
    },
  },
});

const shutdown = (): void => {
  console.log("Shutting down...");

  server.stop();

  for (const ws of clients) {
    try {
      ws.close(1001, "Server shutting down");
    } catch {}
  }

  setTimeout(() => process.exit(0), 100);
};

function sendPacket(payload: string) {
  const packet = preparePacket(payload);

  for (const ws of clients) {
    try {
      ws.send(packet);
    } catch (err) {
      console.error("Send failed:", err);
    }
  }
}

console.log(`Listening on http://localhost:${server.port}`);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// process.stdin.setEncoding("utf8");

// process.stdin.on("data", (line: string) => {
//   const cmd = line.trim();
//   if (!cmd) return;

//   sendPacket(cmd);
// });
