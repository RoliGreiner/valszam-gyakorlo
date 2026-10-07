/* Számolós feladatok. Mindegyiknek van egy "fixed" paraméterkészlete (a gyakorlat eredeti
   számaival) és egy random() generátora. A build(p) visszaadja a szöveget, a részkérdéseket
   (helyes számértékkel) és a kidolgozott megoldást. */
"use strict";

const PROBLEMS = [
  /* ═════════════ KOMBINATORIKA ═════════════ */
  {
    id: "kerek", topic: "kombi", title: "Kerek asztal", src: "Gy1/5",
    fixed: { n: 12 },
    random: () => ({ n: rnd.int(5, 12) }),
    build: ({ n }) => ({
      text: R`Egy $${n}$ tagú társaság kerek asztalnál foglal helyet. Hányféle sorrendben ülhetnek le, ha a helyek nem számozottak (csak az számít, ki kinek a szomszédja)?`,
      parts: [{ label: "Ültetések száma", ans: fact(n - 1) }],
      sol: R`Körpermutáció: egy embert rögzítünk (a forgatás nem ad új ültetést), a többi $${n - 1}$ ember sorrendje számít: $$(n-1)! = ${n - 1}! = ${tn(fact(n - 1))}$$`,
    }),
  },
  {
    id: "lepes", topic: "kombi", title: "Lépések a számegyenesen", src: "Gy1/6",
    fixed: { N: 15, d: 3 },
    random: () => {
      const N = rnd.int(8, 20);
      const d = rnd.pick(range(1, N - 2).filter((x) => (N + x) % 2 === 0));
      return { N, d };
    },
    build: ({ N, d }) => {
      const f = (N + d) / 2, b = (N - d) / 2;
      return {
        text: R`Egy pont egységnyi lépéseket tesz a számegyenesen, pozitív vagy negatív irányban. Hányféleképpen juthat el az origóból $${N}$ lépésben a $+${d}$ pontba?`,
        parts: [{ label: "Utak száma", ans: binom(N, b) }],
        sol: R`Legyen $e$ az előre, $h$ a hátra lépések száma: $e+h=${N}$, $e-h=${d}$, így $e=${f}$, $h=${b}$. Azt kell kiválasztani, melyik $${b}$ lépés megy hátra: $$\binom{${N}}{${b}} = ${tn(binom(N, b))}$$`,
      };
    },
  },
  {
    id: "levelek", topic: "kombi", title: "Levelek és szórólapok ládákba", src: "Gy1/7–8",
    fixed: { k: 5, m: 16 },
    random: () => ({ k: rnd.int(3, 6), m: rnd.int(8, 20) }),
    build: ({ k, m }) => ({
      text: R`Hányféleképpen helyezhetünk el $${k}$ tárgyat $${m}$ levelesládába, ha
      <br>(a) a tárgyak <b>különböző</b> levelek, és egy ládába legfeljebb egy kerül;
      <br>(b) a tárgyak <b>különböző</b> levelek, és egy ládába több is kerülhet;
      <br>(c) a tárgyak <b>egyforma</b> szórólapok, és egy ládába legfeljebb egy kerül;
      <br>(d) a tárgyak <b>egyforma</b> szórólapok, és egy ládába több is kerülhet?`,
      parts: [
        { label: "(a)", ans: variation(m, k) },
        { label: "(b)", ans: m ** k },
        { label: "(c)", ans: binom(m, k) },
        { label: "(d)", ans: binom(m + k - 1, k) },
      ],
      sol: R`Különböző tárgyak → minden tárgy „választ” egy ládát (variáció); egyforma tárgyak → csak az számít, melyik ládába kerül (kombináció).
      <br>(a) ismétlés nélküli variáció: $${m}\cdot${m - 1}\cdots${m - k + 1} = ${tn(variation(m, k))}$
      <br>(b) ismétléses variáció: $${m}^{${k}} = ${tn(m ** k)}$
      <br>(c) ismétlés nélküli kombináció: $\binom{${m}}{${k}} = ${tn(binom(m, k))}$
      <br>(d) ismétléses kombináció: $\binom{${m}+${k}-1}{${k}} = \binom{${m + k - 1}}{${k}} = ${tn(binom(m + k - 1, k))}$`,
    }),
  },
  {
    id: "dijak", topic: "kombi", title: "Díjak kisorsolása", src: "Gy1/10",
    fixed: { n: 78, k: 3 },
    random: () => ({ n: rnd.int(20, 90), k: rnd.int(2, 4) }),
    build: ({ n, k }) => ({
      text: R`Egy rejtvénypályázaton $${k}$ díjat sorsolnak ki a $${n}$ helyes megfejtő között. Hányféle eredményt hozhat a sorsolás, ha
      <br>(a) a díjak különbözők, és mindenki legfeljebb egyet kaphat;
      <br>(b) a díjak különbözők, és valaki több díjat is kaphat;
      <br>(c) a díjak egyformák, és mindenki legfeljebb egyet kaphat;
      <br>(d) a díjak egyformák, és valaki több díjat is kaphat?`,
      parts: [
        { label: "(a)", ans: variation(n, k) },
        { label: "(b)", ans: n ** k },
        { label: "(c)", ans: binom(n, k) },
        { label: "(d)", ans: binom(n + k - 1, k) },
      ],
      sol: R`(a) $V_{${n}}^{${k}} = ${tn(variation(n, k))}$ &nbsp; (b) $${n}^{${k}} = ${tn(n ** k)}$ &nbsp; (c) $\binom{${n}}{${k}} = ${tn(binom(n, k))}$ &nbsp; (d) $\binom{${n + k - 1}}{${k}} = ${tn(binom(n + k - 1, k))}$`,
    }),
  },
  {
    id: "szo", topic: "kombi", title: "Betűk összekeverése (ismétléses permutáció)", src: "Gy1/13",
    fixed: { w: "MATEMATIKA" },
    random: () => ({ w: rnd.pick(["MATEMATIKA", "KOMBINATORIKA", "MISSISSIPPI", "ABRAKADABRA", "BANÁN", "PAPAGÁJ", "STATISZTIKA", "KAKAÓ", "TATÁR", "ANANÁSZ"]) }),
    build: ({ w }) => {
      const letters = [...w];
      const cnt = {};
      letters.forEach((c) => (cnt[c] = (cnt[c] || 0) + 1));
      const rep = Object.entries(cnt).filter(([, v]) => v > 1);
      const n = letters.length;
      const total = fact(n) / rep.reduce((a, [, v]) => a * fact(v), 1);
      return {
        text: R`A <b>${w}</b> szó betűit összekeverjük, és véletlenszerűen egymás mellé rakjuk. Hány különböző betűsor jöhet létre, és mi a valószínűsége, hogy visszakapjuk az eredeti szót? (Minden betű külön betűnek számít, pl. az SZ két betű.)`,
        parts: [
          { label: "Különböző sorrendek", ans: total },
          { label: "P(az eredeti szó)", ans: 1 / total },
        ],
        sol: R`$${n}$ betű, ismétlődők: ${rep.map(([c, v]) => `${c}: ${v}`).join(", ") || "nincs"}. Ismétléses permutáció: $$\frac{${n}!}{${rep.map(([, v]) => v + "!").join("\\,") || "1"}} = ${tn(total)}$$ Ezek közül egy kedvező, így $P = \frac{1}{${tn(total)}} ${approx(1 / total)}$.`,
      };
    },
  },

  /* ═════════════ KLASSZIKUS VALÓSZÍNŰSÉG ═════════════ */
  {
    id: "kockaosszeg", topic: "klassz", title: "Három kockadobás összege", src: "Gy1/15",
    fixed: { s: 17 },
    random: () => ({ s: rnd.int(4, 17) }),
    build: ({ s }) => {
      const list = [];
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) if (a + b + c === s) list.push([a, b, c]);
      const multisets = {};
      list.forEach((t) => { const k = t.slice().sort().join("+"); multisets[k] = (multisets[k] || 0) + 1; });
      const desc = Object.entries(multisets).map(([k, v]) => R`$${k}$ (${v} sorrend)`).join(", ");
      return {
        text: R`Egy szabályos dobókockával egymás után háromszor dobunk. Mi a valószínűsége, hogy a dobott számok összege $${s}$?`,
        parts: [{ label: "P(összeg = " + s + ")", ans: list.length / 216 }],
        sol: R`Összes eset (sorrend számít): $6^3=216$. A kedvező felbontások: ${desc}. Összesen $${list.length}$ kedvező eset: $$P = \frac{${list.length}}{216} ${approx(list.length / 216)}$$`,
      };
    },
  },
  {
    id: "egymasmellett", topic: "klassz", title: "Két ember egymás mellett", src: "Gy1/14",
    fixed: { n: 10 },
    random: () => ({ n: rnd.int(5, 14) }),
    build: ({ n }) => ({
      text: R`$${n}$ ember véletlenszerűen ül le egy asztalhoz. Mi a valószínűsége, hogy A és B egymás mellé kerül, ha (a) az asztal kerek; (b) egyenes sorban ülnek (csak az asztal egyik oldalán)?`,
      parts: [
        { label: "(a) kerek asztal", ans: 2 / (n - 1) },
        { label: "(b) egyenes sor", ans: 2 / n },
      ],
      sol: R`(a) A leül valahova; B a maradék $${n - 1}$ helyből bármelyikre egyforma eséllyel kerül, ebből 2 szomszédos: $P=\frac{2}{${n - 1}} ${approx(2 / (n - 1))}$.
      <br>(b) A és B helypárja: $${n}\cdot${n - 1}$ rendezett lehetőség; szomszédos helypár $${n - 1}$ van, mindegyik 2 sorrendben: $P=\frac{2\cdot${n - 1}}{${n}\cdot${n - 1}}=\frac{2}{${n}} ${approx(2 / n)}$.`,
    }),
  },
  {
    id: "urna", topic: "klassz", title: "Visszatevéses és visszatevés nélküli húzás", src: "Gy1/16",
    fixed: { r: 10, g: 10, n: 5, k: 3 },
    random: () => {
      const r = rnd.int(4, 15), g = rnd.int(4, 15), n = rnd.int(3, 6);
      const k = rnd.int(Math.max(1, n - g), Math.min(n - 1, r));
      return { r, g, n, k };
    },
    build: ({ r, g, n, k }) => {
      const N = r + g, p = r / N;
      const a = binPmf(n, p, k), b = hypPmf(N, r, n, k);
      return {
        text: R`Egy urnában $${r}$ piros és $${g}$ zöld golyó van. $${n}$-ször húzunk. Mi a valószínűsége, hogy pontosan $${k}$ pirosat húzunk, ha (a) visszatevéssel; (b) visszatevés nélkül húzunk?`,
        parts: [
          { label: "(a) visszatevéssel", ans: a },
          { label: "(b) visszatevés nélkül", ans: b },
        ],
        sol: R`(a) Binomiális, $p=\frac{${r}}{${N}}$: $$\binom{${n}}{${k}}\left(\frac{${r}}{${N}}\right)^{${k}}\left(\frac{${g}}{${N}}\right)^{${n - k}} ${approx(a)}$$
        (b) Hipergeometriai: $$\frac{\binom{${r}}{${k}}\binom{${g}}{${n - k}}}{\binom{${N}}{${n}}} = \frac{${binom(r, k)}\cdot${binom(g, n - k)}}{${tn(binom(N, n))}} ${approx(b)}$$`,
      };
    },
  },
  {
    id: "lotto", topic: "klassz", title: "Lottó", src: "Gy1/17",
    fixed: { N: 90, m: 5, k: 3 },
    random: () => {
      const [N, m] = rnd.pick([[90, 5], [45, 6], [35, 7]]);
      return { N, m, k: rnd.int(2, m) };
    },
    build: ({ N, m, k }) => {
      const pr = (binom(m, k) * binom(N - m, m - k)) / binom(N, m);
      return {
        text: R`A lottón $${N}$ számból $${m}$ számot húznak ki, és mi is $${m}$ számot jelölünk meg. Mi a valószínűsége, hogy pontosan $${k}$ találatunk lesz?`,
        parts: [{ label: `P(${k} találat)`, ans: pr }],
        sol: R`A kihúzott $${m}$ számból $${k}$ a miénk, a többi $${m - k}$ a maradék $${N - m}$ közül: $$\frac{\binom{${m}}{${k}}\binom{${N - m}}{${m - k}}}{\binom{${N}}{${m}}} = \frac{${tn(binom(m, k) * binom(N - m, m - k))}}{${tn(binom(N, m))}} ${approx(pr)}$$`,
      };
    },
  },
  {
    id: "kocka6", topic: "klassz", title: "Többszöri kockadobás", src: "Gy2/5",
    fixed: { k: 6 },
    random: () => ({ k: rnd.int(3, 6) }),
    build: ({ k }) => {
      const a = variation(6, k) / 6 ** k, b = (1 / 6) * (5 / 6) ** (k - 1), c = binPmf(k, 1 / 6, 2);
      return {
        text: R`Egy szabályos kockát $${k}$-szor feldobunk. Mi a valószínűsége, hogy (a) ${k === 6 ? "az 1, 2, …, 6 számok mindegyike szerepel" : "minden dobás különböző"}; (b) az első dobás 6-os, a többi ettől különböző; (c) pontosan két dobás 6-os?`,
        parts: [
          { label: "(a)", ans: a },
          { label: "(b)", ans: b },
          { label: "(c)", ans: c },
        ],
        sol: R`Összes eset: $6^{${k}}$.
        <br>(a) Ismétlés nélküli variáció: $\frac{${variation(6, k)}}{6^{${k}}} ${approx(a)}$
        <br>(b) $\frac16\cdot\left(\frac56\right)^{${k - 1}} ${approx(b)}$
        <br>(c) Melyik két dobás: $\binom{${k}}{2}$; így $\binom{${k}}{2}\left(\frac16\right)^2\left(\frac56\right)^{${k - 2}} ${approx(c)}$`,
      };
    },
  },
  {
    id: "talalkozo", topic: "klassz", title: "Geometriai valószínűség: találkozó", src: "Gy4/16",
    fixed: { T: 60, w: 15 },
    random: () => ({ T: 60, w: rnd.pick([5, 10, 12, 15, 20, 25, 30, 40]) }),
    build: ({ T, w }) => {
      const q = 1 - w / T, ans = 1 - q * q;
      return {
        text: R`Anna és Béla megbeszélik, hogy 14:00 és 15:00 között találkoznak. Mindketten az egy órán belül egymástól függetlenül, egyenletesen véletlen időpontban érkeznek. Aki előbb ér oda, legfeljebb $${w}$ percet vár. Mi a valószínűsége, hogy találkoznak?`,
        parts: [{ label: "P(találkoznak)", ans }],
        sol: R`Legyen $x,y\in[0,${T}]$ (perc) a két érkezés. Találkoznak, ha $|x-y|\le ${w}$. A négyzet területe $${T}^2$; a kedvezőtlen rész két derékszögű háromszög, befogóik $${T - w}$, együttes területük $${T - w}^2$: $$P = 1-\left(\frac{${T - w}}{${T}}\right)^2 ${approx(ans)}$$`,
      };
    },
  },

  /* ═════════════ FELTÉTELES VALÓSZÍNŰSÉG ═════════════ */
  {
    id: "alap", topic: "felt", title: "Műveletek valószínűségekkel", src: "Gy2/1",
    fixed: { a: 0.4, b: 0.8, ab: 0.3 },
    random: () => {
      const a = rnd.step(0.2, 0.8, 0.05), b = rnd.step(0.2, 0.8, 0.05);
      const lo = Math.max(0.05, +(a + b - 1).toFixed(2)), hi = Math.min(a, b) - 0.05;
      return { a, b, ab: rnd.step(lo, Math.max(lo, hi), 0.05) };
    },
    build: ({ a, b, ab }) => ({
      text: R`Legyen $P(A)=${tn(a)}$, $P(B)=${tn(b)}$, és együttes bekövetkezésük valószínűsége $P(AB)=${tn(ab)}$. Határozza meg a következőket!`,
      parts: [
        { label: "P(A + B)", ans: a + b - ab },
        { label: "P(A − B)", ans: a - ab },
        { label: "P(Ā)", ans: 1 - a },
        { label: "P(B − Ā)", ans: ab },
        { label: "P(Ā + B̄)", ans: 1 - ab },
        { label: "P(A | B)", ans: ab / b },
      ],
      sol: R`$P(A+B)=P(A)+P(B)-P(AB)=${tn(a + b - ab)}$
      <br>$P(A-B)=P(A)-P(AB)=${tn(a - ab)}$
      <br>$P(\overline A)=1-P(A)=${tn(1 - a)}$
      <br>$P(B-\overline A)=P(B\cdot A)=${tn(ab)}$
      <br>$P(\overline A+\overline B)=P(\overline{AB})=1-P(AB)=${tn(1 - ab)}$ (De Morgan)
      <br>$P(A\mid B)=\frac{P(AB)}{P(B)}=\frac{${tn(ab)}}{${tn(b)}} ${approx(ab / b)}$`,
    }),
  },
  {
    id: "feltab", topic: "felt", title: "Feltételes valószínűségekből vissza", src: "Gy2/4",
    fixed: { a: 2 / 3, agb: 2 / 3, bga: 1 / 3, la: "\\frac23", lagb: "\\frac23", lbga: "\\frac13" },
    random: () => {
      for (;;) {
        const a = rnd.int(2, 8) / 10, bga = rnd.int(1, 9) / 10, agb = rnd.int(1, 9) / 10;
        const ab = a * bga, b = ab / agb;
        if (b <= 0.95 && b >= ab && a + b - ab <= 1) return { a, agb, bga, la: tn(a), lagb: tn(agb), lbga: tn(bga) };
      }
    },
    build: ({ a, agb, bga, la, lagb, lbga }) => {
      const ab = a * bga, b = ab / agb, u = a + b - ab;
      return {
        text: R`Legyen $P(A)=${la}$, $P(A\mid B)=${lagb}$ és $P(B\mid A)=${lbga}$. Határozza meg a $P(AB)$, $P(B)$, $P(A+B)$ és $P(\overline A\,\overline B)$ valószínűségeket!`,
        parts: [
          { label: "P(AB)", ans: ab },
          { label: "P(B)", ans: b },
          { label: "P(A + B)", ans: u },
          { label: "P(Ā·B̄)", ans: 1 - u },
        ],
        sol: R`Szorzási szabály: $P(AB)=P(B\mid A)P(A) ${approx(ab)}$.
        <br>$P(B)=\frac{P(AB)}{P(A\mid B)} ${approx(b)}$.
        <br>$P(A+B)=P(A)+P(B)-P(AB) ${approx(u)}$.
        <br>$P(\overline A\,\overline B)=1-P(A+B) ${approx(1 - u)}$ (De Morgan).
        ${Math.abs(ab - a * b) < 1e-9 ? "<br>Megjegyzés: itt $P(AB)=P(A)P(B)$, tehát A és B függetlenek." : ""}`,
      };
    },
  },
  {
    id: "kontingencia", topic: "felt", title: "Kontingenciatábla", src: "Gy2/8",
    fixed: { t: [[130, 24], [8, 4], [22, 9]] },
    random: () => ({ t: [[rnd.int(60, 150), rnd.int(20, 90)], [rnd.int(5, 30), rnd.int(5, 30)], [rnd.int(10, 40), rnd.int(5, 30)]] }),
    build: ({ t }) => {
      const rows = ["hallgató", "munkatárs", "külsős"];
      const tot = sum(t.flat()), men = sum(t.map((r) => r[0])), women = sum(t.map((r) => r[1]));
      const tbl = `<table class="mini"><tr><th></th><th>férfi</th><th>nő</th></tr>${t.map((r, i) => `<tr><th>${rows[i]}</th><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</table>`;
      return {
        text: R`Egy erdei futáson a következő indulók voltak: ${tbl} Véletlenszerűen választunk egy indulót. (a) Mi a valószínűsége, hogy hallgató? (b) Feltéve, hogy külsőst választunk, mi a valószínűsége, hogy nő? (c) Ha férfit választunk, mi a valószínűsége, hogy hallgató? (d) Ha nőt választunk, mi a valószínűsége, hogy nem munkatárs?`,
        parts: [
          { label: "(a)", ans: (t[0][0] + t[0][1]) / tot },
          { label: "(b)", ans: t[2][1] / (t[2][0] + t[2][1]) },
          { label: "(c)", ans: t[0][0] / men },
          { label: "(d)", ans: (women - t[1][1]) / women },
        ],
        sol: R`Összesen $${tot}$ induló; férfi $${men}$, nő $${women}$. A feltételes valószínűségnél a feltétel sor- vagy oszlopösszege a nevező.
        <br>(a) $\frac{${t[0][0] + t[0][1]}}{${tot}} ${approx((t[0][0] + t[0][1]) / tot)}$
        <br>(b) $\frac{${t[2][1]}}{${t[2][0] + t[2][1]}} ${approx(t[2][1] / (t[2][0] + t[2][1]))}$
        <br>(c) $\frac{${t[0][0]}}{${men}} ${approx(t[0][0] / men)}$
        <br>(d) $\frac{${women} - ${t[1][1]}}{${women}} ${approx((women - t[1][1]) / women)}$`,
      };
    },
  },

  /* ═════════════ TELJES VALÓSZÍNŰSÉG, BAYES ═════════════ */
  {
    id: "teljes3", topic: "bayes", title: "Három forrás: teljes valószínűség + Bayes", src: "Gy2/16–17",
    fixed: { ctx: 0, pr: [50, 30, 20], q: [2, 3, 5], j: 2 },
    random: () => {
      const ctx = rnd.int(0, 1);
      const pr = rnd.partition(100, 3, 5, 10);
      const q = ctx === 0 ? [rnd.int(1, 8), rnd.int(1, 8), rnd.int(1, 8)] : [rnd.step(50, 95, 5), rnd.step(40, 90, 5), rnd.step(30, 85, 5)];
      return { ctx, pr, q, j: rnd.int(0, 2) };
    },
    build: ({ ctx, pr, q, j }) => {
      const P = pr.map((x) => x / 100), Q = q.map((x) => x / 100);
      const tot = sum(P.map((x, i) => x * Q[i]));
      const names = ["A", "B", "C"];
      const C = ctx === 0
        ? { intro: "Egy üzemben a termékeket három gép gyártja: A, B és C.", share: "készül", rate: "selejtarány", ev: "selejtes", S: "S",
            q1: "a véletlenszerűen kiválasztott termék selejtes", q2: `ha a kiválasztott termék selejtes, akkor azt a(z) ${names[j]} gép gyártotta` }
        : { intro: "Egy kurzus hallgatói három csoportba járnak: A, B és C.", share: "jár", rate: "sikeres vizsga valószínűsége", ev: "sikeres", S: "V",
            q1: "egy véletlenszerűen választott hallgató sikeresen vizsgázik", q2: `ha a hallgató sikeresen vizsgázott, akkor a(z) ${names[j]} csoportba jár` };
      return {
        text: R`${C.intro} ${ctx === 0 ? "A termékek" : "A hallgatók"} ${pr.map((x, i) => `${x}%-a a(z) ${names[i]}`).join(", ")} ${ctx === 0 ? "gépen" : "csoportba"} ${C.share}. A ${C.rate} rendre ${q.map((x) => x + "%").join(", ")}. Mi a valószínűsége, hogy (a) ${C.q1}; (b) ${C.q2}?`,
        parts: [
          { label: "(a)", ans: tot },
          { label: "(b)", ans: (P[j] * Q[j]) / tot },
        ],
        sol: R`Teljes eseményrendszer: $B_A, B_B, B_C$ (honnan származik). Megfigyelt esemény: $${C.S}$.
        <br>(a) Teljes valószínűség: $$P(${C.S}) = ${P.map((x, i) => `${tn(x)}\\cdot${tn(Q[i])}`).join(" + ")} ${approx(tot)}$$
        (b) Bayes: $$P(B_${names[j]}\mid ${C.S}) = \frac{${tn(P[j])}\cdot${tn(Q[j])}}{${tn(tot)}} ${approx((P[j] * Q[j]) / tot)}$$`,
      };
    },
  },
  {
    id: "bayes2", topic: "bayes", title: "Két hipotézis: Bayes-tétel", src: "Gy3/5, Gy2/18",
    fixed: { ctx: 0, pi: 0.8, a: 0.1, b: 0.01 },
    random: () => {
      const ctx = rnd.int(0, 2);
      if (ctx === 0) return { ctx, pi: rnd.step(0.3, 0.9, 0.05), a: rnd.step(0.05, 0.3, 0.01), b: rnd.step(0.005, 0.05, 0.005) };
      if (ctx === 1) return { ctx, pi: rnd.step(0.2, 0.7, 0.05), a: rnd.step(0.8, 0.99, 0.01), b: rnd.step(0.01, 0.15, 0.01) };
      return { ctx, pi: rnd.pick([0.001, 0.005, 0.01, 0.02, 0.05]), a: rnd.step(0.85, 0.99, 0.01), b: rnd.step(0.01, 0.1, 0.01) };
    },
    build: ({ ctx, pi, a, b }) => {
      const tot = pi * a + (1 - pi) * b, post = (pi * a) / tot;
      const texts = [
        R`Tegyük fel, hogy az e-mailek $${tn(pi * 100)}\%$-a spam. A spamek $${tn(a * 100)}\%$-ában szerepel az „ingyen” szó, a rendes e-mailek csupán $${tn(b * 100)}\%$-ában. (a) Mi a valószínűsége, hogy egy e-mailben szerepel az „ingyen” szó? (b) Egy most érkezett e-mailben szerepel. Mi a valószínűsége, hogy spam?`,
        R`Egy csatornán a jelek $${tn(pi * 100)}\%$-a 1-es bit, a többi 0-s. Az elküldött 1-es $${tn(a * 100)}\%$ eséllyel érkezik 1-esként, az elküldött 0-s $${tn(b * 100)}\%$ eséllyel érkezik (tévesen) 1-esként. (a) Mi a valószínűsége, hogy a vevő 1-est regisztrál? (b) Ha a vevő 1-est regisztrált, mi a valószínűsége, hogy valóban 1-est küldtek?`,
        R`Egy betegség a népesség $${tn(pi * 100)}\%$-át érinti. A teszt a betegeknél $${tn(a * 100)}\%$ eséllyel pozitív, egészségeseknél $${tn(b * 100)}\%$ eséllyel ad téves pozitív eredményt. (a) Mi a valószínűsége, hogy egy véletlen ember tesztje pozitív? (b) Ha a teszt pozitív, mi a valószínűsége, hogy az illető beteg?`,
      ];
      const [H, E] = [["S", "I"], ["K_1", "V_1"], ["B", "+"]][ctx];
      return {
        text: texts[ctx],
        parts: [
          { label: "(a)", ans: tot },
          { label: "(b)", ans: post },
        ],
        sol: R`$P(${H})=${tn(pi)}$, $P(${E}\mid ${H})=${tn(a)}$, $P(${E}\mid\overline{${H}})=${tn(b)}$.
        <br>(a) Teljes valószínűség: $P(${E}) = ${tn(pi)}\cdot${tn(a)} + ${tn(1 - pi)}\cdot${tn(b)} ${approx(tot)}$
        <br>(b) Bayes: $P(${H}\mid ${E}) = \frac{${tn(pi)}\cdot${tn(a)}}{${tn(tot)}} ${approx(post)}$`,
      };
    },
  },
  {
    id: "gepall", topic: "bayes", title: "Mikor áll a gép?", src: "Gy2/15",
    fixed: { t: [1 / 3, 1 / 6, 1 / 2], lt: ["\\frac13", "\\frac16", "\\frac12"], s: [0.1, 0, 0.25] },
    random: () => {
      const opts = [[[1 / 3, 1 / 6, 1 / 2], ["\\frac13", "\\frac16", "\\frac12"]], [[1 / 2, 1 / 4, 1 / 4], ["\\frac12", "\\frac14", "\\frac14"]], [[1 / 5, 2 / 5, 2 / 5], ["\\frac15", "\\frac25", "\\frac25"]], [[1 / 4, 1 / 4, 1 / 2], ["\\frac14", "\\frac14", "\\frac12"]]];
      const [t, lt] = rnd.pick(opts);
      return { t, lt, s: [rnd.step(0, 0.3, 0.05), rnd.step(0, 0.3, 0.05), rnd.step(0.05, 0.4, 0.05)] };
    },
    build: ({ t, lt, s }) => {
      const stop = sum(t.map((x, i) => x * s[i])), work = 1 - stop, pa = (t[0] * (1 - s[0])) / work;
      return {
        text: R`Egy gép munkaidejének $${lt[0]}$ részében A, $${lt[1]}$ részében B, a maradékban ($${lt[2]}$) C alkatrészen dolgozik. Az A alkatrész idejének $${tn(s[0] * 100)}\%$-ában, a B-nek $${tn(s[1] * 100)}\%$-ában, a C-nek $${tn(s[2] * 100)}\%$-ában áll a gép. (a) Mi a valószínűsége, hogy egy véletlen időpontban áll a gép? (b) Feltéve, hogy a gép dolgozik, mi a valószínűsége, hogy éppen A alkatrészen?`,
        parts: [
          { label: "(a) P(áll)", ans: stop },
          { label: "(b) P(A | dolgozik)", ans: pa },
        ],
        sol: R`(a) $P(\text{áll}) = ${lt[0]}\cdot${tn(s[0])} + ${lt[1]}\cdot${tn(s[1])} + ${lt[2]}\cdot${tn(s[2])} ${approx(stop)}$
        <br>(b) $P(A\mid\text{dolgozik}) = \frac{${lt[0]}\cdot${tn(1 - s[0])}}{1-${tn(stop)}} ${approx(pa)}$`,
      };
    },
  },

  /* ═════════════ VALÓSZÍNŰSÉGI VÁLTOZÓ ═════════════ */
  {
    id: "tabla", topic: "valvalt", title: "Eloszlás táblázatból: F, E, D", src: "Gy3/3",
    fixed: { x0: -2, p: [0.1, 0.2, 0.15, 0.3, 0.15, 0.1], c: 1 },
    random: () => {
      const x0 = rnd.int(-3, 1);
      const p = rnd.partition(100, 6, 5, 5).map((v) => v / 100);
      return { x0, p, c: x0 + rnd.int(1, 5) };
    },
    build: ({ x0, p, c }) => {
      const xs = p.map((_, i) => x0 + i);
      const E = sum(xs.map((x, i) => x * p[i])), E2 = sum(xs.map((x, i) => x * x * p[i])), V = E2 - E * E;
      const F = sum(xs.map((x, i) => (x < c ? p[i] : 0)));
      const tbl = `<table class="mini"><tr><th>$x_i$</th>${xs.map((x) => `<td>${x}</td>`).join("")}</tr><tr><th>$p_i$</th>${p.map((v) => `<td>${fmt(v)}</td>`).join("")}</tr></table>`;
      return {
        text: R`Egy diszkrét $X$ valószínűségi változó eloszlása: ${tbl} Számítsa ki $F(${c}) = P(X\lt ${c})$, $E(X)$, $E(X^2)$, $D^2(X)$ és $D(X)$ értékét!`,
        parts: [
          { label: `F(${c})`, ans: F },
          { label: "E(X)", ans: E },
          { label: "E(X²)", ans: E2 },
          { label: "D²(X)", ans: V },
          { label: "D(X)", ans: Math.sqrt(V) },
        ],
        sol: R`Ellenőrzés: $\sum p_i = 1$ ✓.
        <br>$F(${c}) = P(X\lt ${c})$: csak a $${c}$-nél <b>szigorúan kisebb</b> értékek: $${tn(F)}$.
        <br>$E(X) = \sum x_ip_i = ${xs.map((x, i) => `(${x})\\cdot${tn(p[i])}`).join(" + ")} ${approx(E)}$
        <br>$E(X^2) = \sum x_i^2p_i = ${xs.map((x, i) => `${x * x}\\cdot${tn(p[i])}`).join(" + ")} ${approx(E2)}$
        <br>$D^2(X) = E(X^2)-E^2(X) = ${tn(E2)} - ${tn(E)}^2 ${approx(V)}$, &nbsp; $D(X) ${approx(Math.sqrt(V))}$`,
      };
    },
  },
  {
    id: "amig", topic: "valvalt", title: "Húzás, amíg pirosat nem kapunk (transzformáció)", src: "Gy3/6, Gy4/8",
    fixed: { a: 2, b: 2 },
    random: () => ({ a: rnd.int(1, 3), b: rnd.int(2, 4) }),
    build: ({ a, b }) => {
      const N = a + b, ps = [];
      for (let k = 1; k <= b + 1; k++) {
        let pr = 1;
        for (let i = 0; i < k - 1; i++) pr *= (b - i) / (N - i);
        pr *= a / (N - k + 1);
        ps.push(pr);
      }
      const ks = ps.map((_, i) => i + 1);
      const E = sum(ks.map((k, i) => k * ps[i])), E2 = sum(ks.map((k, i) => k * k * ps[i])), E4 = sum(ks.map((k, i) => k ** 4 * ps[i]));
      const V = E2 - E * E;
      return {
        text: R`Egy dobozban $${a}$ piros és $${b}$ fehér golyó van. Visszatevés nélkül húzunk, amíg pirosat nem húzunk. Legyen $\xi$ a húzások száma. Számítsa ki $E(\xi)$, $D^2(\xi)$ értékét, valamint $\eta=\xi^2$ és $\beta=2\xi$ várható értékét és szórásnégyzetét!`,
        parts: [
          { label: "E(ξ)", ans: E },
          { label: "D²(ξ)", ans: V },
          { label: "E(η) = E(ξ²)", ans: E2 },
          { label: "D²(η)", ans: E4 - E2 * E2 },
          { label: "E(β)", ans: 2 * E },
          { label: "D²(β)", ans: 4 * V },
        ],
        sol: R`Eloszlás: ${ks.map((k, i) => `$P(\\xi=${k}) ${approx(ps[i])}$`).join(", ")}. (Pl. $P(\xi=2)=\frac{${b}}{${N}}\cdot\frac{${a}}{${N - 1}}$.)
        <br>$E(\xi)=\sum k\,p_k ${approx(E)}$, &nbsp; $E(\xi^2)=\sum k^2p_k ${approx(E2)}$, &nbsp; $D^2(\xi)=E(\xi^2)-E^2(\xi) ${approx(V)}$
        <br>$\eta=\xi^2$: $E(\eta)=E(\xi^2) ${approx(E2)}$, &nbsp; $E(\eta^2)=E(\xi^4)=\sum k^4p_k ${approx(E4)}$, &nbsp; $D^2(\eta)=E(\xi^4)-E^2(\xi^2) ${approx(E4 - E2 * E2)}$
        <br>$\beta=2\xi$ (lineáris): $E(\beta)=2E(\xi) ${approx(2 * E)}$, &nbsp; $D^2(\beta)=4D^2(\xi) ${approx(4 * V)}$`,
      };
    },
  },
  {
    id: "busz", topic: "valvalt", title: "Buszok: diák vagy sofőr szemszögéből", src: "Gy3/11",
    fixed: { s: [40, 33, 25, 50] },
    random: () => ({ s: Array.from({ length: rnd.int(3, 5) }, () => rnd.int(15, 60)) }),
    build: ({ s }) => {
      const T = sum(s), k = s.length;
      const Ex = sum(s.map((x) => x * x)) / T, Ex2 = sum(s.map((x) => x ** 3)) / T;
      const Ee = T / k, Ee2 = sum(s.map((x) => x * x)) / k;
      return {
        text: R`Egy kiránduláson $${k}$ busz szállítja a diákokat, bennük rendre ${s.join(", ")} diák utazik. Véletlenszerűen kiválasztunk egy diákot; $\xi$ az ő buszában utazók száma. A sofőrök közül is választunk egyet; $\eta$ az ő buszán utazók száma. Számítsa ki $E(\xi)$, $E(\eta)$, $D(\xi)$ és $D(\eta)$ értékét!`,
        parts: [
          { label: "E(ξ)", ans: Ex },
          { label: "E(η)", ans: Ee },
          { label: "D(ξ)", ans: Math.sqrt(Ex2 - Ex * Ex) },
          { label: "D(η)", ans: Math.sqrt(Ee2 - Ee * Ee) },
        ],
        sol: R`Összesen $${T}$ diák. Diákot választva egy $n$ fős busz $\frac{n}{${T}}$ eséllyel jön ki, sofőrt választva $\frac1{${k}}$ eséllyel.
        <br>$E(\xi)=\sum n\cdot\frac{n}{${T}} = \frac{${s.map((x) => x + "^2").join("+")}}{${T}} ${approx(Ex)}$, &nbsp; $E(\xi^2)=\frac{\sum n^3}{${T}} ${approx(Ex2)}$, &nbsp; $D(\xi) ${approx(Math.sqrt(Ex2 - Ex * Ex))}$
        <br>$E(\eta)=\frac{${T}}{${k}} ${approx(Ee)}$, &nbsp; $E(\eta^2)=\frac{\sum n^2}{${k}} ${approx(Ee2)}$, &nbsp; $D(\eta) ${approx(Math.sqrt(Ee2 - Ee * Ee))}$
        <br>$E(\xi)\ge E(\eta)$, mert a nagyobb buszokból nagyobb eséllyel választunk diákot.`,
      };
    },
  },
  {
    id: "szabo", topic: "valvalt", title: "Vizsgák (geometriai eloszlás)", src: "Gy3/9",
    fixed: { p: 0.3, r: 3 },
    random: () => ({ p: rnd.step(0.2, 0.7, 0.05), r: rnd.int(2, 3) }),
    build: ({ p, r }) => {
      const q = 1 - p, n = 3 * r + 1;
      return {
        text: R`Szabó Béla minden vizsgán $${tn(p)}$ valószínűséggel sikeres, függetlenül a korábbiaktól. Egy tárgyfelvétel legfeljebb 3 vizsgát jelent. Mi a valószínűsége, hogy (a) egy tárgyfelvétellel teljesíti a tárgyat; (b) ${r} tárgyfelvétel és egy méltányossági vizsga után sem teljesíti?`,
        parts: [
          { label: "(a)", ans: 1 - q ** 3 },
          { label: "(b)", ans: q ** n },
        ],
        sol: R`A szükséges vizsgák száma geometriai eloszlású, $p=${tn(p)}$.
        <br>(a) $P(X\le 3) = 1-(1-p)^3 = 1-${tn(q)}^3 ${approx(1 - q ** 3)}$
        <br>(b) $${r}\cdot3+1=${n}$ vizsga, mind sikertelen: $${tn(q)}^{${n}} ${approx(q ** n)}$`,
      };
    },
  },
  {
    id: "blicc", topic: "valvalt", title: "Blicc úr és az ellenőr", src: "Gy3/10",
    fixed: { c: 0.2, h: 0.95, d: 5, k: 2 },
    random: () => ({ c: rnd.step(0.1, 0.4, 0.05), h: rnd.step(0.7, 0.95, 0.05), d: 5, k: rnd.int(1, 3) }),
    build: ({ c, h, d, k }) => {
      const q = c * h, ok = 1 - q;
      const pa = ok ** d, pb = binPmf(d, q, k), pc = ((c * (1 - h)) / ok) ** d;
      return {
        text: R`Blicc úr jegy nélkül villamosozik minden munkanap (${d} nap). Naponta $${tn(c)}$ valószínűséggel száll fel ellenőr, aki ekkor $${tn(h)}$ valószínűséggel elkapja. A napok függetlenek. (a) Mi a valószínűsége, hogy szerencsés hete van (egyszer sem kapják el)? (b) Mi a valószínűsége, hogy pontosan $${k}$-szor kapják el? (c) Feltéve, hogy szerencsés hete volt, mi a valószínűsége, hogy mind az ${d} nap volt ellenőr?`,
        parts: [
          { label: "(a)", ans: pa },
          { label: "(b)", ans: pb },
          { label: "(c)", ans: pc },
        ],
        sol: R`Egy napon elkapják: $${tn(c)}\cdot${tn(h)} = ${tn(q)}$; nem kapják el: $${tn(ok)}$.
        <br>(a) $${tn(ok)}^{${d}} ${approx(pa)}$
        <br>(b) $\text{Bin}(${d};\,${tn(q)})$: $\binom{${d}}{${k}}${tn(q)}^{${k}}\cdot${tn(ok)}^{${d - k}} ${approx(pb)}$
        <br>(c) Egy napon „volt ellenőr, de nem kapta el”: $${tn(c)}\cdot${tn(1 - h)} = ${tn(c * (1 - h))}$. Napi feltételes valószínűség: $\frac{${tn(c * (1 - h))}}{${tn(ok)}}$; a napok függetlensége miatt $\left(\frac{${tn(c * (1 - h))}}{${tn(ok)}}\right)^{${d}} ${approx(pc)}$`,
      };
    },
  },

  /* ═════════════ NEVEZETES ELOSZLÁSOK ═════════════ */
  {
    id: "binom", topic: "eloszl", title: "Binomiális eloszlás", src: "Gy4/1",
    fixed: { n: 15, p: 0.08, k: 2, m: 1 },
    random: () => {
      const n = rnd.int(6, 20), p = rnd.step(0.05, 0.5, 0.01);
      return { n, p, k: rnd.int(0, Math.min(n, Math.round(n * p) + 2)), m: rnd.int(1, 3) };
    },
    build: ({ n, p, k, m }) => {
      const pk = binPmf(n, p, k), pm = sum(range(0, m).map((i) => binPmf(n, p, i)));
      return {
        text: R`A gyártósorról kikerülő chipek $${tn(p * 100)}\%$-a hibás. Véletlenszerűen, egymástól függetlenül kiválasztunk $${n}$ chipet. (a) Mi a valószínűsége, hogy pontosan $${k}$ hibás lesz köztük? (b) Mi a valószínűsége, hogy legfeljebb $${m}$ hibás? (c) Mennyi a hibások számának várható értéke és szórása?`,
        parts: [
          { label: `(a) P(X = ${k})`, ans: pk },
          { label: `(b) P(X ≤ ${m})`, ans: pm },
          { label: "(c) E(X)", ans: n * p },
          { label: "(c) D(X)", ans: Math.sqrt(n * p * (1 - p)) },
        ],
        sol: R`$X\sim\text{Bin}(${n};\,${tn(p)})$.
        <br>(a) $\binom{${n}}{${k}}\cdot${tn(p)}^{${k}}\cdot${tn(1 - p)}^{${n - k}} ${approx(pk)}$
        <br>(b) $\sum_{i=0}^{${m}}\binom{${n}}{i}${tn(p)}^i\,${tn(1 - p)}^{${n}-i} = ${range(0, m).map((i) => tn(binPmf(n, p, i))).join(" + ")} ${approx(pm)}$
        <br>(c) $E=np ${approx(n * p)}$, &nbsp; $D=\sqrt{np(1-p)} ${approx(Math.sqrt(n * p * (1 - p)))}$`,
      };
    },
  },
  {
    id: "hipergeo", topic: "eloszl", title: "Hipergeometriai eloszlás", src: "Gy4/2, Gy4/7",
    fixed: { N: 20, K: 6, n: 5, k: 2 },
    random: () => {
      const N = rnd.int(15, 40), K = rnd.int(4, Math.floor(N / 2)), n = rnd.int(3, 8);
      return { N, K, n, k: rnd.int(Math.max(0, n - (N - K)), Math.min(n, K, 4)) };
    },
    build: ({ N, K, n, k }) => {
      const pk = hypPmf(N, K, n, k);
      return {
        text: R`$${N}$ hallgató pályázott, közülük $${K}$ végzett TDK-munkát. A bizottság visszatevés nélkül, véletlenszerűen kiválaszt $${n}$ pályázatot. (a) Mi a valószínűsége, hogy pontosan $${k}$ TDK-s lesz a kiválasztottak között? (b) Átlagosan hány TDK-s kerül be?`,
        parts: [
          { label: `(a) P(X = ${k})`, ans: pk },
          { label: "(b) E(X)", ans: (n * K) / N },
        ],
        sol: R`Hipergeometriai eloszlás ($N=${N}$, $K=${K}$, $n=${n}$).
        <br>(a) $\frac{\binom{${K}}{${k}}\binom{${N - K}}{${n - k}}}{\binom{${N}}{${n}}} = \frac{${binom(K, k)}\cdot${tn(binom(N - K, n - k))}}{${tn(binom(N, n))}} ${approx(pk)}$
        <br>(b) $E = n\frac{K}{N} = ${n}\cdot\frac{${K}}{${N}} ${approx((n * K) / N)}$`,
      };
    },
  },
  {
    id: "geo", topic: "eloszl", title: "Geometriai eloszlás", src: "Gy4/3",
    fixed: { p: 0.15, k: 4, m: 5 },
    random: () => ({ p: rnd.step(0.05, 0.4, 0.05), k: rnd.int(2, 8), m: rnd.int(3, 10) }),
    build: ({ p, k, m }) => ({
      text: R`Az IT ügyfélszolgálatra érkező bejelentések $${tn(p * 100)}\%$-a igényel helyszíni kiszállást, egymástól függetlenül. (a) Mi a valószínűsége, hogy pontosan a $${k}$. bejelentés lesz az első, amelyhez ki kell szállni? (b) Mi a valószínűsége, hogy legfeljebb $${m}$ bejelentésen belül szükség lesz kiszállásra? (c) Átlagosan hányadik bejelentés lesz az első ilyen?`,
      parts: [
        { label: `(a) P(X = ${k})`, ans: (1 - p) ** (k - 1) * p },
        { label: `(b) P(X ≤ ${m})`, ans: 1 - (1 - p) ** m },
        { label: "(c) E(X)", ans: 1 / p },
      ],
      sol: R`$X\sim\text{Geo}(${tn(p)})$.
      <br>(a) $(1-p)^{${k - 1}}p = ${tn(1 - p)}^{${k - 1}}\cdot${tn(p)} ${approx((1 - p) ** (k - 1) * p)}$
      <br>(b) $1-(1-p)^{${m}} = 1-${tn(1 - p)}^{${m}} ${approx(1 - (1 - p) ** m)}$
      <br>(c) $E=\frac1p ${approx(1 / p)}$`,
    }),
  },
  {
    id: "poisson", topic: "eloszl", title: "Poisson-eloszlás (átskálázással)", src: "Gy4/4, Gy4/15",
    fixed: { l: 4, k: 2, t: 30 },
    random: () => ({ l: rnd.pick([1, 2, 3, 4, 5, 6, 8, 1.5, 2.5]), k: rnd.int(0, 5), t: rnd.pick([10, 15, 20, 30, 90, 120]) }),
    build: ({ l, k, t }) => {
      const pk = poiPmf(l, k), lt = (l * t) / 60, p1 = 1 - Math.exp(-lt);
      return {
        text: R`A sürgősségi osztályra óránként átlagosan $${tn(l)}$ súlyos sérült érkezik (Poisson-eloszlás). (a) Mi a valószínűsége, hogy egy adott órában pontosan $${k}$ sérült érkezik? (b) Mi a valószínűsége, hogy egy $${t}$ perces időszakban legalább 1 sérült érkezik? (c) Mi a valószínűsége, hogy a $${t}$ perc alatt pontosan 1 érkezik?`,
        parts: [
          { label: `(a) P(X = ${k})`, ans: pk },
          { label: "(b) P(Y ≥ 1)", ans: p1 },
          { label: "(c) P(Y = 1)", ans: poiPmf(lt, 1) },
        ],
        sol: R`(a) $\lambda=${tn(l)}$: $\frac{${tn(l)}^{${k}}}{${k}!}e^{-${tn(l)}} ${approx(pk)}$
        <br>(b) Átskálázás: $${t}$ perc $=\frac{${t}}{60}$ óra, így $\lambda' = ${tn(l)}\cdot\frac{${t}}{60} = ${tn(lt)}$. $P(Y\ge1)=1-e^{-${tn(lt)}} ${approx(p1)}$
        <br>(c) $P(Y=1)=${tn(lt)}\,e^{-${tn(lt)}} ${approx(poiPmf(lt, 1))}$`,
      };
    },
  },
  {
    id: "poisinv", topic: "eloszl", title: "Poisson: λ visszafejtése P(X = 0)-ból", src: "Gy4/10–11",
    fixed: { q: 0.1, m: 3 },
    random: () => ({ q: rnd.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]), m: rnd.int(1, 4) }),
    build: ({ q, m }) => {
      const l = -Math.log(q), pm = sum(range(0, m).map((i) => poiPmf(l, i)));
      return {
        text: R`Annak a valószínűsége, hogy egy évben egyetlen repülőgép sem zuhan le, $${tn(q * 100)}\%$ (a lezuhanások száma Poisson-eloszlású). (a) Átlagosan hány gép zuhan le egy évben? (b) Mi a valószínűsége, hogy legfeljebb $${m}$ gép zuhan le? (c) Mi a legvalószínűbb érték (módusz)?`,
        parts: [
          { label: "(a) λ = E(X)", ans: l },
          { label: `(b) P(X ≤ ${m})`, ans: pm },
          { label: "(c) módusz", ans: Math.floor(l) },
        ],
        sol: R`(a) $P(X=0)=e^{-\lambda}=${tn(q)}$, így $\lambda=-\ln ${tn(q)} ${approx(l)}$.
        <br>(b) $e^{-\lambda}\sum_{i=0}^{${m}}\frac{\lambda^i}{i!} ${approx(pm)}$
        <br>(c) A módusz $\lfloor\lambda\rfloor = ${Math.floor(l)}$.`,
      };
    },
  },
  {
    id: "kulcs", topic: "eloszl", title: "Kulcsok próbálgatása", src: "Gy3/14, Gy4/5",
    fixed: { n: 100, m: 50 },
    random: () => {
      const n = rnd.pick([10, 20, 25, 50, 100]);
      return { n, m: rnd.int(2, n - 1) };
    },
    build: ({ n, m }) => ({
      text: R`$${n}$ kulcs közül csak 1 nyitja az ajtót. Mi a valószínűsége, hogy legfeljebb $${m}$ próbálkozással kinyitjuk, ha (a) a sötétben nem látjuk, melyiket próbáltuk már (visszatevéses); (b) a kipróbált kulcsot eldobjuk?`,
      parts: [
        { label: "(a)", ans: 1 - (1 - 1 / n) ** m },
        { label: "(b)", ans: m / n },
      ],
      sol: R`(a) Geometriai eloszlás, $p=\frac1{${n}}$: $P(X\le ${m}) = 1-\left(1-\frac1{${n}}\right)^{${m}} ${approx(1 - (1 - 1 / n) ** m)}$
      <br>(b) A jó kulcs egyforma eséllyel kerül az 1., 2., …, ${n}. helyre: $P=\frac{${m}}{${n}} ${approx(m / n)}$`,
    }),
  },
  {
    id: "pistike", topic: "eloszl", title: "Tippelés a vizsgán", src: "Gy3/15, Gy4/6",
    fixed: { n: 10, p: 0.6, pct: 80 },
    random: () => ({ n: rnd.pick([8, 10, 12, 15, 20]), p: rnd.step(0.4, 0.8, 0.05), pct: rnd.pick([50, 60, 70, 75, 80]) }),
    build: ({ n, p, pct }) => {
      const t = Math.ceil((n * pct) / 100 - 1e-9);
      const pr = sum(range(t, n).map((i) => binPmf(n, p, i)));
      return {
        text: R`Pistike $${n}$ eldöntendő kérdésre válaszol, mindegyikre egymástól függetlenül $${tn(p)}$ valószínűséggel jól. Legalább $${pct}\%$ kell a sikerhez. Mi a valószínűsége, hogy sikerül? Mennyi a jó válaszok várható értéke és szórása?`,
        parts: [
          { label: "P(sikerül)", ans: pr },
          { label: "E(X)", ans: n * p },
          { label: "D(X)", ans: Math.sqrt(n * p * (1 - p)) },
        ],
        sol: R`$X\sim\text{Bin}(${n};\,${tn(p)})$, legalább $${t}$ jó válasz kell.
        <br>$P(X\ge ${t}) = \sum_{i=${t}}^{${n}}\binom{${n}}{i}${tn(p)}^i\,${tn(1 - p)}^{${n}-i} ${approx(pr)}$
        <br>$E=np ${approx(n * p)}$, &nbsp; $D=\sqrt{np(1-p)} ${approx(Math.sqrt(n * p * (1 - p)))}$`,
      };
    },
  },
  {
    id: "vegyes", topic: "eloszl", title: "Vegyes: melyik eloszlás?", src: "Gy4/15",
    fixed: { l: 6, t: 20, p: 0.2, n: 10, k: 2, g: 4, N: 50, K: 10, m: 5 },
    random: () => ({ l: rnd.int(3, 9), t: rnd.pick([10, 15, 20, 30]), p: rnd.step(0.1, 0.35, 0.05), n: rnd.int(6, 12), k: rnd.int(1, 3), g: rnd.int(2, 6), N: rnd.int(30, 60), K: rnd.int(5, 15), m: rnd.int(4, 6) }),
    build: ({ l, t, p, n, k, g, N, K, m }) => {
      const lt = (l * t) / 60;
      const a = poiPmf(lt, 1), b = binPmf(n, p, k), c = (1 - p) ** (g - 1) * p, d = hypPmf(N, K, m, 2);
      return {
        text: R`Egy webáruházba óránként átlagosan $${l}$ reklamáció érkezik; egy reklamáció $${tn(p * 100)}\%$ eséllyel a csomagoló hibája.
        <br>(a) Mi a valószínűsége, hogy egy $${t}$ perces időszakban pontosan 1 reklamáció érkezik?
        <br>(b) $${n}$ reklamációt megvizsgálva mi a valószínűsége, hogy pontosan $${k}$ a csomagoló hibája?
        <br>(c) Egyenként nézve mi a valószínűsége, hogy pontosan a $${g}$. lesz az első, ami a csomagoló hibája?
        <br>(d) Egy $${N}$ reklamációból álló kötegben $${K}$ a csomagoló hibája. Visszatevés nélkül kiveszünk $${m}$-et. Mi a valószínűsége, hogy pontosan 2 a csomagoló hibája?`,
        parts: [
          { label: "(a) Poisson", ans: a },
          { label: "(b) binomiális", ans: b },
          { label: "(c) geometriai", ans: c },
          { label: "(d) hipergeometriai", ans: d },
        ],
        sol: R`(a) $\lambda = ${l}\cdot\frac{${t}}{60} = ${tn(lt)}$: $${tn(lt)}e^{-${tn(lt)}} ${approx(a)}$
        <br>(b) $\binom{${n}}{${k}}${tn(p)}^{${k}}${tn(1 - p)}^{${n - k}} ${approx(b)}$
        <br>(c) $${tn(1 - p)}^{${g - 1}}\cdot${tn(p)} ${approx(c)}$
        <br>(d) $\frac{\binom{${K}}{2}\binom{${N - K}}{${m - 2}}}{\binom{${N}}{${m}}} ${approx(d)}$`,
      };
    },
  },
];

/* ═══════════════════ 5. hét: folytonos eloszlások ═══════════════════ */
const xpow = (n) => (n === 1 ? "x" : `x^{${n}}`);
const fracWord = { 2: "fele", 3: "harmada", 4: "negyede", 5: "ötöde" };
PROBLEMS.push(
  {
    id: "poli", topic: "folyt", title: "Sűrűségfüggvény: c, E, D, medián", src: "Gy5/3",
    fixed: { n: 1, b: 1, a: 0.5 },
    random: () => { const b = rnd.int(1, 4); return { n: rnd.int(1, 3), b, a: b * rnd.pick([0.25, 0.5, 0.75]) }; },
    build: ({ n, b, a }) => {
      const c = (n + 1) / b ** (n + 1), E = ((n + 1) * b) / (n + 2), E2 = ((n + 1) * b * b) / (n + 3), D = Math.sqrt(E2 - E * E);
      const Pa = (a / b) ** (n + 1), med = b * 0.5 ** (1 / (n + 1));
      return {
        text: R`Legyen $f(x)=c\,${xpow(n)}$, ha $0\lt x\lt ${b}$, máshol $f(x)=0$. (a) Mennyi $c$, hogy $f$ sűrűségfüggvény legyen? (b) Mennyi $E(X)$ és $D(X)$? (c) Mennyi $P(X\lt ${tn(a)})$? (d) Mi a medián?`,
        parts: [
          { label: "(a) c", ans: c },
          { label: "(b) E(X)", ans: E },
          { label: "(b) D(X)", ans: D },
          { label: `(c) P(X < ${fmt(a)})`, ans: Pa },
          { label: "(d) medián", ans: med },
        ],
        sol: R`(a) $\int_0^{${b}} c\,${xpow(n)}\,dx = c\cdot\frac{${b}^{${n + 1}}}{${n + 1}} = 1 \Rightarrow c = \frac{${n + 1}}{${b ** (n + 1)}} ${approx(c)}$ (és $f\ge0$ ✓).
        <br>(b) $E(X)=\int_0^{${b}} x\cdot c\,${xpow(n)}\,dx = c\cdot\frac{${b}^{${n + 2}}}{${n + 2}} ${approx(E)}$, &nbsp; $E(X^2)=c\cdot\frac{${b}^{${n + 3}}}{${n + 3}} ${approx(E2)}$,
        <br>$D^2(X)=E(X^2)-E^2(X) ${approx(E2 - E * E)}$, &nbsp; $D(X) ${approx(D)}$.
        <br>(c) Eloszlásfüggvény a tartományon: $F(x)=\int_0^x c\,t^{${n}}\,dt=\left(\frac{x}{${b}}\right)^{${n + 1}}$, így $P(X\lt ${tn(a)})=F(${tn(a)}) ${approx(Pa)}$.
        <br>(d) $F(m)=\frac12 \Rightarrow m = ${b}\cdot\left(\frac12\right)^{1/${n + 1}} ${approx(med)}$.`,
      };
    },
  },
  {
    id: "pareto", topic: "folyt", title: "Sűrűségfüggvény $a/x^k$ alakban", src: "Gy5/17",
    fixed: { k: 3, x0: 2, c: 3, d: 4 },
    random: () => { const x0 = rnd.int(1, 3), c = x0 + rnd.int(1, 2); return { k: rnd.int(2, 4), x0, c, d: c + rnd.int(1, 3) }; },
    build: ({ k, x0, c, d }) => {
      const a = (k - 1) * x0 ** (k - 1), P = (x0 / c) ** (k - 1) - (x0 / d) ** (k - 1), med = x0 * 2 ** (1 / (k - 1));
      const parts = [
        { label: "(a) a", ans: a },
        { label: `(b) P(${c} < ξ < ${d})`, ans: P },
        { label: "(c) medián", ans: med },
      ];
      if (k > 2) parts.push({ label: "(d) E(ξ)", ans: ((k - 1) * x0) / (k - 2) });
      return {
        text: R`Egy $\xi$ valószínűségi változó sűrűségfüggvénye $f(x)=\frac{a}{x^{${k}}}$, ha $x\gt ${x0}$, máshol 0. (a) Mennyi $a$? (b) Írja fel az eloszlásfüggvényt, és számolja ki $P(${c}\lt\xi\lt ${d})$-t! (c) Milyen $x$-re lesz $P(\xi\gt x)=\frac12$ (medián)? (d) ${k > 2 ? "Mennyi $E(\\xi)$?" : "Létezik-e $E(\\xi)$?"}`,
        parts,
        sol: R`(a) $\int_{${x0}}^{\infty}\frac{a}{x^{${k}}}\,dx = a\left[\frac{x^{${1 - k}}}{${1 - k}}\right]_{${x0}}^{\infty} = \frac{a}{${k - 1}\cdot ${x0}^{${k - 1}}} = 1 \Rightarrow a = ${a}$.
        <br>(b) $F(x)=\int_{${x0}}^{x}\frac{${a}}{t^{${k}}}\,dt = 1-\left(\frac{${x0}}{x}\right)^{${k - 1}}$, ha $x\gt ${x0}$ (különben 0). $P(${c}\lt\xi\lt ${d}) = F(${d})-F(${c}) ${approx(P)}$.
        <br>(c) $\left(\frac{${x0}}{m}\right)^{${k - 1}}=\frac12 \Rightarrow m = ${x0}\cdot 2^{1/${k - 1}} ${approx(med)}$.
        <br>(d) ${k > 2 ? R`$E(\xi)=\int_{${x0}}^\infty x\cdot\frac{${a}}{x^{${k}}}\,dx = \frac{${a}}{${k - 2}\cdot ${x0}^{${k - 2}}} ${approx(((k - 1) * x0) / (k - 2))}$.` : R`$\int_{${x0}}^\infty x\cdot\frac{${a}}{x^2}\,dx = ${a}\int_{${x0}}^\infty\frac{dx}{x} = \infty$, tehát a várható érték <b>nem létezik</b>.`}`,
      };
    },
  },
  {
    id: "benzin", topic: "folyt", title: "Benzinkút: mekkora tartály kell?", src: "Gy5/6",
    fixed: { n: 4, p: 0.01 },
    random: () => ({ n: rnd.int(1, 5), p: rnd.pick([0.01, 0.02, 0.05, 0.1]) }),
    build: ({ n, p }) => {
      const t = 1 - p ** (1 / (n + 1));
      return {
        text: R`Egy benzinkút hetente egyszer kap benzint. A heti eladás (ezer literben) sűrűségfüggvénye $f(x)=${n + 1}(1-x)^{${n}}$, ha $0\lt x\lt1$, máshol 0. (a) Mekkora tartály kell ahhoz, hogy a kút egy adott héten csak $${tn(p)}$ valószínűséggel fogyjon ki? (b) Mennyi az átlagos heti eladás?`,
        parts: [
          { label: "(a) tartály (ezer liter)", ans: t },
          { label: "(b) E(X)", ans: 1 / (n + 2) },
        ],
        sol: R`(a) Kifogy, ha az eladás nagyobb a tartálynál ($t$): $P(X\gt t)=\int_t^1 ${n + 1}(1-x)^{${n}}\,dx = (1-t)^{${n + 1}} = ${tn(p)}$, így $t = 1-${tn(p)}^{1/${n + 1}} ${approx(t)}$ ezer liter.
        <br>(b) $E(X)=\int_0^1 x\cdot${n + 1}(1-x)^{${n}}\,dx = \frac{1}{${n + 2}} ${approx(1 / (n + 2))}$ (parciális integrálással vagy $u=1-x$ helyettesítéssel).`,
      };
    },
  },
  {
    id: "egyenletes", topic: "folyteo", title: "Egyenletes eloszlás: várakozás a buszra", src: "Gy5/13",
    fixed: { T: 30, w: 10, s: 15 },
    random: () => {
      const T = rnd.pick([20, 30, 40, 60]), w = 5 * rnd.int(1, T / 10);
      return { T, w, s: 5 * rnd.int(1, Math.max(1, (T - w) / 5 - 1)) };
    },
    build: ({ T, w, s }) => ({
      text: R`A busz 10:00 és ${T === 60 ? "11:00" : "10:" + T} között egyenletes eloszlású időpontban érkezik a megállóba, mi 10:00-ra megyünk ki. (a) Mi a valószínűsége, hogy legalább $${w}$ percet várunk? (b) Ha 10:${String(s).padStart(2, "0")}-kor még mindig várunk, mi a valószínűsége, hogy még legalább $${w}$ percet várunk? (c) Mennyi a várakozási idő várható értéke és szórása?`,
      parts: [
        { label: "(a)", ans: (T - w) / T },
        { label: "(b)", ans: (T - s - w) / (T - s) },
        { label: "(c) E(X)", ans: T / 2 },
        { label: "(c) D(X)", ans: T / Math.sqrt(12) },
      ],
      sol: R`A várakozási idő $X\sim U[0;${T}]$ (percben).
      <br>(a) $P(X\ge ${w}) = \frac{${T}-${w}}{${T}} ${approx((T - w) / T)}$.
      <br>(b) $P(X\ge ${s + w}\mid X\gt ${s}) = \frac{P(X\ge ${s + w})}{P(X\gt ${s})} = \frac{${T - s - w}/${T}}{${T - s}/${T}} ${approx((T - s - w) / (T - s))}$. (Feltéve, hogy még nem jött meg, az érkezés a maradék $[${s};${T}]$-on egyenletes.)
      <br>(c) $E(X)=\frac{0+${T}}{2}=${tn(T / 2)}$, &nbsp; $D(X)=\frac{${T}}{\sqrt{12}} ${approx(T / Math.sqrt(12))}$.`,
    }),
  },
  {
    id: "exp_alap", topic: "folyteo", title: "Exponenciális eloszlás: érkezések", src: "Gy5/23",
    fixed: { mu: 40, a: 15, b: 30 },
    random: () => { const mu = rnd.pick([10, 15, 20, 30, 40, 60]); return { mu, a: 5 * rnd.int(1, mu / 5), b: 5 * rnd.int(2, (2 * mu) / 5) }; },
    build: ({ mu, a, b }) => {
      const pa = 1 - Math.exp(-a / mu), pb = Math.exp(-b / mu), med = mu * Math.LN2;
      return {
        text: R`Egy baleseti sebészeten a betegek érkezése között eltelt idő exponenciális eloszlású, átlaga $${mu}$ perc. Mi a valószínűsége, hogy egy beteg érkezése után (a) $${a}$ percen belül érkezik a következő; (b) legalább $${b}$ percig nem jön újabb beteg? (c) Mennyi időn belül érkezik a betegek korán érkező fele (medián)?`,
        parts: [
          { label: `(a) P(X < ${a})`, ans: pa },
          { label: `(b) P(X > ${b})`, ans: pb },
          { label: "(c) medián (perc)", ans: med },
        ],
        sol: R`$\lambda=\frac{1}{${mu}}$ (perc⁻¹), $F(x)=1-e^{-x/${mu}}$.
        <br>(a) $P(X\lt ${a})=1-e^{-${a}/${mu}} ${approx(pa)}$
        <br>(b) $P(X\gt ${b})=e^{-${b}/${mu}} ${approx(pb)}$
        <br>(c) $1-e^{-m/${mu}}=\frac12 \Rightarrow m=${mu}\ln 2 ${approx(med)}$ perc.`,
      };
    },
  },
  {
    id: "exp_kvant", topic: "folyteo", title: "Exponenciális: túlélés és kvantilis", src: "Gy5/24",
    fixed: { mu: 3, t: 4, qd: 3, r: 0.8 },
    random: () => { const mu = rnd.pick([2, 3, 4, 5, 10]); return { mu, t: mu + rnd.int(1, mu), qd: rnd.int(2, 5), r: rnd.pick([0.5, 0.6, 0.75, 0.8, 0.9]) }; },
    build: ({ mu, t, qd, r }) => {
      const tq = mu * Math.log(qd), tr = -mu * Math.log(1 - r);
      return {
        text: R`Egy korallfaj polipjainak élettartama exponenciális eloszlású, átlagosan $${mu}$ év. (a) Az egyedek hány része él legfeljebb $${mu}$ évig? (b) Hány része éri meg a $${mu}$ évet? (c) Hány része éri meg a $${t}$ évet? (d) Hány év múlva lesz még életben éppen az egyedek ${fracWord[qd]}? (e) Hány év alatt pusztul el az egyedek $${tn(r * 100)}\%$-a?`,
        parts: [
          { label: `(a) P(X ≤ ${mu})`, ans: 1 - Math.exp(-1) },
          { label: `(b) P(X > ${mu})`, ans: Math.exp(-1) },
          { label: `(c) P(X > ${t})`, ans: Math.exp(-t / mu) },
          { label: "(d) év", ans: tq },
          { label: "(e) év", ans: tr },
        ],
        sol: R`$\lambda=\frac1{${mu}}$, $P(X\gt x)=e^{-x/${mu}}$.
        <br>(a) $1-e^{-1} ${approx(1 - Math.exp(-1))}$ — az átlagnál tovább csak kb. 37% él!
        <br>(b) $e^{-1} ${approx(Math.exp(-1))}$
        <br>(c) $e^{-${t}/${mu}} ${approx(Math.exp(-t / mu))}$
        <br>(d) $e^{-x/${mu}}=\frac1{${qd}} \Rightarrow x=${mu}\ln ${qd} ${approx(tq)}$ év
        <br>(e) $1-e^{-x/${mu}}=${tn(r)} \Rightarrow x=-${mu}\ln ${tn(1 - r)} ${approx(tr)}$ év`,
      };
    },
  },
  {
    id: "exp_orok", topic: "folyteo", title: "Exponenciális: örökifjú tulajdonság", src: "Gy5/25–26",
    fixed: { lam: 0.2, t: 3, s: 5, a: 4, q: 0.25 },
    random: () => ({ lam: rnd.pick([0.1, 0.2, 0.25, 0.5]), t: rnd.int(1, 5), s: rnd.int(2, 8), a: rnd.int(2, 6), q: rnd.pick([0.2, 0.25, 0.4, 0.5, 0.6]) }),
    build: ({ lam, t, s, a, q }) => {
      const p = Math.exp(-lam * t);
      return {
        text: R`Egy alkatrész élettartama (években) $${tn(lam)}$ paraméterű exponenciális eloszlású. (a) Mi a valószínűsége, hogy az élettartam meghaladja a $${t}$ évet? (b) Feltéve, hogy már $${s}$ éve működik, mi a valószínűsége, hogy további $${t}$ évig is használható? (c) Egy másik (szintén exponenciális élettartamú) izzófajtánál a darabok $${tn(q * 100)}\%$-a éli túl a $${a}$ évet. Hány százalékuk éli túl a $${2 * a}$ évet?`,
        parts: [
          { label: `(a) P(X > ${t})`, ans: p },
          { label: `(b) P(X > ${s + t} | X > ${s})`, ans: p },
          { label: `(c) P(Y > ${2 * a})`, ans: q * q },
        ],
        sol: R`(a) $P(X\gt ${t})=e^{-${tn(lam)}\cdot ${t}} ${approx(p)}$
        <br>(b) $P(X\gt ${s + t}\mid X\gt ${s})=\frac{e^{-${tn(lam)}\cdot${s + t}}}{e^{-${tn(lam)}\cdot${s}}}=e^{-${tn(lam)}\cdot${t}} ${approx(p)}$ — ugyanannyi, mint (a): az exponenciális eloszlás <b>örökifjú</b>.
        <br>(c) $P(Y\gt ${2 * a})=e^{-2\lambda\cdot${a}}=\left(e^{-\lambda\cdot${a}}\right)^2=${tn(q)}^2 ${approx(q * q)}$, azaz $${tn(q * q * 100)}\%$. ($\lambda$-t ki sem kell számolni.)`,
      };
    },
  },
  {
    id: "exp_min", topic: "folyteo", title: "Két foglalt telefonfülke (minimum)", src: "Gy5/27",
    fixed: { m1: 10, m2: 5, t: 5 },
    random: () => ({ m1: rnd.pick([4, 5, 6, 8, 10, 12, 15]), m2: rnd.pick([2, 3, 4, 5, 6]), t: rnd.int(1, 6) }),
    build: ({ m1, m2, t }) => {
      const l = 1 / m1 + 1 / m2;
      return {
        text: R`Telefonálni szeretnék, de mindkét fülke foglalt. Az egyikben a beszélgetés hossza exponenciális, átlagosan $${m1}$ perc, a másikban (tőle függetlenül) exponenciális, átlagosan $${m2}$ perc. Amint valamelyik felszabadul, bemegyek. (a) Átlagosan mennyit várok? (b) Mi a valószínűsége, hogy $${t}$ percnél többet várok?`,
        parts: [
          { label: "(a) E(T) (perc)", ans: 1 / l },
          { label: `(b) P(T > ${t})`, ans: Math.exp(-l * t) },
        ],
        sol: R`A várakozás $T=\min(X,Y)$. $P(T\gt t)=P(X\gt t)\,P(Y\gt t)=e^{-t/${m1}}e^{-t/${m2}}=e^{-(\frac1{${m1}}+\frac1{${m2}})t}$, tehát $T\sim\text{Exp}(\lambda)$, $\lambda=\frac1{${m1}}+\frac1{${m2}} ${approx(l)}$.
        <br>(a) $E(T)=\frac1\lambda ${approx(1 / l)}$ perc
        <br>(b) $P(T\gt ${t})=e^{-${tn(l)}\cdot ${t}} ${approx(Math.exp(-l * t))}$`,
      };
    },
  },
  {
    id: "normalis", topic: "folyteo", title: "Normális eloszlás: tejhozam", src: "Gy5/28",
    fixed: { m: 22.1, s: 1.5, a: 23, b: 25, q1: 0.7, q2: 0.4 },
    random: () => {
      const m = rnd.step(15, 30, 0.1), s = rnd.step(0.8, 3, 0.1);
      const a = +(m + s * rnd.pick([-1, -0.5, 0.4, 0.6, 1])).toFixed(1);
      return { m, s, a, b: +(a + s * rnd.pick([1, 1.5, 2])).toFixed(1), q1: rnd.pick([0.6, 0.7, 0.8, 0.9]), q2: rnd.pick([0.2, 0.3, 0.4]) };
    },
    build: ({ m, s, a, b, q1, q2 }) => {
      const za = (a - m) / s, zb = (b - m) / s;
      const x1 = m + s * invPhi(q1), x2 = m + s * invPhi(q2);
      return {
        text: R`Egy tehén napi tejhozama normális eloszlású, $m=${tn(m)}$ liter várható értékkel és $\sigma=${tn(s)}$ liter szórással. Mi a valószínűsége, hogy egy adott napon a tejhozam (a) kevesebb, mint $${tn(a)}$ liter; (b) több, mint $${tn(b)}$ liter; (c) $${tn(a)}$ és $${tn(b)}$ liter közé esik; (d) $m-\sigma$ és $m+\sigma$ közé esik? (e) Legfeljebb mennyi tejet ad a legkevésbé tejelő napok $${tn(q1 * 100)}\%$-a? (f) És $${tn(q2 * 100)}\%$-a?`,
        parts: [
          { label: `(a) P(X < ${fmt(a)})`, ans: Phi(za) },
          { label: `(b) P(X > ${fmt(b)})`, ans: 1 - Phi(zb) },
          { label: "(c)", ans: Phi(zb) - Phi(za) },
          { label: "(d)", ans: 2 * Phi(1) - 1 },
          { label: `(e) ${fmt(q1)}-kvantilis`, ans: x1 },
          { label: `(f) ${fmt(q2)}-kvantilis`, ans: x2 },
        ],
        sol: R`Standardizálás: $P(X\lt x)=\Phi\left(\frac{x-${tn(m)}}{${tn(s)}}\right)$.
        <br>(a) $z=\frac{${tn(a)}-${tn(m)}}{${tn(s)}} ${approx(za, 4)}$, $\Phi(${tn(za, 4)}) ${approx(Phi(za))}$
        <br>(b) $z ${approx(zb, 4)}$, $1-\Phi(${tn(zb, 4)}) ${approx(1 - Phi(zb))}$
        <br>(c) $\Phi(${tn(zb, 4)})-\Phi(${tn(za, 4)}) ${approx(Phi(zb) - Phi(za))}$
        <br>(d) $\Phi(1)-\Phi(-1)=2\Phi(1)-1 ${approx(2 * Phi(1) - 1)}$ (független $m$-től és $\sigma$-tól!)
        <br>(e) $\Phi(z)=${tn(q1)} \Rightarrow z=\Phi^{-1}(${tn(q1)}) ${approx(invPhi(q1), 4)}$, $x=${tn(m)}+${tn(s)}\cdot ${tn(invPhi(q1), 4)} ${approx(x1)}$ liter
        <br>(f) $z=\Phi^{-1}(${tn(q2)})=-\Phi^{-1}(${tn(1 - q2)}) ${approx(invPhi(q2), 4)}$, $x ${approx(x2)}$ liter`,
      };
    },
  },
  {
    id: "normalis2", topic: "folyteo", title: "Normális eloszlás: testmagasság", src: "Gy5/29",
    fixed: { m: 180, s: 20, lo: 160, hi: 190, pl: 0.1, ph: 0.2 },
    random: () => {
      const m = rnd.int(160, 185), s = rnd.int(6, 15);
      return { m, s, lo: m - s * rnd.pick([1, 1.5, 2]), hi: m + rnd.int(1, 2) * 5, pl: rnd.pick([0.05, 0.1, 0.2]), ph: rnd.pick([0.1, 0.2, 0.25]) };
    },
    build: ({ m, s, lo, hi, pl, ph }) => {
      const zl = (lo - m) / s, zh = (hi - m) / s, xl = m + s * invPhi(pl), xh = m + s * invPhi(1 - ph);
      return {
        text: R`Egy populációban a férfiak testmagassága normális eloszlású, átlaga $${m}$ cm, szórása $${s}$ cm. Mi a valószínűsége, hogy egy véletlenszerűen választott férfi (a) $${tn(lo)}$ cm-nél alacsonyabb; (b) $${hi}$ cm-nél magasabb; (c) $${tn(lo)}$ és $${hi}$ cm közötti? (d) Melyik magasság alatt van a férfiak $${tn(pl * 100)}\%$-a? (e) Melyik magasság fölött van a férfiak $${tn(ph * 100)}\%$-a?`,
        parts: [
          { label: `(a) P(X < ${fmt(lo)})`, ans: Phi(zl) },
          { label: `(b) P(X > ${hi})`, ans: 1 - Phi(zh) },
          { label: "(c)", ans: Phi(zh) - Phi(zl) },
          { label: "(d) cm", ans: xl },
          { label: "(e) cm", ans: xh },
        ],
        sol: R`(a) $\Phi\left(\frac{${tn(lo)}-${m}}{${s}}\right)=\Phi(${tn(zl, 4)})=1-\Phi(${tn(-zl, 4)}) ${approx(Phi(zl))}$
        <br>(b) $1-\Phi\left(\frac{${hi}-${m}}{${s}}\right)=1-\Phi(${tn(zh, 4)}) ${approx(1 - Phi(zh))}$
        <br>(c) $\Phi(${tn(zh, 4)})-\Phi(${tn(zl, 4)}) ${approx(Phi(zh) - Phi(zl))}$
        <br>(d) $F(x)=${tn(pl)}$: $x=${m}+${s}\cdot\Phi^{-1}(${tn(pl)})=${m}-${s}\cdot ${tn(-invPhi(pl), 4)} ${approx(xl)}$ cm
        <br>(e) $P(X\gt x)=${tn(ph)} \Leftrightarrow F(x)=${tn(1 - ph)}$: $x=${m}+${s}\cdot ${tn(invPhi(1 - ph), 4)} ${approx(xh)}$ cm`,
      };
    },
  },
  {
    id: "talalkozo2", topic: "folyteo", title: "Találkozó eltérő várakozással", src: "Gy5/21",
    fixed: { T: 60, w: 10, wa: 15, wb: 5 },
    random: () => ({ T: 60, w: 5 * rnd.int(1, 6), wa: 5 * rnd.int(1, 6), wb: 5 * rnd.int(1, 6) }),
    build: ({ T, w, wa, wb }) => {
      const pa = ((T - w) / T) ** 2, pm = 1 - ((T - wa) ** 2 + (T - wb) ** 2) / (2 * T * T);
      return {
        text: R`Aladár és Bori 9 és 10 óra között, egymástól függetlenül, teljesen véletlen időpontban érkezik a megbeszélt helyre. (a) Mekkora a valószínűsége, hogy az előbb érkezőnek $${w}$ percnél többet kell várnia a másikra? (b) Megérkezése után Aladár $${wa}$ percet vár, Bori $${wb}$ percet. Mekkora a valószínűsége, hogy találkoznak?`,
        parts: [
          { label: "(a)", ans: pa },
          { label: "(b)", ans: pm },
        ],
        sol: R`Legyen $x$ Aladár, $y$ Bori érkezése percben: $(x,y)$ egyenletes a $[0;${T}]^2$ négyzetben (terület $${T * T}$).
        <br>(a) $|x-y|\gt ${w}$: két egybevágó derékszögű háromszög, befogóik $${T - w}$: $P=\frac{2\cdot\frac12\cdot${T - w}^2}{${T}^2}=\left(\frac{${T - w}}{${T}}\right)^2 ${approx(pa)}$
        <br>(b) Találkoznak, ha Aladár ér oda előbb és $y-x\le ${wa}$, vagy Bori ér oda előbb és $x-y\le ${wb}$. A kedvezőtlen részek: háromszög $${T - wa}$ és $${T - wb}$ befogóval: $$P = 1-\frac{\frac12\cdot${T - wa}^2+\frac12\cdot${T - wb}^2}{${T}^2} ${approx(pm)}$$`,
      };
    },
  },
  {
    id: "osszeg2", topic: "folyteo", title: "Két véletlen szám összege", src: "Gy5/22",
    fixed: { L: 2, c1: 1, c2: 2 },
    random: () => {
      const L = rnd.int(1, 4), steps = range(1, 7).map((i) => (i * L) / 4);
      const c1 = rnd.pick(steps.slice(0, 5));
      return { L, c1, c2: rnd.pick(steps.filter((x) => x > c1)) };
    },
    build: ({ L, c1, c2 }) => {
      const A = (c) => (c <= L ? (c * c) / 2 : L * L - ((2 * L - c) ** 2) / 2);
      const P = (A(c2) - A(c1)) / (L * L);
      return {
        text: R`A $[0;${L}]$ intervallumból teljesen véletlenszerűen, egymástól függetlenül választunk két számot. Mi a valószínűsége, hogy az összegük nagyobb $${tn(c1)}$-nél, de kisebb $${tn(c2)}$-nél?`,
        parts: [{ label: "P", ans: P }],
        sol: R`$(x,y)$ egyenletes a $[0;${L}]^2$ négyzetben (terület $${L * L}$). Az $x+y\lt c$ rész területe: ha $c\le ${L}$, akkor $\frac{c^2}{2}$ (háromszög); ha $c\gt ${L}$, akkor $${L * L}-\frac{(${2 * L}-c)^2}{2}$.
        <br>$T(${tn(c2)}) ${approx(A(c2))}$, $T(${tn(c1)}) ${approx(A(c1))}$, így $$P=\frac{T(${tn(c2)})-T(${tn(c1)})}{${L * L}} ${approx(P)}$$`,
      };
    },
  },
);

/* Tippek (a Számolás oldalon és a ZH tanuló módjában) */
const PROBLEM_HINTS = {
  kerek: R`Körpermutáció: egy embert rögzíts, a többiek sorrendje számít: $(n-1)!$.`,
  lepes: R`Írd fel: előre + hátra = lépésszám, előre − hátra = a cél. Ebből megvan, hány lépés megy hátra; ezeket kell kiválasztani.`,
  levelek: R`Különböző tárgyak → variáció, egyforma tárgyak → kombináció. Ha egy ládába több is kerülhet → ismétléses.`,
  dijak: R`Különböző díjak → számít, ki melyiket kapja (variáció); egyforma díjak → csak a nyertesek halmaza számít (kombináció).`,
  szo: R`Ismétléses permutáció: $n!$ osztva az egyforma betűk darabszámának faktoriálisaival.`,
  kockaosszeg: R`Összes eset $6^3$ (a sorrend számít). Keresd meg, mely számhármasok adják az összeget, és mindegyiknek hány sorrendje van.`,
  egymasmellett: R`Rögzítsd A helyét: B-nek hány hely marad, és ebből hány szomszédos?`,
  urna: R`Visszatevéssel: binomiális. Visszatevés nélkül: hipergeometriai (kombinációk aránya).`,
  lotto: R`Hipergeometriai: a kihúzott számokból $k$ a mieink közül, a többi a maradékból jön.`,
  kocka6: R`Összes eset $6^n$. „Mind különböző”: ismétlés nélküli variáció; „pontosan két 6-os”: binomiális.`,
  talalkozo: R`Ábrázold az érkezéseket az $(x,y)$ négyzetben; a találkozás feltétele $|x-y|\le w$. A kedvezőtlen rész két háromszög.`,
  alap: R`$P(A+B)=P(A)+P(B)-P(AB)$, $P(A-B)=P(A)-P(AB)$, komplementer: $1-P$, és De Morgan.`,
  feltab: R`Szorzási szabály: $P(AB)=P(B|A)P(A)$, aztán $P(B)=P(AB)/P(A|B)$.`,
  kontingencia: R`Feltételes valószínűségnél a feltételnek megfelelő sor vagy oszlop összege a nevező.`,
  teljes3: R`Fa-diagram: első szint a „honnan” (gép/csoport), második a megfigyelt esemény. (a) teljes valószínűség, (b) Bayes.`,
  bayes2: R`$P(E)=P(E|H)P(H)+P(E|\overline H)P(\overline H)$, majd Bayes: a kérdéses ág osztva $P(E)$-vel.`,
  gepall: R`Teljes valószínűség az időarányokkal; a (b)-ben a feltétel a „dolgozik”, a nevező $1-P(\text{áll})$.`,
  tabla: R`$F(c)=P(X\lt c)$: csak a szigorúan kisebb értékeket add össze. $E=\sum x_ip_i$, $D^2=E(X^2)-E^2(X)$.`,
  amig: R`$P(\xi=k)$: előbb $k-1$ fehér, aztán piros (szorzási szabály). Transzformációnál kell $E(\xi^2)$ és $E(\xi^4)$.`,
  busz: R`Diákot választva egy busz a létszámával arányos eséllyel jön ki: $P(\xi=n)=n/N$; sofőrt választva mind egyforma eséllyel.`,
  szabo: R`A szükséges vizsgák száma geometriai: $P(X\le k)=1-(1-p)^k$.`,
  blicc: R`Egy napon elkapják = (van ellenőr)·(elkapja). A napok függetlenek → hatványozás, binomiális.`,
  binom: R`Független próbák, állandó $p$: binomiális, $P(X=k)=\binom nk p^k(1-p)^{n-k}$.`,
  hipergeo: R`Visszatevés nélkül, véges készletből: hipergeometriai, $E=n\frac KN$.`,
  geo: R`Az első sikerig: geometriai, $P(X=k)=(1-p)^{k-1}p$, $P(X\le m)=1-(1-p)^m$.`,
  poisson: R`Poisson; a $\lambda$-t skálázd az időtartamhoz. „Legalább 1”: $1-e^{-\lambda}$.`,
  poisinv: R`$P(X=0)=e^{-\lambda}$, ebből $\lambda=-\ln P(X=0)$.`,
  kulcs: R`Visszatevéssel: geometriai. Eldobva: a jó kulcs helye egyenletes az $1,\dots,n$ között.`,
  pistike: R`Binomiális: számold ki, legalább hány jó válasz kell, és add össze a valószínűségeket onnan $n$-ig.`,
  vegyes: R`Időtartam alatti darabszám → Poisson; rögzített számú független próba → binomiális; „az első…” → geometriai; visszatevés nélkül → hipergeometriai.`,
  poli: R`$\int f=1$-ből $c$; $E=\int xf$, $E(X^2)=\int x^2f$; a medián: $F(m)=\frac12$.`,
  pareto: R`$\int_{x_0}^\infty a\,x^{-k}dx=1$; az eloszlásfüggvény integrálással jön; $E$ csak akkor létezik, ha $\int xf$ véges.`,
  benzin: R`Kifogy, ha az eladás több a tartálynál: $P(X\gt t)=\int_t^1 f=0{,}01$, ezt oldd meg $t$-re.`,
  egyenletes: R`Egyenletes eloszlás: a valószínűség a hosszak aránya. Feltételesnél a maradék intervallum egyenletes.`,
  exp_alap: R`$\lambda=\frac1{\text{átlag}}$; $P(X\lt a)=1-e^{-\lambda a}$, $P(X\gt b)=e^{-\lambda b}$, medián $\frac{\ln2}\lambda$.`,
  exp_kvant: R`Túlélés: $P(X\gt t)=e^{-t/\mu}$. Kvantilis: oldd meg $e^{-t/\mu}=q$-t, azaz $t=-\mu\ln q$.`,
  exp_orok: R`Örökifjú: $P(X\gt s+t\mid X\gt s)=P(X\gt t)$. És $P(X\gt2a)=P(X\gt a)^2$.`,
  exp_min: R`A várakozás a két idő minimuma, ami $\text{Exp}(\lambda_1+\lambda_2)$ eloszlású.`,
  normalis: R`Standardizálj: $z=\frac{x-m}{\sigma}$, majd $\Phi(z)$; kvantilis: $x=m+\sigma\,\Phi^{-1}(p)$.`,
  normalis2: R`Standardizálj, negatív $z$-nél $\Phi(-z)=1-\Phi(z)$; „fölötte van a 20%” ⇔ $F(x)=0{,}8$.`,
  talalkozo2: R`$[0;60]^2$ négyzet; „$w$ percnél többet vár” ⇔ $|x-y|\gt w$. Eltérő várakozásnál a két háromszög befogója is eltér.`,
  osszeg2: R`Rajzold be a négyzetbe az $x+y=c$ egyeneseket; a kedvező rész a két egyenes közötti sáv.`,
};
PROBLEMS.forEach((p) => { if (PROBLEM_HINTS[p.id]) p.hint = PROBLEM_HINTS[p.id]; });
