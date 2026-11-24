# Çınar Adisyon (local-adisyon) — Proje Bağlamı / Claude İçin Tam Prompt

> Bu doküman bir proje brief'idir. Claude'a (veya başka bir ajana) bu projede çalıştırmadan
> önce verilmelidir. Tüm bilgiler canlı repodan ve gerçek fatura verisinden doğrulanmıştır.

---

## 1. Proje Kimliği

| Alan | Değer |
|---|---|
| Ad | Çınar Adisyon / `local-adisyon` |
| Repo | https://github.com/Soul-Art-000/cinar-adisyon (public) |
| Sahip | GitHub **Soul-Art-000**, commit kimliği `S <salihbayrak815@gmail.com>` |
| Yerel yol | `/Volumes/T7/Yazılım/magical-pasteur` (harici disk, `~/Documents/antigravity` → T7 symlink) |
| Amaç | Kantin/büfe gibi küçük satış noktaları için **internetsiz** çalışan kasa + veresiye sistemi |
| Kullanım yeri | Okul kantini; müşteri kitlesi çocuklar → fiyat hassasiyeti yüksek |
| Son sürüm | `v1.0.32` (macOS dmg, Windows exe/msi, Linux deb/AppImage) |

### Kritik konum notu
- Proje **harici T7 diskinde**. Disk takılı değilse yol yoktur; önce `ls /Volumes/` ile kontrol et.
- Harici diskte `core.filemode=false` şart (yoksa 900+ sahte değişiklik görünür).
- `getcwd`, `set owner/group` uyarıları zararsız, yok say.
- Repo'da macOS AppleDouble çöpü (`._dosya`, `Icon\r`) commit'li durumda — temizlenmeli.

---

## 2. Mimari

```
magical-pasteur/
├── adisyon-app/                 # Vite + React 19 + Tailwind 4 (frontend)
│   ├── src/
│   │   ├── App.jsx              # Ana bileşen, tüm state + routing (view switch)
│   │   ├── barcode.js           # Barkod okuyucu (keyboard emulation) + API client
│   │   ├── components/
│   │   │   ├── KasaView.jsx     # ★ BARKOD + ELLE SEÇİM + VERESİYE (ana ekran)
│   │   │   ├── VeresiyeView.jsx # Veresiye defteri
│   │   │   ├── BarcodeAdmin.jsx # Barkod ↔ ürün eşleştirme
│   │   │   ├── ProductsAdmin.jsx# Ürün CRUD
│   │   │   ├── CiroView.jsx     # Gün sonu / ciro raporu
│   │   │   ├── SettingsAdmin.jsx# Bölge/kategori ayarları + config import/export
│   │   │   ├── Sidebar.jsx      # Masaüstü dikey menü
│   │   │   ├── OrderView.jsx    # (KAPALI) adisyon/sipariş ekranı
│   │   │   └── TablesView.jsx   # (KAPALI) masa grid'i
│   │   ├── database.json        # ★ CANLI VERİ (ürün, satış, veresiye, barkod)
│   │   └── src-tauri/           # Rust masaüstü kabuğu (Tauri v2)
│   │       └── src/{lib.rs,server.rs,printer.rs}
├── adisyon-server/              # Node/Express sunucu (garson telefondan erişim)
│   ├── server.js                # REST + Socket.IO + mDNS (kasa.local:3000)
│   └── database.json            # AYRI KOPYA (senkron tutulmalı!)
└── .github/workflows/release.yml# 3 platform build + Android APK
```

### İki ayrı çalışma modu
1. **Tauri masaüstü (kasa bilgisayarı)**: DB `app_data_dir/database.json` içinde, IPC ile
   `invoke('get_db')` / `invoke('mutate_db')`. Port 3001'de mini HTTP sunucu da açar.
2. **Web (garson telefonu)**: Tarayıcıdan `http://kasa.local:3000`. `localStorage.kasaIp`
   doluysa istekler doğrudan kasa IP'sine gider, değilse göreli `/api/...`.

> **TUZAK:** İki ayrı `database.json` var (`adisyon-app/` ve `adisyon-server/`). Birini
> güncelleyip diğerini unutmak en sık hata. Her veri değişikliğinde İKİSİNİ de yaz.

