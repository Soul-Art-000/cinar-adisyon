import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

if (!code.includes('import { connectBle }')) {
  code = code.replace(
    "import Sidebar from './components/Sidebar.jsx';",
    "import Sidebar from './components/Sidebar.jsx';\nimport { Bluetooth } from 'lucide-react';\nimport { connectBle, connectedDeviceId, setBleCallback } from './ble.js';"
  );
}

// Add state for Bluetooth connection status
if (!code.includes('const [isBleConnected')) {
  code = code.replace(
    "const [view, setView] = useState('masalar');",
    "const [view, setView] = useState('masalar');\n  const [isBleConnected, setIsBleConnected] = useState(false);\n  useEffect(() => {\n    setBleCallback((msg) => {\n      console.log('Bluetooth Message:', msg);\n      // TODO: Update state based on msg (sync)\n    });\n  }, []);\n  const handleConnectBle = async () => {\n    const success = await connectBle();\n    setIsBleConnected(success);\n  };\n"
  );
}

// Add the floating Bluetooth button
if (!code.includes('handleConnectBle')) {
  code = code.replace(
    '<div className="flex-1 overflow-hidden relative">',
    `<div className="flex-1 overflow-hidden relative">
        {!window.__TAURI__ && (
          <button onClick={handleConnectBle} className={\`absolute top-4 right-4 z-50 p-3 rounded-full shadow-lg text-white transition-colors \${isBleConnected ? 'bg-blue-500' : 'bg-gray-400 animate-pulse'}\`}>
            <Bluetooth size={24} />
          </button>
        )}`
  );
}

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("App.jsx updated with BLE Button.");
