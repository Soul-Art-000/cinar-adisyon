import fs from 'fs';
let code = fs.readFileSync('vite.config.js', 'utf8');

if (!code.includes('proxy:')) {
  code = code.replace(
    'plugins: [react(), tailwindcss()],',
    \`plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },\`
  );
  fs.writeFileSync('vite.config.js', code);
}