---

## 3. Veri Modeli

`database.json` üst seviye anahtarlar:

```jsonc
{
  "settings": { "zones": [...], "categories": ["GIDA","IZGARALAR","BOWL",...
                "DÜRÜMLER & EKMEK ARASI","BURGER","APERATİFLER","TATLILAR","İÇECEKLER","BÜFE"] },
  "products": [ /* ürün */ ],
  "barcodes": [ /* barkod kısayolu */ ],
  "sales":    [ /* satış kaydı */ ],
  "veresiye": [ /* veresiye müşterisi */ ],
  "tables": [], "orders": [], "archive": []
}
```

### products
```jsonc
{ "id": "p-bufe-...", "name": "Ülker Dido 35 g", "price": 30,
  "category": "BÜFE", "color": "bg-rose-500", "unit": "adet",
  "cost": 20.91, "stock": 24, "barcode": "8690504028536" }
```
- `cost` = KDV dahil gerçek alış fiyatı (faturadan), `stock` = eldeki adet.
- `unit`: `adet` | `kg` (kg ise ekranda miktar sorulur).

### barcodes
```jsonc
{ "id": "bc-...", "code": "8690504028536", "name": "Ülker Dido 35 g",
  "price": 30, "category": "BÜFE", "color": "bg-rose-500", "unit": "adet" }
```
> **Aynı ürün İKİ yerde tutuluyor** (`products.barcode` + `barcodes[]`). Fiyat değişince
> ikisini de güncelle, yoksa kasa eski fiyatla satar. Senkron kuralı: her ürün değişikliğinden
> sonra `barcodes` listesini `products`'tan yeniden üret.

### veresiye
```jsonc
{ "id": "v-...", "name": "Ali Veli", "phone": "", "debt": 87,
  "logs": [{ "id":"...", "type":"debt|payment", "amount":87,
             "date":"22.10.2026 16:40", "note":"Kasa satışı" }],
  "createdAt": 1761... }
```
- `type: "debt"` → borç artar, `"payment"` → borç azalır. `debt` asla negatife düşmez.

### sales
```jsonc
{ "id":"sale-...", "tableId":"KANTIN", "tableName":"Kantin (barkod)",
  "items":[{ "productId":"...", "barcode":"...", "name":"...", "price":30, "qty":1 }],
  "subtotal":30, "paymentMethod":"nakit|kart|veresiye",
  "discountType":"amount","discountValue":0,"discountAmount":0,
  "finalTotal":30, "paidAt":"22.10.2026 16:40", "createdAt":1761... }
```

---

## 4. Backend Sözleşmeleri

### Node sunucu (`adisyon-server/server.js`, port 3000)
| Endpoint | Açıklama |
|---|---|
| `GET /api/db` | Tüm DB |
| `POST /api/mutate` | `{ mutations:[{action, collection, id, data}] }` |
| `GET /api/barcode/:code` | Barkod → ürün. Sıra: `barcodes[]` → `products.barcode` → `products.id` |
| `GET /api/price/:code` | Sadece `{name, price}` |
| `POST /api/sell` | `{code, qty, paymentMethod}` → satış kaydı oluşturur |
| Socket.IO | `sync_state`, `add_order`, `update_table_status` |
| mDNS | `kasa.local` → yerel IP |

**Desteklenen mutation action'ları:** `set`, `add`, `update`, `delete`, `deleteMany`,
`updateSettings`.

> **Barkodsuz ürün satışı:** `findCode` artık `products.id` ile de eşleşir; böylece barkodu
> olmayan ürün id'siyle satılabilir. KasaView bu yüzden basket'te `code = barcode || id` tutar.

### Tauri komutları (`lib.rs`)
`get_db`, `mutate_db`, `get_printers`, `print_receipt`, `get_local_ip`, `get_hostname`

> **TUZAK:** Tauri'nin kendi HTTP sunucusunda (`server.rs`, port 3001) `/api/barcode` ve
> `/api/sell` endpoint'leri YOK — sadece `/api/db`, `/api/mutate`, `/api/print`. Bu yüzden
> KasaView'da satış başarısız olursa `mutate('add','sales',...)` fallback'i zorunlu.

---

