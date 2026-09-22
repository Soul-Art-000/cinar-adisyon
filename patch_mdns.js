import fs from 'fs';
let code = fs.readFileSync('adisyon-server/server.js', 'utf8');

const mdnsCode = `
const os = require('os');
const mdns = require('multicast-dns')();

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIp();

mdns.on('query', function(query) {
  if (query.questions[0] && query.questions[0].name === 'kasa.local') {
    mdns.respond({
      answers: [{
        name: 'kasa.local',
        type: 'A',
        ttl: 300,
        data: LOCAL_IP
      }]
    });
  }
});

console.log('mDNS Aktif! Kasa URL: http://kasa.local:' + PORT);
`;

code = code.replace(
  "server.listen(PORT, '0.0.0.0', () => {",
  mdnsCode + "\nserver.listen(PORT, '0.0.0.0', () => {"
);

fs.writeFileSync('adisyon-server/server.js', code);
console.log("mDNS added to server.js");
