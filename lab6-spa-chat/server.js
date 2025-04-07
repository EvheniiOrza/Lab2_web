const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  let filePath = "./public" + (req.url === "/" ? "/index.html" : req.url);
  let extname = path.extname(filePath);
  let contentType = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
  }[extname] || "text/plain";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("404 Not Found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    // Broadcast message to all clients except the sender
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
