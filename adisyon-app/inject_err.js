import fs from 'fs';
let html = fs.readFileSync('dist/index.html', 'utf8');
const errScript = `<script>window.onerror = function(m,s,l,c,e) { document.body.innerHTML += '<h1 style="color:red">CRASH: ' + m + '</h1>'; };</script>`;
html = html.replace('<head>', '<head>' + errScript);
fs.writeFileSync('dist/index.html', html);
