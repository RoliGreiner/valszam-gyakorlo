/* Egyszerű SVG-ábrák a levezetésekhez: oszlopdiagram (eloszlás), lépcsős eloszlásfüggvény,
   görbe satírozott területtel (sűrűségfüggvény), valószínűségi fa, síkbeli tartomány
   (geometriai valószínűség), kockarács, szerencsekerék és Venn-diagram.
   Minden függvény HTML-szöveget ad vissza; a színek CSS-változókból jönnek (világos/sötét mód). */
"use strict";

/* az ábra szélessége a képernyőhöz igazodik, így mobilon sem lesznek apró betűk */
const figW = () => Math.round(Math.min(440, Math.max(300, (typeof window !== "undefined" && window.innerWidth ? window.innerWidth : 1000) - 64)));
const r2 = (x) => Math.round(x * 100) / 100;

function figWrap(w, h, inner, { title, caption, label } = {}) {
  return `<figure class="fig">${title ? `<div class="fig-title">${title}</div>` : ""}<svg viewBox="0 0 ${r2(w)} ${r2(h)}" role="img" aria-label="${esc(label || String(title || "ábra").replace(/\$/g, ""))}">${inner}</svg>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
}
/* "szép" lépésköz a tengelyekhez: 1, 2, 2,5, 5 ·10^k */
function niceStep(raw) {
  if (!(raw > 0)) return 1;
  const e = Math.floor(Math.log10(raw)), b = raw / 10 ** e;
  const m = b <= 1 ? 1 : b <= 2 ? 2 : b <= 2.5 ? 2.5 : b <= 5 ? 5 : 10;
  return m * 10 ** e;
}
const tick = (x) => fmt(+x.toFixed(10), 3);
const txt = (x, y, t, cls = "", anchor = "middle", extra = "") =>
  `<text x="${r2(x)}" y="${r2(y)}" text-anchor="${anchor}" class="${cls}" ${extra}>${esc(t)}</text>`;
const line = (x1, y1, x2, y2, cls) => `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" class="${cls}"/>`;

/* ───────── oszlopdiagram: diszkrét eloszlás ───────── */
/* sumText: a kiemelt rész összegének felirata, ha az ábra nem mutatja a teljes (végtelen) farkat */
function figBars({ xs, ps, hl = () => false, title, caption, xlabel = "k", ylabel = "P", ref = null, labelAll, sumText }) {
  const W = figW(), H = 236, L = 46, R = 14, T = 24, B = 40;
  const pw = W - L - R, ph = H - T - B;
  const top0 = Math.max(...ps, ref ? ref.y : 0);
  const step = niceStep(top0 / 4);
  const ymax = Math.max(step, Math.ceil(top0 / step - 1e-9) * step);
  const Y = (v) => T + ph - (v / ymax) * ph;
  const n = xs.length, band = pw / n, bw = Math.min(24, band * 0.62);
  const showAll = labelAll ?? n <= 6;
  let g = "";
  for (let v = 0; v <= ymax + 1e-9; v += step) {
    g += line(L, Y(v), W - R, Y(v), "grid") + txt(L - 6, Y(v) + 4, tick(v), "t-muted t-small", "end");
  }
  const cands = [];
  xs.forEach((x, i) => {
    const cx = L + band * (i + 0.5), x0 = cx - bw / 2, x1 = cx + bw / 2, y0 = Y(ps[i]), yb = Y(0);
    const h = yb - y0, r = Math.min(4, bw / 2, h);
    const on = hl(x, i);
    const d = h <= 0.5 ? "" : `M${r2(x0)},${r2(yb)}V${r2(y0 + r)}Q${r2(x0)},${r2(y0)} ${r2(x0 + r)},${r2(y0)}H${r2(x1 - r)}Q${r2(x1)},${r2(y0)} ${r2(x1)},${r2(y0 + r)}V${r2(yb)}Z`;
    g += `<g class="hit"><rect x="${r2(cx - band / 2)}" y="${T}" width="${r2(band)}" height="${ph}" class="hitbox"/><path d="${d}" class="bar${on ? " hl" : ""}"/><title>${esc(`${ylabel}(${xlabel} = ${x}) = ${fmt(ps[i], 4)}`)}</title></g>`;
    /* címke-jelöltek; a nagyon kicsi értékeket csak a buborék mutatja */
    if (on || (showAll && ps[i] >= 0.0005)) cands.push({ cx, y: y0 - 5, t: fmt(ps[i], 3), on });
    if (n <= 16 || i % 2 === 0) g += txt(cx, H - B + 16, String(x), "t-muted t-small");
  });
  /* csak az egymást nem takaró címkék kerülnek ki: előbb a kiemeltek, aztán a többi */
  const placed = [];
  const fits = (c) => {
    const w = c.t.length * 6.4 + 4, a0 = c.cx - w / 2, a1 = c.cx + w / 2;
    if (a0 < L - 4 || a1 > W - 2) return false;
    return placed.every((p) => a1 + 2 < p.a0 || a0 - 2 > p.a1 || Math.abs(c.y - p.y) > 13) && placed.push({ a0, a1, y: c.y });
  };
  [...cands.filter((c) => c.on), ...cands.filter((c) => !c.on)].forEach((c) => {
    if (fits(c)) g += txt(c.cx, c.y, c.t, c.on ? "t-strong t-small" : "t-muted t-small");
  });
  /* több kiemelt oszlop: az összegük a lényeg */
  const hlIdx = xs.map((x, i) => (hl(x, i) ? i : -1)).filter((i) => i >= 0);
  if (sumText || hlIdx.length >= 2) g += txt(W - R, 13, sumText || `Σ kiemelt = ${fmt(sum(hlIdx.map((i) => ps[i])), 4)}`, "t-small t-strong", "end");
  g += line(L, Y(0), W - R, Y(0), "axis");
  if (ref) g += line(L, Y(ref.y), W - R, Y(ref.y), "refline") + txt(W - R, Y(ref.y) - 5, ref.label, "t-small", "end");
  g += txt(L + pw / 2, H - 6, xlabel, "t-muted t-small");
  return figWrap(W, H, g, { title, caption });
}

/* ───────── lépcsős eloszlásfüggvény: F(x) = P(X < x), balról folytonos ───────── */
function figStepCDF({ xs, ps, title, caption, ylabels, xlabel = "x" }) {
  const W = figW(), H = 232, L = 50, R = 16, T = 18, B = 36;
  const pw = W - L - R, ph = H - T - B;
  const n = xs.length, span = xs[n - 1] - xs[0] || 1;
  const xmin = xs[0] - Math.max(1, span * 0.25), xmax = xs[n - 1] + Math.max(1, span * 0.25);
  const X = (x) => L + ((x - xmin) / (xmax - xmin)) * pw, Y = (v) => T + ph - v * ph;
  const cum = [0];
  ps.forEach((p, i) => cum.push(cum[i] + p));
  let g = "";
  const levels = cum.length <= 7 ? cum : [0, 0.25, 0.5, 0.75, 1];
  levels.forEach((v, i) => {
    g += line(L, Y(v), W - R, Y(v), "grid") + txt(L - 6, Y(v) + 4, ylabels && cum.length <= 7 ? ylabels[i] : tick(v), "t-muted t-small", "end");
  });
  xs.forEach((x) => (g += line(X(x), Y(0), X(x), T, "guide") + txt(X(x), H - B + 16, String(x), "t-muted t-small")));
  g += line(L, Y(0), W - R, Y(0), "axis");
  for (let i = 0; i <= n; i++) {
    const xa = i === 0 ? xmin : xs[i - 1], xb = i === n ? xmax : xs[i];
    g += line(X(xa), Y(cum[i]), X(xb), Y(cum[i]), "curve");
  }
  xs.forEach((x, i) => {
    g += `<circle cx="${r2(X(x))}" cy="${r2(Y(cum[i]))}" r="4" class="dot"><title>F(${x}) = ${esc(fmt(cum[i], 4))}</title></circle>`;
    g += `<circle cx="${r2(X(x))}" cy="${r2(Y(cum[i + 1]))}" r="4" class="dot open"/>`;
  });
  g += txt(L + pw / 2, H - 4, xlabel, "t-muted t-small");
  return figWrap(W, H, g, { title, caption });
}

/* ───────── görbe (sűrűség- vagy eloszlásfüggvény), satírozott területtel ───────── */
function figCurve({ f, x0, x1, breaks = [], shade = null, negShade = false, marks = [], xTicks, title, caption, ymaxHint, xlabel = "x", n = 260 }) {
  const W = figW(), H = 230, L = 46, R = 16, T = 18, B = 36;
  const pw = W - L - R, ph = H - T - B;
  let xsS = [];
  for (let i = 0; i <= n; i++) xsS.push(x0 + ((x1 - x0) * i) / n);
  breaks.forEach((b) => { if (b > x0 && b < x1) xsS.push(b - 1e-9, b + 1e-9); });
  if (shade) xsS.push(shade.a, shade.b);
  xsS = [...new Set(xsS)].sort((a, b) => a - b);
  const val = (x) => { const v = f(x); return isFinite(v) ? v : NaN; };
  const ysS = xsS.map(val);
  const finite = ysS.filter((v) => isFinite(v));
  let ymax = ymaxHint || Math.max(...finite) * 1.12 || 1;
  const ymin = Math.min(0, ...finite) * 1.12;
  const X = (x) => L + ((x - x0) / (x1 - x0)) * pw, Y = (v) => T + ph - ((Math.min(v, ymax) - ymin) / (ymax - ymin)) * ph;
  let g = "";
  const step = niceStep((ymax - ymin) / 4);
  for (let v = Math.ceil(ymin / step) * step; v <= ymax + 1e-9; v += step) {
    g += line(L, Y(v), W - R, Y(v), "grid") + txt(L - 6, Y(v) + 4, tick(v), "t-muted t-small", "end");
  }
  const ticks = xTicks || (() => { const s = niceStep((x1 - x0) / 6); const a = []; for (let v = Math.ceil(x0 / s) * s; v <= x1 + 1e-9; v += s) a.push(v); return a; })();
  ticks.forEach((tk) => { const x = typeof tk === "object" ? tk.x : tk, l = typeof tk === "object" ? tk.t : tick(tk); g += txt(X(x), H - B + 16, l, "t-muted t-small"); });
  /* satírozott terület */
  if (shade) {
    const pts = xsS.filter((x) => x >= shade.a - 1e-12 && x <= shade.b + 1e-12).filter((x, i) => isFinite(val(x)));
    if (pts.length) {
      const d = `M${r2(X(pts[0]))},${r2(Y(0))}` + pts.map((x) => `L${r2(X(x))},${r2(Y(val(x)))}`).join("") + `L${r2(X(pts[pts.length - 1]))},${r2(Y(0))}Z`;
      g += `<path d="${d}" class="area"/>`;
      if (shade.label) {
        const mid = (shade.a + shade.b) / 2, mv = val(mid);
        g += txt(X(mid), Y(isFinite(mv) ? mv * 0.42 : ymax * 0.3) + 4, shade.label, "t-strong halo");
      }
    }
  }
  if (negShade) {
    let seg = [];
    const flush = () => {
      if (seg.length > 1) g += `<path d="M${r2(X(seg[0]))},${r2(Y(0))}${seg.map((x) => `L${r2(X(x))},${r2(Y(val(x)))}`).join("")}L${r2(X(seg[seg.length - 1]))},${r2(Y(0))}Z" class="area neg"/>`;
      seg = [];
    };
    xsS.forEach((x) => (val(x) < 0 ? seg.push(x) : flush()));
    flush();
  }
  g += line(L, Y(0), W - R, Y(0), "axis");
  /* görbe: szakadásoknál megszakítjuk */
  let d = "", pen = false, prev = null;
  xsS.forEach((x) => {
    const v = val(x);
    if (!isFinite(v)) { pen = false; return; }
    const jump = prev !== null && Math.abs(v - prev) > (ymax - ymin) * 0.5 && breaks.length;
    d += `${pen && !jump ? "L" : "M"}${r2(X(x))},${r2(Y(v))}`;
    pen = true;
    prev = v;
  });
  g += `<path d="${d}" class="curve"/>`;
  marks.forEach((m) => {
    const v = val(m.x);
    g += line(X(m.x), Y(0), X(m.x), isFinite(v) ? Y(v) : T, "mark") + (m.t ? txt(X(m.x), T + 10 + (m.dy || 0), m.t, "t-small halo") : "");
  });
  g += txt(L + pw / 2, H - 4, xlabel, "t-muted t-small");
  return figWrap(W, H, g, { title, caption });
}

/* ───────── valószínűségi fa (két szint) ─────────
   branches: [{ label, p, children: [{ label, p, value, hl }] }] — p, value: kiírt szöveg */
function figTree({ branches, title, caption, root = "" }) {
  const leaves = [];
  branches.forEach((b, bi) => b.children.forEach((c) => leaves.push({ ...c, bi })));
  const W = Math.min(440, figW()), rowH = 36, H = leaves.length * rowH + 16;
  const xr = 18, x1 = Math.round(W * 0.31), x2 = Math.round(W * 0.6);
  const ly = (i) => 8 + rowH * (i + 0.5);
  let li = 0;
  const nodes = branches.map((b) => {
    const idx = b.children.map(() => li++);
    return { ...b, y: (ly(idx[0]) + ly(idx[idx.length - 1])) / 2, leafIdx: idx };
  });
  const ry = (nodes[0].y + nodes[nodes.length - 1].y) / 2;
  /* élcímke: az él mentén, felfelé menő élnél fölötte, lefelé menőnél alatta */
  const edgeLbl = (xa, ya, xb, yb, t, cls, at = 0.55) => {
    const x = xa + (xb - xa) * at, y = ya + (yb - ya) * at;
    return txt(x, yb < ya - 1 ? y - 7 : yb > ya + 1 ? y + 15 : y - 7, t, cls);
  };
  let g = "";
  nodes.forEach((b) => {
    const anyHl = b.children.some((c) => c.hl);
    g += line(xr, ry, x1, b.y, "edge" + (anyHl ? " hl" : ""));
    b.children.forEach((c, k) => (g += line(x1, b.y, x2, ly(b.leafIdx[k]), "edge" + (c.hl ? " hl" : ""))));
  });
  nodes.forEach((b) => {
    g += edgeLbl(xr, ry, x1, b.y, b.p, "t-small halo", 0.5);
    b.children.forEach((c, k) => (g += edgeLbl(x1, b.y, x2, ly(b.leafIdx[k]), c.p, "t-small halo t-muted", 0.62)));
  });
  g += `<circle cx="${xr}" cy="${r2(ry)}" r="5" class="node"/>` + (root ? txt(xr, ry - 12, root, "t-small t-muted") : "");
  nodes.forEach((b) => {
    const anyHl = b.children.some((c) => c.hl);
    const w = Math.max(30, b.label.length * 7.2 + 14);
    g += `<rect x="${r2(x1 - w / 2)}" y="${r2(b.y - 11)}" width="${r2(w)}" height="22" rx="11" class="node${anyHl ? " hl" : ""}"/>` + txt(x1, b.y + 4, b.label, "t-small t-strong");
    b.children.forEach((c, k) => {
      const y = ly(b.leafIdx[k]);
      g += `<circle cx="${x2}" cy="${r2(y)}" r="4" class="dot${c.hl ? "" : " dim"}"/>` +
        `<text x="${x2 + 10}" y="${r2(y + 4)}" text-anchor="start" class="t-small${c.hl ? " t-strong" : ""}">${esc(c.label)}${c.value ? `<tspan class="${c.hl ? "t-strong" : "t-muted"}" dx="6">${esc(c.value)}</tspan>` : ""}</text>`;
    });
  });
  return figWrap(W, H, g, { title, caption });
}

/* ───────── síkbeli tartomány (geometriai valószínűség) ───────── */
function figPlane({ xr, yr, polys = [], segs = [], texts = [], xTicks = [], yTicks = [], xlabel = "x", ylabel = "y", title, caption, size = 260 }) {
  const sx = xr[1] - xr[0], sy = yr[1] - yr[0], k = size / Math.max(sx, sy);
  const L = 40, R = 16, T = 14, B = 36, pw = sx * k, ph = sy * k, W = pw + L + R, H = ph + T + B;
  const X = (x) => L + (x - xr[0]) * k, Y = (y) => T + ph - (y - yr[0]) * k;
  let g = `<rect x="${L}" y="${T}" width="${r2(pw)}" height="${r2(ph)}" class="frame"/>`;
  polys.forEach((p) => (g += `<polygon points="${p.pts.map(([x, y]) => `${r2(X(x))},${r2(Y(y))}`).join(" ")}" class="${p.cls || "fav"}"/>`));
  segs.forEach((s) => (g += line(X(s.a[0]), Y(s.a[1]), X(s.b[0]), Y(s.b[1]), s.cls || "line")));
  xTicks.forEach((t) => { const x = typeof t === "object" ? t.x : t; g += line(X(x), T + ph, X(x), T + ph + 4, "axis") + txt(X(x), T + ph + 16, typeof t === "object" ? t.t : tick(x), "t-muted t-small"); });
  yTicks.forEach((t) => { const y = typeof t === "object" ? t.y : t; g += line(L - 4, Y(y), L, Y(y), "axis") + txt(L - 7, Y(y) + 4, typeof t === "object" ? t.t : tick(y), "t-muted t-small", "end"); });
  texts.forEach((t) => (g += txt(X(t.x), Y(t.y) + 4, t.t, (t.cls || "t-small") + " halo")));
  g += txt(L + pw / 2, H - 4, xlabel, "t-muted t-small") + txt(12, T + ph / 2, ylabel, "t-muted t-small", "middle", `transform="rotate(-90 12 ${r2(T + ph / 2)})"`);
  return figWrap(W, H, g, { title, caption });
}

/* ───────── két kocka: 6×6 rács ───────── */
function figDice({ hl, title, caption, a = "1. kocka", b = "2. kocka" }) {
  const c = 34, L = 50, T = 34, W = L + 6 * c + 12, H = T + 6 * c + 12;
  let g = txt(L + 3 * c, 14, a, "t-muted t-small") + txt(12, T + 3 * c, b, "t-muted t-small", "middle", `transform="rotate(-90 12 ${T + 3 * c})"`);
  for (let i = 1; i <= 6; i++) {
    g += txt(L + (i - 0.5) * c, T - 6, String(i), "t-muted t-small") + txt(L - 10, T + (i - 0.5) * c + 4, String(i), "t-muted t-small", "end");
    for (let j = 1; j <= 6; j++) {
      const on = hl(i, j);
      g += `<rect x="${L + (i - 1) * c}" y="${T + (j - 1) * c}" width="${c}" height="${c}" rx="6" class="cell${on ? " hl" : ""}"><title>${i} + ${j} = ${i + j}</title></rect>` +
        txt(L + (i - 0.5) * c, T + (j - 0.5) * c + 4, String(i + j), "t-small" + (on ? " on-accent t-strong" : " t-muted"));
    }
  }
  return figWrap(W, H, g, { title, caption });
}

/* ───────── szerencsekerék ───────── */
function figWheel({ labels, title, caption, mark = [] }) {
  const W = 260, H = 240, cx = 130, cy = 120, R = 92, n = labels.length;
  let g = "";
  labels.forEach((l, i) => {
    const a0 = -Math.PI / 2 + (2 * Math.PI * i) / n, a1 = a0 + (2 * Math.PI) / n, am = (a0 + a1) / 2;
    const p = (a, r) => `${r2(cx + r * Math.cos(a))},${r2(cy + r * Math.sin(a))}`;
    g += `<path d="M${cx},${cy}L${p(a0, R)}A${R},${R} 0 0 1 ${p(a1, R)}Z" class="${l === "+" ? "sec-plus" : "sec-minus"}${mark.includes(i) ? " marked" : ""}"/>`;
    g += txt(cx + R * 0.62 * Math.cos(am), cy + R * 0.62 * Math.sin(am) + 7, l, "t-big t-strong");
    g += txt(cx + (R + 14) * Math.cos(am), cy + (R + 14) * Math.sin(am) + 4, String(i + 1), "t-muted t-small");
  });
  return figWrap(W, H, g, { title, caption });
}

/* ───────── Venn-diagram két halmazzal (darabszámok) ───────── */
function figVenn({ onlyA, both, onlyB, none, la = "A", lb = "B", title, caption }) {
  const W = 360, H = 200, c1 = 142, c2 = 218, cy = 104, r = 72;
  let g = `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="10" class="frame"/>` +
    `<circle cx="${c1}" cy="${cy}" r="${r}" class="venn"/><circle cx="${c2}" cy="${cy}" r="${r}" class="venn"/>` +
    txt(c1 - 40, 30, la, "t-strong t-small") + txt(c2 + 40, 30, lb, "t-strong t-small") +
    txt(c1 - 36, cy + 5, String(onlyA), "t-big") + txt((c1 + c2) / 2, cy + 5, String(both), "t-big t-strong") + txt(c2 + 36, cy + 5, String(onlyB), "t-big") +
    txt(W - 16, H - 16, `egyik sem: ${none}`, "t-small t-muted", "end");
  return figWrap(W, H, g, { title, caption });
}
