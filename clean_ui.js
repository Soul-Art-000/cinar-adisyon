import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

// Remove the debug banner
const debugStart = '<div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-2 text-center font-bold z-[9999] flex justify-center gap-4">';
const debugEnd = '</div>';
const debugIndex = code.indexOf(debugStart);
if (debugIndex !== -1) {
  const endIndex = code.indexOf(debugEnd, debugIndex) + debugEnd.length;
  code = code.substring(0, debugIndex) + code.substring(endIndex);
}

// Remove the red Error UI
const errorStart = 'if (dbError) {';
const errorEnd = 'return (\n    <div className="flex h-screen overflow-hidden bg-gray-100 relative">';
const errorIndex = code.indexOf(errorStart);
if (errorIndex !== -1) {
  code = code.substring(0, errorIndex) + errorEnd;
}

fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("UI Cleaned");
