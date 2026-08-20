// Design-review server: serves the built site from dist/ plus fixture
// responses for /api/fire-status, so every live-data state is reachable on
// demand without touching the NWS or the state of ND.
//
//   yarn build && node tools/review-server.mjs        # http://localhost:4323
//   curl 'http://localhost:4323/_mode?set=ban'        # switch state, no restart
//
// Modes: calm | high | redflag | ban | norating
// Used by the mrfd-page-review skill (.claude/skills/mrfd-page-review).

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = process.cwd() + '/dist';
const PORT = Number(process.env.PORT ?? 4323);
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.txt': 'text/plain', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

const BASE = { redFlag: null, fireWatch: null, fireDanger: null, burnDeclaration: null };
// Mirrors Morton's real declaration shape, including per-activity thresholds
// and Red Flag triggers. Pellet grills carry no Red Flag trigger here so the
// redflag mode exercises the mixed Allowed/Restricted rendering.
const ACTIVITIES = (threshold) => [
  'Campfires', 'Controlled burns', 'Cropland burning', 'Garbage burning',
  'Fireworks, aerial', 'Fireworks, ground', 'Charcoal grills & smokers',
  'Wood-fire grills & smokers', 'Pellet grills & smokers',
  'Outdoor fireplaces',
].map((label) => ({ label, threshold, redFlag: label !== 'Pellet grills & smokers' }));
const DECL = { threshold: 'High', activities: ACTIVITIES('High'), link: 'https://experience.arcgis.com/experience/c5da309af17b4c48a3b953675a77f654', expires: '2027-01-01T06:00:00.000Z' };
const MODES = {
  calm:     { ...BASE, fireDanger: 'Low', burnDeclaration: DECL },
  high:     { ...BASE, fireDanger: 'High', burnDeclaration: DECL },
  // Moderate + Red Flag: below every threshold, so restriction comes from the
  // per-activity Red Flag triggers alone (pellet stays Allowed).
  redflag:  { ...BASE, fireDanger: 'Moderate', burnDeclaration: DECL, redFlag: { headline: 'Red Flag Warning', ends: null } },
  ban:      { ...BASE, fireDanger: 'Moderate', burnDeclaration: { ...DECL, threshold: 'Low', activities: ACTIVITIES('Low') } },
  norating: { ...BASE, burnDeclaration: DECL },
};

let mode = process.env.MODE ?? 'calm';

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/_mode') {
    const next = url.searchParams.get('set');
    if (next && MODES[next]) mode = next;
    res.writeHead(next && !MODES[next] ? 400 : 200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ mode, available: Object.keys(MODES) }));
  }
  if (url.pathname === '/api/fire-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ...MODES[mode], updated: new Date().toISOString() }));
  }
  let file = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) && existsSync(file + '.html')) file += '.html';
  if (!existsSync(file)) {
    const nf = join(DIST, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end(existsSync(nf) ? readFileSync(nf) : 'Not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(PORT, () => console.log(`review server on http://localhost:${PORT} (mode: ${mode})`));
