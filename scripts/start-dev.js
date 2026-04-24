const { execSync } = require('child_process');
const next = require('next');
const http = require('http');

const DEFAULT_PORT = 3000;
const MAX_PORT = 65535;

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => {
      resolve(true);
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (port <= MAX_PORT) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    console.log(`Port ${port} is in use, trying next port...`);
    port++;
  }
  throw new Error('No available port found');
}

async function startDevServer() {
  const port = await findAvailablePort(DEFAULT_PORT);

  if (port !== DEFAULT_PORT) {
    console.log(`Port ${DEFAULT_PORT} is in use, using port ${port}`);
  }

  const dev = next({ dev: true, port });
  const handle = dev.getRequestHandler();

  await dev.prepare();
  const server = http.createServer((req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}

startDevServer().catch((err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});