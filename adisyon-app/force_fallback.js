import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Whenever there is an error, enable fallback mode
code = code.replace(
  '}, (error) => { if (isMounted) setErrorMsg("Firebase Okuma Hatası: " + error.message); });',
  `}, (error) => { 
    if (isMounted) {
      setErrorMsg("Firebase Okuma Hatası: " + error.message); 
      setIsFallback(true);
      setLoading(false);
      // Create mock tables immediately if error
      const dummyTables = [];
      ZONES.forEach(zone => {
        for(let i=1; i<=8; i++) {
          dummyTables.push({ id: \`\${zone}-\${i}\`, name: \`Masa \${i}\`, zone, status: 'empty', orderId: null });
        }
      });
      setTables(dummyTables);
    }
  });`
);

fs.writeFileSync('src/App.jsx', code);
