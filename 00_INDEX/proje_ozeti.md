# Proje Özeti — AI Panel Pro

## Genel Amaç
Yerel çalışan, çok ajanlı AI panel sistemi.
İnternet bağlantısı olmadan da çalışabilen, kendi hafızası olan bir AI iş istasyonu.

## Teknoloji Yığını
- **LLM**: Groq API (bulut) + Ollama (yerel)
- **Görsel**: Pollinations AI (flux-pro, gptimage, imagen4)
- **STT**: Whisper (kurulu — port 1953, model: base, dil: tr)
- **Panel**: PowerShell HTTP sunucusu — port 1942
- **Tarayıcı**: Brave (app mode)

## Mevcut Durum
| Servis | Port | Durum |
|--------|------|-------|
| Panel | 1942 | ✅ |
| Koordinatör | 1943 | ✅ |
| AjanYönlendirici | 1944 | ❌ |
| WebIzleme | 1945 | ✅ |
| DosyaAjan | 1946 | ✅ |
| PCAjan | 1947 | ✅ |
| KodYamaci | 1948 | ✅ |
| OrkestaSefi | 1950 | ✅ |
| DDGAjan | 1951 | ✅ |
| TokenAjan | 1952 | ✅ |
| WhisperSTT | 1953 | ✅ |

## API Anahtarları
- Groq: ✅
- Serper: ✅
- Pollinations: ücretsiz (key yok)
- Mistral/Gemini/Cerebras: ❌

## Tamamlanan Önemli İşler
- Filesystem MCP kuruldu
- TokenAjan + DDGAjan entegrasyonu
- Pollinations tam entegrasyon (görsel, analiz, arama)
- WhisperSTT kuruldu ve çalışıyor (port 1953, model: base, dil: tr)
- Merkezi hafıza sistemi kuruldu
