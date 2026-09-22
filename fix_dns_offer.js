import fs from 'fs';
let code = fs.readFileSync('esp8266_repeater/esp8266_repeater.ino', 'utf8');

const offerCode = `
  dhcps_offer_t dhcps_dns_value = OFFER_ROUTER;
  wifi_softap_set_dhcps_offer_option(OFFER_ROUTER, &dhcps_dns_value);
`;

code = code.replace(
  'extern "C" void dhcps_set_dns(int num, ip_addr_t* dns);',
  'extern "C" {\n#include <user_interface.h>\n}'
);

code = code.replace(
  /uint32_t dns1 = WiFi\.dnsIP\(0\);[\s\S]*?dhcps_set_dns\(1, \(ip_addr_t\*\)&dns2\);/,
  offerCode
);

fs.writeFileSync('esp8266_repeater/esp8266_repeater.ino', code);
