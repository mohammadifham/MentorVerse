const http = require('http');
const next = require('next');

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || '127.0.0.1';

const app = next({ dev: true, hostname, port });
const handle = app.getRequestHandler();

console.log('[dev-server] Preparing Next.js app in-process...');
app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.listen(port, hostname, () => {
    console.log(`[dev-server] Ready and listening on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('[dev-server] Prepare failed:', err);
});
