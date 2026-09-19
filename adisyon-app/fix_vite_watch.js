import fs from 'fs';
let code = fs.readFileSync('vite.config.js', 'utf8');

if (!code.includes('watch:')) {
  code = code.replace(
    `  server: {`,
    `  server: {
    watch: {
      ignored: ['**/database.json']
    },`
  );
  fs.writeFileSync('vite.config.js', code);
}
