/* Hece tasarım dili: prosedürel resim.
   Bir renkli şekil ve üzerinden geçen, konuşmaya benzeyen bir ses dalgası çizer.
   Seçilen rengi sayfanın --vurgu değişkenine yazar, böylece bütün sayfa o renge boyanır.

   Kullanım:
     <svg id="resim" viewBox="0 0 400 400"></svg>
     <script src="hece-resim.js"></script>
     <script>HeceResim.bagla(document.getElementById("resim"), document.getElementById("yenile"));</script>

   Seçenekler (hepsi isteğe bağlı):
     renkler          renk listesi (#rrggbb)
     sekiller         kullanılacak şekil türleri (SEKILLER listesinden)
     dalgalar         kullanılacak dalga türleri (DALGALAR listesinden)
     gorseller        şeklin içine kesilip renge boyanacak görsel adresleri
     gorselOlasiligi  görsel gelme olasılığı, 0 ile 1 arası
     tohum            aynı sayı her zaman aynı resmi verir. Verilmezse rastgele seçilir.
     motif            şeklin üstüne çizilecek, sayfanın konusuna uygun desen.
                      Hazır olanlar: "dalga" (konuşma, ses), "metin" (belge, yazı denetimi), "spektrogram" (ses analizi, Praat).
                      Kendi motifini fonksiyon olarak verebilirsin: motif: (c) => { ... }
                      c içinde: svg, el, r (aralıkta sayı), sec (listeden seç), renk, ikinci, cx, cy, R.
                      Kural: her sayfa kendi bağlamına uygun motifi kullanır, aynı görsel her yerde tekrar etmez.
     ikiRenkOlasiligi ikinci rengin girme olasılığı (varsayılan 0.5)
     vurguHedefi      --vurgu değişkeninin yazılacağı öğe (varsayılan: <html>). null verilirse yazılmaz.
*/
(function (kok) {
  "use strict";
  const RENKLER = ["#2f5bff", "#ff4f2e", "#ffbe0b", "#12b886", "#8c5cff", "#ff5fa2", "#00a6d6"];
  const SEKILLER = ["daire", "yarim", "iki", "kare", "halka", "ucgen", "ceyrek", "hap", "merkez", "noktalar", "seritler", "ikili"];
  const DALGALAR = ["cizgi", "cizgi", "cubuk", "cift", "nokta"];
  const NS = "http://www.w3.org/2000/svg";
  let sayac = 0;

  // Tohumlu rastgele sayı üreteci (mulberry32)
  function uretec(tohum) {
    let a = tohum >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const el = (ad, ozellik) => { const e = document.createElementNS(NS, ad); for (const k in ozellik) e.setAttribute(k, ozellik[k]); return e; };

  function ciz(svg, secenek = {}) {
    const renkler = secenek.renkler || RENKLER;
    const tohum = secenek.tohum ?? Math.floor(Math.random() * 1e9);
    const rnd = uretec(tohum);
    const r = (a, b) => a + rnd() * (b - a);
    const sec = d => d[Math.floor(rnd() * d.length)];
    const kimlik = "hece" + (++sayac);
    svg.textContent = "";

    const renk = sec(renkler), ikinci = sec(renkler.filter(x => x !== renk));
    const hedef = secenek.vurguHedefi === undefined ? document.documentElement : secenek.vurguHedefi;
    if (hedef) hedef.style.setProperty("--vurgu", renk);

    // Şekil
    const cx = r(170, 240), cy = r(160, 230), R = r(110, 155);
    const sekiller = [];
    const S = (ad, oz, dolgu = renk) => sekiller.push([ad, oz, dolgu]);
    const tur = sec(secenek.sekiller || SEKILLER);
    const don = () => `rotate(${sec([0, 90, 180, 270])} ${cx} ${cy})`;
    if (tur === "daire") S("circle", { cx, cy, r: R });
    if (tur === "yarim") S("path", { d: `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`, transform: don() });
    if (tur === "iki") { S("circle", { cx: cx - R * 0.35, cy, r: R * 0.75, opacity: 0.55 }); S("circle", { cx: cx + R * 0.35, cy, r: R * 0.75 }); }
    if (tur === "kare") S("rect", { x: cx - R * 0.9, y: cy - R * 0.9, width: R * 1.8, height: R * 1.8, rx: R * 0.25, transform: `rotate(${r(-12, 12)} ${cx} ${cy})` });
    if (tur === "halka") S("circle", { cx, cy, r: R * 0.82, fill: "none", stroke: renk, "stroke-width": R * 0.36 }, "none");
    if (tur === "ucgen") { const a = r(0, 360) * Math.PI / 180; S("polygon", { points: [0, 1, 2].map(k => `${cx + R * 1.1 * Math.cos(a + k * 2.094)},${cy + R * 1.1 * Math.sin(a + k * 2.094)}`).join(" ") }); }
    if (tur === "ceyrek") S("path", { d: `M ${cx - R} ${cy + R} L ${cx - R} ${cy - R} A ${R * 2} ${R * 2} 0 0 1 ${cx + R} ${cy + R} Z`, transform: don() });
    if (tur === "hap") S("rect", { x: cx - R * 1.1, y: cy - R * 0.5, width: R * 2.2, height: R, rx: R * 0.5, transform: `rotate(${r(-35, 35)} ${cx} ${cy})` });
    if (tur === "merkez") [1, 0.68, 0.36].forEach((k, i) => S("circle", { cx, cy, r: R * k, opacity: [0.35, 0.65, 1][i] }));
    if (tur === "noktalar") { const n = 6, ad = (R * 2) / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (Math.hypot(i - 2.5, j - 2.5) < 3.3) S("circle", { cx: cx - R + ad * (i + 0.5), cy: cy - R + ad * (j + 0.5), r: ad * r(0.18, 0.42) }); }
    if (tur === "seritler") { const n = 5, h = (R * 2) / (n * 1.6); for (let i = 0; i < n; i++) { const w = R * 2 * Math.sqrt(1 - ((i - 2) / 2.6) ** 2); S("rect", { x: cx - w / 2, y: cy - R + i * h * 1.6, width: w, height: h, rx: h / 2 }); } }
    if (tur === "ikili") { S("circle", { cx: cx - R * 0.2, cy: cy - R * 0.1, r: R * 0.8 }); S("circle", { cx: cx + R * 0.45, cy: cy + R * 0.35, r: R * 0.45 }, ikinci); }

    // İkinci renk: açılışların yaklaşık yarısında şekle ikinci renkte bir öğe eklenir ya da bir parçası o renge boyanır
    if (tur !== "ikili" && rnd() < (secenek.ikiRenkOlasiligi ?? 0.5)) {
      const cok = sekiller.filter(([, oz]) => oz.fill !== "none");
      if (cok.length > 2) { const k = sec(cok); k[2] = ikinci; delete k[1].opacity; }
      else if (tur === "iki" || tur === "merkez") { const k = sekiller[sekiller.length - 1]; k[2] = ikinci; }
      else { const a = r(0, 6.28); sekiller.push(["circle", { cx: cx + Math.cos(a) * R * 0.62, cy: cy + Math.sin(a) * R * 0.62, r: R * r(0.32, 0.46) }, ikinci]); }
    }
    const gorseller = secenek.gorseller || [];
    const gorsel = gorseller.length && rnd() < (secenek.gorselOlasiligi ?? 0.6) ? sec(gorseller) : null;
    if (!gorsel) for (const [ad, oz, dolgu] of sekiller) svg.append(el(ad, { fill: dolgu, ...oz }));
    else {
      // Görsel şeklin içine kesilir ve seçilen rengin tonlarıyla boyanır (duotone)
      const v = hex(renk);
      const defs = el("defs", {}), kes = el("clipPath", { id: kimlik + "-kes" });
      for (const [ad, oz] of sekiller) { const { opacity, ...geri } = oz; kes.append(el(ad, geri)); }
      const filtre = el("filter", { id: kimlik + "-ton", "color-interpolation-filters": "sRGB" });
      filtre.append(el("feColorMatrix", { type: "saturate", values: "0" }));
      const ct = el("feComponentTransfer", {});
      ["R", "G", "B"].forEach((k, i) => ct.append(el("feFunc" + k, { type: "table", tableValues: `${(v[i] * 0.18).toFixed(3)} ${v[i].toFixed(3)} ${(v[i] + (1 - v[i]) * 0.82).toFixed(3)}` })));
      filtre.append(ct); defs.append(kes, filtre); svg.append(defs);
      const g = el("g", { "clip-path": `url(#${kimlik}-kes)` });
      g.append(el("rect", { x: 0, y: 0, width: 400, height: 400, fill: renk }));
      g.append(el("image", { href: gorsel, x: cx - R * 1.1, y: cy - R * 1.05, width: R * 2.2, height: R * 2.2, preserveAspectRatio: "xMidYMid slice", filter: `url(#${kimlik}-ton)` }));
      svg.append(g);
    }

    const motif = secenek.motif || "dalga";
    const c = { svg, el, r, sec, renk, ikinci, cx, cy, R, secenek };
    const sonuc = typeof motif === "function" ? motif(c) : (MOTIFLER[motif] || MOTIFLER.dalga)(c);
    return { tohum, renk, sekil: tur, motif: typeof motif === "function" ? "ozel" : motif, ayrinti: sonuc };
  }

  /* Hazır motifler. Yeni bir bağlam için buraya ekle ya da sayfada fonksiyon olarak ver. */
  const MOTIFLER = {
    // Konuşma ve ses: birkaç hece, her hecede genliği artıp azalan salınım
    dalga({ svg, el, r, sec, secenek }) {
      const y0 = r(175, 235), heceler = Math.floor(r(2, 5));
      const merkezler = Array.from({ length: heceler }, (_, i) => 60 + (280 / heceler) * (i + 0.5) + r(-15, 15));
      const genislik = merkezler.map(() => r(20, 32)), siklik = r(0.11, 0.2), faz = r(0, 6.28), gen = r(65, 92);
      const zarf = x => merkezler.reduce((m, c, i) => Math.max(m, Math.exp(-((x - c) ** 2) / (2 * genislik[i] ** 2))), 0);
      const yk = x => y0 + Math.sin(x * siklik + faz) * (4 + zarf(x) * gen);
      const dalga = sec(secenek.dalgalar || DALGALAR);
      const cizgi = (f, adim) => { const nk = []; for (let x = 0; x <= 400; x += adim) nk.push(`${x},${f(x).toFixed(1)}`); return nk.join(" "); };
      if (dalga === "cizgi" || dalga === "cift") svg.append(el("polyline", { points: cizgi(yk, 2), class: "dalga" }));
      if (dalga === "cift") svg.append(el("polyline", { points: cizgi(x => 2 * y0 - yk(x) + 14, 2), class: "dalga", opacity: 0.45 }));
      if (dalga === "cubuk") for (let x = 8; x < 400; x += 9) { const h = 3 + zarf(x) * gen * r(0.55, 1); svg.append(el("line", { x1: x, x2: x, y1: y0 - h, y2: y0 + h, class: "dalga", style: "stroke-width:4" })); }
      if (dalga === "nokta") svg.append(el("polyline", { points: cizgi(yk, 1), class: "dalga", "stroke-dasharray": "0.1 8", style: "stroke-width:5" }));
      return dalga;
    },
    // Belge ve yazı denetimi: kelime çubuklarından satırlar, bir iki kelime işaretli
    metin({ svg, el, r, sec, cy }) {
      const satir = Math.floor(r(3, 6)), aralik = r(50, 60), h = r(20, 26), kalin = h * 0.28;
      const y0 = Math.max(50, Math.min(350 - satir * aralik, cy - (satir * aralik) / 2));
      const kelimeler = [];
      for (let i = 0; i < satir; i++) {
        let x = r(30, 60); const son = i === satir - 1 ? r(170, 280) : r(310, 370);
        while (x < son) { const w = r(34, 110); if (x + w > son) break; kelimeler.push({ x, y: y0 + i * aralik, w }); x += w + r(12, 18); }
      }
      const isaretli = new Set(Array.from({ length: sec([1, 1, 2]) }, () => Math.floor(r(0, kelimeler.length))));
      kelimeler.forEach((k, i) => {
        if (!isaretli.has(i)) { svg.append(el("rect", { x: k.x, y: k.y, width: k.w, height: h, rx: h / 2, class: "motif-dolgu" })); return; }
        svg.append(el("rect", { x: k.x - 8, y: k.y - 8, width: k.w + 16, height: h + 16, rx: (h + 16) / 2, class: "motif-cizgi", style: `stroke-width:${kalin}` }));
        let d = `M ${k.x - 4} ${k.y + h + 20}`; for (let x = k.x - 4; x < k.x + k.w + 4; x += 14) d += ` q 3.5 -8 7 0 t 7 0`;
        svg.append(el("path", { d, class: "motif-cizgi", style: `stroke-width:${kalin}` }));
      });
      return { satir, isaretli: isaretli.size };
    },
    // Ses analizi (Praat): spektrogram görünümü. Hecelerde kalın formant izleri, üstte noktalı perde eğrisi
    spektrogram({ svg, el, r, cy }) {
      const hece = Math.floor(r(2, 4)), alt = Math.min(340, Math.max(250, cy + r(40, 90)));
      const bant = r(42, 52), kalin = r(9, 13), sol = r(34, 56), sag = r(344, 366);
      const gen = (sag - sol) / hece, perde = [];
      for (let i = 0; i < hece; i++) {
        const x1 = sol + i * gen + r(4, 10), x2 = sol + (i + 1) * gen - r(10, 20);
        for (let f = 0; f < 3; f++) {
          const y1 = alt - (f + 0.4) * bant + r(-10, 10), y2 = y1 + r(-18, 18);
          const ort = (y1 + y2) / 2 + r(-10, 10);
          svg.append(el("path", { d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${((x1 + x2) / 2).toFixed(1)} ${ort.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
            class: "motif-cizgi", style: `stroke-width:${(kalin * (1 - f * 0.18)).toFixed(1)}`, opacity: (1 - f * 0.22).toFixed(2) }));
        }
        const py = alt - 3.4 * bant - r(10, 30), egim = r(-16, 16);
        for (let x = x1; x <= x2; x += 13) perde.push([x, py + egim * Math.sin(((x - x1) / (x2 - x1)) * Math.PI) - (x - x1) * 0.06]);
      }
      perde.forEach(([x, y]) => svg.append(el("circle", { cx: x.toFixed(1), cy: Math.max(28, y).toFixed(1), r: 4, class: "motif-dolgu" })));
      return { hece };
    },
  };

  // Resmi çizer, resme ve (varsa) düğmeye tıklayınca yeniden çizer
  function bagla(svg, dugme, secenek = {}) {
    if (!svg) return null;
    const cevir = () => { if (!dugme) return; dugme.classList.remove("dondu"); void dugme.offsetWidth; dugme.classList.add("dondu"); };
    const yeniden = () => { const s = ciz(svg, { ...secenek, tohum: undefined }); cevir(); return s; };
    svg.addEventListener("click", yeniden);
    if (dugme) dugme.addEventListener("click", yeniden);
    return ciz(svg, secenek);
  }

  kok.HeceResim = { ciz, bagla, RENKLER, SEKILLER, DALGALAR, MOTIFLER };
})(window);
