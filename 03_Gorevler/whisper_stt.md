# Whisper STT Kurulum Planı — Port 1953

## Sorun
webkitSpeechRecognition Electron'da çalışmıyor → "ağ hatası"

## Çözüm
Python ile yerel Whisper HTTP servisi

## Python Yolları (bilgisayarda mevcut)
- `C:\Users\yilma\.platformio\python3\python.exe` ✅
- `C:\Users\yilma\.cache\codex-runtimes\...\python.exe` ✅

## Servis Yapısı
```
POST http://localhost:1953/kaydet
→ mikrofonu X saniye dinle
→ WAV kaydet
→ Whisper ile çevir
→ metin döndür

POST http://localhost:1953/transkript
→ gönderilen ses dosyasını çevir
→ metin döndür
```

## Dosya Konumu
- Script: `D:\AI_Data\Workspace\WhisperSTT.py` (mevcut)
- Başlatıcı: `D:\AI_Data\Workspace\Panel\WhisperSTT_Baslatici.ps1` (mevcut)

## Yapılacaklar
1. Python'un whisper + sounddevice + numpy kurulu mu kontrol et
2. WhisperSTT.py'yi test et
3. Port 1953'te ayağa kalkıyor mu doğrula
4. Panel UI'a mikrofon butonunu bağla

## Bağlantılar
- [[../03_Gorevler/siradaki_isler]]
- [[../00_INDEX/proje_ozeti]]
