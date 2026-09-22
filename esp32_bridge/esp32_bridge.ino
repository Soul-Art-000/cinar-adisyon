#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Özel UUID'ler (Adisyon sistemi için benzersiz)
#define SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID    "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
int connectedClients = 0;

// Sunucu bağlantı durumlarını yakalayan sınıf
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      connectedClients++;
      Serial.print("Yeni cihaz baglandi! Toplam istemci: ");
      Serial.println(connectedClients);
    }
    void onDisconnect(BLEServer* pServer) {
      connectedClients--;
      if(connectedClients == 0) deviceConnected = false;
      Serial.print("Cihaz koptu! Kalan istemci: ");
      Serial.println(connectedClients);
      // Tekrar görünür (discoverable) ol
      BLEDevice::startAdvertising();
    }
};

// Gelen verileri (Sipariş veya Kasa onayı) yakalayan sınıf
class MyCharacteristicCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String rxValue = pCharacteristic->getValue();

      if (rxValue.length() > 0) {
        Serial.println("========= YENI MESAJ ALINDI =========");
        Serial.println(rxValue.c_str());
        Serial.println("=======================================");

        // Alınan mesajı ANINDA tüm bağlı cihazlara (Kasa ve diğer garsonlar) yolla! (Yansıtma / Ayna görevi)
        pCharacteristic->setValue(rxValue);
        pCharacteristic->notify();
        Serial.println("Mesaj diger cihazlara iletildi (Notify).");
      }
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 Adisyon BLE Koprusu Basliyor...");

  // 1. BLE Cihazını başlat
  BLEDevice::init("ADISYON_KOPRUSU");
  
  // MTU (Maximum Transmission Unit) boyutunu artır ki uzun JSON'lar sığsın (Maksimum 512)
  BLEDevice::setMTU(512);

  // 2. BLE Sunucusu oluştur
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // 3. Servis (Hizmet) oluştur
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // 4. Karakteristik (Veri Kanalı) oluştur (Okuma, Yazma, Bildirim)
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY |
                      BLECharacteristic::PROPERTY_INDICATE
                    );

  // Bildirimleri (Notify) aktifleştirmek için 2902 Descriptor ekle
  pCharacteristic->addDescriptor(new BLE2902());

  // Yazma işlemleri için Callback ata
  pCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  // 5. Servisi başlat
  pService->start();

  // 6. Yayına (Advertising) başla
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // iPhone bağlantı sorunlarını çözer
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("Bluetooth Yayini Basladi! Baglanti bekleniyor...");
}

void loop() {
  // ESP32 sadece donanımsal köprü olduğu için Loop içinde hiçbir şey yapmasına gerek yok.
  // Tüm işlemler "Interrupt/Callback" mantığıyla anında çalışır.
  delay(2000);
}
