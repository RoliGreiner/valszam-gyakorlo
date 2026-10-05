/* Az alkalmazás: egyszerű hash-alapú útválasztás és a négy nézet. */
"use strict";

const app = document.getElementById("app");
const md = (s) => String(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const typeName = { def: "Definíció", tetel: "Tétel", kepl: "Képlet" };
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderMath(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  }
}
function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
let routeChanged = true;
function mount(html) {
  app.innerHTML = html;
  renderMath(app);
  if (routeChanged) {
    routeChanged = false;
    window.scrollTo(0, 0);
    app.classList.remove("view-enter");
    void app.offsetWidth; /* újraindítja az animációt */
    app.classList.add("view-enter");
  }
}

/* ───────────────────────── útválasztás ───────────────────────── */
let keyHandler = null;
function route() {
  const parts = (location.hash.replace(/^#\/?/, "") || "").split("/");
  const name = parts[0] || "";
  document.querySelectorAll("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
  keyHandler = null;
  routeChanged = true;
  const views = { "": viewHome, tudastar: viewTheory, kartyak: viewFlash, kviz: viewQuiz, szamolas: viewCalc };
  (views[name] || viewHome)(parts.slice(1));
}
window.addEventListener("hashchange", route);
const topbar = document.querySelector(".topbar");
window.addEventListener("scroll", () => topbar.classList.toggle("scrolled", scrollY > 4), { passive: true });
document.addEventListener("keydown", (e) => {
  if (keyHandler && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) keyHandler(e);
});
document.getElementById("themeBtn").addEventListener("click", () => {
  const root = document.documentElement;
  const cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = cur === "dark" ? "light" : "dark";
  root.classList.add("theme-anim");
  root.setAttribute("data-theme", next);
  store.set("theme", next);
  setTimeout(() => root.classList.remove("theme-anim"), 450);
});

/* ───────────────────────── Főoldal ───────────────────────── */
function viewHome() {
  const best = store.get("quizBest", null);
  const solved = store.get("calcSolved", {});
  mount(`
    <section class="hero">
      <h1>Valószínűségszámítás gyakorló</h1>
      <p>Az 1–4. heti gyakorlatok anyaga egy helyen: definíciók és tételek, kártyák a magoláshoz, feleletválasztós kvíz és számolós feladatok fix vagy véletlen számokkal.</p>
    </section>
    <div class="tiles">
      <a class="tile" href="#/tudastar"><div class="ic">📖</div><h3>Tudástár</h3><p>Minden definíció, tétel és képlet témakörönként, kidolgozott példafeladatokkal.</p><div class="count">${CARDS.length} fogalom · ${PROBLEMS.length} példa</div></a>
      <a class="tile" href="#/kartyak"><div class="ic">🃏</div><h3>Kártyák</h3><p>Fordítsd meg a kártyát, és jelöld, tudtad-e. A nem tudott kártyák visszakerülnek a pakliba.</p><div class="count">${CARDS.length} kártya</div></a>
      <a class="tile" href="#/kviz"><div class="ic">✅</div><h3>Feleletválasztós kvíz</h3><p>Elsősorban definíciók és tételek, azonnali visszajelzéssel és magyarázattal.</p><div class="count">${MCQ.length} kérdés + ${CARDS.length} generált${best ? ` · legjobb: ${best}%` : ""}</div></a>
      <a class="tile" href="#/szamolas"><div class="ic">🧮</div><h3>Számolós feladatok</h3><p>A gyakorlatok feladatai eredeti számokkal, vagy minden alkalommal új, véletlen számokkal.</p><div class="count">${PROBLEMS.length} feladattípus${Object.keys(solved).length ? ` · ${Object.keys(solved).length} megoldva` : ""}</div></a>
    </div>
    <h2>Témakörök</h2>
    <div class="topics-overview">
      ${TOPICS.map((t) => `<div><span class="badge">${t.week}. hét</span> ${t.name}</div>`).join("")}
    </div>`);
}

/* ───────────────────────── Tudástár ───────────────────────── */
const TYPE_FILTERS = [
  { id: "def", label: "Definíciók" },
  { id: "tetel", label: "Tételek" },
  { id: "kepl", label: "Képletek" },
  { id: "ex", label: "Példafeladatok" },
];
const th = Object.assign({ view: "detail", types: ["def", "tetel", "kepl", "ex"], weeks: [1, 2, 3, 4] }, store.get("theory", {}));
th.q = "";
const thSave = () => store.set("theory", { view: th.view, types: th.types, weeks: th.weeks });

function exampleHtml(pr, i) {
  const b = pr.build(pr.fixed);
  return `<details class="example anim-item" style="--i:${i}"><summary>${pr.title} <span class="badge">${pr.src}</span></summary>
    <div class="body">
      <div>${b.text}</div>
      <div class="solution"><h4>Megoldás</h4>${b.sol}
        <ul class="answers">${b.parts.map((p) => `<li><b>${esc(p.label)}:</b> ${fmt(p.ans)}</li>`).join("")}</ul>
      </div>
      <p class="small"><a href="#/szamolas/${pr.id}/random">Gyakorold véletlen számokkal →</a></p>
    </div></details>`;
}
/* A képletlapon a kártya kiemelt ($$…$$) képletei, ha nincsenek, tételeknél/képleteknél a szöveg. */
function formulaOf(c) {
  const m = c.text.match(/\$\$[\s\S]+?\$\$/g);
  if (m) return m.join("");
  return c.type === "def" ? null : `<div class="ftext">${md(c.text)}</div>`;
}
function cardHtml(c, i) {
  return `<article class="tcard ${c.type} anim-item" style="--i:${i}">
    <span class="badge ${c.type}">${typeName[c.type]}</span>
    <h3>${c.term}</h3>
    <div class="ttext">${md(c.text)}</div>
    ${c.ex ? `<div class="ex"><b>Példa:</b> ${md(c.ex)}</div>` : ""}
  </article>`;
}
function formulaRowHtml(c, f, i) {
  return `<div class="frow anim-item" style="--i:${i}">
    <div class="fterm"><span class="dot ${c.type}" title="${typeName[c.type]}"></span>${c.term}</div>
    <div class="fbody">${f}</div>
  </div>`;
}
function theoryData() {
  const q = th.q.trim().toLowerCase();
  const match = (c) => !q || (c.term + " " + c.text + " " + (c.ex || "")).toLowerCase().includes(q);
  return TOPICS.filter((t) => th.weeks.includes(t.week)).map((t) => {
    const groups = SUBGROUPS[t.id].map(([name, ids]) => {
      const cards = ids.map((id) => CARDS.find((c) => c.id === id))
        .filter((c) => th.types.includes(c.type) && match(c))
        .map((c) => ({ c, f: th.view === "formula" ? formulaOf(c) : null }))
        .filter((x) => th.view !== "formula" || x.f);
      return { name, cards };
    }).filter((g) => g.cards.length);
    const probs = th.view === "detail" && th.types.includes("ex")
      ? PROBLEMS.filter((p) => p.topic === t.id && (!q || (p.title + " " + p.src).toLowerCase().includes(q)))
      : [];
    const nc = sum(groups.map((g) => g.cards.length));
    return { t, groups, probs, nc, n: nc + probs.length };
  }).filter((x) => x.n);
}
function renderTheoryContent() {
  const data = theoryData();
  const content = document.getElementById("tContent");
  let i = 0;
  content.innerHTML = data.length ? data.map(({ t, groups, probs }) => `
    <section class="topic-sec" id="sec-${t.id}">
      <h2><span class="t-ic">${t.icon}</span>${t.name} <span class="week">${t.week}. hét</span></h2>
      ${groups.map((g) => `
        <h3 class="subgroup">${g.name}</h3>
        ${th.view === "formula"
          ? `<div class="flist">${g.cards.map(({ c, f }) => formulaRowHtml(c, f, i++)).join("")}</div>`
          : `<div class="cards">${g.cards.map(({ c }) => cardHtml(c, i++)).join("")}</div>`}`).join("")}
      ${probs.length ? `<h3 class="subgroup">Példafeladatok a gyakorlatokról</h3><div class="examples">${probs.map((p) => exampleHtml(p, i++)).join("")}</div>` : ""}
    </section>`).join("")
    : `<div class="empty">Nincs találat a megadott szűrőkkel.</div>`;
  renderMath(content);
  /* tartalomjegyzék: minden témakör látszik, a szám a szűrés utáni elemszám (szűréskor "látható/összes") */
  const toc = document.getElementById("tToc");
  const allTypes = th.view === "formula" ? ["def", "tetel", "kepl"] : ["def", "tetel", "kepl", "ex"];
  const filtered = !!th.q.trim() || th.weeks.length < 4 || !allTypes.every((x) => th.types.includes(x));
  const prev = th.counts || {};
  th.counts = {};
  toc.innerHTML = TOPICS.map((t) => {
    const d = data.find((x) => x.t.id === t.id);
    const n = d ? d.n : 0;
    const totalCards = CARDS.filter((c) => c.topic === t.id && (th.view !== "formula" || formulaOf(c))).length;
    const totalProbs = th.view === "detail" ? PROBLEMS.filter((p) => p.topic === t.id).length : 0;
    const total = totalCards + totalProbs;
    th.counts[t.id] = n;
    const bump = t.id in prev && prev[t.id] !== n ? " bump" : "";
    const tip = d ? `${d.nc} fogalom${d.probs.length ? ` + ${d.probs.length} példafeladat` : ""}` : "nincs találat a szűrőkkel";
    return `<button class="toc${n ? "" : " empty"}" data-t="${t.id}" title="${tip}" ${n ? "" : "disabled"}>
      <span class="t-ic">${t.icon}</span><span class="toc-name">${t.name}</span>
      <span class="toc-n${bump}">${n}${filtered ? `<small>/${total}</small>` : ""}</span></button>`;
  }).join("");
  toc.querySelectorAll(".toc:not(.empty)").forEach((b) => b.addEventListener("click", () => {
    const el = document.getElementById("sec-" + b.dataset.t);
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: "smooth" });
  }));
  /* az épp olvasott témakör kiemelése a tartalomjegyzékben */
  if (window.IntersectionObserver) {
    if (th.obs) th.obs.disconnect();
    th.obs = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) toc.querySelectorAll(".toc").forEach((b) => b.classList.toggle("on", b.dataset.t === e.target.id.slice(4)));
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    content.querySelectorAll(".topic-sec").forEach((s) => th.obs.observe(s));
  }
}
function viewTheory(args) {
  if (args && args[0] === "kepletlap") th.view = "formula";
  else if (args && args.length === 0 && routeChanged && th.view === "formula") history.replaceState(null, "", "#/tudastar/kepletlap");
  const chip = (group, id, label, on) => `<button class="chip ${on ? "on" : ""}" data-g="${group}" data-v="${id}">${label}</button>`;
  mount(`
    <div class="layout">
      <aside class="side">
        <div class="side-title">Témakörök</div>
        <nav id="tToc" class="toc-list"></nav>
      </aside>
      <div>
        <div class="th-head">
          <div>
            <h1>Tudástár</h1>
            <p class="muted">${th.view === "formula"
              ? "Képletlap: csak a képletek és a tételek tömören, gyors ismétléshez."
              : "Minden definíció, tétel és képlet témakörönként és alcsoportonként, a gyakorlatok kidolgozott példáival."}</p>
          </div>
          <div class="seg" id="tView">
            <button data-v="detail" class="${th.view === "detail" ? "on" : ""}">📖 Részletes</button>
            <button data-v="formula" class="${th.view === "formula" ? "on" : ""}">∑ Képletlap</button>
          </div>
        </div>
        <div class="panel toolbar">
          <input type="search" id="tSearch" placeholder="Keresés (pl. Bayes, szórás, Poisson)…" aria-label="Keresés">
          <div class="filter-row"><span class="flabel">Típus</span><div class="chips">
            ${TYPE_FILTERS.filter((f) => th.view === "detail" || f.id !== "ex").map((f) => chip("type", f.id, `<span class="dot ${f.id}"></span>${f.label}`, th.types.includes(f.id))).join("")}
          </div></div>
          <div class="filter-row"><span class="flabel">Hét</span><div class="chips">
            ${[1, 2, 3, 4].map((w) => chip("week", w, `${w}. hét`, th.weeks.includes(w))).join("")}
          </div></div>
        </div>
        <div id="tContent"></div>
      </div>
    </div>`);
  renderTheoryContent();
  app.querySelectorAll("#tView button").forEach((b) => b.addEventListener("click", () => {
    if (th.view === b.dataset.v) return;
    th.view = b.dataset.v; thSave();
    history.replaceState(null, "", th.view === "formula" ? "#/tudastar/kepletlap" : "#/tudastar");
    viewTheory();
  }));
  app.querySelectorAll(".toolbar .chip").forEach((b) => b.addEventListener("click", () => {
    const list = b.dataset.g === "type" ? th.types : th.weeks;
    const v = b.dataset.g === "type" ? b.dataset.v : +b.dataset.v;
    const k = list.indexOf(v);
    if (k >= 0) { if (list.length > 1) list.splice(k, 1); } else list.push(v);
    b.classList.toggle("on", list.includes(v));
    thSave(); renderTheoryContent();
  }));
  const search = document.getElementById("tSearch");
  let timer;
  search.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { th.q = search.value; renderTheoryContent(); }, 150);
  });
}

