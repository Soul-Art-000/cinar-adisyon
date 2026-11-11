#include <ESP8266WiFi.h>
#include <lwip/napt.h>
#include <lwip/dns.h>

void setup() {
  dhcpSoftAP.dhcps_set_dns(0, WiFi.dnsIP(0));
}
