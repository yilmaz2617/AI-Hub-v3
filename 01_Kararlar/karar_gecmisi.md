# Karar Geçmişi

## 2026-05-14
### K-001 — Merkezi Hafıza Sistemi
- **Karar**: Obsidian vault + decision_log.json + context.md kuruldu
- **Neden**: 5-6 farklı Claude hesabı aynı proje için kullanılıyor, her oturumda bağlam kayboluyordu
- **Amaç**: Tüm hesaplardan gelen kararları tek depoda toplamak
- **Hedef**: Yeni oturumda Claude devam_notu.txt ve context.md okuyarak sormadan devam etsin

### K-002 — Whisper STT Öncelik
- **Karar**: Port 1953 Whisper STT en öncelikli iş olarak belirlendi
- **Neden**: webkitSpeechRecognition Electron'da çalışmıyor
- **Amaç**: Mikrofon desteğini tüm panellerde çalışır hale getirmek
- **Hedef**: Python ile yerel HTTP servisi, POST /kaydet endpoint

### K-003 — Panel Başlatıcıya Devam Notu Entegrasyonu
- **Karar**: AI-Panel-Baslatici.ps1'e devam_notu.txt otomatik okuma eklendi
- **Neden**: Panel her başladığında bağlam kayboluyordu
- **Amaç**: Panel açılışında son durumu logla

## Bağlantılar
- [[siradaki_isler]] → Sıradaki işler
- [[../00_INDEX/proje_ozeti]] → Proje özeti
