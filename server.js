const http = require("http");
const fs = require("fs");
const path = require("path");

// Railway provides the port via environment variable
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

console.log("🚀 STARTUP: Server script beginning execution");
console.log(`📊 Environment: PORT=${PORT}, NODE_ENV=${process.env.NODE_ENV || 'not set'}`);
console.log(`📂 Current directory: ${__dirname}`);
console.log(`📂 Current directory contents:`);

try {
  const files = fs.readdirSync(__dirname);
  files.forEach(file => {
    const stats = fs.statSync(path.join(__dirname, file));
    console.log(`   - ${file} ${stats.isDirectory() ? '(dir)' : '(file)'}`);
  });
} catch (err) {
  console.log(`❌ Failed to read directory: ${err.message}`);
}

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

console.log("🔄 Creating HTTP server...");

const server = http.createServer((req, res) => {
  console.log(`📥 REQUEST: ${req.method} ${req.url} at ${new Date().toISOString()}`);
  
  try {
    let urlPath = req.url.split("?")[0];
    if (urlPath === "/") urlPath = "/index.html";

    // Remove leading slash
    const cleanPath = urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
    
    console.log(`   Looking for: ${cleanPath}`);
    
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
      console.log(`   ✅ Serving: ${filePath} (${contentType})`);
      
      try {
        const stats = fs.statSync(filePath);
        console.log(`   📏 File size: ${stats.size} bytes`);
        
        res.writeHead(200, { 
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*"
        });
        
        const stream = fs.createReadStream(filePath);
        stream.on('error', (err) => {
          console.log(`   ❌ Stream error: ${err.message}`);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal server error");
          }
        });
        stream.pipe(res);
      } catch (err) {
        console.log(`   ❌ Error serving file: ${err.message}`);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error serving file");
        }
      }
    }

    if (fs.existsSync(rootAttempt) && fs.statSync(rootAttempt).isFile()) {
      serveFile(rootAttempt);
    } else if (lithiumAttempt && fs.existsSync(lithiumAttempt) && fs.statSync(lithiumAttempt).isFile()) {
      serveFile(lithiumAttempt);
    } else {
      console.log(`   ❌ Not found: ${urlPath}`);
      console.log(`      Tried root: ${rootAttempt}`);
      if (lithiumAttempt) console.log(`      Tried lithium: ${lithiumAttempt}`);
      
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found: " + urlPath);
    }
  } catch (err) {
    console.log(`❌ UNHANDLED ERROR in request: ${err.message}`);
    console.log(err.stack);
    
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error: " + err.message);
    }
  }
});

// Add error handler for the server
server.on('error', (err) => {
  console.log(`❌ SERVER ERROR: ${err.message}`);
  console.log(err.stack);
});

console.log(`🔄 Attempting to listen on ${HOST}:${PORT}...`);

server.listen(PORT, HOST, () => {
  console.log(`✅ SUCCESS: Server is listening on http://${HOST}:${PORT}`);
  console.log(`🔍 Ready to accept connections!`);
  
  // Do a self-check
  console.log(`🔍 Running self-check for critical files:`);
  
  const indexPath = path.join(__dirname, "index.html");
  if (fs.existsSync(indexPath)) {
    console.log(`   ✅ index.html found at: ${indexPath}`);
  } else {
    console.log(`   ❌ index.html NOT found at: ${indexPath}`);
  }
  
  const lithiumPath = path.join(__dirname, "lithium-js");
  if (fs.existsSync(lithiumPath)) {
    console.log(`   ✅ lithium-js/ directory found`);
    
    const scramjetPath = path.join(lithiumPath, "scram", "scramjet.all.js");
    if (fs.existsSync(scramjetPath)) {
      console.log(`   ✅ scramjet.all.js found at: ${scramjetPath}`);
    } else {
      console.log(`   ❌ scramjet.all.js NOT found at: ${scramjetPath}`);
    }
    
    const lithiumMjsPath = path.join(lithiumPath, "lithium.mjs");
    if (fs.existsSync(lithiumMjsPath)) {
      console.log(`   ✅ lithium.mjs found at: ${lithiumMjsPath}`);
    } else {
      console.log(`   ❌ lithium.mjs NOT found at: ${lithiumMjsPath}`);
    }
  } else {
    console.log(`   ❌ lithium-js/ directory NOT found at: ${lithiumPath}`);
  }
});

// Keep the process alive and log if it's about to exit
process.on('beforeExit', (code) => {
  console.log(`⚠️ Process about to exit with code: ${code}`);
});

process.on('exit', (code) => {
  console.log(`⚠️ Process exiting with code: ${code}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ UNCAUGHT EXCEPTION: ${err.message}`);
  console.log(err.stack);
});

console.log("🚀 Startup complete, waiting for connections...");
