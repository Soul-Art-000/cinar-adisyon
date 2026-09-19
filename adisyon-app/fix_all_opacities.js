import fs from 'fs';
import path from 'path';

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk('src/components');
files.push('src/App.jsx');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove `opacity: 0` from styles
  code = code.replace(/,\s*opacity:\s*0/g, '');
  code = code.replace(/opacity:\s*0\s*,/g, '');
  code = code.replace(/{\{([^}]*)opacity:\s*0([^}]*)\}}/g, (match, p1, p2) => {
      let inner = (p1 + p2).trim();
      if (inner.endsWith(',')) inner = inner.slice(0, -1);
      if (inner === '') return '{}';
      return `{{ ${inner} }}`;
  });

  // Remove `animate-in` class
  code = code.replace(/animate-in /g, '');
  code = code.replace(/ animate-in/g, '');

  fs.writeFileSync(file, code);
});
