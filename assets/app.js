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
let viewCleanup = null;
function route() {
  if (viewCleanup) { viewCleanup(); viewCleanup = null; }
  const parts = (location.hash.replace(/^#\/?/, "") || "").split("/");
  const name = parts[0] || "";
  document.querySelectorAll("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
  keyHandler = null;
  routeChanged = true;
  const views = { "": viewHome, tudastar: viewTheory, kartyak: viewFlash, kviz: viewQuiz, szamolas: viewCalc, zh: viewZH };
  (views[name] || viewHome)(parts.slice(1));
}
window.addEventListener("hashchange", route);
const topbar = document.querySelector(".topbar");
/* a ragadós (sticky) ZH-sáv a fejléc alá kerüljön */
const setTopbarVar = () => document.documentElement.style.setProperty("--tb", topbar.offsetHeight + "px");
window.addEventListener("resize", setTopbarVar);
setTopbarVar();
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
      <p>Az 1–5. heti gyakorlatok anyaga egy helyen: definíciók és tételek, kártyák a magoláshoz, feleletválasztós kvíz, számolós feladatok fix vagy véletlen számokkal, és korábbi ZH-k részletes levezetéssel.</p>
    </section>
    <div class="tiles">
      <a class="tile" href="#/tudastar"><div class="ic">📖</div><h3>Tudástár</h3><p>Minden definíció, tétel és képlet témakörönként, kidolgozott példafeladatokkal.</p><div class="count">${CARDS.length} fogalom · ${PROBLEMS.length + EXAMPLES.length} példa</div></a>
      <a class="tile" href="#/kartyak"><div class="ic">🃏</div><h3>Kártyák</h3><p>Fordítsd meg a kártyát, és jelöld, tudtad-e. A nem tudott kártyák visszakerülnek a pakliba.</p><div class="count">${CARDS.length} kártya</div></a>
      <a class="tile" href="#/kviz"><div class="ic">✅</div><h3>Feleletválasztós kvíz</h3><p>Elsősorban definíciók és tételek, azonnali visszajelzéssel és magyarázattal.</p><div class="count">${MCQ.length} kérdés + ${CARDS.length} generált${best ? ` · legjobb: ${best}%` : ""}</div></a>
      <a class="tile" href="#/szamolas"><div class="ic">🧮</div><h3>Számolós feladatok</h3><p>A gyakorlatok feladatai eredeti számokkal, vagy minden alkalommal új, véletlen számokkal.</p><div class="count">${PROBLEMS.length} feladattípus${Object.keys(solved).length ? ` · ${Object.keys(solved).length} megoldva` : ""}</div></a>
      <a class="tile tile-zh" href="#/zh"><div class="ic">🎓</div><h3>ZH-felkészülés</h3><p>Korábbi zárthelyik segítség nélkül (időre, pontozással) vagy lépésenkénti levezetéssel és ábrákkal.</p><div class="count">${EXAMS.length} korábbi ZH + véletlen próba-ZH</div></a>
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
const WEEKS = [...new Set(TOPICS.map((t) => t.week))].sort((x, y) => x - y);
const th = Object.assign({ view: "detail", types: ["def", "tetel", "kepl", "ex"], weeks: [...WEEKS], known: [1, 2, 3, 4] }, store.get("theory", {}));
/* az új hetek akkor is jelenjenek meg, ha a szűrőt korábban elmentettük */
WEEKS.forEach((w) => { if (!th.known.includes(w)) { th.known.push(w); if (!th.weeks.includes(w)) th.weeks.push(w); } });
th.q = "";
const thSave = () => store.set("theory", { view: th.view, types: th.types, weeks: th.weeks, known: th.known });

function exampleHtml(pr, i) {
  const b = pr.build(pr.fixed);
  return `<details class="example anim-item" style="--i:${i}"><summary>${pr.title} <span class="badge">${pr.src}</span></summary>
    <div class="body">
      <div>${b.text}</div>
      <div class="solution"><h4>Megoldás</h4>${b.sol}
        ${(b.figs || []).length ? `<div class="figs">${b.figs.join("")}</div>` : ""}
        <ul class="answers">${b.parts.map((p) => `<li><b>${esc(p.label)}:</b> ${fmt(p.ans)}</li>`).join("")}</ul>
      </div>
      <p class="small"><a href="#/szamolas/${pr.id}/random">Gyakorold véletlen számokkal →</a></p>
    </div></details>`;
}
/* nem generált, kidolgozott példa (examples.js) */
function staticExampleHtml(e, i) {
  const figs = e.figs ? e.figs() : [];
  return `<details class="example anim-item" style="--i:${i}"><summary>${e.title} <span class="badge">${e.src}</span></summary>
    <div class="body">
      <div>${e.text}</div>
      <div class="solution"><h4>Megoldás</h4>${e.sol}${figs.length ? `<div class="figs">${figs.join("")}</div>` : ""}</div>
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
    const exMatch = (x) => !q || (x.title + " " + x.src).toLowerCase().includes(q);
    const probs = th.view === "detail" && th.types.includes("ex")
      ? [...PROBLEMS.filter((p) => p.topic === t.id && exMatch(p)).map((p) => ({ p })), ...EXAMPLES.filter((e) => e.topic === t.id && exMatch(e)).map((e) => ({ e }))]
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
      ${probs.length ? `<h3 class="subgroup">Példafeladatok a gyakorlatokról</h3><div class="examples">${probs.map((x) => (x.p ? exampleHtml(x.p, i++) : staticExampleHtml(x.e, i++))).join("")}</div>` : ""}
    </section>`).join("")
    : `<div class="empty">Nincs találat a megadott szűrőkkel.</div>`;
  renderMath(content);
  /* tartalomjegyzék: minden témakör látszik, a szám a szűrés utáni elemszám (szűréskor "látható/összes") */
  const toc = document.getElementById("tToc");
  const allTypes = th.view === "formula" ? ["def", "tetel", "kepl"] : ["def", "tetel", "kepl", "ex"];
  const filtered = !!th.q.trim() || th.weeks.length < WEEKS.length || !allTypes.every((x) => th.types.includes(x));
  const prev = th.counts || {};
  th.counts = {};
  toc.innerHTML = TOPICS.map((t) => {
    const d = data.find((x) => x.t.id === t.id);
    const n = d ? d.n : 0;
    const totalCards = CARDS.filter((c) => c.topic === t.id && (th.view !== "formula" || formulaOf(c))).length;
    const totalProbs = th.view === "detail" ? PROBLEMS.filter((p) => p.topic === t.id).length + EXAMPLES.filter((e) => e.topic === t.id).length : 0;
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
            ${WEEKS.map((w) => chip("week", w, `${w}. hét`, th.weeks.includes(w))).join("")}
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
const fc = { topics: new Set(TOPICS.map((t) => t.id)), types: new Set(["def", "tetel", "kepl"]), dir: "term", onlyHard: false, settingsOpen: window.innerWidth > 860, queue: [], total: 0, known: 0, flipped: false, enter: "", busy: false };
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
      <details class="panel fc-settings" id="fcSettings" ${fc.settingsOpen ? "open" : ""}>
        <summary><span>⚙ Beállítások</span><span class="small muted">${fc.topics.size === TOPICS.length ? "minden témakör" : fc.topics.size + " témakör"} · ${fc.types.size === 3 ? "minden típus" : [...fc.types].map((t) => typeName[t].toLowerCase()).join(", ")} · ${fc.dir === "term" ? "fogalom → leírás" : "leírás → fogalom"}</span></summary>
        <div class="fc-settings-body">
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
      </details>
      ${card ? `
        <div class="row small muted" style="margin-top:18px">
          <span>Ebben a körben: ${fc.known} / ${fc.total} tudva · hátravan ${fc.queue.length}</span><span class="spacer"></span><span>Összesen tudott: ${knownAll} / ${CARDS.length}</span>
        </div>
        <div class="progress" style="margin-top:6px"><div style="width:${fc.total ? (100 * fc.known) / fc.total : 0}%"></div></div>
        <div class="flip ${fc.flipped ? "flipped" : ""} ${fc.enter}" id="fcCard" tabindex="0" role="button" aria-label="Kártya megfordítása">
          <div class="swipe-hint yes" aria-hidden="true">✓ TUDTAM</div>
          <div class="swipe-hint no" aria-hidden="true">NEM TUDTAM ✗</div>
          <div class="flip-inner">
            <div class="face front"><div class="topline"><span class="badge ${card.type}">${typeName[card.type]}</span><span class="small muted">${topicName(card.topic)}</span></div>${front}<div class="hint"><span class="hint-desktop">Kattints vagy <span class="kbd">Space</span> a megfordításhoz · a kártya húzható is</span><span class="hint-touch">Koppints a megfordításhoz · húzd jobbra, ha tudtad, balra, ha nem</span></div></div>
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
  document.getElementById("fcSettings").addEventListener("toggle", (e) => { fc.settingsOpen = e.target.open; });
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
  const answer = (ok, swiped) => {
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
    if (swiped) {
      /* a húzott helyzetből repül tovább ugyanabba az irányba */
      el.style.transition = "transform .25s ease-out, opacity .25s";
      el.style.transform = `translateX(${ok ? "" : "-"}120vw) rotate(${ok ? 24 : -24}deg)`;
      el.style.opacity = "0";
    } else el.classList.add(ok ? "out-right" : "out-left");
    setTimeout(() => { fc.busy = false; fc.enter = "card-in"; fcRender(); }, reduceMotion() ? 0 : 230);
  };
  /* húzás (swipe): egér és érintés, mindkettő pointer eseményekkel */
  const cardEl = document.getElementById("fcCard");
  const TH = Math.min(110, window.innerWidth * 0.22); /* ennyi elmozdulás után számít válasznak */
  let sx = 0, sy = 0, dx = 0, st = 0, pid = null, dragging = false, moved = false;
  const setDrag = (x) => {
    cardEl.style.transform = x ? `translateX(${x}px) rotate(${x / 18}deg)` : "";
    cardEl.style.setProperty("--swipe", Math.max(-1, Math.min(1, x / TH)).toFixed(3));
  };
  cardEl.addEventListener("pointerdown", (e) => {
    if (fc.busy || (e.pointerType === "mouse" && e.button !== 0)) return;
    sx = e.clientX; sy = e.clientY; dx = 0; st = performance.now();
    pid = e.pointerId; dragging = true; moved = false;
  });
  cardEl.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pid) return;
    const mx = e.clientX - sx, my = e.clientY - sy;
    if (!moved) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      if (Math.abs(my) > Math.abs(mx)) { dragging = false; return; } /* függőleges: hagyjuk görgetni */
      moved = true;
      try { cardEl.setPointerCapture(pid); } catch (err) { /* nem kritikus */ }
      cardEl.classList.add("dragging");
    }
    dx = mx;
    setDrag(dx);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    if (!moved) return; /* sima koppintás: a click esemény fordítja meg */
    cardEl.classList.remove("dragging");
    const fast = Math.abs(dx) > 40 && Math.abs(dx) / (performance.now() - st) > 0.6; /* gyors pöccintés */
    if (Math.abs(dx) > TH || fast) answer(dx > 0, true);
    else setDrag(0);
  };
  cardEl.addEventListener("pointerup", endDrag);
  cardEl.addEventListener("pointercancel", endDrag);
  cardEl.addEventListener("click", () => {
    if (moved) { moved = false; return; } /* húzás után ne forduljon meg */
    flip();
  });
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
            ${pr.hint ? `<button type="button" class="btn" id="csHint">💡 Tipp</button>` : ""}
            <button type="button" class="btn" id="csSol">Megoldás mutatása</button>
            <span class="spacer"></span>
            ${cs.mode === "random" ? `<button type="button" class="btn" id="csNew">↻ Új számok</button>` : ""}
            <button type="button" class="btn" id="csNext">Következő →</button>
          </div>
        </form>
        <div id="csHintBox"></div>
        <div id="csSolution"></div>
        <details class="help" style="margin-top:16px"><summary>Hogyan írjam be a választ?</summary>
          <p>Elég 3–4 tizedesjegy pontossággal megadni (pl. <code>0,2273</code>). Kifejezést is írhatsz, az oldal kiszámolja:
          <code>1/72</code>, <code>0.85^3*0.15</code>, <code>1-e^-2</code>, <code>C(15;2)*0.08^2*0.92^13</code>, <code>11!</code>, <code>sqrt(2.15)</code>, <code>8%</code>, <code>Phi(0,6)</code>, <code>invPhi(0,9)</code>.
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
      ${(b.figs || []).length ? `<div class="figs">${b.figs.join("")}</div>` : ""}
      <ul class="answers">${b.parts.map((p) => `<li><b>${esc(p.label)}:</b> ${fmt(p.ans)}</li>`).join("")}</ul></div>`;
    renderMath(el);
  };
  document.getElementById("csSol").addEventListener("click", showSol);
  const hb = document.getElementById("csHint");
  if (hb) hb.addEventListener("click", () => {
    const el = document.getElementById("csHintBox");
    el.innerHTML = `<div class="hint-box"><b>💡 Tipp:</b> ${pr.hint}</div>`;
    renderMath(el);
    hb.disabled = true;
  });

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

/* ───────────────────────── ZH ───────────────────────── */
const zs = { exam: null, mode: null, answers: {}, submitted: false, start: 0, limit: 0, elapsed: 0, ti: 0, revealed: {}, results: {}, hints: {} };
const zhTopic = (id) => (id === "elmelet" ? "Elmélet" : topicName(id));
const taskPts = (t) => sum(t.parts.map((p) => p.pts || 1));
const examPts = (ex) => sum(ex.tasks.map(taskPts));
const mmss = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

function viewZH(args) {
  const [id, mode, tn1] = args || [];
  if (!id) return zhHome();
  if (mode !== "vizsga" && mode !== "tanulo") { location.hash = "#/zh"; return; }
  if (!zs.exam || zs.exam.id !== id || zs.mode !== mode) {
    if (!zhStart(id, mode)) { location.hash = "#/zh"; return; }
  }
  if (mode === "tanulo" && tn1 && zs.exam.tasks[+tn1 - 1]) zs.ti = +tn1 - 1;
  mode === "vizsga" ? zhExamRender() : zhLearnRender();
}
function zhStart(id, mode) {
  const ex = id === "random" ? buildRandomExam() : EXAMS.find((e) => e.id === id);
  if (!ex) return false;
  Object.assign(zs, { exam: ex, mode, answers: {}, submitted: false, start: Date.now(), elapsed: 0, ti: 0, revealed: {}, results: {}, hints: {},
    limit: mode === "vizsga" ? store.get("zhLimit", 0) : 0 });
  return true;
}
function gradePart(p, a) {
  if (a === undefined || a === "") return null;
  if (p.choices) return a === p.ans;
  try { return isClose(evaluate(a), p.ans); } catch (e) { return false; }
}
const answerText = (p) => (p.choices ? p.choices[p.ans] : fmt(p.ans, 4));

/* ── közös építőelemek ── */
function zhTaskHead(t, ti) {
  return `<div class="zh-task-head"><span class="zh-num">${ti + 1}</span><h2>${t.title}</h2>
    <span class="badge">${zhTopic(t.topic)}</span><span class="badge">${fmt(taskPts(t))} pont</span></div>
    <div class="prob-text">${t.text}</div>${t.textFigs ? `<div class="figs">${t.textFigs().join("")}</div>` : ""}`;
}
function zhPartHtml(ti, pi, p, { locked = false, result = null, showAns = false } = {}) {
  const key = `${ti}-${pi}`, a = zs.answers[key];
  const cls = result === true ? " ok" : result === false ? " bad" : "";
  const mark = result === true ? "✓" : result === false ? "✗" : "";
  const fb = `<span class="fb${cls}">${mark}</span>`;
  const helyes = showAns && result !== true ? `<div class="preview correct">Helyes: ${md(answerText(p))}</div>` : `<div class="preview"></div>`;
  const label = `<label${p.choices ? "" : ` for="z${key}"`}>${esc(p.label)} <span class="pts">${fmt(p.pts || 1)} p</span></label>`;
  if (p.choices) {
    return `<div class="part choice${cls}" data-k="${key}">${label}<div class="seg choice-seg">${p.choices.map((c, ci) =>
      `<button type="button" data-ci="${ci}" class="${a === ci ? "on" : ""}" ${locked ? "disabled" : ""}>${md(c)}</button>`).join("")}</div>${fb}${helyes}</div>`;
  }
  return `<div class="part${cls}" data-k="${key}">${label}<input type="text" id="z${key}" inputmode="decimal" autocomplete="off" value="${esc(a || "")}" ${locked ? "disabled" : ""} placeholder="pl. 0,25 vagy 1/4">${fb}${helyes}</div>`;
}
function zhWireParts(root, onChange) {
  root.querySelectorAll(".part input").forEach((inp) => inp.addEventListener("input", () => {
    const row = inp.closest(".part");
    zs.answers[row.dataset.k] = inp.value;
    row.classList.remove("ok", "bad");
    row.querySelector(".fb").textContent = "";
    const pv = row.querySelector(".preview");
    pv.classList.remove("correct");
    if (!inp.value.trim()) pv.textContent = "";
    else { try { pv.textContent = "= " + fmt(evaluate(inp.value), 6); } catch (err) { pv.textContent = "⚠ " + err.message; } }
    if (onChange) onChange();
  }));
  root.querySelectorAll(".choice-seg button").forEach((btn) => btn.addEventListener("click", () => {
    const row = btn.closest(".part");
    zs.answers[row.dataset.k] = +btn.dataset.ci;
    row.querySelectorAll(".choice-seg button").forEach((x) => x.classList.toggle("on", x === btn));
    row.classList.remove("ok", "bad");
    row.querySelector(".fb").textContent = "";
    if (onChange) onChange();
  }));
}
function zhStepsHtml(t, n, animFrom = false) {
  return `<ol class="steps">${t.steps.slice(0, n).map((s, si) => `<li class="step${s.note ? " note" : ""}${animFrom !== false && si >= animFrom ? " anim-swap" : ""}">
    <div class="step-t">${s.t}</div><div class="step-b">${s.b}</div>${s.figs ? `<div class="figs">${s.figs().join("")}</div>` : ""}</li>`).join("")}</ol>`;
}
const zhAnswersHtml = (t) => `<div class="solution"><h4>Végeredmények</h4><ul class="answers">${t.parts.map((p) => `<li><b>${esc(p.label)}:</b> ${md(answerText(p))}</li>`).join("")}</ul></div>`;

/* ── ZH főoldal ── */
function zhHome() {
  const best = store.get("zhBest", {});
  const limit = store.get("zhLimit", 0);
  const running = zs.exam && zs.mode === "vizsga" && !zs.submitted;
  const card = (ex) => {
    const topics = [...new Set(ex.tasks.map((t) => t.topic))];
    return `<article class="panel zh-card anim-item">
      <div><h3>${ex.title}</h3><div class="small muted">${ex.source}</div></div>
      <div class="small">${ex.tasks.length} feladat · ${fmt(examPts(ex))} pont</div>
      <div class="zh-topics">${topics.map((t) => `<span class="badge">${zhTopic(t)}</span>`).join("")}</div>
      ${best[ex.id] !== undefined ? `<div class="small">Legjobb ZH-mód eredmény: <b>${best[ex.id]}%</b></div>` : ""}
      <div class="row zh-card-btns"><a class="btn primary" href="#/zh/${ex.id}/vizsga">📝 ZH-mód</a><a class="btn" href="#/zh/${ex.id}/tanulo">📖 Tanuló mód</a></div>
    </article>`;
  };
  mount(`
    <h1>ZH-felkészülés</h1>
    <p class="muted">Korábbi 1. zárthelyik feladatai, a hivatalos pontozással. Válaszd ki, hogyan szeretnél gyakorolni:</p>
    <div class="zh-modes">
      <div class="panel"><h3>📝 ZH-mód — segítség nélkül</h3><p class="small muted">Mint a valódi ZH-n: minden feladat egyben, választható időkorláttal, tipp és megoldás nélkül. A beadás után pontozást kapsz, és minden feladathoz megnézheted a részletes levezetést.</p>
        <label class="small">Időkorlát: <select id="zhLimit">${[0, 45, 60, 90].map((m) => `<option value="${m}" ${m === limit ? "selected" : ""}>${m ? m + " perc" : "nincs (stopper)"}</option>`).join("")}</select></label></div>
      <div class="panel"><h3>📖 Tanuló mód — levezetéssel</h3><p class="small muted">Feladatonként haladsz: azonnal ellenőrizheted a válaszaid, kérhetsz tippet, és lépésről lépésre kibonthatod a megoldást ábrákkal, grafikonokkal.</p></div>
    </div>
    ${running ? `<div class="panel zh-resume"><b>Folyamatban:</b> ${zs.exam.title} (ZH-mód) <span class="spacer"></span><a class="btn primary" href="#/zh/${zs.exam.id}/vizsga">Folytatás →</a></div>` : ""}
    <div class="zh-grid">
      ${EXAMS.map(card).join("")}
      <article class="panel zh-card zh-card-random anim-item">
        <div><h3>🎲 Véletlen próba-ZH</h3><div class="small muted">6 feladat a számolós feladatok generátoraiból (kombinatorika, Bayes, valószínűségi változó, nevezetes eloszlások, folytonos eloszlás) — minden indításkor új számokkal.</div></div>
        ${best.random !== undefined ? `<div class="small">Legjobb ZH-mód eredmény: <b>${best.random}%</b></div>` : ""}
        <div class="row zh-card-btns"><a class="btn primary zh-new" href="#/zh/random/vizsga">📝 ZH-mód</a><a class="btn zh-new" href="#/zh/random/tanulo">📖 Tanuló mód</a></div>
      </article>
    </div>`);
  document.getElementById("zhLimit").addEventListener("change", (e) => store.set("zhLimit", +e.target.value));
  app.querySelectorAll(".zh-new").forEach((x) => x.addEventListener("click", () => { zs.exam = null; }));
}

/* ── ZH-mód: segítség nélkül ── */
function zhExamRender() {
  const ex = zs.exam, total = examPts(ex), sub = zs.submitted;
  let score = 0;
  if (sub) ex.tasks.forEach((t, ti) => t.parts.forEach((p, pi) => { if (zs.results[`${ti}-${pi}`] === true) score += p.pts || 1; }));
  const pct = Math.round((100 * score) / total);
  const nParts = sum(ex.tasks.map((t) => t.parts.length));
  mount(`
    <div class="zh-bar">
      <a class="btn small-btn" href="#/zh">← ZH-k</a>
      <b class="zh-bar-title">${ex.title}</b>
      <span class="spacer"></span>
      <span class="stat-pill" id="zhTimer">⏱ ${sub ? mmss(zs.elapsed) : "00:00"}</span>
      ${sub ? `<span class="stat-pill">${fmt(score)} / ${fmt(total)} pont</span>` : `<span class="stat-pill" id="zhProgress"></span><button class="btn primary" id="zhSubmit">Beadás</button>`}
    </div>
    ${sub ? `<div class="panel zh-result anim-swap">
        <div class="score-big">${pct}%</div>
        <p>${fmt(score)} / ${fmt(total)} pont · idő: ${mmss(zs.elapsed)}${zs.timeUp ? " (lejárt az idő)" : ""}</p>
        <div class="tbl-scroll"><table class="mini zh-table"><tr><th>Feladat</th><th>Pont</th></tr>${ex.tasks.map((t, ti) => {
          const got = sum(t.parts.map((p, pi) => (zs.results[`${ti}-${pi}`] === true ? p.pts || 1 : 0)));
          return `<tr><td style="text-align:left"><a href="#zht${ti}" class="zh-jump" data-ti="${ti}">${ti + 1}. ${t.title}</a></td><td>${fmt(got)} / ${fmt(taskPts(t))}</td></tr>`;
        }).join("")}</table></div>
        <div class="row" style="justify-content:center;margin-top:12px">
          <button class="btn primary" id="zhRetry">${ex.generated ? "Új próba-ZH" : "Újrakezdés"}</button>
          ${ex.generated ? "" : `<a class="btn" href="#/zh/${ex.id}/tanulo">📖 Átnézem tanuló módban</a>`}
        </div>
      </div>`
    : `<p class="muted small">Segítség nélküli mód: a válaszokat a végén, a <b>Beadás</b> gombbal ellenőrizheted. Számot vagy kifejezést is írhatsz (pl. <code>1/12</code>, <code>1-0,9^7</code>, <code>Phi(0,6)</code>).</p>`}
    ${ex.tasks.map((t, ti) => {
      const lost = sub && t.parts.some((p, pi) => zs.results[`${ti}-${pi}`] !== true);
      return `<section class="panel zh-task" id="zht${ti}">
        ${zhTaskHead(t, ti)}
        <div class="parts">${t.parts.map((p, pi) => zhPartHtml(ti, pi, p, { locked: sub, result: sub ? zs.results[`${ti}-${pi}`] ?? false : null, showAns: sub })).join("")}</div>
        ${sub ? `<details class="zh-sol"${lost ? " open" : ""}><summary>Részletes megoldás</summary>${zhStepsHtml(t, t.steps.length)}${zhAnswersHtml(t)}</details>` : ""}
      </section>`;
    }).join("")}
    ${sub ? "" : `<div class="row"><span class="spacer"></span><button class="btn primary" id="zhSubmit2">Beadás</button></div>`}`);

  if (sub) {
    document.getElementById("zhRetry").addEventListener("click", () => { zhStart(ex.generated ? "random" : ex.id, "vizsga"); zhExamRender(); window.scrollTo(0, 0); });
    app.querySelectorAll(".zh-jump").forEach((l) => l.addEventListener("click", (e) => {
      e.preventDefault();
      const el = document.getElementById("zht" + l.dataset.ti);
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 130, behavior: "smooth" });
    }));
    return;
  }
  const progress = () => {
    const n = Object.entries(zs.answers).filter(([, v]) => v !== "" && v !== undefined).length;
    document.getElementById("zhProgress").textContent = `${n} / ${nParts} válasz`;
    return n;
  };
  progress();
  zhWireParts(app, progress);
  const submit = (force) => {
    const n = progress();
    if (!force && n < nParts && !confirm(`Még ${nParts - n} válasz hiányzik. Biztosan beadod?`)) return;
    ex.tasks.forEach((t, ti) => t.parts.forEach((p, pi) => { zs.results[`${ti}-${pi}`] = gradePart(p, zs.answers[`${ti}-${pi}`]); }));
    zs.submitted = true;
    zs.elapsed = Date.now() - zs.start;
    let sc = 0;
    ex.tasks.forEach((t, ti) => t.parts.forEach((p, pi) => { if (zs.results[`${ti}-${pi}`] === true) sc += p.pts || 1; }));
    const best = store.get("zhBest", {});
    const pc = Math.round((100 * sc) / examPts(ex));
    if (best[ex.id] === undefined || pc > best[ex.id]) { best[ex.id] = pc; store.set("zhBest", best); }
    if (viewCleanup) { viewCleanup(); viewCleanup = null; }
    zhExamRender();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  document.getElementById("zhSubmit").addEventListener("click", () => submit(false));
  document.getElementById("zhSubmit2").addEventListener("click", () => submit(false));
  /* időzítő: időkorlát esetén visszaszámol, és lejáratkor automatikusan bead */
  const timerEl = document.getElementById("zhTimer");
  const tickT = () => {
    const el = Date.now() - zs.start;
    if (zs.limit) {
      const left = zs.limit * 60000 - el;
      timerEl.textContent = "⏱ " + mmss(left);
      timerEl.classList.toggle("warn", left < 5 * 60000);
      if (left <= 0) { zs.timeUp = true; submit(true); }
    } else timerEl.textContent = "⏱ " + mmss(el);
  };
  tickT();
  const iv = setInterval(tickT, 1000);
  viewCleanup = () => clearInterval(iv);
}

/* ── Tanuló mód: tipp, ellenőrzés, lépésenkénti levezetés ──
   Csak feladatváltáskor rajzoljuk újra a teljes panelt; a gombok a panelnek csak a
   megfelelő részét frissítik, így nem villan fel újra az egész (animáció). */
const zlDone = (k) => zs.exam.tasks[k].parts.every((p, pi) => zs.results[`${k}-${pi}`] === true);
function zlStepsWrapHtml(t, ti, animFrom = false) {
  const shown = zs.revealed[ti] || 0, n = t.steps.length;
  return `<div class="row zh-steps-head"><h3>Levezetés</h3><span class="muted small">${shown} / ${n} lépés</span><span class="spacer"></span>
      ${shown < n ? `<button type="button" class="btn" data-act="next">${shown ? "Következő lépés" : "Első lépés"} →</button><button type="button" class="btn" data-act="all">Összes lépés</button>`
        : `<button type="button" class="btn" data-act="hide">Elrejtés</button>`}
    </div>
    <div>${shown ? zhStepsHtml(t, shown, animFrom) : `<p class="muted small">Próbáld meg előbb egyedül! Ha elakadsz, kérj tippet, vagy bontsd ki a levezetést lépésenként.</p>`}</div>
    ${shown === n ? `<div${animFrom !== false ? ' class="anim-swap"' : ""}>${zhAnswersHtml(t)}</div>` : ""}`;
}
/* a részkérdések jelzéseinek (✓/✗, „Helyes: …”) frissítése a helyükön */
function zlUpdateParts(t, ti) {
  const all = (zs.revealed[ti] || 0) === t.steps.length;
  t.parts.forEach((p, pi) => {
    const key = `${ti}-${pi}`, row = app.querySelector(`.part[data-k="${key}"]`);
    if (!row) return;
    const r = zs.results[key] ?? null;
    row.classList.toggle("ok", r === true);
    row.classList.toggle("bad", r === false);
    const fb = row.querySelector(".fb");
    fb.textContent = r === true ? "✓" : r === false ? "✗" : "";
    fb.className = "fb" + (r === true ? " ok" : r === false ? " bad" : "");
    const pv = row.querySelector(".preview");
    if (all && r !== true) { pv.classList.add("correct"); pv.innerHTML = "Helyes: " + md(answerText(p)); renderMath(pv); }
    else if (pv.classList.contains("correct")) { pv.classList.remove("correct"); pv.textContent = ""; }
  });
}
function zlUpdateProgress() {
  const ex = zs.exam;
  document.getElementById("zlDone").textContent = `${ex.tasks.filter((_, k) => zlDone(k)).length} / ${ex.tasks.length} feladat kész`;
  app.querySelectorAll(".zh-tab").forEach((b) => {
    const k = +b.dataset.k, d = zlDone(k);
    b.classList.toggle("done", d);
    b.textContent = d ? "✓" : k + 1;
  });
}
function zhLearnRender() {
  const ex = zs.exam, ti = zs.ti, t = ex.tasks[ti];
  mount(`
    <div class="zh-bar">
      <a class="btn small-btn" href="#/zh">← ZH-k</a>
      <b class="zh-bar-title">${ex.title} · tanuló mód</b>
      <span class="spacer"></span>
      <span class="stat-pill" id="zlDone"></span>
    </div>
    <div class="zh-tabs">${ex.tasks.map((x, k) => `<button class="zh-tab${k === ti ? " on" : ""}" data-k="${k}" title="${esc(x.title)}">${k + 1}</button>`).join("")}</div>
    <section class="panel zh-task anim-swap">
      ${zhTaskHead(t, ti)}
      <form class="parts" id="zlForm" autocomplete="off">
        ${t.parts.map((p, pi) => zhPartHtml(ti, pi, p)).join("")}
        <div class="row">
          <button type="submit" class="btn primary">Ellenőrzés</button>
          ${t.hint ? `<button type="button" class="btn" id="zlHint" ${zs.hints[ti] ? "disabled" : ""}>💡 Tipp</button>` : ""}
        </div>
      </form>
      <div id="zlHintBox">${zs.hints[ti] ? `<div class="hint-box"><b>💡 Tipp:</b> ${t.hint}</div>` : ""}</div>
      <div class="zh-steps-wrap" id="zlSteps">${zlStepsWrapHtml(t, ti)}</div>
      <div class="row zh-nav">
        <button class="btn" id="zlPrev" ${ti === 0 ? "disabled" : ""}>← Előző feladat</button>
        <span class="spacer"></span>
        <button class="btn" id="zlNext" ${ti === ex.tasks.length - 1 ? "disabled" : ""}>Következő feladat →</button>
      </div>
    </section>`);
  zlUpdateParts(t, ti);
  zlUpdateProgress();
  const go = (k) => {
    zs.ti = k;
    history.replaceState(null, "", `#/zh/${ex.id}/tanulo/${k + 1}`);
    zhLearnRender();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  app.querySelectorAll(".zh-tab").forEach((b) => b.addEventListener("click", () => go(+b.dataset.k)));
  document.getElementById("zlPrev").addEventListener("click", () => go(ti - 1));
  document.getElementById("zlNext").addEventListener("click", () => go(ti + 1));
  zhWireParts(app);
  /* ellenőrzés: csak a mezők jelzései változnak */
  document.getElementById("zlForm").addEventListener("submit", (e) => {
    e.preventDefault();
    t.parts.forEach((p, pi) => { zs.results[`${ti}-${pi}`] = gradePart(p, zs.answers[`${ti}-${pi}`]); });
    zlUpdateParts(t, ti);
    zlUpdateProgress();
  });
  /* tipp: csak a tippdoboz jelenik meg */
  const hb = document.getElementById("zlHint");
  if (hb) hb.addEventListener("click", () => {
    zs.hints[ti] = true;
    hb.disabled = true;
    const box = document.getElementById("zlHintBox");
    box.innerHTML = `<div class="hint-box"><b>💡 Tipp:</b> ${t.hint}</div>`;
    renderMath(box);
  });
  /* levezetés: csak a levezetés-blokk frissül, és csak az új lépés úszik be */
  const wrap = document.getElementById("zlSteps");
  wrap.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const prev = zs.revealed[ti] || 0, n = t.steps.length;
    const next = b.dataset.act === "next" ? Math.min(n, prev + 1) : b.dataset.act === "all" ? n : 0;
    zs.revealed[ti] = next;
    wrap.innerHTML = zlStepsWrapHtml(t, ti, next > prev ? prev : false);
    renderMath(wrap);
    zlUpdateParts(t, ti);
    if (next > prev) {
      const first = wrap.querySelectorAll(".step")[prev];
      if (first) first.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "nearest" });
    }
  });
}

/* indulás (a defer-es szkriptek sorrendben futnak, így a KaTeX már betöltődött) */
renderMath(document.querySelector(".footer"));
route();
