import fs from 'fs';
let code = fs.readFileSync('esp8266_repeater/esp8266_repeater.ino', 'utf8');

code = code.replace(
  '#include <dhcpserver.h>',
  'extern "C" void dhcps_set_dns(int num, ip_addr_t* dns);'
);

code = code.replace(
  '(const ipv4_addr_t*)',
  '(ip_addr_t*)'
);
code = code.replace(
  '(const ipv4_addr_t*)',
  '(ip_addr_t*)'
);

fs.writeFileSync('esp8266_repeater/esp8266_repeater.ino', code);
