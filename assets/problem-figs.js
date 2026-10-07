/* Ábrák a számolós feladatok megoldásához. A feladat build()-jét becsomagoljuk:
   a visszaadott objektum kap egy figs tömböt (SVG-ábrák HTML-je). */
"use strict";

/* diszkrét eloszlás oszlopdiagramja; kmax-ig, vagy amíg a maradék valószínűség elhanyagolható */
const pmfRange = (pmf, kmin, kmax) => range(kmin, kmax).map((k) => pmf(k));
function poiMax(l) { let k = 0, c = 0; while (c < 0.999 && k < 40) { c += poiPmf(l, k); k++; } return Math.max(k, 5); }

const PROBLEM_FIGS = {
  binom: ({ n, p, k, m }) => [
    figBars({ xs: range(0, n), ps: pmfRange((i) => binPmf(n, p, i), 0, n), hl: (x) => x === k, title: R`$\text{Bin}(${n};\,${tn(p)})$ eloszlás — kiemelve: $X=${k}$` }),
    figBars({ xs: range(0, n), ps: pmfRange((i) => binPmf(n, p, i), 0, n), hl: (x) => x <= m, title: R`$P(X\le ${m})$ = a kiemelt oszlopok összege` }),
  ],
  pistike: ({ n, p, pct }) => {
    const t = Math.ceil((n * pct) / 100 - 1e-9);
    return [figBars({ xs: range(0, n), ps: pmfRange((i) => binPmf(n, p, i), 0, n), hl: (x) => x >= t, title: R`$\text{Bin}(${n};\,${tn(p)})$ — a siker: legalább $${t}$ jó válasz` })];
  },
  hipergeo: ({ N, K, n, k }) => {
    const lo = Math.max(0, n - (N - K)), hi = Math.min(n, K);
    return [figBars({ xs: range(lo, hi), ps: pmfRange((i) => hypPmf(N, K, n, i), lo, hi), hl: (x) => x === k, title: R`Hipergeometriai eloszlás ($N=${N}$, $K=${K}$, $n=${n}$)` })];
  },
  geo: ({ p, k, m }) => {
    const top = Math.max(k, m) + 3;
    return [figBars({ xs: range(1, top), ps: pmfRange((i) => (1 - p) ** (i - 1) * p, 1, top), hl: (x) => x === k, title: R`$\text{Geo}(${tn(p)})$: $P(X=k)=(1-p)^{k-1}p$ — kiemelve $k=${k}$`, caption: "Minden oszlop az előző (1−p)-szerese: a valószínűségek mértani sorozatot alkotnak." })];
  },
  poisson: ({ l, k }) => {
    const top = poiMax(l);
    return [figBars({ xs: range(0, top), ps: pmfRange((i) => poiPmf(l, i), 0, top), hl: (x) => x === k, title: R`$\text{Poisson}(${tn(l)})$ — kiemelve $X=${k}$` })];
  },
  poisinv: ({ q, m }) => {
    const l = -Math.log(q), top = poiMax(l);
    return [figBars({ xs: range(0, top), ps: pmfRange((i) => poiPmf(l, i), 0, top), hl: (x) => x <= m, title: R`$\text{Poisson}(\lambda\approx${tn(l, 3)})$ — kiemelve $X\le ${m}$; a legmagasabb oszlop a módusz` })];
  },
  lotto: ({ N, m, k }) => [
    figBars({ xs: range(0, m), ps: pmfRange((i) => (binom(m, i) * binom(N - m, m - i)) / binom(N, m), 0, m), hl: (x) => x === k, title: R`A találatok számának eloszlása (${N}/${m}-ös lottó)`, caption: "A nagy találatok valószínűsége olyan kicsi, hogy az oszlop szinte nem is látszik." }),
  ],
  amig: ({ a, b }) => {
    const N = a + b, ps = [];
    for (let k = 1; k <= b + 1; k++) { let pr = 1; for (let i = 0; i < k - 1; i++) pr *= (b - i) / (N - i); ps.push((pr * a) / (N - k + 1)); }
    const xs = ps.map((_, i) => i + 1);
    return [figBars({ xs, ps, title: R`$\xi$ eloszlása`, xlabel: "k" }), figStepCDF({ xs, ps, title: R`$\xi$ eloszlásfüggvénye: $F(x)=P(\xi\lt x)$`, caption: "Teli pont: ott veszi fel az értéket (balról folytonos); üres karika: ott még nem." })];
  },
  tabla: ({ x0, p, c }) => {
    const xs = p.map((_, i) => x0 + i);
    return [figStepCDF({ xs, ps: p, title: R`Az eloszlásfüggvény; $F(${c})=P(X\lt ${c})$` })];
  },
  teljes3: ({ ctx, pr, q, j }) => {
    const names = ["A", "B", "C"], ev = ctx === 0 ? ["selejt", "jó"] : ["sikeres", "sikertelen"];
    return [figTree({
      root: "",
      title: R`Valószínűségi fa — kiemelve a (b) kérdés ága`,
      branches: pr.map((x, i) => ({
        label: names[i], p: fmt(x / 100),
        children: [
          { label: ev[0], p: fmt(q[i] / 100), value: "= " + fmt((x / 100) * (q[i] / 100), 4), hl: i === j },
          { label: ev[1], p: fmt(1 - q[i] / 100), value: "" },
        ],
      })),
      caption: `A teljes valószínűség a „${ev[0]}” levelek összege; Bayes: a kiemelt ág osztva ezzel az összeggel.`,
    })];
  },
  bayes2: ({ ctx, pi, a, b }) => {
    const [H, Hn, E, En] = [["spam", "nem spam", "„ingyen”", "nincs benne"], ["1-et küld", "0-t küld", "1-et kap", "0-t kap"], ["beteg", "egészséges", "pozitív", "negatív"]][ctx];
    return [figTree({
      title: "Valószínűségi fa",
      branches: [
        { label: H, p: fmt(pi), children: [{ label: E, p: fmt(a), value: "= " + fmt(pi * a, 4), hl: true }, { label: En, p: fmt(1 - a) }] },
        { label: Hn, p: fmt(1 - pi), children: [{ label: E, p: fmt(b), value: "= " + fmt((1 - pi) * b, 4) }, { label: En, p: fmt(1 - b) }] },
      ],
      caption: "P(megfigyelés) = a két „megfigyelés” levél összege; a Bayes-tétel a kiemelt ág arányát adja ezen belül.",
    })];
  },
  gepall: ({ t, s }) => [figTree({
    title: "Valószínűségi fa (időarányok)",
    branches: ["A", "B", "C"].map((n, i) => ({ label: n, p: fmt(t[i], 3), children: [{ label: "áll", p: fmt(s[i]), value: "= " + fmt(t[i] * s[i], 4) }, { label: "dolgozik", p: fmt(1 - s[i]), value: i === 0 ? "= " + fmt(t[0] * (1 - s[0]), 4) : "", hl: i === 0 }] })),
  })],
  talalkozo: ({ T, w }) => [figPlane({
    xr: [0, T], yr: [0, T], title: "A találkozás tartománya: |x − y| ≤ " + w,
    polys: [{ pts: [[0, 0], [w, 0], [T, T - w], [T, T], [T - w, T], [0, w]], cls: "fav" }],
    xTicks: [0, w, T], yTicks: [0, w, T], xlabel: "Anna érkezése (perc)", ylabel: "Béla érkezése",
  })],
  /* ── 5. hét ── */
  poli: ({ n, b, a }) => {
    const c = (n + 1) / b ** (n + 1), med = b * 0.5 ** (1 / (n + 1));
    const f = (x) => (x > 0 && x < b ? c * x ** n : 0);
    return [figCurve({ f, x0: -0.15 * b, x1: 1.15 * b, breaks: [0, b], shade: { a: 0, b: a, label: "P = " + fmt((a / b) ** (n + 1), 3) }, marks: [{ x: med, t: "medián" }], title: R`A sűrűségfüggvény; a satírozott terület $P(X\lt ${tn(a)})$` })];
  },
  pareto: ({ k, x0, c, d }) => {
    const a = (k - 1) * x0 ** (k - 1), f = (x) => (x > x0 ? a / x ** k : 0);
    return [figCurve({ f, x0: 0, x1: d + 2, breaks: [x0], shade: { a: c, b: d, label: "P = " + fmt((x0 / c) ** (k - 1) - (x0 / d) ** (k - 1), 3) }, title: R`$f(x)=\frac{${a}}{x^{${k}}}$, a satírozott terület $P(${c}\lt\xi\lt ${d})$` })];
  },
  benzin: ({ n, p }) => {
    const t = 1 - p ** (1 / (n + 1)), f = (x) => (x > 0 && x < 1 ? (n + 1) * (1 - x) ** n : 0);
    return [figCurve({ f, x0: -0.1, x1: 1.1, breaks: [0, 1], shade: { a: t, b: 1, label: "" }, marks: [{ x: t, t: "t ≈ " + fmt(t, 3) }], title: R`A heti eladás sűrűségfüggvénye; a satírozott terület $P(X\gt t)=${tn(p)}$`, caption: "A t-től jobbra eső (kifogyás) rész területe kell, hogy pont 0,01 legyen." })];
  },
  egyenletes: ({ T, w, s }) => {
    const f = (x) => (x > 0 && x < T ? 1 / T : 0);
    return [figCurve({ f, x0: -T * 0.1, x1: T * 1.1, breaks: [0, T], shade: { a: w, b: T, label: "P = " + fmt((T - w) / T, 3) }, ymaxHint: 1.6 / T, title: R`$U[0;${T}]$ sűrűségfüggvénye; satírozva $P(X\ge ${w})$` })];
  },
  exp_alap: ({ mu, a, b }) => {
    const f = (x) => (x > 0 ? Math.exp(-x / mu) / mu : 0);
    return [
      figCurve({ f, x0: -mu * 0.1, x1: mu * 3, breaks: [0], shade: { a: 0, b: a, label: "P = " + fmt(1 - Math.exp(-a / mu), 3) }, marks: [{ x: mu * Math.LN2, t: "medián" }], title: R`Exponenciális sűrűségfüggvény, átlag $${mu}$; satírozva $P(X\lt ${a})$` }),
      figCurve({ f, x0: -mu * 0.1, x1: mu * 3, breaks: [0], shade: { a: b, b: mu * 3, label: "P = " + fmt(Math.exp(-b / mu), 3) }, title: R`Satírozva $P(X\gt ${b})$` }),
    ];
  },
  exp_kvant: ({ mu, t }) => {
    const F = (x) => (x > 0 ? 1 - Math.exp(-x / mu) : 0);
    return [figCurve({ f: F, x0: -mu * 0.1, x1: mu * 3.2, marks: [{ x: mu, t: "átlag: " + fmt(1 - Math.exp(-1), 3) }, { x: t, t: "", dy: 14 }], ymaxHint: 1.1, title: R`Az eloszlásfüggvény: $F(x)=1-e^{-x/${mu}}$`, caption: "Az átlagnál F értéke 1 − 1/e ≈ 0,632: az egyedek többsége az átlag előtt elpusztul." })];
  },
  exp_min: ({ m1, m2 }) => {
    const l = 1 / m1 + 1 / m2, F = (x) => (x > 0 ? Math.exp(-l * x) : 1);
    return [figCurve({ f: F, x0: 0, x1: 3 / l, ymaxHint: 1.1, title: R`Túlélési függvény: $P(T\gt t)=e^{-${tn(l, 3)}\,t}$` })];
  },
  normalis: ({ m, s, a, b }) => {
    const f = (x) => normPdf(x, m, s);
    return [figCurve({ f, x0: m - 3.6 * s, x1: m + 3.6 * s, shade: { a, b, label: "P = " + fmt(Phi((b - m) / s) - Phi((a - m) / s), 3) },
      marks: [{ x: m, t: "m" }, { x: m - s, t: "m−σ" }, { x: m + s, t: "m+σ" }], title: R`$N(${tn(m)};\,${tn(s)})$ — satírozva $P(${tn(a)}\lt X\lt ${tn(b)})$` })];
  },
  normalis2: ({ m, s, lo, hi }) => {
    const f = (x) => normPdf(x, m, s);
    return [figCurve({ f, x0: m - 3.6 * s, x1: m + 3.6 * s, shade: { a: lo, b: hi, label: "P = " + fmt(Phi((hi - m) / s) - Phi((lo - m) / s), 3) }, marks: [{ x: m, t: "m = " + m }], title: R`$N(${m};\,${s})$ — satírozva a (c) rész` })];
  },
  talalkozo2: ({ T, w, wa, wb }) => [
    figPlane({ xr: [0, T], yr: [0, T], title: R`(a) $|x-y|\gt ${w}$: a két háromszög`, polys: [{ pts: [[w, 0], [T, 0], [T, T - w]], cls: "fav" }, { pts: [[0, w], [0, T], [T - w, T]], cls: "fav" }], xTicks: [0, w, T], yTicks: [0, w, T], xlabel: "Aladár (perc)", ylabel: "Bori" }),
    figPlane({ xr: [0, T], yr: [0, T], title: R`(b) találkoznak: $y-x\le ${wa}$ és $x-y\le ${wb}$`, polys: [{ pts: [[0, 0], [wb, 0], [T, T - wb], [T, T], [T - wa, T], [0, wa]], cls: "fav" }], xTicks: [0, wb, T], yTicks: [0, wa, T], xlabel: "Aladár (perc)", ylabel: "Bori", texts: [{ x: T * 0.25, y: T * 0.78, t: "Bori túl későn jön" }, { x: T * 0.75, y: T * 0.2, t: "Aladár túl későn jön" }] }),
  ],
  osszeg2: ({ L, c1, c2 }) => {
    const clip = (c) => (c <= L ? [[c, 0], [0, c]] : [[L, c - L], [c - L, L]]);
    const [p1, p2] = [clip(c1), clip(c2)];
    const poly = c2 <= L ? [p1[0], p2[0], p2[1], p1[1]]
      : c1 >= L ? [p1[0], p2[0], p2[1], p1[1]]
      : [p1[0], [L, 0], p2[0], p2[1], [0, L], p1[1]];
    return [figPlane({ xr: [0, L], yr: [0, L], title: R`A kedvező sáv: $${tn(c1)}\lt x+y\lt ${tn(c2)}$`, polys: [{ pts: poly, cls: "fav" }], xTicks: [0, L], yTicks: [0, L] })];
  },
};

PROBLEMS.forEach((p) => {
  const fig = PROBLEM_FIGS[p.id];
  if (!fig) return;
  const orig = p.build;
  p.build = (params) => {
    const b = orig(params);
    try { b.figs = fig(params, b); } catch (e) { b.figs = []; }
    return b;
  };
});
