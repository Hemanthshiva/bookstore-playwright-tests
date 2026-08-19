const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDirectory = path.resolve(process.argv[2] || '../dist/bookstore/browser');
const port = Number(process.argv[3] || 4200);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const requestedFile = path.resolve(rootDirectory, `.${requestPath}`);
  const isInsideRoot = requestedFile === rootDirectory || requestedFile.startsWith(`${rootDirectory}${path.sep}`);
  const filePath = isInsideRoot && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()
    ? requestedFile
    : path.join(rootDirectory, 'index.html');

  if (!fs.existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Static application build not found.');
    return;
  }

  serveFile(response, filePath);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${rootDirectory} on http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
