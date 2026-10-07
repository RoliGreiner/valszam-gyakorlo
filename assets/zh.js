/* Korábbi ZH-k feladatai részletes, lépésenkénti levezetéssel és ábrákkal,
   valamint a véletlen próba-ZH összeállítója.
   Feladat: { title, topic, text, textFigs?, parts: [{ label, ans, pts, choices? }], hint, steps: [{ t, b, figs?, note? }] }
   choices esetén az ans a helyes válasz indexe. */
"use strict";

const IH = ["Igaz", "Hamis"];
const IH_INTRO = R`Az alábbi állítások közül melyek igazak (I) és melyek hamisak (H)? Igaz válasz esetén indoklás, hamis válasz esetén ellenpélda szükséges.`;

const EXAMS = (() => {
  const c905 = binom(90, 5);
  const lam16 = -Math.log(0.013), p16 = 1 - sum(range(0, 6).map((k) => poiPmf(lam16, k)));
  const p17 = 1 - (8 / 9) ** 4 - 4 * (1 / 9) * (8 / 9) ** 3;
  const d4 = [1, 3, 6, 10, 12, 12, 10, 6, 3, 1];
  const loot = { v: [0, 50, 150, 320, 500], p: [2 / 30, 15 / 30, 6 / 30, 5 / 30, 2 / 30] };
  const lootE = sum(loot.v.map((v, i) => v * loot.p[i])), lootE2 = sum(loot.v.map((v, i) => v * v * loot.p[i]));
  const huba = range(0, 4).map((k) => binPmf(4, 0.35, k));
  const l22 = Math.log(4);

  return [
    /* ═════════════════════════ 2016 ═════════════════════════ */
    {
      id: "2016", title: "1. ZH — 2016 ősz", source: "Csercsik Dávid, megoldókulccsal",
      tasks: [
        {
          title: "Lottó: 2-es vagy 3-as", topic: "klassz",
          text: R`Mi az esélye, hogy a lottón (90 számból 5-öt húznak) 2-es vagy 3-as találatom lesz?`,
          parts: [{ label: "P(2-es vagy 3-as)", ans: (10 * binom(85, 3) + 10 * binom(85, 2)) / c905, pts: 4 }],
          hint: R`Klasszikus valószínűség: a kihúzott ötös $\binom{90}5$-féle lehet. Pontosan $k$ találat: $k$ szám a mieink közül, $5-k$ a többi 85 közül. A 2-es és a 3-as kizárja egymást.`,
          steps: [
            { t: "Összes eset", b: R`A húzásnál a sorrend nem számít, így az összes lehetséges kimenetel $\binom{90}{5}=43\,949\,268$, és ezek egyformán valószínűek (klasszikus mező).` },
            { t: "Kedvező esetek", b: R`Pontosan $k$ találat: a kihúzott 5 számból $k$ a mi 5 számunk közül való, a többi $5-k$ a maradék 85 közül: $\binom5k\binom{85}{5-k}$ eset.
              <br>$k=2$: $\binom52\binom{85}3=10\cdot98\,770=987\,700$
              <br>$k=3$: $\binom53\binom{85}2=10\cdot3570=35\,700$` },
            { t: "Összeadás", b: R`A „2-es” és a „3-as” egymást kizáró események, ezért a valószínűségük összeadódik: $$P=\frac{987\,700+35\,700}{43\,949\,268} ${approx((987700 + 35700) / c905)}$$`,
              figs: () => [figBars({ xs: range(0, 5), ps: range(0, 5).map((k) => (binom(5, k) * binom(85, 5 - k)) / c905), hl: (x) => x === 2 || x === 3, title: "A találatok számának eloszlása (kiemelve a 2 és a 3)", caption: "A 3-as oszlop olyan kicsi (0,0008), hogy alig látszik; a válasz nagy része a 2-esből jön." })] },
          ],
        },
        {
          title: "Angol és német: függetlenek-e?", topic: "felt",
          text: R`Egy 30 fős osztályban angolt és németet lehet tanulni. Csak angolt, de németet nem, 10-en tanulnak. Sem angolt, sem németet nem tanul pontosan 10 diák. Az angolul tanulók harmada tanul németül is. Igaz-e, hogy az a két esemény, hogy egy véletlenszerűen kiválasztott diák tanul-e angolt, illetve németet, független?`,
          parts: [
            { label: "P(A·N)", ans: 1 / 6, pts: 1 },
            { label: "P(A)", ans: 0.5, pts: 1 },
            { label: "P(N)", ans: 1 / 3, pts: 1 },
            { label: "Függetlenek?", choices: ["Igen, függetlenek", "Nem függetlenek"], ans: 0, pts: 2 },
          ],
          hint: R`Rajzolj Venn-diagramot, és számold ki a darabszámokat. Független, ha $P(A\cdot N)=P(A)\,P(N)$.`,
          steps: [
            { t: "Jelölések", b: R`$A$: angolul tanul, $N$: németül tanul. A szöveg: $|A\cdot\overline N|=10$ (csak angol), $|\overline A\cdot\overline N|=10$ (egyik sem), $|A\cdot N|=\frac13|A|$.` },
            { t: "Darabszámok", b: R`$|A|=|A\cdot\overline N|+|A\cdot N|=10+\frac13|A|$, ebből $\frac23|A|=10$, tehát $|A|=15$ és $|A\cdot N|=5$.
              <br>Csak németül: $30-15-10=5$, így $|N|=5+5=10$.`,
              figs: () => [figVenn({ onlyA: 10, both: 5, onlyB: 5, none: 10, la: "angol (15)", lb: "német (10)", title: "A 30 diák megoszlása" })] },
            { t: "Függetlenség ellenőrzése", b: R`$$P(A\cdot N)=\frac5{30}=\frac16,\qquad P(A)\,P(N)=\frac{15}{30}\cdot\frac{10}{30}=\frac12\cdot\frac13=\frac16.$$ Egyenlők, tehát <b>függetlenek</b>.
              <br>Másképp: $P(N\mid A)=\frac5{15}=\frac13=P(N)$ — az, hogy valaki angolos, nem változtat a németes esélyén.` },
          ],
        },
        {
          title: "Vakondtúrás a két kertben (Bayes)", topic: "bayes",
          text: R`Lóri és Zoli négyzet alakú kertjei szomszédosak: $L=[0;1]\times[0;1]$ és $Z=[1;2]\times[0;1]$. Az első vakondtúrás $\frac34$ eséllyel $L$-ben, $\frac14$ eséllyel $Z$-ben jelenik meg, és a helye mind $L$-en, mind $Z$-n belül egyenletes. Feltéve, hogy az első vakondtúrás a $(0;0)$, $(1;0)$, $(2;\frac23)$ pontok által meghatározott háromszögbe esik, mennyi az esélye, hogy Lóri kertjében van?`,
          parts: [
            { label: "P(H | L)", ans: 1 / 6, pts: 1 },
            { label: "P(H | Z)", ans: 1 / 6, pts: 1 },
            { label: "P(L | H)", ans: 0.75, pts: 4 },
          ],
          hint: R`Teljes eseményrendszer: $L$, $Z$. Megfigyelés: $H$ = a háromszögbe esik. $P(H\mid L)$ és $P(H\mid Z)$ a háromszög kertbe eső részének területe (mindkét kert területe 1). Utána Bayes.`,
          steps: [
            { t: "Események", b: R`$L$: Lóri kertjében van, $Z$: Zoliéban — teljes eseményrendszer, $P(L)=\frac34$, $P(Z)=\frac14$. $H$: a háromszögbe esik.` },
            { t: "Feltételes valószínűségek területből", b: R`Kerten belül egyenletes, a kertek területe 1, így $P(H\mid L)$ = a háromszög $L$-be eső részének területe. A háromszög felső oldala az $y=\frac x3$, alsó-jobb oldala az $y=\frac23(x-1)$ egyenes.
              <br>$L$-ben ($0\le x\le1$): $\int_0^1\frac x3\,dx=\frac16$. &nbsp; $Z$-ben ($1\le x\le2$): $\int_1^2\Big(\frac x3-\frac23(x-1)\Big)dx=\int_1^2\frac{2-x}3\,dx=\frac16$.
              <br>Tehát $P(H\mid L)=P(H\mid Z)=\frac16$.`,
              figs: () => [figPlane({ xr: [0, 2], yr: [0, 1], size: 340, polys: [{ pts: [[0, 0], [1, 0], [1, 1 / 3]], cls: "fav" }, { pts: [[1, 0], [2, 2 / 3], [1, 1 / 3]], cls: "fav" }], segs: [{ a: [1, 0], b: [1, 1], cls: "line" }], texts: [{ x: 0.5, y: 0.82, t: "L (Lóri)" }, { x: 1.5, y: 0.82, t: "Z (Zoli)" }, { x: 0.7, y: 0.1, t: "1/6" }, { x: 1.35, y: 0.33, t: "1/6" }], xTicks: [0, 1, 2], yTicks: [0, { y: 1 / 3, t: "1/3" }, { y: 2 / 3, t: "2/3" }, 1], title: "A háromszög mindkét kertből 1/6 területet fed le" })] },
            { t: "Bayes-tétel", b: R`$$P(L\mid H)=\frac{P(H\mid L)P(L)}{P(H\mid L)P(L)+P(H\mid Z)P(Z)}=\frac{\frac16\cdot\frac34}{\frac16\cdot\frac34+\frac16\cdot\frac14}=\frac34.$$`,
              figs: () => [figTree({ title: "Valószínűségi fa", branches: [{ label: "L", p: "3/4", children: [{ label: "H", p: "1/6", value: "= 1/8", hl: true }, { label: "nem H", p: "5/6" }] }, { label: "Z", p: "1/4", children: [{ label: "H", p: "1/6", value: "= 1/24" }, { label: "nem H", p: "5/6" }] }] })] },
            { t: "Értelmezés", note: true, b: R`Mivel a háromszög mindkét kertből ugyanakkora részt fed le, a megfigyelés nem ad új információt: az a posteriori valószínűség megegyezik az a priori $\frac34$-del.` },
          ],
        },
        {
          title: "Golyók: hipergeometriai és „amíg fehéret nem kapunk”", topic: "valvalt",
          text: R`Egy dobozban 3 piros és 2 fehér golyó van. (a) Mi a valószínűsége, hogy 2 kihúzott golyóból 1 fehér? (b) Visszatevés nélkül húzunk, amíg fehéret nem kapunk. Legyen $Y$ a húzások száma. Adjuk meg $Y$ eloszlását, várható értékét és szórását!`,
          parts: [
            { label: "(a) P(1 fehér)", ans: 0.6, pts: 3 },
            { label: "(b) P(Y = 1)", ans: 0.4, pts: 0.75 },
            { label: "(b) P(Y = 2)", ans: 0.3, pts: 0.75 },
            { label: "(b) P(Y = 3)", ans: 0.2, pts: 0.75 },
            { label: "(b) P(Y = 4)", ans: 0.1, pts: 0.75 },
            { label: "E(Y)", ans: 2, pts: 2 },
            { label: "D(Y)", ans: 1, pts: 2 },
          ],
          hint: R`(a) Visszatevés nélkül 2-t húzunk → hipergeometriai. (b) $P(Y=k)$: előbb $k-1$ piros, aztán fehér — szorzási szabály. Legfeljebb 3 piros jöhet, így $Y\le4$.`,
          steps: [
            { t: "(a) Hipergeometriai eloszlás", b: R`$N=5$ golyó, $K=2$ fehér, $n=2$ húzás: $$P(X=1)=\frac{\binom21\binom31}{\binom52}=\frac{2\cdot3}{10}=0{,}6.$$` },
            { t: "(b) Y eloszlása szorzási szabállyal", b: R`$P(Y=1)=\frac25=0{,}4$
              <br>$P(Y=2)=\frac35\cdot\frac24=0{,}3$ (először piros, aztán fehér)
              <br>$P(Y=3)=\frac35\cdot\frac24\cdot\frac23=0{,}2$
              <br>$P(Y=4)=\frac35\cdot\frac24\cdot\frac13\cdot1=0{,}1$ (a 3 piros elfogyott, a 4. biztosan fehér)
              <br>Ellenőrzés: $0{,}4+0{,}3+0{,}2+0{,}1=1$ ✓`,
              figs: () => [figBars({ xs: [1, 2, 3, 4], ps: [0.4, 0.3, 0.2, 0.1], xlabel: "k", title: "Y eloszlása" })] },
            { t: "Várható érték és szórás", b: R`$E(Y)=1\cdot0{,}4+2\cdot0{,}3+3\cdot0{,}2+4\cdot0{,}1=2$
              <br>$E(Y^2)=1\cdot0{,}4+4\cdot0{,}3+9\cdot0{,}2+16\cdot0{,}1=5$
              <br>$D^2(Y)=E(Y^2)-E^2(Y)=5-4=1$, így $D(Y)=1$.` },
          ],
        },
        {
          title: "Telefonközpont (Poisson)", topic: "eloszl",
          text: R`Egy telefonközpontba egy óra alatt 0,013 valószínűséggel nem fut be hívás. (a) Átlagosan hány hívás fut be egy óra alatt? (b) Mi a valószínűsége, hogy 6-nál több hívás fut be egy óra alatt?`,
          parts: [
            { label: "(a) λ", ans: lam16, pts: 2 },
            { label: "(b) P(X > 6)", ans: p16, pts: 3 },
          ],
          hint: R`Ritka események egy időtartam alatt → Poisson. $P(X=0)=e^{-\lambda}$, ebből $\lambda$. „6-nál több”: komplementer.`,
          steps: [
            { t: "λ meghatározása", b: R`Poisson-eloszlás: $P(X=0)=\frac{\lambda^0}{0!}e^{-\lambda}=e^{-\lambda}=0{,}013$, így $\lambda=-\ln0{,}013 ${approx(lam16)}$ — ez egyben a várható érték, tehát átlagosan ennyi hívás jön óránként.` },
            { t: "Komplementer", b: R`$P(X\gt6)=1-P(X\le6)=1-\sum_{k=0}^{6}\frac{\lambda^k}{k!}e^{-\lambda}$
              <br>$=1-(${range(0, 6).map((k) => tn(poiPmf(lam16, k), 4)).join("+")}) ${approx(p16)}$`,
              figs: () => [figBars({ xs: range(0, 12), ps: range(0, 12).map((k) => poiPmf(lam16, k)), hl: (x) => x > 6, sumText: `P(X > 6) = ${fmt(p16, 4)} (a 12 utáni rész is)`, title: R`$\text{Poisson}(${tn(lam16, 3)})$ — kiemelve a $X\gt6$ rész` })] },
          ],
        },
      ],
    },

    /* ═════════════════════════ 2017 ═════════════════════════ */
    {
      id: "2017", title: "1. ZH — 2017 ősz", source: "Csercsik Dávid, megoldókulccsal",
      tasks: [
        {
          title: "Négy dobás két kockával", topic: "eloszl",
          text: R`Négyszer dobok két kockával (egy piros és egy fehér). Mi az esélye, hogy a 4 dobásból legalább 2-szer lesz az összeg 9?`,
          parts: [
            { label: "p = P(összeg 9)", ans: 1 / 9, pts: 2 },
            { label: "P(legalább 2-szer)", ans: p17, pts: 2 },
          ],
          hint: R`Először egy dobásra: $p=P(\text{összeg }9)$ (36 egyformán valószínű eset). Utána a 4 független dobásból a 9-esek száma binomiális.`,
          steps: [
            { t: "Egy dobás", b: R`A két kocka 36 egyformán valószínű kimenetele közül a 9-es összeg: $3+6,\ 4+5,\ 5+4,\ 6+3$, tehát $p=\frac4{36}=\frac19$.`,
              figs: () => [figDice({ hl: (i, j) => i + j === 9, a: "piros kocka", b: "fehér kocka", title: "A 9-es összegű cellák" })] },
            { t: "Binomiális eloszlás", b: R`$X$ = a 9-esek száma a 4 dobásban, $X\sim\text{Bin}(4;\frac19)$. $$P(X\ge2)=\binom42\Big(\frac19\Big)^2\Big(\frac89\Big)^2+\binom43\Big(\frac19\Big)^3\frac89+\Big(\frac19\Big)^4=\frac{417}{6561} ${approx(p17)}$$ (Ugyanez komplementerrel: $1-P(X=0)-P(X=1)$.)`,
              figs: () => [figBars({ xs: range(0, 4), ps: range(0, 4).map((k) => binPmf(4, 1 / 9, k)), hl: (x) => x >= 2, title: R`$\text{Bin}(4;\frac19)$ — kiemelve $X\ge2$` })] },
          ],
        },
        {
          title: "Igaz vagy hamis? (elmélet)", topic: "elmelet",
          text: R`${IH_INTRO}
            <br>(a) $(\Omega,\mathfrak F)$ mérhető tér, $\Omega$ véges sok valós számot tartalmaz (nem üres), $f:\Omega\to\mathbb R$. Igaz-e, hogy ha $f$ az identitás, akkor $f$ mindig mérhető?
            <br>(b) $(\Omega,\mathfrak F,P)$ valószínűségi mező, $\xi\gt0$ valószínűségi változó. Igaz-e, hogy $A\gt0$ esetén $\frac{P(\xi\gt A)\,A}{E(\xi)}\le1$?
            <br>(c) Egy diák vizsgázik: 10 tétel van, a 6-os sorszámút nem tudja, a többit igen. A tanár két „tételhúzási” módszert ajánl: egy 10 oldalú kockával dob, vagy 3 db (megkülönböztethető) 4 oldalú kockával dob, és az összegből levon 2-t. Igaz-e, hogy érdemes a diáknak egyik vagy másik módszert preferálnia?
            <br>(d) $\Omega=\{A,B\}$, $\mathfrak F=2^\Omega$, $\mu(\emptyset)=c_1$, $\mu(\{A\})=\mu(\{B\})=c_2$, $\mu(\{A,B\})=c_3$ ($c_i\in\mathbb R$). Igaz-e, hogy megválaszthatók a $c_1,c_2,c_3$ értékek úgy, hogy $\mu$ valószínűségi mérték legyen?`,
          parts: [
            { label: "(a)", choices: IH, ans: 1, pts: 2 },
            { label: "(b)", choices: IH, ans: 0, pts: 2 },
            { label: "(c)", choices: IH, ans: 0, pts: 2 },
            { label: "(d)", choices: IH, ans: 0, pts: 2 },
          ],
          hint: R`(a) Mérhető: minden Borel-halmaz ősképe $\mathfrak F$-ben van — keress „szegény” $\mathfrak F$-et. (b) Markov-egyenlőtlenség. (c) Számold ki, mennyi eséllyel jön ki a 6 a második módszerrel. (d) Axiómák: $\mu(\emptyset)=0$, $\mu(\Omega)=1$, additivitás.`,
          steps: [
            { t: "(a) Hamis", b: R`Ellenpélda: $\Omega=\{1,2\}$, $\mathfrak F=\{\emptyset,\Omega\}$. A $[\frac12;\frac32]$ Borel-halmaz ősképe az identitásnál $\{1\}$, ami nincs $\mathfrak F$-ben, tehát $f$ nem mérhető.` },
            { t: "(b) Igaz", b: R`Ez a Markov-egyenlőtlenség: nemnegatív $\xi$-re és $A\gt0$-ra $P(\xi\ge A)\le\frac{E(\xi)}{A}$, és $P(\xi\gt A)\le P(\xi\ge A)$. Átrendezve $\frac{P(\xi\gt A)\,A}{E(\xi)}\le1$.` },
            { t: "(c) Igaz", b: R`10 oldalú kockával $P(6)=\frac1{10}$. Három 4 oldalúval az eredmény $S-2$, ahol $S\in\{3,\dots,12\}$; a 6-os tétel $S=8$-nál jön ki. A $4^3=64$ egyformán valószínű kimenetelből 12 adja a 8-at (pl. 2+2+4, 3+3+2, 1+3+4 és ezek sorrendjei), így $P=\frac{12}{64}=0{,}1875\gt0{,}1$. Tehát érdemes különbséget tenni: a 10 oldalú kocka a jobb.`,
              figs: () => [figBars({ xs: range(1, 10), ps: d4.map((c) => c / 64), hl: (x) => x === 6, ref: { y: 0.1, label: "10 oldalú kocka: 0,1" }, xlabel: "tétel", title: "A második módszer eloszlása (S − 2)", caption: "A középső tételek sokkal gyakrabban jönnek ki — épp a 6-os is." })] },
            { t: "(d) Igaz", b: R`Valószínűségi mérték: $\mu(\emptyset)=0$, $\mu(\Omega)=1$, és kizáró halmazokra additív: $\mu(\{A\})+\mu(\{B\})=\mu(\{A,B\})$. Ezek teljesülnek, ha $c_1=0$, $c_2=0{,}5$, $c_3=1$.` },
          ],
        },
        {
          title: "Három nyomtató (Bayes)", topic: "bayes",
          text: R`Egy irodában 3 nyomtató van, ugyanazon okirat nyomtatására. Az első naponta 10 példányt nyomtat, a második 15-öt, a harmadik 25-öt. Átlagosan hibás (darab/nap): az első gép esetében 0,3, a másodiknál 0,9, a harmadiknál 0,5. Az egész napi mennyiségből találomra kiveszünk egy példányt, és hibásnak találjuk. Mennyi a valószínűsége, hogy az első gép készítette?`,
          parts: [
            { label: "P(hibás)", ans: 0.034, pts: 2 },
            { label: "P(1. gép | hibás)", ans: 0.006 / 0.034, pts: 3 },
          ],
          hint: R`$P(B_i)$ a napi mennyiségek aránya (10, 15, 25 az 50-ből). A hibaarány: átlagos hibás darab / nyomtatott darab. Teljes valószínűség, majd Bayes.`,
          steps: [
            { t: "A fa adatai", b: R`$B_i$: az $i$-edik gép nyomtatta. $P(B_1)=\frac{10}{50}=0{,}2$, $P(B_2)=\frac{15}{50}=0{,}3$, $P(B_3)=\frac{25}{50}=0{,}5$.
              <br>Hibaarányok: $P(A\mid B_1)=\frac{0{,}3}{10}=0{,}03$, $P(A\mid B_2)=\frac{0{,}9}{15}=0{,}06$, $P(A\mid B_3)=\frac{0{,}5}{25}=0{,}02$.`,
              figs: () => [figTree({ title: "Valószínűségi fa", branches: [[0.2, 0.03], [0.3, 0.06], [0.5, 0.02]].map(([p, q], i) => ({ label: `${i + 1}. gép`, p: fmt(p), children: [{ label: "hibás", p: fmt(q), value: "= " + fmt(p * q, 4), hl: i === 0 }, { label: "jó", p: fmt(1 - q) }] })) })] },
            { t: "Teljes valószínűség", b: R`$P(A)=0{,}2\cdot0{,}03+0{,}3\cdot0{,}06+0{,}5\cdot0{,}02=0{,}006+0{,}018+0{,}01=0{,}034$` },
            { t: "Bayes", b: R`$$P(B_1\mid A)=\frac{0{,}006}{0{,}034}=\frac{3}{17} ${approx(0.006 / 0.034)}$$` },
          ],
        },
        {
          title: "Golyók: 4 piros, 3 fehér", topic: "valvalt",
          text: R`Egy dobozban 4 piros és 3 fehér golyó van. (a) Mi a valószínűsége, hogy 3 kihúzott golyóból 1 fehér? (b) Visszatevés nélkül húzunk, amíg pirosat nem kapunk. Legyen $Y$ a húzások száma. Adjuk meg $Y$ eloszlását!`,
          parts: [
            { label: "(a) P(1 fehér)", ans: 18 / 35, pts: 3 },
            { label: "(b) P(Y = 1)", ans: 4 / 7, pts: 0.75 },
            { label: "(b) P(Y = 2)", ans: 2 / 7, pts: 0.75 },
            { label: "(b) P(Y = 3)", ans: 4 / 35, pts: 0.75 },
            { label: "(b) P(Y = 4)", ans: 1 / 35, pts: 0.75 },
          ],
          hint: R`(a) Hipergeometriai ($N=7$, $K=3$ fehér, $n=3$). (b) Szorzási szabály; legfeljebb 3 fehér jöhet előbb.`,
          steps: [
            { t: "(a) Hipergeometriai", b: R`$$P=\frac{\binom31\binom42}{\binom73}=\frac{3\cdot6}{35}=\frac{18}{35} ${approx(18 / 35)}$$` },
            { t: "(b) Y eloszlása", b: R`$P(Y=1)=\frac47$, $P(Y=2)=\frac37\cdot\frac46=\frac27$, $P(Y=3)=\frac37\cdot\frac26\cdot\frac45=\frac4{35}$, $P(Y=4)=\frac37\cdot\frac26\cdot\frac15\cdot1=\frac1{35}$. Összegük 1 ✓. (Bónusz: $E(Y)=\frac{56}{35}=1{,}6$.)`,
              figs: () => [figBars({ xs: [1, 2, 3, 4], ps: [4 / 7, 2 / 7, 4 / 35, 1 / 35], title: "Y eloszlása" }), figStepCDF({ xs: [1, 2, 3, 4], ps: [4 / 7, 2 / 7, 4 / 35, 1 / 35], title: R`Y eloszlásfüggvénye, $F(x)=P(Y\lt x)$` })] },
          ],
        },
        {
          title: "A kalóz zsákmánya", topic: "valvalt",
          text: R`Sándor, a déltengeri kalóz vitorlás hajókat fosztogat. A zsákmány értéke (aranytallérban) a hajótípustól függ: halászhajó 50, karavella 150, galleon 320, fregatt 500. Egy nap legfeljebb egy hajóval találkozik; a hajótípusok feltűnési gyakorisága: halászhajó $\frac5{10}$, karavella $\frac2{10}$, galleon $\frac16$, fregatt $\frac2{30}$. Mi lesz Sándor napi zsákmányának várható értéke és szórása?`,
          parts: [
            { label: "E(ξ)", ans: lootE, pts: 2 },
            { label: "D(ξ)", ans: Math.sqrt(lootE2 - lootE * lootE), pts: 2 },
          ],
          hint: R`Add össze a gyakoriságokat: ha nem 1, a maradék az az eset, amikor nem jön hajó (zsákmány 0). Utána $E=\sum x_ip_i$, $D^2=E(\xi^2)-E^2(\xi)$.`,
          steps: [
            { t: "A csapda: nem 1 az összeg", b: R`$\frac{15}{30}+\frac6{30}+\frac5{30}+\frac2{30}=\frac{28}{30}$, tehát $\frac2{30}$ valószínűséggel <b>nem jön hajó</b>: ekkor a zsákmány 0.`,
              figs: () => [figBars({ xs: loot.v, ps: loot.p, xlabel: "zsákmány", title: "A napi zsákmány eloszlása (a 0 a „nincs hajó” eset)", labelAll: true })] },
            { t: "Várható érték", b: R`$$E(\xi)=0\cdot\frac2{30}+50\cdot\frac{15}{30}+150\cdot\frac6{30}+320\cdot\frac5{30}+500\cdot\frac2{30}=\frac{4250}{30} ${approx(lootE)}$$` },
            { t: "Szórás", b: R`$E(\xi^2)=50^2\cdot\frac{15}{30}+150^2\cdot\frac6{30}+320^2\cdot\frac5{30}+500^2\cdot\frac2{30} ${approx(lootE2)}$
              <br>$D^2(\xi)=E(\xi^2)-E^2(\xi) ${approx(lootE2 - lootE * lootE)}$, &nbsp; $D(\xi) ${approx(Math.sqrt(lootE2 - lootE * lootE))}$` },
          ],
        },
        {
          title: "Telefonközpont (Poisson)", topic: "eloszl",
          text: R`Egy telefonközpontba egy óra alatt 0,04 valószínűséggel nem fut be hívás. Átlagosan hány hívás fut be egy óra alatt?`,
          parts: [{ label: "λ", ans: -Math.log(0.04), pts: 3 }],
          hint: R`Poisson: $P(X=0)=e^{-\lambda}$, és a várható érték $\lambda$.`,
          steps: [{ t: "Poisson", b: R`$P(X=0)=e^{-\lambda}=0{,}04\Rightarrow\lambda=-\ln0{,}04 ${approx(-Math.log(0.04))}$, ami egyben a várható érték.` }],
        },
      ],
    },

    /* ═════════════════════════ 2018 ═════════════════════════ */
    {
      id: "2018", title: "1. ZH — 2018 ősz", source: "megoldókulccsal",
      tasks: [
        {
          title: "Szerencsekerék", topic: "bayes",
          text: R`A szerencsekerék egyszerűsített változatát játsszuk: a kerék 6 egyforma mezőre van osztva, ebből 2 egymás melletti „−” jelű, a többi „+” jelű. Egy pörgetés után nem látjuk a kerék állapotát. Kétfordulós játékot játszunk: akkor kapjuk meg a nyereményt, ha mindkétszer „+” mezőt kapunk.
            <br>(a) Az első pörgetés után két lehetőség közül választhatsz: (a) elfogadod a kisorsolt mezőt és az azt közvetlenül követő mezőt; (b) elfogadod a kisorsolt mezőt, majd újrapörgeted a kereket, és az azután kiadódó mezőt kapod másodiknak. Melyiket választod?
            <br>(b) Tegyük fel, hogy az első pörgetés eredménye „+” mező, és (akármit is választottál) a második választás előtt újrapörgethetsz. Megteszed vagy nem?
            <br>(c) A játékosok átlagosan 0,45-öd része választja az (a) stratégiát. Ha tudomásunkra jut, hogy az előző játékos nyert, mi a valószínűsége, hogy az (a) stratégiát választotta?`,
          parts: [
            { label: "(a) melyiket?", choices: ["Az (a) lehetőséget", "A (b) lehetőséget"], ans: 0, pts: 1 },
            { label: "(a) P(nyer | a)", ans: 0.5, pts: 0.5 },
            { label: "(a) P(nyer | b)", ans: 4 / 9, pts: 0.5 },
            { label: "(b) újrapörgetsz?", choices: ["Nem pörgetek újra", "Újrapörgetek"], ans: 0, pts: 1 },
            { label: "(b) P(nyer | nem pörget)", ans: 0.75, pts: 0.5 },
            { label: "(b) P(nyer | újrapörget)", ans: 2 / 3, pts: 0.5 },
            { label: "(c) P(a | nyert)", ans: 0.225 / (0.225 + (4 / 9) * 0.55), pts: 4 },
          ],
          hint: R`Számozd meg a mezőket (a két „−” legyen az 1. és 2.). Nézd végig, honnan indulva nyer az (a) stratégia. A (c) Bayes: $P(\text{nyer}\mid a)$ és $P(\text{nyer}\mid b)$ az (a) részből jön.`,
          steps: [
            { t: "A kerék", b: R`Az általánosság megszorítása nélkül a két „−” az 1. és 2. mező, a „+” mezők: 3, 4, 5, 6.`,
              figs: () => [figWheel({ labels: ["−", "−", "+", "+", "+", "+"], title: "A kerék: 1–2. mező „−”, 3–6. mező „+”" })] },
            { t: "(a) A két stratégia", b: R`<b>(a) stratégia</b> (kisorsolt + következő mező): nyer, ha a kerék a 3-as, 4-es vagy 5-ös mezőn áll (3→4, 4→5, 5→6 mind „+ +”; a 6→1 már „−”). $P=\frac36=\frac12$.
              <br><b>(b) stratégia</b> (két független pörgetés): $P=\frac46\cdot\frac46=\frac49$.
              <br>$\frac12\gt\frac49$, tehát az <b>(a)</b>-t érdemes választani.` },
            { t: "(b) Már tudjuk, hogy az első „+”", b: R`A kerék a 3., 4., 5. vagy 6. mezőn áll (egyformán valószínű). Ha nem pörgetünk újra, a következő mező „+”, ha 3, 4 vagy 5: $\frac34$. Újrapörgetve: $\frac46=\frac23$. Mivel $\frac34\gt\frac23$, <b>nem</b> érdemes újrapörgetni.` },
            { t: "(c) Bayes", b: R`$T$: nyert. $P(T\mid a)=\frac12$, $P(T\mid b)=\frac49$, $P(a)=0{,}45$, $P(b)=0{,}55$. $$P(a\mid T)=\frac{\frac12\cdot0{,}45}{\frac12\cdot0{,}45+\frac49\cdot0{,}55} ${approx(0.225 / (0.225 + (4 / 9) * 0.55))}$$`,
              figs: () => [figTree({ title: "Valószínűségi fa", branches: [{ label: "(a) str.", p: "0,45", children: [{ label: "nyer", p: "1/2", value: "= 0,225", hl: true }, { label: "veszít", p: "1/2" }] }, { label: "(b) str.", p: "0,55", children: [{ label: "nyer", p: "4/9", value: "≈ 0,2444" }, { label: "veszít", p: "5/9" }] }] })] },
          ],
        },
        {
          title: "Nem fejezi be a ZH-t (binomiális)", topic: "eloszl",
          text: R`Egy ZH beadásakor átlagosan 10-ből 1 ember nem fejezi be az írást, amikor a felszólítás elhangzik. Ha 7-en írnak ZH-t, mi a valószínűsége, hogy legalább 2 ember nem hagyja abba az írást az idő lejártával?`,
          parts: [{ label: "P(legalább 2)", ans: 1 - 0.9 ** 7 - 7 * 0.1 * 0.9 ** 6, pts: 3 }],
          hint: R`7 független ember, mindegyik 0,1 eséllyel „nem hagyja abba” → $\text{Bin}(7;\,0{,}1)$. „Legalább 2” = 1 − (0 vagy 1).`,
          steps: [{ t: "Binomiális, komplementerrel", b: R`$$P(X\ge2)=1-\binom70 0{,}1^0\,0{,}9^7-\binom71 0{,}1^1\,0{,}9^6 ${approx(1 - 0.9 ** 7 - 7 * 0.1 * 0.9 ** 6)}$$`,
            figs: () => [figBars({ xs: range(0, 7), ps: range(0, 7).map((k) => binPmf(7, 0.1, k)), hl: (x) => x >= 2, title: R`$\text{Bin}(7;\,0{,}1)$ — kiemelve $X\ge2$` })] }],
        },
        {
          title: "Eloszlásfüggvény leolvasása ábráról", topic: "valvalt",
          text: R`Az alábbi ábra egy $\xi$ valószínűségi változó eloszlásfüggvényét ábrázolja. Mi a következő esemény valószínűsége: $\{\xi\lt3{,}3$ vagy $\xi\gt4{,}7\}$?`,
          textFigs: () => [figStepCDF({ xs: [3, 4, 5], ps: [1 / 3, 1 / 3, 1 / 3], ylabels: ["0", "1/3", "2/3", "1"] })],
          parts: [{ label: "P", ans: 2 / 3, pts: 2 }],
          hint: R`Az ugrások helye a lehetséges értékek, az ugrások nagysága a valószínűségük.`,
          steps: [
            { t: "Az eloszlás leolvasása", b: R`Az ugrások: $3$-nál, $4$-nél és $5$-nél, mindegyik $\frac13$. Tehát $P(\xi=3)=P(\xi=4)=P(\xi=5)=\frac13$.`,
              figs: () => [figBars({ xs: [3, 4, 5], ps: [1 / 3, 1 / 3, 1 / 3], hl: (x) => x !== 4, title: "ξ eloszlása (kiemelve a kedvező értékek)" })] },
            { t: "Az esemény", b: R`$\xi\lt3{,}3$ csak $\xi=3$ esetén, $\xi\gt4{,}7$ csak $\xi=5$ esetén teljesül; kizárók, így $P=\frac13+\frac13=\frac23$.` },
          ],
        },
        {
          title: "Röpzh: először a 3. héten 0 pont (geometriai)", topic: "eloszl",
          text: R`Tegyük fel, hogy annak az esélye, hogy valaki 0 pontot ír egy röpzh-n, egy az ötödhöz. Mi ezek szerint annak a valószínűsége, hogy valaki először a 3. héten ír 0 pontot?`,
          parts: [{ label: "P", ans: 0.8 ** 2 * 0.2, pts: 3 }],
          hint: R`„Először a 3. héten”: az első sikerig tartó próbák száma → geometriai, $p=0{,}2$.`,
          steps: [{ t: "Geometriai eloszlás", b: R`$P(X=3)=(1-p)^2p=0{,}8^2\cdot0{,}2=0{,}128$: két hétig nem 0 pont, a harmadikon igen.`,
            figs: () => [figBars({ xs: range(1, 8), ps: range(1, 8).map((k) => 0.8 ** (k - 1) * 0.2), hl: (x) => x === 3, title: R`$\text{Geo}(0{,}2)$ — kiemelve $k=3$` })] }],
        },
        {
          title: "Bliccelők a trolin (Poisson)", topic: "eloszl",
          text: R`A 83-as trolin átlagosan 0,3 bliccelő van. Mi a valószínűsége, hogy egy adott járművön mindenkinek van jegye?`,
          parts: [{ label: "P(nincs bliccelő)", ans: Math.exp(-0.3), pts: 2 }],
          hint: R`Ritka esemény, adott átlaggal → Poisson, $\lambda=0{,}3$; „mindenkinek van jegye” = 0 bliccelő.`,
          steps: [{ t: "Poisson", b: R`$P(X=0)=\frac{0{,}3^0}{0!}e^{-0{,}3}=e^{-0{,}3} ${approx(Math.exp(-0.3))}$` }],
        },
        {
          title: "Dominók", topic: "kombi",
          text: R`Az európai dominóban 28 különböző dominó található. Egy dominó két részre van osztva, mindkét felén 0, 1, …, 6 pont lehet. Egy készletben 7 „dupla” dominó van (a két oldalon ugyanannyi pont). (a) Miért pont 28 az összes lehetséges dominó száma? (Kombinatorikai megfontolást kérünk.) (b) A játék kezdetekor egy játékos 7 dominót kap. Mi az esélye, hogy pontosan 2 dupla dominó van a 7 között?`,
          parts: [
            { label: "(a) dominók száma", ans: 28, pts: 3 },
            { label: "(b) P(2 dupla)", ans: (binom(7, 2) * binom(21, 5)) / binom(28, 7), pts: 3 },
          ],
          hint: R`(a) 7-féle számot teszünk 2 helyre, a sorrend nem számít, ismétlés lehet. (b) 28-ból 7-et kap visszatevés nélkül, ebből 7 dupla → hipergeometriai.`,
          steps: [
            { t: "(a) Ismétléses kombináció", b: R`Egy dominó egy (rendezetlen) számpár a $\{0,\dots,6\}$ halmazból, ismétlés megengedett: $\binom{7+2-1}{2}=\binom82=28$.
              <br>Ellenőrzés másképp: 7 dupla + $\binom72=21$ különböző számpár $=28$.` },
            { t: "(b) Hipergeometriai", b: R`$N=28$, $K=7$ dupla, $n=7$: $$P(X=2)=\frac{\binom72\binom{21}5}{\binom{28}7}=\frac{21\cdot20\,349}{1\,184\,040} ${approx((binom(7, 2) * binom(21, 5)) / binom(28, 7))}$$`,
              figs: () => [figBars({ xs: range(0, 7), ps: range(0, 7).map((k) => hypPmf(28, 7, 7, k)), hl: (x) => x === 2, title: "A kapott duplák számának eloszlása" })] },
            { t: "Megjegyzés", note: true, b: R`A hivatalos megoldásban $P(\xi=1)$ szerepel, de a képlet és a 0,3609 a $P(\xi=2)$-höz tartozik — elírás.` },
          ],
        },
        {
          title: "Igaz vagy hamis? (elmélet)", topic: "elmelet",
          text: R`${IH_INTRO}
            <br>(a) $\Omega=\{🐶, 🐱, 🐰, 🐷\}$. Igaz-e, hogy ha $\mathfrak F=2^\Omega$, akkor minden $f:\Omega\to\mathbb R$ mérhető?
            <br>(b) Ugyanez az $\Omega$. Igaz-e, hogy ha $\mathfrak F=\{\Omega,\emptyset\}$, akkor nem létezik mérhető $f:\Omega\to\mathbb R$?
            <br>(c) $\Omega=\{A,B\}$, $\mathfrak F=2^\Omega$, $\mu:\mathfrak F\to\mathbb R$, $\mu(\emptyset)=0$, $\mu(\{A\})=0{,}3$, $\mu(\{B\})=c_1$, $\mu(\{A,B\})=c_2$. Igaz-e, hogy megválaszthatók $c_1,c_2$ úgy, hogy $\mu$ valószínűségi mérték legyen?`,
          parts: [
            { label: "(a)", choices: IH, ans: 0, pts: 2 },
            { label: "(b)", choices: IH, ans: 1, pts: 2 },
            { label: "(c)", choices: IH, ans: 0, pts: 2 },
          ],
          hint: R`Mérhető: minden Borel-halmaz ősképe $\mathfrak F$-ben van. A konstans függvényre gondolj!`,
          steps: [
            { t: "(a) Igaz", b: R`Bármely Borel-halmaz ősképe $\Omega$ egy részhalmaza, és $2^\Omega$ az összes részhalmazt tartalmazza, tehát minden $f$ mérhető.` },
            { t: "(b) Hamis", b: R`Ellenpélda: a konstans 0 függvény. Egy Borel-halmaz ősképe vagy $\Omega$ (ha tartalmazza a 0-t), vagy $\emptyset$ — mindkettő $\mathfrak F$-ben van, tehát mérhető.` },
            { t: "(c) Igaz", b: R`$c_1=0{,}7$ és $c_2=1$: ekkor $\mu(\emptyset)=0$, $\mu(\Omega)=1$ és $\mu(\{A\})+\mu(\{B\})=\mu(\{A,B\})$.` },
          ],
        },
      ],
    },

    /* ═════════════════════════ 2022 (fotó) ═════════════════════════ */
    {
      id: "2022", title: "1. ZH — 2022", source: "fotó alapján, a pontozás becsült",
      tasks: [
        {
          title: "Gumicukrok (binomiális)", topic: "eloszl",
          text: R`Huba vett egy doboz gumicukrot, amelynek 35%-a piros színű, a többi lila. Véletlenszerűen kiválaszt 4 cukrot. Mennyi annak a valószínűsége, hogy egynél több piros cukor lesz a kiválasztottak között? Írja és rajzolja fel a piros cukrok számának eloszlásfüggvényét! Mennyi a piros cukrok számának várható értéke?`,
          parts: [
            { label: "P(X > 1)", ans: 1 - huba[0] - huba[1], pts: 3 },
            { label: "F(1) = P(X < 1)", ans: huba[0], pts: 1 },
            { label: "F(2,5)", ans: huba[0] + huba[1] + huba[2], pts: 1 },
            { label: "E(X)", ans: 1.4, pts: 2 },
          ],
          hint: R`Csak az arány (35%) adott, a doboz „nagy” → a 4 húzás közel független: $\text{Bin}(4;\,0{,}35)$. Az eloszlásfüggvénynél figyelj: $F(x)=P(X\lt x)$.`,
          steps: [
            { t: "Modell", b: R`$X$ = a piros cukrok száma, $X\sim\text{Bin}(4;\,0{,}35)$ (a doboz nagy, csak az arány ismert, így a húzások közel függetlenek).
              <br>$P(X=k)=\binom4k0{,}35^k\,0{,}65^{4-k}$: ${huba.map((p, k) => R`$P(${k}) ${approx(p)}$`).join(", ")}.` },
            { t: "Egynél több piros", b: R`$P(X\gt1)=1-P(0)-P(1)=1-0{,}65^4-4\cdot0{,}35\cdot0{,}65^3 ${approx(1 - huba[0] - huba[1])}$`,
              figs: () => [figBars({ xs: range(0, 4), ps: huba, hl: (x) => x > 1, title: R`$\text{Bin}(4;\,0{,}35)$ — kiemelve $X\gt1$` })] },
            { t: "Eloszlásfüggvény", b: R`$F(x)=P(X\lt x)$ — lépcsős, balról folytonos:
              $$F(x)=\begin{cases}0, & x\le0\\ ${tn(huba[0], 4)}, & 0\lt x\le1\\ ${tn(huba[0] + huba[1], 4)}, & 1\lt x\le2\\ ${tn(huba[0] + huba[1] + huba[2], 4)}, & 2\lt x\le3\\ ${tn(1 - huba[4], 4)}, & 3\lt x\le4\\ 1, & x\gt4\end{cases}$$
              Például $F(1)=P(X\lt1)=P(X=0)$ — az 1-nél még az ugrás előtti érték!`,
              figs: () => [figStepCDF({ xs: range(0, 4), ps: huba, title: R`$F(x)=P(X\lt x)$` })] },
            { t: "Várható érték", b: R`Binomiálisnál $E(X)=np=4\cdot0{,}35=1{,}4$.` },
          ],
        },
        {
          title: "Csoportok és lányok (Bayes)", topic: "bayes",
          text: R`A hallgatók 30%-a A csoportot, 45%-a B csoportot, a többiek C csoportot írnak a vizsgán. Az A csoportot írók 60%-a, a B csoportot írók 80%-a, a C csoportot írók 25%-a lány. Mennyi annak a valószínűsége, hogy egy tetszőlegesen kiválasztott hallgató lány? Mennyi a valószínűsége, hogy C csoportot ír, feltéve, hogy lány?`,
          parts: [
            { label: "P(lány)", ans: 0.6025, pts: 3 },
            { label: "P(C | lány)", ans: 0.0625 / 0.6025, pts: 3 },
          ],
          hint: R`Fa-diagram: csoport → lány / fiú. Teljes valószínűség, majd Bayes. A C csoport aránya $1-0{,}3-0{,}45$.`,
          steps: [
            { t: "Fa-diagram", b: R`$P(C)=1-0{,}3-0{,}45=0{,}25$.`,
              figs: () => [figTree({ title: "Valószínűségi fa", branches: [[0.3, 0.6], [0.45, 0.8], [0.25, 0.25]].map(([p, q], i) => ({ label: "ABC"[i], p: fmt(p), children: [{ label: "lány", p: fmt(q), value: "= " + fmt(p * q, 4), hl: i === 2 }, { label: "fiú", p: fmt(1 - q) }] })) })] },
            { t: "Teljes valószínűség", b: R`$P(L)=0{,}3\cdot0{,}6+0{,}45\cdot0{,}8+0{,}25\cdot0{,}25=0{,}18+0{,}36+0{,}0625=0{,}6025$` },
            { t: "Bayes", b: R`$$P(C\mid L)=\frac{0{,}25\cdot0{,}25}{0{,}6025}=\frac{0{,}0625}{0{,}6025} ${approx(0.0625 / 0.6025)}$$` },
          ],
        },
        {
          title: "Két kocka, összeg 10-nél nagyobb", topic: "klassz",
          text: R`Két kockával dobva mennyi a valószínűsége annak, hogy a dobott számok összege 10-nél nagyobb?`,
          parts: [{ label: "P(összeg > 10)", ans: 1 / 12, pts: 2 }],
          hint: R`36 egyformán valószínű (rendezett) eset; számold meg, hol nagyobb az összeg 10-nél.`,
          steps: [{ t: "Klasszikus valószínűség", b: R`Kedvező: $5+6$, $6+5$, $6+6$ — 3 eset a 36-ból: $P=\frac3{36}=\frac1{12} ${approx(1 / 12)}$. (Vigyázz: az 5+6 és a 6+5 két különböző eset!)`,
            figs: () => [figDice({ hl: (i, j) => i + j > 10, title: "A 10-nél nagyobb összegű cellák" })] }],
        },
        {
          title: "Mazsolás kalács (Poisson)", topic: "eloszl",
          text: R`Egy pékségben szeletelt mazsolás kalácsot készítenek. Minden negyedik szeletben nincs mazsola. Mennyi annak a valószínűsége, hogy egy véletlenszerűen kiválasztott szelet kalácsban két mazsola van?`,
          parts: [
            { label: "λ", ans: l22, pts: 1 },
            { label: "P(X = 2)", ans: (l22 * l22) / 2 * 0.25, pts: 3 },
          ],
          hint: R`A mazsolák száma egy szeletben Poisson. „Minden negyedikben nincs” = $P(X=0)=\frac14$, ebből $\lambda$.`,
          steps: [
            { t: "λ meghatározása", b: R`$P(X=0)=e^{-\lambda}=\frac14\Rightarrow\lambda=\ln4 ${approx(l22)}$.` },
            { t: "Két mazsola", b: R`$$P(X=2)=\frac{\lambda^2}{2!}e^{-\lambda}=\frac{(\ln4)^2}{2}\cdot\frac14 ${approx((l22 * l22) / 8)}$$`,
              figs: () => [figBars({ xs: range(0, 7), ps: range(0, 7).map((k) => poiPmf(l22, k)), hl: (x) => x === 2, title: R`$\text{Poisson}(\ln4)$ — kiemelve $X=2$` })] },
          ],
        },
        {
          title: "Sűrűségfüggvény paramétere", topic: "folyt",
          text: R`<span class="warn-inline">A fotón a függvény nem látszik, ezért egy azonos típusú gyakorló függvényt adunk meg.</span> Határozzuk meg az $A$ paraméter értékét úgy, hogy az $f(x)=A\,x(2-x)$, ha $0\lt x\lt2$ (máshol 0) függvény sűrűségfüggvény legyen, és írjuk fel a hozzá tartozó eloszlásfüggvényt! Mennyi $F(1)$ és $P(0{,}5\lt X\lt1{,}5)$?`,
          parts: [
            { label: "A", ans: 0.75, pts: 2 },
            { label: "F(1)", ans: 0.5, pts: 1 },
            { label: "P(0,5 < X < 1,5)", ans: 0.6875, pts: 2 },
          ],
          hint: R`$\int_0^2 A\,x(2-x)\,dx=1$. $f\ge0$ a $(0;2)$-n, ha $A\gt0$. $F(x)=\int_0^x f(t)\,dt$ a tartományon.`,
          steps: [
            { t: "A paraméter", b: R`$\int_0^2(2x-x^2)dx=\Big[x^2-\frac{x^3}3\Big]_0^2=4-\frac83=\frac43$, így $A=\frac34$. (És $x(2-x)\ge0$ a $(0;2)$-n ✓.)` },
            { t: "Eloszlásfüggvény", b: R`$$F(x)=\begin{cases}0, & x\le0\\ \frac34\Big(x^2-\frac{x^3}3\Big)=\frac{3x^2-x^3}{4}, & 0\lt x\le2\\ 1, & x\gt2\end{cases}$$ $F(1)=\frac{3-1}4=\frac12$ (szimmetria miatt is).`,
              figs: () => [figCurve({ f: (x) => (x <= 0 ? 0 : x <= 2 ? (3 * x * x - x ** 3) / 4 : 1), x0: -0.5, x1: 2.5, ymaxHint: 1.15, title: "Az eloszlásfüggvény" })] },
            { t: "Valószínűség", b: R`$P(0{,}5\lt X\lt1{,}5)=F(1{,}5)-F(0{,}5)=\frac{6{,}75-3{,}375}{4}-\frac{0{,}75-0{,}125}{4}=0{,}6875$`,
              figs: () => [figCurve({ f: (x) => (x > 0 && x < 2 ? 0.75 * x * (2 - x) : 0), x0: -0.3, x1: 2.3, breaks: [0, 2], shade: { a: 0.5, b: 1.5, label: "0,6875" }, title: R`A sűrűségfüggvény; satírozva $P(0{,}5\lt X\lt1{,}5)$` })] },
          ],
        },
      ],
    },
  ];
})();