/* ───────────────────────── Kártyák ───────────────────────── */
const fc = { topics: new Set(TOPICS.map((t) => t.id)), types: new Set(["def", "tetel", "kepl"]), dir: "term", onlyHard: false, queue: [], total: 0, known: 0, flipped: false, enter: "", busy: false };
function fcBuild() {
  const hist = store.get("fcHist", {});
  let cards = CARDS.filter((c) => fc.topics.has(c.topic) && fc.types.has(c.type));
  if (fc.onlyHard) cards = cards.filter((c) => hist[c.id] !== "ok");
  fc.queue = rnd.shuffle(cards);
  fc.total = fc.queue.length;
  fc.known = 0;
  fc.flipped = false;
}
function viewFlash() {
  fcBuild();
  fcRender();
}
function fcRender() {
  const hist = store.get("fcHist", {});
  const knownAll = CARDS.filter((c) => hist[c.id] === "ok").length;
  const card = fc.queue[0];
  const front = card && (fc.dir === "term"
    ? `<div class="big">${card.term}</div>`
    : `<div>${md(card.text)}</div>`);
  const back = card && (fc.dir === "term"
    ? `<div>${md(card.text)}</div>${card.ex ? `<div class="ex small muted"><b>Példa:</b> ${md(card.ex)}</div>` : ""}`
    : `<div class="big">${card.term}</div>`);
  mount(`
    <div class="fc-wrap">
      <h1>Kártyák</h1>
      <div class="panel">
        <div class="filter-row"><span class="flabel">Témakör</span><div class="chips" id="fcTopics">${TOPICS.map((t) => `<button class="chip ${fc.topics.has(t.id) ? "on" : ""}" data-t="${t.id}">${t.name}</button>`).join("")}</div></div>
        <div class="filter-row"><span class="flabel">Típus</span><div class="chips" id="fcTypes">${["def", "tetel", "kepl"].map((t) => `<button class="chip ${fc.types.has(t) ? "on" : ""}" data-t="${t}"><span class="dot ${t}"></span>${{ def: "Definíciók", tetel: "Tételek", kepl: "Képletek" }[t]}</button>`).join("")}</div></div>
        <div class="row" style="margin-top:12px">
          <div class="seg" id="fcDir">
            <button data-d="term" class="${fc.dir === "term" ? "on" : ""}">Fogalom → leírás</button>
            <button data-d="text" class="${fc.dir === "text" ? "on" : ""}">Leírás → fogalom</button>
          </div>
          <label class="check small"><input type="checkbox" id="fcHard" ${fc.onlyHard ? "checked" : ""}> Csak a még nem tudott kártyák</label>
          <span class="spacer"></span>
          <button class="btn" id="fcShuffle">↻ Újrakezdés</button>
          <button class="btn bad" id="fcReset" ${knownAll ? "" : "disabled"} title="Az összes kártya „tudott” jelölésének törlése">Haladás nullázása</button>
        </div>
      </div>
      ${card ? `
        <div class="row small muted" style="margin-top:18px">
          <span>Ebben a körben: ${fc.known} / ${fc.total} tudva · hátravan ${fc.queue.length}</span><span class="spacer"></span><span>Összesen tudott: ${knownAll} / ${CARDS.length}</span>
        </div>
        <div class="progress" style="margin-top:6px"><div style="width:${fc.total ? (100 * fc.known) / fc.total : 0}%"></div></div>
        <div class="flip ${fc.flipped ? "flipped" : ""} ${fc.enter}" id="fcCard" tabindex="0" role="button" aria-label="Kártya megfordítása">
          <div class="flip-inner">
            <div class="face front"><div class="topline"><span class="badge ${card.type}">${typeName[card.type]}</span><span class="small muted">${topicName(card.topic)}</span></div>${front}<div class="hint">Kattints vagy <span class="kbd">Space</span> a megfordításhoz</div></div>
            <div class="face back"><div class="topline"><span class="badge ${card.type}">${typeName[card.type]}</span><span class="small muted">${topicName(card.topic)}</span></div>${back}</div>
          </div>
        </div>
        <div class="fc-actions">
          <button class="btn bad" id="fcNo">✗ Nem tudtam <span class="kbd">←</span></button>
          <button class="btn ok" id="fcYes">✓ Tudtam <span class="kbd">→</span></button>
        </div>`
      : `<div class="panel empty" style="margin-top:18px">
          ${fc.total ? `<div class="score-big">🎉</div><h2>Kész a pakli!</h2><p>Mind a ${fc.total} kártyát tudtad ebben a körben.</p>` : `<p>Nincs kártya a kiválasztott beállításokkal.</p>`}
          <button class="btn primary" id="fcAgain">Új kör</button>
        </div>`}
    </div>`);

  app.querySelectorAll("#fcTopics .chip").forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.t;
    if (fc.topics.has(t)) { if (fc.topics.size > 1) fc.topics.delete(t); } else fc.topics.add(t);
    fcBuild(); fcRender();
  }));
  app.querySelectorAll("#fcTypes .chip").forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.t;
    if (fc.types.has(t)) { if (fc.types.size > 1) fc.types.delete(t); } else fc.types.add(t);
    fcBuild(); fcRender();
  }));
  app.querySelectorAll("#fcDir button").forEach((b) => b.addEventListener("click", () => { fc.dir = b.dataset.d; fc.flipped = false; fcRender(); }));
  document.getElementById("fcHard").addEventListener("change", (e) => { fc.onlyHard = e.target.checked; fcBuild(); fcRender(); });
  document.getElementById("fcShuffle").addEventListener("click", () => { fcBuild(); fcRender(); });
  document.getElementById("fcReset").addEventListener("click", () => {
    if (!confirm(`Biztosan nullázod a haladást? Mind a ${knownAll} tudottnak jelölt kártya újra „nem tudott” lesz.`)) return;
    store.set("fcHist", {});
    fcBuild(); fcRender();
  });
  const again = document.getElementById("fcAgain");
  if (again) again.addEventListener("click", () => { fcBuild(); fcRender(); });
  if (!card) { keyHandler = null; return; }

  const flip = () => { fc.flipped = !fc.flipped; document.getElementById("fcCard").classList.toggle("flipped", fc.flipped); };
  fc.enter = "";
  const answer = (ok) => {
    if (fc.busy) return;
    fc.busy = true;
    const hst = store.get("fcHist", {});
    hst[card.id] = ok ? "ok" : "no";
    store.set("fcHist", hst);
    fc.queue.shift();
    if (ok) fc.known++;
    else fc.queue.splice(Math.min(fc.queue.length, 3 + Math.floor(Math.random() * 4)), 0, card); /* hamarosan újra jön */
    fc.flipped = false;
    const el = document.getElementById("fcCard");
    el.classList.add(ok ? "out-right" : "out-left");
    setTimeout(() => { fc.busy = false; fc.enter = "card-in"; fcRender(); }, reduceMotion() ? 0 : 230);
  };
  document.getElementById("fcCard").addEventListener("click", flip);
  document.getElementById("fcYes").addEventListener("click", () => answer(true));
  document.getElementById("fcNo").addEventListener("click", () => answer(false));
  keyHandler = (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
    else if (e.key === "ArrowRight") answer(true);
    else if (e.key === "ArrowLeft") answer(false);
  };
}

