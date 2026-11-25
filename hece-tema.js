/* Hece tasarım dili: tema düğmesi ve menü vurgusu.
   - id="tema" olan düğme sistem, açık ve koyu arasında döner, seçim tarayıcıda hatırlanır.
   - .menu içindeki #bolum bağlantıları, kaydırırken görünen bölüme göre "aktif" sınıfı alır.
   Bu dosyayı sayfanın sonunda yükle. */
(function () {
  "use strict";
  const kok = document.documentElement, btn = document.getElementById("tema");
  if (btn) {
    const ad = { sistem: "sistem", light: "açık", dark: "koyu" };
    let t; try { t = localStorage.getItem("tema") || "sistem"; } catch { t = "sistem"; }
    const uygula = () => { if (t === "sistem") kok.removeAttribute("data-theme"); else kok.setAttribute("data-theme", t); btn.textContent = "Tema: " + ad[t]; };
    btn.addEventListener("click", () => { t = t === "sistem" ? "light" : t === "light" ? "dark" : "sistem"; try { localStorage.setItem("tema", t); } catch {} uygula(); });
    uygula();
  }
  const linkler = [...document.querySelectorAll(".menu a[href^='#']")];
  if (linkler.length && "IntersectionObserver" in window) {
    const gozcu = new IntersectionObserver(girdiler => {
      for (const g of girdiler) if (g.isIntersecting) linkler.forEach(a => a.classList.toggle("aktif", a.getAttribute("href") === "#" + g.target.id));
    }, { rootMargin: "-40% 0px -55% 0px" });
    linkler.forEach(a => { const b = document.querySelector(a.getAttribute("href")); if (b) gozcu.observe(b); });
  }
})();