## 5. Mevcut Ürünler ve Fiyatlar (v1.0.32 sonrası hedef durum)

**14 kalem, 324 adet, alış 4.831,92₺. Hedef: 2.500₺ net kâr (KDV hariç).**

| Ürün | Adet | Maliyet | Fiyat | Kâr/ad | Toplam kâr | Marj |
|---|---:|---:|---:|---:|---:|---:|
| Ülker Çubuk Kraker 40 g | 36 | 5,70 | **10** | 4,30 | 154,80 | %75 |
| Ülker Susamlı Çubuk Kraker 70 g | 22 | 9,12 | **15** | 5,88 | 129,36 | %64 |
| Eti Hoşbeş Fındıklı 70 g | 24 | 13,37 | **20** | 6,63 | 159,12 | %50 |
| Eti Popkek Vişneli 60 g | 24 | 14,15 | **20** | 5,85 | 140,40 | %41 |
| Eti Popkek Çikolatalı 60 g | 24 | 14,15 | **20** | 5,85 | 140,40 | %41 |
| Eti Popkek Muzlu 60 g | 24 | 14,15 | **20** | 5,85 | 140,40 | %41 |
| Capri-Sun Safari 200 ml | 20 | 14,55 | **20** | 5,45 | 109,00 | %37 |
| Ülker ÇiziViç 82 g | 24 | 17,11 | **25** | 7,89 | 189,36 | %46 |
| Ülker Altınbaşak Yoğurt Yemişli 50 g | 20 | 16,73 | **25** | 8,27 | 165,40 | %49 |
| Ülker Çikolatalı Gofret 36 g | 36 | 14,19 | **25** | 10,81 | 389,16 | %76 |
| Ülker Dido 35 g | 24 | 20,91 | **30** | 9,09 | 218,16 | %43 |
| Eti Browni Intense 50 g | 16 | 18,90 | **30** | 11,10 | 177,60 | %59 |
| Eti Ahenk Sütlü Çikolatalı Gofret 18 g | 18 | 23,59 | **35** | 11,41 | 205,38 | %48 |
| Çaykur Didi Bergamot 500 ml | 12 | 25,89 | **40** | 14,11 | 169,32 | %54 |

**Toplam:** Ciro 7.320₺ − Maliyet 4.831,92₺ = **NET KÂR 2.487,86₺** (%51,5 zam)
**KDV %10 düşülünce:** ≈ 1.822₺

### Fiyatlandırma kuralları (kullanıcı tercihleri)
1. **Sadece yuvarlak rakamlar**: 10 / 15 / 20 / 25 / 30 / 35 / 40. **22, 28 gibi ara fiyat YASAK.**
   (Kullanıcı: "22 sıkıntı, 2 tl değmez")
2. Ucuz ürünlere yüksek oran, pahalıya düşük oran: maliyet 5-10₺ → %60-75, 13-18₺ → %40-50,
   20₺+ → %45-55. Amaç çocuk fiyat hassasiyetini korumak.
3. Marj hiçbir üründe %30 altına, hiçbirinde %120 üstüne çıkmamalı.
4. Koli içi adetler varsayımdır (Dido 24, Popkek 24, Didi 12, ÇiziViç 24, Susamlı 22,
   Çubuk 36, Altınbaşak 20, Gofret 36, Hoşbeş 24, Capri 20, Browni 16, Ahenk 18) — fişle
   doğrulanmalı.
5. Sarıyer Gazoz cam 200 ml ayrı alındı: maliyet 23₺ (toptan 552₺/24), satış 29₺.

### Barkod dizini (doğrulanmış)
| Ürün | Barkod |
|---|---|
| Ülker Dido 35 g | 8690504028536 |
| Eti Popkek Vişneli 60 g | 8690526073873 |
| Eti Popkek Çikolatalı 60 g | 8690526083711 |
| Eti Popkek Muzlu 60 g | 8690526083728 |
| Ülker ÇiziViç 82 g | 8690504009542 |
| Ülker Susamlı Çubuk Kraker 70 g | 8690504117827 |
| Ülker Çubuk Kraker 40 g | 8690504017301 |
| Ülker Altınbaşak Yoğurt Yemişli 50 g | 8690504011828 |
| Ülker Çikolatalı Gofret 36 g | 8690504135913 |
| Eti Hoşbeş Fındıklı 70 g | 8690526745220 |
| Eti Browni Intense 50 g | 8690526076379 |
| Çaykur Didi Bergamot 500 ml | 8691020675624 |
| Sarıyer Gazoz 200 ml Cam | 8683789552643 |
| **Eti Ahenk Gofret 18 g** | **EKSİK** (kaynak bulunamadı, uydurma!) |
| **Capri-Sun Safari 200 ml** | **EKSİK** (kaynak bulunamadı, uydurma!) |