/* ───────────────────────── Kvíz ───────────────────────── */
const qz = { topics: new Set(TOPICS.map((t) => t.id)), count: 15, gen: true, list: [], i: 0, score: 0, wrong: [], answered: false };
function quizPool() {
  const pool = MCQ.filter((q) => qz.topics.has(q.topic)).map((q) => ({ ...q, kind: "mcq" }));
  if (qz.gen) {
    CARDS.filter((c) => qz.topics.has(c.topic)).forEach((c) => {
      const same = CARDS.filter((d) => d.id !== c.id && d.topic === c.topic);
      const others = same.length >= 3 ? same : CARDS.filter((d) => d.id !== c.id);
      const distract = rnd.shuffle(others).slice(0, 3).map((d) => d.term);
      pool.push({
        topic: c.topic, kind: "gen",
        q: `Melyik ${c.type === "tetel" ? "tételre" : "fogalomra / képletre"} illik a leírás?<div class="explain" style="background:var(--surface-2);font-weight:400">${md(c.text)}</div>`,
        o: [c.term, ...distract], e: `${c.term}.`,
      });
    });
  }
  return pool;
}
function questionPrep(q) {
  const order = rnd.shuffle(q.o.map((_, i) => i));
  return { ...q, order };
}
function viewQuiz() {
  qz.list = [];
  quizSetup();
}
function quizSetup() {
  const poolSize = quizPool().length;
  const best = store.get("quizBest", null);
  mount(`
    <div class="quiz-wrap">
      <h1>Feleletválasztós kvíz</h1>
      <p class="muted">Válaszd ki a témaköröket és a kérdések számát. Minden válasz után megkapod a magyarázatot.</p>
      <div class="panel">
        <h3>Témakörök</h3>
        <div class="chips" id="qzTopics">${TOPICS.map((t) => `<button class="chip ${qz.topics.has(t.id) ? "on" : ""}" data-t="${t.id}">${t.name}</button>`).join("")}</div>
        <div class="row" style="margin-top:16px">
          <label>Kérdések száma:
            <select id="qzCount">${[10, 15, 20, 30, 50, 0].map((n) => `<option value="${n}" ${n === qz.count ? "selected" : ""}>${n || "mind"}</option>`).join("")}</select>
          </label>
          <label class="check"><input type="checkbox" id="qzGen" ${qz.gen ? "checked" : ""}> Fogalomfelismerő kérdések a kártyákból is</label>
        </div>
        <div class="row" style="margin-top:18px">
          <span class="muted small">${poolSize} elérhető kérdés${best ? ` · eddigi legjobb: ${best}%` : ""}</span><span class="spacer"></span>
          <button class="btn primary" id="qzStart">Indítás →</button>
        </div>
      </div>
    </div>`);
  app.querySelectorAll("#qzTopics .chip").forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.t;
    if (qz.topics.has(t)) { if (qz.topics.size > 1) qz.topics.delete(t); } else qz.topics.add(t);
    quizSetup();
  }));
  document.getElementById("qzCount").addEventListener("change", (e) => { qz.count = +e.target.value; });
  document.getElementById("qzGen").addEventListener("change", (e) => { qz.gen = e.target.checked; quizSetup(); });
  document.getElementById("qzStart").addEventListener("click", () => quizStart(rnd.shuffle(quizPool())));
}
function quizStart(pool) {
  const list = qz.count ? pool.slice(0, qz.count) : pool;
  qz.list = list.map(questionPrep);
  qz.i = 0; qz.score = 0; qz.wrong = []; qz.answered = false;
  quizQuestion();
}
function quizQuestion() {
  const q = qz.list[qz.i];
  if (!q) return quizEnd();
  qz.answered = false;
  const L = "ABCD";
  mount(`
    <div class="quiz-wrap">
      <div class="row small muted"><span>${qz.i + 1}. kérdés / ${qz.list.length}</span><span class="spacer"></span><span>${topicName(q.topic)}</span><span class="stat-pill">✓ ${qz.score}</span></div>
      <div class="progress" style="margin-top:6px"><div style="width:${(100 * qz.i) / qz.list.length}%"></div></div>
      <div class="panel anim-swap" style="margin-top:16px">
        <div class="q-text">${md(q.q)}</div>
        <div class="opts">${q.order.map((oi, k) => `<button class="opt" data-i="${oi}"><span class="letter">${L[k]}</span><span>${md(q.o[oi])}</span></button>`).join("")}</div>
        <div id="qzFeedback"></div>
      </div>
      <div class="row small muted" style="margin-top:10px">Billentyűk: <span class="kbd">1</span>–<span class="kbd">4</span> válasz, <span class="kbd">Enter</span> tovább</div>
    </div>`);
  const pick = (btn) => {
    if (qz.answered) return;
    qz.answered = true;
    const chosen = +btn.dataset.i;
    const ok = chosen === 0;
    if (ok) qz.score++; else qz.wrong.push({ q, chosen });
    app.querySelectorAll(".opt").forEach((b) => {
      b.disabled = true;
      if (+b.dataset.i === 0) b.classList.add("correct");
      else if (b === btn) b.classList.add("wrong");
    });
    const fb = document.getElementById("qzFeedback");
    fb.innerHTML = `<div class="explain"><b>${ok ? "✓ Helyes!" : "✗ Nem ez a helyes válasz."}</b> ${md(q.e || "")}</div>
      <div class="row" style="margin-top:14px"><span class="spacer"></span><button class="btn primary" id="qzNext">${qz.i + 1 < qz.list.length ? "Következő →" : "Eredmény"}</button></div>`;
    renderMath(fb);
    document.getElementById("qzNext").addEventListener("click", next);
    document.getElementById("qzNext").focus();
  };
  const next = () => { qz.i++; quizQuestion(); };
  app.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => pick(b)));
  keyHandler = (e) => {
    if (!qz.answered && /^[1-4]$/.test(e.key)) { const b = app.querySelectorAll(".opt")[+e.key - 1]; if (b) pick(b); }
    else if (qz.answered && e.key === "Enter") { e.preventDefault(); next(); }
  };
}
function quizEnd() {
  keyHandler = null;
  const pct = Math.round((100 * qz.score) / qz.list.length);
  const best = store.get("quizBest", 0);
  if (pct > best) store.set("quizBest", pct);
  mount(`
    <div class="quiz-wrap">
      <div class="panel" style="text-align:center">
        <div class="score-big">${pct}%</div>
        <p>${qz.score} / ${qz.list.length} helyes válasz${pct > best ? " · új rekord! 🎉" : ""}</p>
        <div class="row" style="justify-content:center">
          <button class="btn primary" id="qzRetry">Új kvíz</button>
          ${qz.wrong.length ? `<button class="btn" id="qzWrong">A hibásak újra (${qz.wrong.length})</button>` : ""}
          <button class="btn" id="qzSetup">Beállítások</button>
        </div>
      </div>
      ${qz.wrong.length ? `<div class="panel" style="margin-top:18px"><h2>Amit érdemes átnézni</h2>
        ${qz.wrong.map(({ q, chosen }) => `<div class="review-item">
          <div><b>${md(q.q)}</b></div>
          <div class="small" style="margin-top:6px">A te válaszod: <span style="color:var(--bad)">${md(q.o[chosen])}</span></div>
          <div class="small">Helyes: <span style="color:var(--ok)">${md(q.o[0])}</span></div>
          <div class="small muted">${md(q.e || "")}</div></div>`).join("")}</div>` : ""}
    </div>`);
  document.getElementById("qzRetry").addEventListener("click", () => quizStart(rnd.shuffle(quizPool())));
  document.getElementById("qzSetup").addEventListener("click", quizSetup);
  const w = document.getElementById("qzWrong");
  if (w) w.addEventListener("click", () => { const c = qz.count; qz.count = 0; quizStart(rnd.shuffle(qz.wrong.map((x) => x.q))); qz.count = c; });
}

