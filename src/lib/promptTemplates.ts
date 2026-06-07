// ═══════════════════════════════════════════
// AI HUB v3 — Prompt Şablon Galerisi (50+)
// ═══════════════════════════════════════════

export interface PromptTemplate {
  id: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  prompt: string;
}

export const PROMPT_CATEGORIES = [
  'Yazılım',
  'İçerik',
  'Analiz',
  'Eğitim',
  'Yaratıcı',
  'İş',
  'Sosyal',
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // YAZILIM
  {
    id: 'code-explain',
    category: 'Yazılım',
    icon: '💻',
    title: 'Kodu Açıkla',
    description: 'Herhangi bir kod parçasını satır satır açıklar',
    prompt:
      'Aşağıdaki kodu satır satır açıkla. Her satırın ne yaptığını, kullanılan fonksiyonların amacını ve potansiyel iyileştirmeleri belirt:\n\n```\n[PASTE_CODE_HERE]\n```',
  },
  {
    id: 'code-review',
    category: 'Yazılım',
    icon: '🔍',
    title: 'Kod İncelemesi',
    description: 'Profesyonel kod review yapar',
    prompt:
      'Senior developer gibi aşağıdaki kodu incele. Olumlu yönleri, hataları, güvenlik açıklarını, performans sorunlarını ve best practice önerilerini listele:\n\n```\n[PASTE_CODE_HERE]\n```',
  },
  {
    id: 'code-optimize',
    category: 'Yazılım',
    icon: '⚡',
    title: 'Kodu Optimize Et',
    description: 'Verimlilik ve hız için optimize eder',
    prompt:
      'Aşağıdaki kodu daha verimli, daha hızlı ve daha okunabilir hale getir. Big-O analizi yap ve iyileştirmeleri açıkla:\n\n```\n[PASTE_CODE_HERE]\n```',
  },
  {
    id: 'code-convert',
    category: 'Yazılım',
    icon: '🔄',
    title: 'Dil Dönüştür',
    description: 'Bir programlama dilinden diğerine çevirir',
    prompt:
      "Aşağıdaki kodu [PYTHON] dilinden [JAVASCRIPT] diline çevir. Eşdeğer fonksiyonelliği koru ve hedef dilin best practice'lerini kullan:\n\n```\n[PASTE_CODE_HERE]\n```",
  },
  {
    id: 'regex',
    category: 'Yazılım',
    icon: '🔤',
    title: 'Regex Üret',
    description: 'İhtiyacına özel regex yazdırır',
    prompt:
      'Aşağıdaki gereksinim için bir regex pattern yaz ve her bölümünü açıkla. Test senaryoları da ver:\n\nGereksinim: [DESCRIBE_NEED]',
  },
  {
    id: 'unit-test',
    category: 'Yazılım',
    icon: '🧪',
    title: 'Unit Test Yaz',
    description: 'Fonksiyonlar için test senaryoları üretir',
    prompt:
      "Aşağıdaki fonksiyon için kapsamlı unit testler yaz. Pozitif, negatif ve edge case'leri kapsa. Mock kullan gerekirse:\n\n```\n[PASTE_CODE_HERE]\n```",
  },
  {
    id: 'debug',
    category: 'Yazılım',
    icon: '🐛',
    title: 'Hata Ayıkla',
    description: 'Hata mesajlarını analiz edip çözüm sunar',
    prompt:
      'Aşağıdaki hata mesajını ve kodu analiz et. Hatanın nedenini, nasıl çözüleceğini ve gelecekte nasıl önlenebileceğini açıkla:\n\nHata: [ERROR_MESSAGE]\n\nKod: \n```\n[PASTE_CODE_HERE]\n```',
  },
  {
    id: 'api-design',
    category: 'Yazılım',
    icon: '🔌',
    title: 'API Tasarımı',
    description: 'REST API endpoint tasarımı yapar',
    prompt:
      'Aşağıdaki gereksinimlere uygun REST API endpointleri tasarla. HTTP metodları, URL patternleri, request/response modelleri ve status kodlarını belirt:\n\nGereksinim: [DESCRIBE_API_NEED]',
  },

  // İÇERİK
  {
    id: 'blog-tr',
    category: 'İçerik',
    icon: '📝',
    title: 'Blog Yazısı (TR)',
    description: 'SEO uyumlu Türkçe blog yazısı yazar',
    prompt:
      "Türkiye'deki okuyucular için SEO uyumlu, ilgi çekici bir blog yazısı yaz. Başlık önerileri, giriş, gelişme, sonuç bölümleri olsun. H2/H3 başlıkları kullan:\n\nKonu: [TOPIC]\nKelime sayısı: ~800\nTon: Bilgilendirici ve samimi",
  },
  {
    id: 'social-post',
    category: 'İçerik',
    icon: '📱',
    title: 'Sosyal Medya Gönderisi',
    description: 'Platforma özgü içerik üretir',
    prompt:
      'Aşağıdaki konu hakkında [INSTAGRAM/TWITTER/LINKEDIN] için ilgi çekici bir gönderi yaz. Emoji kullan, hashtag ekle, CTA (call-to-action) koy:\n\nKonu: [TOPIC]',
  },
  {
    id: 'email-pro',
    category: 'İçerik',
    icon: '📧',
    title: 'Profesyonel E-posta',
    description: 'İş dünyasına uygun e-posta yazar',
    prompt:
      'Aşağıdaki durum için profesyonel, nazik ve etkili bir iş e-postası yaz. Türk iş kültürüne uygun olsun:\n\nDurum: [DESCRIBE_SITUATION]\nAlıcı: [RECIPIENT_ROLE]\nTon: [FORMAL/SEMI_FORMAL]',
  },
  {
    id: 'youtube-script',
    category: 'İçerik',
    icon: '🎬',
    title: 'YouTube Senaryosu',
    description: 'Video senaryosu ve bölüm planı yapar',
    prompt:
      'Aşağıdaki konuda ~10 dakikalık bir YouTube videosu için senaryo yaz. Giriş, ana bölümler, geçişler ve kapanış olsun. Konuşma tonu kullan:\n\nKonu: [TOPIC]\nHedef Kitle: [AUDIENCE]\nTon: [EĞLENCELİ/CİDDİ/EĞİTİCİ]',
  },
  {
    id: 'product-desc',
    category: 'İçerik',
    icon: '🛍️',
    title: 'Ürün Açıklaması',
    description: 'E-ticaret ürün açıklaması yazar',
    prompt:
      'Aşağıdaki ürün için e-ticaret sitesine uygun, SEO dostu, müşteriyi ikna edici bir ürün açıklaması yaz. Özellikler, faydalar ve kullanım alanlarını belirt:\n\nÜrün: [PRODUCT_NAME]\nÖzellikler: [FEATURES]',
  },

  // ANALİZ
  {
    id: 'summarize',
    category: 'Analiz',
    icon: '📋',
    title: 'Metin Özetle',
    description: 'Uzun metinleri kısa ve öz özetler',
    prompt:
      'Aşağıdaki metni özetle. Ana fikirleri, önemli noktaları ve sonuçları maddeleyerek belirt. Özet ~%20 uzunluğunda olsun:\n\n[PASTE_TEXT_HERE]',
  },
  {
    id: 'compare',
    category: 'Analiz',
    icon: '⚖️',
    title: 'Karşılaştırma',
    description: 'İki veya daha fazla şeyi karşılaştırır',
    prompt:
      'Aşağıdakileri detaylıca karşılaştır. Artıları, eksileri, kullanım senaryoları ve hangisinin ne zaman tercih edilmesi gerektiğini açıkla:\n\n1) [OPTION_A]\n2) [OPTION_B]',
  },
  {
    id: 'swot',
    category: 'Analiz',
    icon: '📊',
    title: 'SWOT Analizi',
    description: 'Güçlü/zayıf yönleri ve fırsat/tehditleri analiz eder',
    prompt:
      'Aşağıdaki konu/kuruluş/ürün için SWOT analizi yap. Her bir başlık altında en az 3 madde olacak şekilde detaylandır:\n\nKonu: [SUBJECT]',
  },
  {
    id: 'data-insight',
    category: 'Analiz',
    icon: '📈',
    title: 'Veri Analizi',
    description: 'Verilerden içgörü çıkarır',
    prompt:
      'Aşağıdaki veriyi analiz et. Trendleri, anormallikleri, önemli patternleri ve eyleme geçirilebilir önerileri belirt:\n\n```\n[PASTE_DATA_HERE]\n```',
  },

  // EĞİTİM
  {
    id: 'explain-like-im-5',
    category: 'Eğitim',
    icon: '👶',
    title: '5 Yaşındaya Anlat',
    description: 'Karmaşık konuları basitleştirir',
    prompt:
      'Aşağıdaki konuyu 5 yaşındaki bir çocuğa anlatır gibi açıkla. Basit kelimeler, günlük hayattan örnekler ve analogiler kullan:\n\nKonu: [COMPLEX_TOPIC]',
  },
  {
    id: 'study-plan',
    category: 'Eğitim',
    icon: '📚',
    title: 'Çalışma Planı',
    description: 'Kişiselleştirilmiş çalışma programı yapar',
    prompt:
      'Aşağıdaki konu için haftalık bir çalışma planı hazırla. Her gün için konular, kaynaklar ve pratik egzersizler belirt:\n\nKonu: [SUBJECT]\nSeviye: [BEGINNER/INTERMEDIATE/ADVANCED]\nHaftalık zaman: [HOURS] saat',
  },
  {
    id: 'quiz-maker',
    category: 'Eğitim',
    icon: '❓',
    title: 'Quiz/Soru Üret',
    description: 'Konu üzerinde test soruları hazırlar',
    prompt:
      'Aşağıdaki konuda 10 adet çoktan seçmeli test sorusu hazırla. Her sorunun doğru cevabını ve açıklamasını da yaz:\n\nKonu: [TOPIC]\nZorluk: [KOLAY/ORTA/ZOR]',
  },
  {
    id: 'flashcards',
    category: 'Eğitim',
    icon: '🎴',
    title: 'Flashcard Üret',
    description: 'Öğrenme kartları oluşturur',
    prompt:
      'Aşağıdaki konuda 15 adet flashcard (ön yüz/arka yüz) oluştur. JSON formatında döndür: {"cards":[{"front":"...","back":"..."}]}\n\nKonu: [TOPIC]',
  },
  {
    id: 'math-solve',
    category: 'Eğitim',
    icon: '🔢',
    title: 'Matematik Çöz',
    description: 'Matematik problemlerini adım adım çözer',
    prompt:
      'Aşağıdaki matematik problemini adım adım çöz. Her adımı gerekçesiyle birlikte açıkla:\n\nProblem: [MATH_PROBLEM]',
  },

  // YARATICI
  {
    id: 'story-tr',
    category: 'Yaratıcı',
    icon: '📖',
    title: 'Hikaye Yaz (TR)',
    description: 'Türkçe yaratıcı hikaye yazar',
    prompt:
      'Aşağıdaki temaları içeren yaratıcı bir hikaye yaz. Türkçe edebi bir dil kullan, karakter gelişimi olsun, sürükleyici bir kurgu oluştur:\n\nTema: [THEME]\nTür: [TÜR]\nUzunluk: ~500 kelime',
  },
  {
    id: 'poem-tr',
    category: 'Yaratıcı',
    icon: '📜',
    title: 'Şiir Yaz (TR)',
    description: 'Türkçe şiir yazar',
    prompt:
      'Aşağıdaki konuda Türkçe bir şiir yaz. Uyak düzeni, ölçü ve nazım birimi belirle. Duygusal ve etkileyici olsun:\n\nKonu: [TOPIC]\nTür: [HİKMET/SEMAHİ/ÖZGÜR]',
  },
  {
    id: 'character-create',
    category: 'Yaratıcı',
    icon: '🎭',
    title: 'Karakter Oluştur',
    description: 'Oyun/hikaye karakteri tasarlar',
    prompt:
      'Aşağıdaki kriterlere göre detaylı bir karakter profili oluştur. Fiziksel özellikler, kişilik, geçmiş, yetenekler ve zayıflıkları belirt:\n\nTür: [FANTASY/BİLİM_KURGU/KORKU]\nRol: [KAHRAMAN/KÖTÜ/YARDIMCI]',
  },
  {
    id: 'world-build',
    category: 'Yaratıcı',
    icon: '🌍',
    title: 'Dünya Kurma',
    description: 'Hayali evren/dünya tasarımı yapar',
    prompt:
      'Aşağıdaki türde detaylı bir hayali dünya/even tasarımı yap. Coğrafya, tarih, kültür, teknoloji/magick sistemi, topluluklar ve kuralları belirt:\n\nTür: [FANTASY/BİLİM_KURGU/POST_APOKALİPTİK]',
  },
  {
    id: 'dialogue',
    category: 'Yaratıcı',
    icon: '💬',
    title: 'Diyalog Yaz',
    description: 'Karakterler arası diyalog yazar',
    prompt:
      'Aşağıdaki karakterler arasında gerçekçi ve karaktere uygun bir diyalog yaz. Konuşma tarzları, vurgular ve alt metin olsun:\n\nKarakter 1: [CHAR1_DESCRIPTION]\nKarakter 2: [CHAR2_DESCRIPTION]\nDurum: [SITUATION]',
  },

  // İŞ
  {
    id: 'business-plan',
    category: 'İş',
    icon: '📋',
    title: 'İş Planı Özeti',
    description: 'Startup/İş fikri için plan yapar',
    prompt:
      'Aşağıdaki iş fikri için kapsamlı bir iş planı özeti hazırla. Problem, çözüm, hedef pazar, gelir modeli, pazarlama stratejisi ve mali projeksiyonları belirt:\n\nİş Fikri: [IDEA]\nHedef Pazar: [MARKET]',
  },
  {
    id: 'meeting-notes',
    category: 'İş',
    icon: '📌',
    title: 'Toplantı Notları',
    description: 'Toplantıdan özet ve aksiyon maddeleri çıkarır',
    prompt:
      'Aşağıdaki toplantı notlarını profesyonel bir formatta düzenle. Gündem, kararlar, aksiyon maddeleri (sorumlu + deadline) ve takip konularını belirt:\n\nNotlar: [PASTE_NOTES_HERE]',
  },
  {
    id: 'pitch-deck',
    category: 'İş',
    icon: '🎯',
    title: 'Pitch Deck Yaz',
    description: 'Yatırımcı sunumu içeriği hazırlar',
    prompt:
      'Aşağıdaki startup için yatırımcı sunumu (pitch deck) içeriği hazırla. Her slayt için başlık ve 3-5 maddelik içerik belirt:\n\nStartup: [NAME]\nProblem: [PROBLEM]\nÇözüm: [SOLUTION]\nPazar: [MARKET_SIZE]',
  },
  {
    id: 'interview-prep',
    category: 'İş',
    icon: '🎤',
    title: 'Mülakat Hazırlığı',
    description: 'İş görüşmesi için sorular ve cevaplar hazırlar',
    prompt:
      'Aşağıdaki pozisyon için mülakat hazırlığı yap. Muhtemel soruları ve etkili cevap önerilerini ver. Teknik ve davranışsal sorular olsun:\n\nPozisyon: [JOB_TITLE]\nŞirket: [COMPANY_TYPE]\nTecrübe: [YEAR] yıl',
  },
  {
    id: 'cv-improve',
    category: 'İş',
    icon: '📄',
    title: 'CV İyileştir',
    description: 'Özgeçmişi ATS uyumlu ve etkili hale getirir',
    prompt:
      'Aşağıdaki özgeçmişi ATS (Applicant Tracking System) uyumlu, etkileyici ve profesyonel bir formata getir. Eylem fiilleri, ölçülebilir başarılar ve anahtar kelimeler kullan:\n\n[PASTE_CV_HERE]',
  },

  // SOSYAL
  {
    id: 'translate-pro',
    category: 'Sosyal',
    icon: '🌐',
    title: 'Profesyonel Çeviri',
    description: 'Türkçe↔İngilizce profesyonel çeviri',
    prompt:
      'Aşağıdaki metni Türkçeden İngilizceye profesyonel bir şekilde çevir. Kültürel bağlamı koru, deyimleri doğru aktar:\n\n[PASTE_TEXT_HERE]',
  },
  {
    id: 'proofread',
    category: 'Sosyal',
    icon: '✅',
    title: 'Yazım Denetimi',
    description: 'Türkçe yazım ve dil bilgisi kontrolü',
    prompt:
      'Aşağıdaki metni Türkçe yazım, noktalama ve dil bilgisi kurallarına göre düzelt. Hataları işaretle ve açıklamasını ver:\n\n[PASTE_TEXT_HERE]',
  },
  {
    id: 'debate',
    category: 'Sosyal',
    icon: '🗣️',
    title: 'Münazara Hazırlığı',
    description: 'Her iki tarafın argümanlarını hazırlar',
    prompt:
      'Aşağıdaki konuda münazara hazırlığı yap. PRO ve CONTRA argümanlarını, muhtemel karşı argümanları ve etkili kapama cümlelerini belirt:\n\nKonu: [DEBATE_TOPIC]',
  },
  {
    id: 'meditation-guide',
    category: 'Sosyal',
    icon: '🧘',
    title: 'Meditasyon Rehberi',
    description: 'Kişiselleştirilmiş meditasyon programı hazırlar',
    prompt:
      'Aşağıdaki ihtiyaca göre bir meditasyon/mindfulness rehberi hazırla. Adım adım talimatlar, nefes egzersizleri ve günlük rutin önerileri ver:\n\nAmaç: [STRESS/FOCUS/SLEEP/GENERAL]\nDeneyim: [BEGINNER/INTERMEDIATE]',
  },
  {
    id: 'recipe',
    category: 'Sosyal',
    icon: '🍳',
    title: 'Tarif Oluştur',
    description: 'Malzemelere göre yemek tarifi yazar',
    prompt:
      'Aşağıdaki malzemelerle yapılabilecek bir yemek tarifi ver. Adım adım hazırlanışı, püf noktaları ve servis önerileri ekle:\n\nMalzemeler: [INGREDIENTS]\nKişi sayısı: [COUNT]\nSüre: ~[TIME] dk',
  },
];
