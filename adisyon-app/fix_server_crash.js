import fs from 'fs';
let code = fs.readFileSync('server.cjs', 'utf8');

code = code.replace(
  `    } else if (action === 'add') {
      db[collection].push(data);`,
  `    } else if (action === 'add') {
      if (!db[collection]) db[collection] = [];
      db[collection].push(data);`
);

// Also fix JSON.parse to merge with defaults to prevent missing arrays!
code = code.replace(
  `if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch(e) {}
}`,
  `if (fs.existsSync(DB_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    db = { ...db, ...loaded };
    if (!db.veresiye) db.veresiye = [];
  } catch(e) {}
}`
);

fs.writeFileSync('server.cjs', code);

// Fix current database.json
const dbFile = 'database.json';
if (fs.existsSync(dbFile)) {
  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  if (!dbData.veresiye) dbData.veresiye = [];
  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2));
}
