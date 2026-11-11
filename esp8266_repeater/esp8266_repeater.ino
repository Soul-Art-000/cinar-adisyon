#include <ESP8266WiFi.h>
#include <lwip/napt.h>
#include <lwip/dns.h>
extern "C" {
#include <user_interface.h>
}

const char* STA_SSID = "CINAR_1.KAT";
const char* STA_PASS = "987654321*";

const char* AP_SSID = "ADISYON_GARSON";
const char* AP_PASS = "12345678";

void setup() {
  Serial.begin(115200);
  Serial.println("\n[ADISYON] ESP8266 NAT Router Basliyor...");

  // Ana modeme baglan (Station Mode)
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(STA_SSID, STA_PASS);
  
  Serial.print("[ADISYON] Ana Modeme Baglaniliyor (CINAR_1.KAT)");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[ADISYON] Ana Modeme Baglandi!");
  Serial.print("[ADISYON] ESP8266 IP Adresi: ");
  Serial.println(WiFi.localIP());

  // DHCP Sunucusuna ana modemin DNS adreslerini de veriyoruz (Internet erisimi icin cok kritik)
  
  dhcps_offer_t dhcps_dns_value = OFFER_ROUTER;
  wifi_softap_set_dhcps_offer_option(OFFER_ROUTER, &dhcps_dns_value);



  // Garsonlar icin Access Point olustur
  WiFi.softAPConfig(IPAddress(192, 168, 4, 1), IPAddress(192, 168, 4, 1), IPAddress(255, 255, 255, 0));
  WiFi.softAP(AP_SSID, AP_PASS);
  Serial.print("[ADISYON] Garson Agi (AP) Basladi! Sifre: 12345678 | IP: ");
  Serial.println(WiFi.softAPIP());

  // NAT (Ag Adresi Cevirisi) modunu aktif et
  err_t ret = ip_napt_init(1000, 10);
  if (ret == ERR_OK) {
    ret = ip_napt_enable_no(SOFTAP_IF, 1);
    if (ret == ERR_OK) {
      Serial.println("[ADISYON] NAT (Menzil Uzatici) Basariyla Aktif Edildi! Sistem Hazir.");
    }
  }
  
  if (ret != ERR_OK) {
    Serial.println("[ADISYON] HATA: NAT Baslatilamadi!");
  }
}

void loop() {
}
