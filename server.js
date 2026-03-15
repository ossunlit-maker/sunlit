const http = require("http");
const fs = require("fs");
const path = require("path");

// Railway provides the port via environment variable
const PORT = process.env.PORT || 5000;
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

  // Remove leading slash
  const cleanPath = urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
  
  // Try root directory first
  const rootAttempt = path.join(__dirname, cleanPath);
  
  // Handle lithium-js paths correctly
  let lithiumAttempt = null;
  if (cleanPath.startsWith("lithium-js/")) {
    const subPath = cleanPath.slice("lithium-js/".length);
    lithiumAttempt = path.join(__dirname, "lithium-js", subPath);
  }

  function serveFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    console.log(`Serving: ${filePath}`);
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  }

  if (fs.existsSync(rootAttempt) && fs.statSync(rootAttempt).isFile()) {
    serveFile(rootAttempt);
  } else if (lithiumAttempt && fs.existsSync(lithiumAttempt) && fs.statSync(lithiumAttempt).isFile()) {
    serveFile(lithiumAttempt);
  } else {
    console.log(`Not found: ${urlPath}`);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found: " + urlPath);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🔍 Check if lithium-js exists:`);
  
  const lithiumPath = path.join(__dirname, "lithium-js");
  if (fs.existsSync(lithiumPath)) {
    console.log(`   ✅ lithium-js/ directory found`);
    
    const scramjetPath = path.join(lithiumPath, "scram", "scramjet.all.js");
    if (fs.existsSync(scramjetPath)) {
      console.log(`   ✅ scramjet.all.js found`);
    } else {
      console.log(`   ❌ scramjet.all.js NOT found at: ${scramjetPath}`);
    }
  } else {
    console.log(`   ❌ lithium-js/ directory NOT found at: ${lithiumPath}`);
  }
});
