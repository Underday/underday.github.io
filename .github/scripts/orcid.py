"""ORCID'deki herkese açık çalışmaları index.html'deki Akademik listesine yazar.

index.html içinde <!-- ORCID:BASLA --> ile <!-- ORCID:BITIR --> arasını yeniden üretir.
İşaretlerin dışındaki satırlar (elle eklenenler) olduğu gibi kalır.
ORCID'e ulaşılamazsa dosyaya dokunmaz, sayfadaki son liste kalır.

Kullanım: python3 .github/scripts/orcid.py [index.html]
"""
import html
import json
import re
import sys
import urllib.request

ORCID = "0009-0009-3785-1099"
API = f"https://pub.orcid.org/v3.0/{ORCID}"
TUR = {
    "journal-article": "Makale",
    "conference-paper": "Bildiri",
    "conference-abstract": "Bildiri",
    "conference-poster": "Poster",
    "book": "Kitap",
    "book-chapter": "Kitap bölümü",
    "dissertation-thesis": "Tez",
    "preprint": "Ön baskı",
    "research-tool": "Araç",
    "software": "Yazılım",
}


def al(yol):
    istek = urllib.request.Request(API + yol, headers={"Accept": "application/json"})
    with urllib.request.urlopen(istek, timeout=20) as cevap:
        return json.load(cevap)


def deger(d, *anahtarlar):
    for a in anahtarlar:
        if not isinstance(d, dict):
            return None
        d = d.get(a)
    return d


def calismalar():
    ozet = al("/works")
    kodlar = [str(g["work-summary"][0]["put-code"]) for g in ozet.get("group", [])]
    sonuc = []
    for i in range(0, len(kodlar), 50):
        for parca in al("/works/" + ",".join(kodlar[i:i + 50])).get("bulk", []):
            w = parca.get("work")
            if not w:
                continue
            doi = next((e for e in deger(w, "external-ids", "external-id") or [] if e.get("external-id-type") == "doi"), None)
            url = (deger(doi, "external-id-url", "value") if doi else None) or deger(w, "url", "value")
            if not url and doi:
                url = "https://doi.org/" + doi["external-id-value"]
            sonuc.append({
                "baslik": deger(w, "title", "title", "value") or "",
                "yil": deger(w, "publication-date", "year", "value") or "",
                "yer": deger(w, "journal-title", "value") or "",
                "yazarlar": [deger(c, "credit-name", "value") for c in deger(w, "contributors", "contributor") or [] if deger(c, "credit-name", "value")],
                "tur": TUR.get(w.get("type", ""), "Çalışma"),
                "url": url,
            })
    sonuc.sort(key=lambda c: c["yil"], reverse=True)
    return sonuc


# ORCID'deki görev kayıtları İngilizce girildiyse sitede Türkçesi yazılır. Listede olmayan olduğu gibi kalır.
CEVIRI = {
    "research assistant": "Araştırma görevlisi",
    "lecturer": "Öğretim görevlisi",
    "assistant professor": "Doktor öğretim üyesi",
    "associate professor": "Doçent",
    "professor": "Profesör",
    "speech and language pathology": "Dil ve Konuşma Terapisi",
    "speech and language therapy": "Dil ve Konuşma Terapisi",
}


def kurum():
    """Bitiş tarihi olmayan (süren) ilk görev kaydı: 'Unvan, Kurum'."""
    for grup in al("/employments").get("affiliation-group", []):
        for ozet in grup.get("summaries", []):
            g = ozet.get("employment-summary") or {}
            if g.get("end-date"):
                continue
            unvan = g.get("role-title") or ""
            unvan = CEVIRI.get(unvan.strip().lower(), unvan)
            ad = deger(g, "organization", "name") or ""
            return ", ".join(x for x in [unvan, ad] if x)
    return None


def satir(c):
    e = html.escape
    baslik = f'<a href="{e(c["url"])}">{e(c["baslik"])}</a>' if c["url"] else e(c["baslik"])
    kunye = ". ".join(x for x in [", ".join(c["yazarlar"]), c["yer"]] if x)
    kunye = f'<span class="kunye">{e(kunye)}.</span>' if kunye else ""
    return f'        <li><span class="yil">{e(c["yil"])}</span><div>{baslik}{kunye}<span class="tur">{e(c["tur"])}</span></div></li>'


def main():
    dosya = sys.argv[1] if len(sys.argv) > 1 else "index.html"
    try:
        liste = calismalar()
    except Exception as hata:  # ağ ya da biçim hatası: sayfadaki son liste kalsın
        print(f"ORCID okunamadı, liste değişmedi: {hata}")
        return
    if not liste:
        print("ORCID'de herkese açık çalışma yok, liste değişmedi.")
        return
    metin = open(dosya, encoding="utf-8").read()
    try:
        k = kurum()
    except Exception as hata:
        k = None
        print(f"ORCID görev kaydı okunamadı, kurum satırı değişmedi: {hata}")
    if k:
        metin = re.sub(r"(<!-- ORCID:KURUM -->).*?(<!-- /ORCID:KURUM -->)", lambda m: m.group(1) + html.escape(k) + m.group(2), metin)
        print(f"ORCID kurum: {k}")
    yeni, n = re.subn(
        r"(<!-- ORCID:BASLA -->\n).*?([ \t]*<!-- ORCID:BITIR -->)",
        lambda m: m.group(1) + "\n".join(satir(c) for c in liste) + "\n" + m.group(2),
        metin, flags=re.S,
    )
    if not n:
        print("index.html içinde ORCID işaretleri yok.")
        sys.exit(1)
    open(dosya, "w", encoding="utf-8").write(yeni)
    print(f"ORCID: {len(liste)} çalışma yazıldı.")


if __name__ == "__main__":
    main()
