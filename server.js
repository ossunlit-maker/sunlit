const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5000;
const HOST = "0.0.0.0";

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".map": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";

  const rootAttempt = path.join(__dirname, urlPath);
  const lithiumAttempt = path.join(__dirname, "lithium-js", urlPath);

  function serveFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  }

  if (fs.existsSync(rootAttempt) && fs.statSync(rootAttempt).isFile()) {
    serveFile(rootAttempt);
  } else if (
    fs.existsSync(lithiumAttempt) &&
    fs.statSync(lithiumAttempt).isFile()
  ) {
    serveFile(lithiumAttempt);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found: " + urlPath);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
