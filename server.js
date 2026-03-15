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

  // Remove leading slash for file system paths
  const cleanPath = urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
  
  // Try root directory first
  const rootAttempt = path.join(__dirname, cleanPath);
  
  // If the path starts with "lithium-js/", try looking in the lithium-js directory
  // without duplicating the lithium-js folder name
  let lithiumAttempt = null;
  if (cleanPath.startsWith("lithium-js/")) {
    // Remove "lithium-js/" prefix and look in lithium-js directory
    const subPath = cleanPath.slice("lithium-js/".length);
    lithiumAttempt = path.join(__dirname, "lithium-js", subPath);
  }

  function serveFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    console.log(`Serving: ${filePath} (${contentType})`);
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  }

  // Check root attempt
  if (fs.existsSync(rootAttempt) && fs.statSync(rootAttempt).isFile()) {
    serveFile(rootAttempt);
  } 
  // Check lithium attempt if it exists
  else if (lithiumAttempt && fs.existsSync(lithiumAttempt) && fs.statSync(lithiumAttempt).isFile()) {
    serveFile(lithiumAttempt);
  } 
  // File not found
  else {
    console.log(`Not found: ${urlPath} (tried root: ${rootAttempt}${lithiumAttempt ? ', lithium: ' + lithiumAttempt : ''})`);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found: " + urlPath);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Serving files from: ${__dirname}`);
  
  // Check if lithium-js directory exists
  const lithiumPath = path.join(__dirname, "lithium-js");
  if (fs.existsSync(lithiumPath)) {
    console.log(`✅ lithium-js directory found`);
    
    // Check for scramjet file
    const scramjetPath = path.join(lithiumPath, "scram", "scramjet.all.js");
    if (fs.existsSync(scramjetPath)) {
      console.log(`✅ scramjet.all.js found at: ${scramjetPath}`);
    } else {
      console.log(`❌ scramjet.all.js NOT found at: ${scramjetPath}`);
    }
  } else {
    console.log(`❌ lithium-js directory NOT found at: ${lithiumPath}`);
  }
});