> **ASLA barkod uydurma.** Doğrulanmış kaynak yoksa `null` bırak; o ürün kasadaki elle
> seçim ızgarasından satılır.

---

## 6. Kasa Ekranı — Mevcut Özellikler

`KasaView.jsx` sırasıyla:
1. **Barkod girişi**: USB/BT okuyucu (klavye emülasyonu, 120ms eşik) veya elle yazıp Enter.
   Okuyucu global `keydown` dinler; INPUT/TEXTAREA/SELECT odaktayken pasif.
2. **Elle ürün seçme ızgarası**: arama kutusu + ürün kartları (ad, fiyat, barkod).
   Barkodsuz ürünler buradan satılır. `code = barcode || id`.
3. **Barkod Tanımla / Ürün Ekle**: okutulan tanımsız barkod otomatik dolar.
4. **Sepet** (sağ panel): adet +/−, satır silme, toplam.
5. **Ödeme**: NAKİT / KART / **VERESİYE**. Veresiye seçilirse müşteri dropdown'ı veya
   yeni müşteri adı alanı çıkar; tahsil edince borç otomatik yazılır + log düşer.
6. **Son satış** özeti.

### Yapılacaklar (kasa için öneriler)
- `stock` alanı satışta otomatik düşmüyor — satış sonrası `mutate('update','products',...)`
- Kritik stok uyarısı (ör. ≤3 adet)
- Veresiye'ye "kısmi ödeme" hızlı butonu (50/100/Tamamı)
- Fiş yazdırma kasa satışında da çalışsın (şu an sadece OrderView'da)

---

## 7. Kapatılan Kısımlar (bilinçli)

- **Masalar / adisyon** (`TablesView`, `OrderView`) menüden kaldırıldı.
  `App.jsx`'te render `{false && <TablesView .../>}` ile devre dışı, `Sidebar`'da buton yok.
  Kod silinmedi — ileride geri açılabilir.
- Varsayılan ekran artık **KASA** (`useState('kasa')`).
- Menü sırası: **KASA → VERESİYE → BARKOD → ÜRÜNLER → CİRO → AYARLAR**

---

## 8. Build ve Yayın

```bash
cd adisyon-app && npm install && npm run build      # frontend
cd adisyon-app && npm run tauri build               # masaüstü paket
```

### CI/CD (`.github/workflows/release.yml`)
- Tetikleme: `main`'e push veya manuel (`workflow_dispatch`)
- Matrix: `macos-latest`, `windows-latest`, `ubuntu-22.04`
- Linux paketleri: `--bundles deb,appimage`
- Tag şeması: `v1.0.<run_number>` (otomatik artar)
- Android job: `build-android` (APK imzalama dahil)

### Yerel doğrulama zorunlu adımlar
1. `npx vite build` → hatasız
2. Sunucu smoke test:
   ```bash
   lsof -ti tcp:3000 | xargs -r kill; cd adisyon-server && node server.js &
   curl -s localhost:3000/api/barcode/8683789552643
   curl -X POST localhost:3000/api/sell -H 'Content-Type: application/json' \
        -d '{"code":"p-bufe-eti-ahenk-sütlü-çikolata","qty":1,"paymentMethod":"veresiye"}'
   ```
3. Test kayıtlarını DB'den temizle, sonra commit.

### Tauri v1 vs v2
Proje **Tauri v2**. Linux'ta yerel derlenemez (WebKitGTK gerekir) → CI'da doğrula.
`/tmp` noexec; hedef dizini `CARGO_TARGET_DIR=/opt/...` gibi bir yere ver.

---

## 9. Bilinen Tuzaklar / Savaş Hikâyeleri

| Belirti | Gerçek sebep | Çözüm |
|---|---|---|
| Kasa satışı sessizce kayboluyor | Tauri sunucusunda `/api/sell` yok → 404 | `mutate('add','sales')` fallback |
| Veresiye ekranı çalışmıyor | `VeresiyeView` `onAddCustomer/onAddLog/onDeleteCustomer` bekliyor, App `onAdd/onUpdate` veriyordu | Prop imzalarını eşle |
| Fiyat güncellendi ama kasa eski fiyatı gösteriyor | `barcodes[]` ayrı tutuluyor | İkisini birlikte yaz |
| Web'den bağlanınca veri gelmiyor | `localStorage.kasaIp` yanlış/boş | Ayarlar'dan kasa IP'sini gir |
| CI'da "Could not resolve ./components/X.jsx" | Yanlış branch/SHA derlenmiş | `gh run view <id> --json headSha` ile doğrula |
| 900+ dosya değişmiş görünüyor | Harici diskte filemode | `git config core.filemode false` |
| `MemoryDenyWriteExecute` Node'u öldürüyor | systemd sertleştirme Node JIT'ini engeller | Servis dosyasından kaldır |

---

## 10. Çalışma Kuralları (kullanıcı tercihleri)

1. **Türkçe konuş.** Tüm yanıt, commit mesajı ve doküman Türkçe.
2. **İşi bitir, anlatma.** Push, build, test, CI takibi ajana ait. "Şunu yapabilirim" değil,
   yapılmış iş teslim et.
3. **Token cimrisi ol.** Gereksiz araç çağrısı, tekrar okuma, uzun yoklama döngüsü yapma.
4. **Uydurma.** Barkod, fiyat, maliyet, link — hiçbiri tahminle yazılmaz. Kaynak yoksa söyle.
5. **Bedava/yerel çözüm önce.** Ücretli altyapıya geçmeden "gerçekten gerekli mi?" sor.
6. **Doğrulama yap.** Build + gerçek API çağrısı + DB kontrolü olmadan "bitti" deme.
7. **Commit formatı:** `feat(kasa): ...`, `fix(bufe): ...`, `chore: ...` — kısa, ne yaptığı belli.
8. **Kullanıcı itiraz ederse düzelt, savunma yapma.** "22 sıkıntı" dediyse 22'yi kaldır.

---

## 11. Hızlı Başlangıç (Claude için)

```bash
# 1. Disk ve repo
ls /Volumes/                        # T7 takılı mı?
git clone https://github.com/Soul-Art-000/cinar-adisyon.git
cd cinar-adisyon && git config core.filemode false

# 2. Durum
cat adisyon-app/database.json | python3 -m json.tool | head -40

# 3. Frontend
cd adisyon-app && npm install && npx vite build

# 4. Sunucu testi
cd ../adisyon-server && node server.js &
curl -s localhost:3000/api/db | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['products']),'ürün',len(d['barcodes']),'barkod')"
```

### İlk sorulacaklar
- Hangi ekranda çalışıyoruz: kasa mı, veresiye mi, ürünler mi?
- Veri değişikliği mi, kod değişikliği mi? (ikisi de `database.json`'ın İKİ kopyasını etkiler)
- Deploy gerekiyor mu? (push → CI → release → link)

---

## 12. Gelecek Fikirler (henüz yapılmadı)

- [ ] Stok takibi: satışta otomatik düşme, kritik stok uyarısı, "stok giriş" ekranı
- [ ] Veresiye: kısmi ödeme, hatırlatma listesi, günlük tahsilat özeti
- [ ] Kasa fişi: satış sonrası termal yazıcıdan fiş
- [ ] Fiyat güncelleme aracı: toplu zam/indirim (yuvarlak kuralına uyarak)
- [ ] KDV raporu: %10 gıda KDV'si ayrılmış gün sonu raporu
- [ ] Ürün fotoğrafı: kasa ızgarasında görsel
- [ ] Repo temizliği: `._*` AppleDouble dosyaları, kökteki 80+ kullanılmayan `patch_*.js`

---

*Son güncelleme: 22 Ekim 2026 — v1.0.32 sonrası, veresiye entegrasyonu ve kasa odaklı menü değişikliği dahil.*
