import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import { pingMinecraft } from './lib/minecraft-status.mjs';

const WORLD = 'chillice_.lunarclient.world';
const PORT = Number(process.env.PORT || 3000);
const LISTEN = process.env.HOST || '127.0.0.1';
const html = await readFile(fileURLToPath(new URL('./public/index.html', import.meta.url)));

// Deliberately not an unrestricted proxy. Block direct IP, UDP, private and loopback routes.
// Only allow the one specified Lunar world on the default Java TCP port.
wisp.options.hostname_whitelist = [/^chillice_\.lunarclient\.world$/i];
wisp.options.port_whitelist = [25565];
wisp.options.allow_direct_ip = false;
wisp.options.allow_private_ips = false;
wisp.options.allow_loopback_ips = false;
wisp.options.allow_udp_streams = false;
wisp.options.stream_limit_total = 4;
wisp.options.stream_limit_per_host = 4;
wisp.options.parse_real_ip = false;

let cache = null;
let cacheTime = 0;
let pending = null;

async function getStatus() {
  if (cache && Date.now() - cacheTime < 15000) return cache;
  if (!pending) {
    pending = pingMinecraft(WORLD)
      .then(status => ({ reachable: true, status, checkedAt: new Date().toISOString() }))
      .catch(error => ({ reachable: false, error: error.message, checkedAt: new Date().toISOString() }))
      .then(result => {
        cache = result;
        cacheTime = Date.now();
        return result;
      })
      .finally(() => { pending = null; });
  }
  return pending;
}

const app = http.createServer(async (req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    return res.end('Method not allowed');
  }
  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, world: WORLD, relay: 'wisp', multiplayer26_3Verified: false }));
  }
  if (pathname === '/api/status') {
    const result = await getStatus();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(result));
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

app.on('upgrade', (request, socket, head) => {
  try {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname;
    if (pathname !== '/wisp/') {
      socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    wisp.routeRequest(request, socket, head);
  } catch {
    socket.destroy();
  }
});

app.listen(PORT, LISTEN, () => {
  console.log(`Lunar Eagler experimental relay: http://${LISTEN}:${PORT}`);
  console.log('Destination: ' + WORLD + ':25565');
  console.log('Wisp endpoint: /wisp/  — this is NOT an Eaglercraft login server');
  console.log('A client-side Wisp patch + valid Minecraft authentication are still required.');
});
