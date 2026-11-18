import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ...['app.js', 'model.js', 'style.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'].map(name => [
    `/${name}`, [name, name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : name.endsWith('.png') ? 'image/png' : 'application/manifest+json'],
  ]),
]);
export const server = createServer(async (req, res) => {
  const entry = files.get(new URL(req.url, 'http://localhost').pathname);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'none'");
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  if (!entry) { res.writeHead(404); return res.end('Not found'); }
  try {
    const body = await readFile(new URL(`./public/${entry[0]}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': `${entry[1]}${entry[1].startsWith('text/') ? '; charset=utf-8' : ''}` });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500);
    res.end('Unable to read asset');
  }
});
server.listen(Number(process.env.PORT || 3080), '0.0.0.0', () => console.log('Launch dashboard ready'));