/* ───────────────────────── Számolás ───────────────────────── */
const cs = { mode: store.get("calcMode", "fixed"), topic: "all", cur: null, params: null, built: null, ok: 0, tried: 0 };
function viewCalc(args) {
  const id = args && args[0];
  const pr = PROBLEMS.find((p) => p.id === id);
  if (pr && (!cs.cur || cs.cur.id !== pr.id)) { cs.cur = pr; cs.params = null; }
  if (args && args[1] === "random" && cs.mode !== "random") { cs.mode = "random"; store.set("calcMode", "random"); cs.params = null; }
  if (!cs.cur) cs.cur = PROBLEMS[0];
  if (!cs.params) newParams();
  calcRender();
}
function newParams() {
  cs.params = cs.mode === "fixed" ? cs.cur.fixed : cs.cur.random();
  cs.built = cs.cur.build(cs.params);
}
function calcList() {
  return PROBLEMS.filter((p) => cs.topic === "all" || p.topic === cs.topic);
}
function calcRender() {
  const list = calcList();
  const b = cs.built, pr = cs.cur;
  const solved = store.get("calcSolved", {});
  mount(`
    <h1>Számolós feladatok</h1>
    <div class="calc-layout">
      <aside class="calc-side">
        <div class="seg" id="csMode" style="width:100%">
          <button data-m="fixed" class="${cs.mode === "fixed" ? "on" : ""}" style="flex:1">Fix feladat</button>
          <button data-m="random" class="${cs.mode === "random" ? "on" : ""}" style="flex:1">Véletlen számok</button>
        </div>
        <select id="csTopic" aria-label="Témakör"><option value="all">Minden témakör</option>${TOPICS.filter((t) => PROBLEMS.some((p) => p.topic === t.id)).map((t) => `<option value="${t.id}" ${cs.topic === t.id ? "selected" : ""}>${t.name}</option>`).join("")}</select>
        <div class="calc-list" id="csList">
          ${TOPICS.filter((t) => list.some((p) => p.topic === t.id)).map((t) => `<div class="grp">${t.name}</div>` +
            list.filter((p) => p.topic === t.id).map((p) => `<button data-id="${p.id}" class="${p.id === pr.id ? "on" : ""}"><span>${solved[p.id] ? "✓ " : ""}${p.title}</span><span class="src">${p.src}</span></button>`).join("")).join("")}
        </div>
        <button class="btn" id="csRandomProb">🎲 Véletlen feladattípus</button>
        <div class="row small muted"><span class="stat-pill">Ebben a munkamenetben: ${cs.ok} / ${cs.tried} helyes</span></div>
      </aside>

      <section class="panel anim-swap">
        <div class="prob-head">
          <span class="badge">${topicName(pr.topic)}</span>
          <span class="badge">${cs.mode === "fixed" ? "Gyakorlati feladat · " + pr.src : "Véletlen számokkal"}</span>
        </div>
        <h2>${pr.title}</h2>
        <div class="prob-text">${b.text}</div>
        <form class="parts" id="csForm" autocomplete="off">
          ${b.parts.map((p, i) => `<div class="part" data-i="${i}">
            <label for="ans${i}">${esc(p.label)}</label>
            <input type="text" id="ans${i}" inputmode="decimal" placeholder="pl. 0,25 vagy 1/4">
            <span class="fb"></span>
            <div class="preview"></div>
          </div>`).join("")}
          <div class="row">
            <button type="submit" class="btn primary">Ellenőrzés</button>
            <button type="button" class="btn" id="csSol">Megoldás mutatása</button>
            <span class="spacer"></span>
            ${cs.mode === "random" ? `<button type="button" class="btn" id="csNew">↻ Új számok</button>` : ""}
            <button type="button" class="btn" id="csNext">Következő →</button>
          </div>
        </form>
        <div id="csSolution"></div>
        <details class="help" style="margin-top:16px"><summary>Hogyan írjam be a választ?</summary>
          <p>Elég 3–4 tizedesjegy pontossággal megadni (pl. <code>0,2273</code>). Kifejezést is írhatsz, az oldal kiszámolja:
          <code>1/72</code>, <code>0.85^3*0.15</code>, <code>1-e^-2</code>, <code>C(15;2)*0.08^2*0.92^13</code>, <code>11!</code>, <code>sqrt(2.15)</code>, <code>8%</code>.
          Tizedesvessző és -pont is jó; függvényen belül az argumentumokat <code>;</code> (vagy vessző) válassza el.</p>
        </details>
      </section>
    </div>`);

  app.querySelectorAll("#csMode button").forEach((x) => x.addEventListener("click", () => {
    cs.mode = x.dataset.m; store.set("calcMode", cs.mode); newParams(); calcRender();
  }));
  document.getElementById("csTopic").addEventListener("change", (e) => {
    cs.topic = e.target.value;
    const l = calcList();
    if (!l.includes(cs.cur)) { cs.cur = l[0]; newParams(); }
    calcRender();
  });
  app.querySelectorAll("#csList button").forEach((x) => x.addEventListener("click", () => {
    cs.cur = PROBLEMS.find((p) => p.id === x.dataset.id); newParams();
    history.replaceState(null, "", "#/szamolas/" + cs.cur.id);
    calcRender();
  }));
  const goRandom = () => {
    const l = calcList().filter((p) => p !== cs.cur);
    cs.cur = rnd.pick(l.length ? l : calcList()); newParams();
    history.replaceState(null, "", "#/szamolas/" + cs.cur.id);
    calcRender();
  };
  document.getElementById("csRandomProb").addEventListener("click", goRandom);
  document.getElementById("csNext").addEventListener("click", () => {
    if (cs.mode === "random") { goRandom(); return; }
    const l = calcList();
    cs.cur = l[(l.indexOf(cs.cur) + 1) % l.length]; newParams();
    history.replaceState(null, "", "#/szamolas/" + cs.cur.id);
    calcRender();
  });
  const nb = document.getElementById("csNew");
  if (nb) nb.addEventListener("click", () => { newParams(); calcRender(); });
  const showSol = () => {
    const el = document.getElementById("csSolution");
    el.innerHTML = `<div class="solution"><h4>Megoldás</h4>${b.sol}
      <ul class="answers">${b.parts.map((p) => `<li><b>${esc(p.label)}:</b> ${fmt(p.ans)}</li>`).join("")}</ul></div>`;
    renderMath(el);
  };
  document.getElementById("csSol").addEventListener("click", showSol);

  app.querySelectorAll(".part input").forEach((inp) => inp.addEventListener("input", () => {
    const row = inp.closest(".part");
    row.classList.remove("ok", "bad");
    row.querySelector(".fb").textContent = "";
    const pv = row.querySelector(".preview");
    if (!inp.value.trim()) { pv.textContent = ""; return; }
    try { pv.textContent = "= " + fmt(evaluate(inp.value), 6); } catch (err) { pv.textContent = "⚠ " + err.message; }
  }));
  document.getElementById("csForm").addEventListener("submit", (e) => {
    e.preventDefault();
    let allOk = true;
    b.parts.forEach((p, i) => {
      const row = app.querySelector(`.part[data-i="${i}"]`);
      const inp = row.querySelector("input");
      const fb = row.querySelector(".fb");
      row.classList.remove("ok", "bad");
      if (!inp.value.trim()) { fb.textContent = ""; allOk = false; return; }
      let v;
      try { v = evaluate(inp.value); } catch (err) { fb.textContent = "?"; allOk = false; return; }
      const ok = isClose(v, p.ans);
      cs.tried++; if (ok) cs.ok++;
      row.classList.add(ok ? "ok" : "bad");
      fb.textContent = ok ? "✓" : "✗";
      fb.className = "fb " + (ok ? "ok" : "bad");
      if (!ok) allOk = false;
    });
    if (allOk) {
      const s = store.get("calcSolved", {}); s[pr.id] = true; store.set("calcSolved", s);
      showSol();
    }
    app.querySelector(".stat-pill").textContent = `Ebben a munkamenetben: ${cs.ok} / ${cs.tried} helyes`;
  });
}

/* indulás (a defer-es szkriptek sorrendben futnak, így a KaTeX már betöltődött) */
renderMath(document.querySelector(".footer"));
route();
