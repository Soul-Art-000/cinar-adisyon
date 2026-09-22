import fs from 'fs';

['App.jsx', 'components/OrderView.jsx'].forEach(file => {
  let path = 'adisyon-app/src/' + file;
  if (fs.existsSync(path)) {
    let code = fs.readFileSync(path, 'utf8');
    code = code.replace(/h-screen/g, 'h-[100dvh]');
    fs.writeFileSync(path, code);
  }
});
console.log("h-screen replaced with h-[100dvh]");
