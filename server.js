const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

// Log startup info
console.log('Starting server...');
console.log('PORT:', PORT);
console.log('__dirname:', __dirname);
console.log('cwd:', process.cwd());
console.log('Files in dir:', fs.readdirSync(__dirname).join(', '));

function findFile(urlPath) {
  const relPath = urlPath === '/'
    ? 'great-war-of-suur-jahu.html'
    : urlPath.replace(/^\//, '');
  // Try __dirname first, then cwd
  for (const base of [__dirname, process.cwd()]) {
    const full = path.join(base, relPath);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  const filePath = findFile(req.url);
  if (!filePath) {
    // Fallback: serve the game for any path
    const fallback = findFile('/');
    if (fallback) {
      fs.readFile(fallback, (err, data) => {
        if (err) { res.writeHead(500); res.end('Server error'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found: ' + req.url);
    return;
  }
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error reading file');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Great War Of Suur Jahu running on http://0.0.0.0:' + PORT);
});
