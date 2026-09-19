import fs from 'fs';
let code = fs.readFileSync('server.cjs', 'utf8');

const staticHandler = `
  // 1. API Rotaları
  if (req.url === '/api/db' && req.method === 'GET') {
`;

if (!code.includes('MIME_TYPES')) {
  const injection = `
  // Statik Dosya Sunucusu (Ön Yüzü Sunmak İçin)
  const MIME_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
  if (!req.url.startsWith('/api')) {
    let filePath = path.join(process.cwd(), 'dist', req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) filePath = path.join(process.cwd(), 'dist', 'index.html');
    
    try {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      res.end(fs.readFileSync(filePath));
    } catch(e) {
      res.writeHead(404); res.end('Not found');
    }
    return;
  }
`;
  code = code.replace("if (req.url === '/api/db'", injection + "\n  if (req.url === '/api/db'");
  fs.writeFileSync('server.cjs', code);
  console.log("Static handler injected");
}
