import fs from 'fs';
let code = fs.readFileSync('server.cjs', 'utf8');

const oldSend = `res.end(JSON.stringify(db));`;
const newSend = `
    const ip = req.socket.remoteAddress;
    console.log('[' + new Date().toISOString() + '] GET /api/db from ' + ip + ' - sending ' + db.products.length + ' products');
    res.end(JSON.stringify(db));
`;

if (code.includes(oldSend)) {
  code = code.replace(oldSend, newSend);
  fs.writeFileSync('server.cjs', code);
  console.log('Server patched');
}
