import fs from 'fs';
let code = fs.readFileSync('esp8266_repeater/esp8266_repeater.ino', 'utf8');

code = code.replace(
  '#include <lwip/dns.h>',
  '#include <lwip/dns.h>\n#include <dhcpserver.h>'
);

const dnsCode = `
  // DHCP Sunucusuna ana modemin DNS adreslerini de veriyoruz (Internet erisimi icin cok kritik)
  uint32_t dns1 = WiFi.dnsIP(0);
  dhcps_set_dns(0, (const ipv4_addr_t*)&dns1);
  uint32_t dns2 = WiFi.dnsIP(1);
  dhcps_set_dns(1, (const ipv4_addr_t*)&dns2);
`;

code = code.replace(
  'Serial.println(WiFi.localIP());',
  'Serial.println(WiFi.localIP());\n' + dnsCode
);

fs.writeFileSync('esp8266_repeater/esp8266_repeater.ino', code);
