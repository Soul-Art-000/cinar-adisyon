#include <ESP8266WiFi.h>
#include <lwip/napt.h>
#include <lwip/dns.h>

void setup() {
  dhcps_set_dns(0, ip_addr_get_network_addr(WiFi.dnsIP(0)));
}
