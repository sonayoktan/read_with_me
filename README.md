# Read With Me

Kitap okurken, ders çalışırken veya derin odaklanma gerektiren anlarda sakin bir çalışma ortamı sunmak için tasarlanmış minimalist bir odaklanma alanı.

Uygulama; dikkati dağıtmayan estetik görseller, yumuşak ışık ve vignette filtreleri, rahatsız etmeyen çan sesine sahip bir Pomodoro sayacı, ortam sesleri ve müzik entegrasyonunu tek bir arayüzde bir araya getirir.

---

## Öne Çıkan Detaylar

### Görsel Atmosfer ve Arka Plan
- İllüstrasyon veya fotoğraf tabanlı tam ekran arka plan desteği.
- Mobil ve masaüstü ekranlarda görselin ana kompozisyonunu (odak noktasını) koruyan akıllı konumlandırma.
- Kullanıcı tercihine göre yüzdelik (%) derecesi ince ayarlanabilen ve açılıp kapatılabilen odaklı vignette, sıcak akşam lambası filtresi (Warm Glow) ve nostaljik CRT tarama çizgisi (Scanlines) efektleri.
- Okunabilirlik için hassas ayarlanabilen arka plan karartma seviyesi.
- Bilgisayardan yerel görsel yükleme veya web üzerinden görsel bağlantısı tanımlayabilme imkanı.

### Pomodoro Sayacı ve Zamanlayıcı
- Pomodoro (25 dakika), Kısa Mola (5 dakika), Uzun Mola (15 dakika) ve limitsiz Kronometre modları.
- Süre bittiğinde çalan, kulak tırmalamayan ve meditatif iki aşamalı yumuşak çan sesi (Web Audio API ve dahili ses desteği).
- İhtiyaca göre kişiselleştirilebilen seans süreleri.
- Ekran düzenine göre sayacı sağ üst veya sol üst köşeye taşıyabilme.
- Sekme başlığında gerçek zamanlı kalan süre takibi.

### Ortam Sesleri ve Müzik
- Web Audio API ile sıfır gecikmeli üretilen kesintisiz yağmur, şömine ateşi ve rüzgar tınıları.
- Her ortam sesi için bağımsız ses seviyesi denetimi.
- Entegre Spotify oynatıcı desteği (hazır lo-fi ve piyano listeleri veya kişisel çalma listesi bağlantısı).

### Okuma Takibi ve Alıntılar
- Mevcut okunan kitap adı, yazar ve sayfa numarası kartı.
- Odaklanmayı destekleyen sakinleştirici edebiyat alıntıları.

### Odaklanma Seçenekleri
- Zen Modu: Sayacı ve arka planı korurken diğer tüm kontrolleri gizleyerek dikkati yalnızca okumaya yönlendirir.
- Tek dokunuşla tam ekran (Fullscreen) geçişi.

---

## Klavye Kısayolları

| Kısayol | İşlev |
| :--- | :--- |
| Boşluk (Space) | Sayacı başlatır veya duraklatır |
| Z | Zen (Odak) modunu açar veya kapatır |
| F | Tam ekran moduna geçer veya çıkar |
| B | Arka plan ve atmosfer ayarlarını açar |

---

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Sunucu başladıktan sonra tarayıcınızdan aşağıdaki adrese gidebilirsiniz:

[http://localhost:5173](http://localhost:5173)

---

## Kullanılan Teknolojiler

- React 19 & TypeScript
- Vite
- Tailwind CSS
- Web Audio API (Prosedürel ortam sesleri ve çan sentezi)
- Lucide Icons
- Canvas Confetti
