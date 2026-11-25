# underday.github.io

Kişisel merkez sitem: **https://underday.github.io**

Hakkımda bilgiler, kendi yaptığım küçük araçlar, akademik çalışmalar, yazılar ve kişisel projeler tek sayfada toplanıyor.

## Araçlar

Her araç kendi deposunda durur. Web araçları bu sitenin altında kendi adresiyle yayımlanır.

| Araç | Ne yapar | Depo |
| --- | --- | --- |
| [Materyal Denetçisi](https://underday.github.io/materyal-denetcisi/) | Aileye gönderilecek terapi materyalini argo, uygunsuz kelime ve yazım hatası için denetler. PDF, Word ya da düz metin kabul eder. | [materyal-denetcisi](https://github.com/Underday/materyal-denetcisi) |
| [Praat Türkçe](https://underday.github.io/Praat-turkish/) | Ses analizi programı Praat için Türkçe arayüz, terim sözlüğü ve Türkçe ölçüm araçları (Praat 7 tabanlı). | [Praat-turkish](https://github.com/Underday/Praat-turkish) |

## Kişisel projeler

| Proje | Ne yapar |
| --- | --- |
| [Task-tui](https://github.com/Underday/Task-tui) | Google Tasks'i terminalden yöneten hafif bir arayüz. |
| [Omarchy-snooker](https://github.com/Underday/Omarchy-snooker) | Masaüstü çubuğunda süren snooker turnuvasını, canlı skorları ve günün maç programını gösteren bileşen. |

## Yapı

- `index.html`: tek sayfa. Bölümler: Hakkımda, Araçlar, Akademik, Yazılar, Kişisel projeler.
- `hece.css`, `hece-resim.js`, `hece-tema.js`: sitenin tasarım dili. Her açılışta değişen tek bir renk, prosedürel olarak çizilen bir görsel, açık ve koyu tema.
- `.github/workflows/pages.yml`: klasörü olduğu gibi GitHub Pages'e yükler. Derleme adımı yoktur.
