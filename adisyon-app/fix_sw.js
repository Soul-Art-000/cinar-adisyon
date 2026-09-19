import fs from 'fs';
let code = fs.readFileSync('src/main.jsx', 'utf8');

const swFix = `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
`;

if (!code.includes('getRegistrations')) {
  code = code.replace('import App from', swFix + '\nimport App from');
  fs.writeFileSync('src/main.jsx', code);
  console.log("Service Worker cleanup added");
}
