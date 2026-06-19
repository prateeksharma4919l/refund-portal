import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "client", "dist");
const apiTarget = "http://localhost:5000";
const port = 5173;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}

function proxyApi(req, res) {
  const target = new URL(req.url, apiTarget);
  const proxyReq = http.request(
    target,
    {
      method: req.method,
      headers: { ...req.headers, host: target.host }
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", () => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "API server is not reachable" }));
  });

  req.pipe(proxyReq);
}

http
  .createServer((req, res) => {
    if (req.url.startsWith("/api")) {
      proxyApi(req, res);
      return;
    }

    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const requestedPath = path.normalize(path.join(distDir, urlPath));
    const safePath = requestedPath.startsWith(distDir) ? requestedPath : path.join(distDir, "index.html");
    const filePath = fs.existsSync(safePath) && fs.statSync(safePath).isFile() ? safePath : path.join(distDir, "index.html");
    serveFile(res, filePath);
  })
  .listen(port, () => {
    console.log(`Static client running on http://localhost:${port}`);
  });
