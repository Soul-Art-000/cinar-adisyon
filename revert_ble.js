import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

// Remove Bluetooth icon
code = code.replace(
  /{!window\.__TAURI__ && \(\s*<button onClick=\{handleConnectBle\}[\s\S]*?<\/button>\s*\)}/,
  ""
);

// Remove imports
code = code.replace(
  "import { Bluetooth } from 'lucide-react';\nimport { connectBle, connectedDeviceId, setBleCallback } from './ble.js';",
  ""
);

// Remove states
code = code.replace(
  /const \[isBleConnected, setIsBleConnected\] = useState\(false\);\n  useEffect\(\(\) => \{\n    setBleCallback\(\(msg\) => \{\n      console\.log\('Bluetooth Message:', msg\);\n      \/\/ TODO: Update state based on msg \(sync\)\n    \}\);\n  \}, \[\]\);\n  const handleConnectBle = async \(\) => \{\n    const success = await connectBle\(\);\n    setIsBleConnected\(success\);\n  \};\n/,
  ""
);

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("Reverted Bluetooth UI from App.jsx");
