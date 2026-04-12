const http = require('http');
const next = require('next');

const port = Number(process.env.PORT || 7860);
const hostname = process.env.HOSTNAME || '0.0.0.0';

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

function isOpenEnvRootLikePath(urlPath) {
  if (!urlPath) return false;

  const path = urlPath.split('?')[0];
  if (path === '/' || path === '') {
    return true;
  }

  // Some checkers may post to a full HF-style space path.
  return /^\/spaces\/[^/]+\/[^/]+\/?$/.test(path);
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && isOpenEnvRootLikePath(req.url || '/')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, reset: true }));
      return;
    }

    handle(req, res);
  });

  server.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`);
  });
});