/* ───────── véletlen próba-ZH a számolós feladatok generátoraiból ───────── */
const RANDOM_ZH_SLOTS = [
  ["lotto", "kockaosszeg", "kocka6", "egymasmellett", "urna"],
  ["teljes3", "bayes2", "gepall"],
  ["amig", "tabla", "busz"],
  ["binom", "pistike", "hipergeo"],
  ["geo", "poisson", "poisinv", "kulcs"],
  ["poli", "pareto", "exp_alap", "normalis", "egyenletes", "exp_min"],
];
function buildRandomExam() {
  const tasks = RANDOM_ZH_SLOTS.map((slot) => {
    const id = rnd.pick(slot);
    const pr = PROBLEMS.find((p) => p.id === id);
    const b = pr.build(pr.random());
    return {
      title: pr.title, topic: pr.topic, text: b.text,
      parts: b.parts.map((p) => ({ ...p, pts: 2 })),
      hint: pr.hint || "",
      steps: [
        ...(pr.hint ? [{ t: "Ötlet", b: pr.hint }] : []),
        { t: "Levezetés", b: b.sol, figs: b.figs ? () => b.figs : undefined },
      ],
    };
  });
  return { id: "random", title: "Véletlen próba-ZH", source: "a számolós feladatok generátoraiból, minden indításkor új számokkal", tasks, generated: true };
}
