/* IBM Bob Bootcamp — comportamiento compartido.
   El tema inicial se resuelve con un script en línea en <head> (evita parpadeo);
   aquí vive el selector, el copiado de código, la tabla de contenidos y el resto. */
(() => {
  const KEY = "bob-theme";
  const root = document.documentElement;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  const readPref = () => {
    try { return localStorage.getItem(KEY) || "system"; } catch { return "system"; }
  };
  const savePref = (p) => {
    try { p === "system" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, p); } catch { /* sin almacenamiento */ }
  };
  const apply = (pref) => {
    root.dataset.theme = pref === "system" ? (mq.matches ? "dark" : "light") : pref;
    root.dataset.themePref = pref;
    document.querySelectorAll(".seg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pref === pref)));
  };

  const ICONS = {
    system: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="8.5"/><path d="M5.5 14h5M8 11v3"/></svg>',
    light: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3"/></svg>',
    dark: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z"/></svg>',
  };
  const LABELS = { system: "Sistema", light: "Claro", dark: "Oscuro" };

  function buildThemeSwitch() {
    const side = document.querySelector(".sidenav");
    if (!side) return;
    const box = document.createElement("div");
    box.className = "theme-switch";
    box.innerHTML = '<span class="lbl" id="theme-lbl">Tema</span><div class="seg" role="group" aria-labelledby="theme-lbl"></div>';
    const seg = box.querySelector(".seg");
    ["system", "light", "dark"].forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.pref = p;
      b.title = LABELS[p];
      b.setAttribute("aria-label", "Tema " + LABELS[p].toLowerCase());
      b.innerHTML = ICONS[p] + "<span>" + LABELS[p] + "</span>";
      b.addEventListener("click", () => { savePref(p); apply(p); });
      seg.appendChild(b);
    });
    side.appendChild(box);
  }

  mq.addEventListener("change", () => { if (readPref() === "system") apply("system"); });

  /* ---------- Código: barra con botón copiar ---------- */
  function buildCodeBars() {
    document.querySelectorAll(".prewrap").forEach((box) => {
      if (box.querySelector(".code-bar")) return;
      const pre = box.querySelector("pre");
      if (!pre) return;
      const first = (pre.textContent.trim().split("\n")[0] || "").trim();
      const isShell = /^(git|mvn|java|curl|podman|docker|kubectl|oc|cd|mkdir|make|ls|unzip|source|export|\.\/|\/home|#)/.test(first);
      const bar = document.createElement("div");
      bar.className = "code-bar";
      const lbl = document.createElement("span");
      lbl.textContent = isShell ? "Terminal"
        : /^\/[\w-]+$/.test(first) ? "Comando para el chat de Bob"
        : /^[A-ZÁÉÍÓÚÑ¿][^\n]*\s/.test(first) && first.length > 20 ? "Prompt para Bob"
        : "Contenido";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy";
      btn.textContent = "Copiar";
      btn.setAttribute("aria-label", "Copiar al portapapeles");
      btn.addEventListener("click", async () => {
        let ok = true;
        try { await navigator.clipboard.writeText(pre.innerText); } catch { ok = false; }
        btn.textContent = ok ? "Copiado" : "No se pudo copiar";
        btn.classList.toggle("done", ok);
        setTimeout(() => { btn.textContent = "Copiar"; btn.classList.remove("done"); }, 1600);
      });
      bar.append(lbl, btn);
      box.insertBefore(bar, pre);
    });
  }

  /* ---------- Tablas con scroll horizontal ---------- */
  function wrapTables() {
    document.querySelectorAll("main table").forEach((t) => {
      if (t.parentElement.classList.contains("table-wrap")) return;
      const w = document.createElement("div");
      w.className = "table-wrap";
      w.tabIndex = 0;
      w.setAttribute("role", "region");
      w.setAttribute("aria-label", "Tabla desplazable");
      t.replaceWith(w);
      w.appendChild(t);
    });
  }

  /* ---------- Imágenes ampliables ---------- */
  function buildLightbox() {
    const imgs = document.querySelectorAll("figure.shot img");
    if (!imgs.length || typeof HTMLDialogElement === "undefined") return;
    const dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.innerHTML = '<form method="dialog"><button aria-label="Cerrar imagen">Cerrar</button></form><img alt="" />';
    document.body.appendChild(dlg);
    const big = dlg.querySelector("img");
    const open = (img) => { big.src = img.currentSrc || img.src; big.alt = img.alt; dlg.showModal(); };
    imgs.forEach((img) => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Ampliar: " + (img.alt || "imagen"));
      img.addEventListener("click", () => open(img));
      img.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(img); } });
    });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- Tabla de contenidos ---------- */
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function buildToc() {
    const main = document.querySelector("main.wrap");
    const layout = document.querySelector(".layout");
    if (!main || !layout) return;
    const heads = [...main.querySelectorAll("h2")];
    if (heads.length < 3) return;
    const used = new Set();
    const items = heads.map((h) => {
      const clone = h.cloneNode(true);
      clone.querySelectorAll(".t-hint").forEach((n) => n.remove());
      const text = clone.textContent.replace(/\s+/g, " ").trim();
      const section = h.closest("[id]");
      if (!section || section === main) {
        let id = slug(text) || "seccion";
        while (used.has(id) || document.getElementById(id)) id += "-2";
        h.id = id;
      }
      const id = (section && section !== main) ? section.id : h.id;
      used.add(id);
      return { id, text, h };
    });
    const toc = document.createElement("aside");
    toc.className = "toc";
    toc.setAttribute("aria-label", "En esta página");
    toc.innerHTML = '<h2>En esta página</h2><ol></ol>';
    const ol = toc.querySelector("ol");
    items.forEach(({ id, text }) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + id;
      a.textContent = text;
      li.appendChild(a);
      ol.appendChild(li);
    });
    layout.appendChild(toc);

    const links = new Map(items.map((it) => [it.h, ol.querySelector('a[href="#' + it.id + '"]')]));
    const visible = new Set();
    const mark = () => {
      const current = heads.find((h) => visible.has(h)) || heads.filter((h) => h.getBoundingClientRect().top < 120).pop() || heads[0];
      links.forEach((a, h) => (h === current ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        mark();
      }, { rootMargin: "0px 0px -65% 0px" });
      heads.forEach((h) => io.observe(h));
    }
    mark();
  }

  /* ---------- Anterior / siguiente ---------- */
  function buildPager() {
    const main = document.querySelector("main.wrap.lab-content");
    const links = [...document.querySelectorAll(".sidenav nav a")].filter((a) => !a.getAttribute("href").includes("#"));
    const idx = links.findIndex((a) => a.classList.contains("active"));
    if (!main || idx < 0) return;
    const nav = document.createElement("nav");
    nav.className = "pager";
    nav.setAttribute("aria-label", "Navegación entre laboratorios");
    const add = (a, cls, label) => {
      const el = document.createElement("a");
      el.href = a.getAttribute("href");
      el.className = cls;
      el.innerHTML = "<small>" + label + "</small>";
      el.append(a.textContent.trim());
      nav.appendChild(el);
    };
    if (links[idx - 1] && idx - 1 > 0) add(links[idx - 1], "prev", "Anterior");
    if (links[idx + 1]) add(links[idx + 1], "next", "Siguiente");
    if (nav.children.length) main.appendChild(nav);
  }

  function init() {
    // Enlace para saltar al contenido
    const main = document.querySelector("main");
    if (main) {
      if (!main.id) main.id = "main";
      const skip = document.createElement("a");
      skip.className = "skip";
      skip.href = "#" + main.id;
      skip.textContent = "Saltar al contenido";
      document.body.prepend(skip);
    }
    document.querySelectorAll(".sidenav nav a.active").forEach((a) => a.setAttribute("aria-current", "page"));
    buildThemeSwitch();
    apply(readPref());
    buildCodeBars();
    wrapTables();
    buildLightbox();
    buildToc();
    buildPager();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
