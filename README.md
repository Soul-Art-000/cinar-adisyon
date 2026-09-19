# Çınar Adisyon Sistemi 🚀

Bu proje, yerel ağ üzerinde çalışan (internetsiz veya internetli) ve garsonların telefonlarından sipariş girmesini sağlayan, eşzamanlı bir POS (Adisyon) sistemidir.

🤖 **Tamamen Yapay Zeka (AI - Google Antigravity) Tarafından Geliştirilmiştir!**

## Özellikler
- **Gerçek Zamanlı Senkronizasyon:** Garson sipariş girdiği an Kasa ekranına düşer (Polling & Rust Server).
- **Çapraz Platform:** Windows ve macOS için yerleşik masaüstü uygulaması (Tauri).
- **Mobil Uyumlu Web Arayüzü:** Garsonlar için herhangi bir uygulama kurmadan tarayıcıdan (Safari/Chrome) kullanım.
- **Dinamik Renk Kodlu Menü:** Sipariş hızını artırmak için renk kodlarıyla zenginleştirilmiş ürün kategorileri.
- **Termal Yazıcı Entegrasyonu:** USB üzerinden Kasa bilgisayarına bağlı termal fiş yazıcılarla tam uyumlu.
- **Config Sistemi:** Ayarların ve menünün anında içe/dışa aktarılıp USB bellek ile taşınabilmesi.

## Nasıl Çalıştırılır?
1. **Kasa Bilgisayarı:** Uygulamayı indirip (Windows için `.exe`, Mac için `.dmg`) kurun ve açın.
2. **Garson Telefonu:** Aynı WiFi ağına bağlanın ve Kasa ekranının "Ayarlar" bölümünde yazan IP adresine (Örn: `http://192.168.1.133:3001`) Safari veya Chrome üzerinden girin. Ana ekrana ekleyerek tam ekran uygulama gibi kullanabilirsiniz.

## Otomatik Derleme (GitHub Actions)
Bu projenin kodları GitHub'a her yüklendiğinde, Microsoft (GitHub Actions) sunucuları otomatik olarak Windows (.exe) ve macOS (.dmg) sürümlerini derleyip **Releases (Sürümler)** sekmesine ekler.
