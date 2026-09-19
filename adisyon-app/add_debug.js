import fs from 'fs';
let code = fs.readFileSync('server.cjs', 'utf8');

const debugId = Math.random().toString(36).substring(7);

const oldSend = `res.end(JSON.stringify(db));`;
const newSend = `
    const debugInfo = { ...db, _debug: { serverId: "${debugId}", dbPath: DB_FILE } };
    res.end(JSON.stringify(debugInfo));
`;

if (code.includes(oldSend)) {
  code = code.replace(oldSend, newSend);
  fs.writeFileSync('server.cjs', code);
  console.log('Server debug patched');
}
