import fs from 'fs';
let code = fs.readFileSync('esp32_bridge/esp32_bridge.ino', 'utf8');

code = code.replace(
  'std::string rxValue = pCharacteristic->getValue();',
  'String rxValue = pCharacteristic->getValue();'
);

fs.writeFileSync('esp32_bridge/esp32_bridge.ino', code);
