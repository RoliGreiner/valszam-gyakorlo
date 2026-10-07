/* Kidolgozott (nem generált) példák a Tudástárhoz — főleg az 5. hét elméleti feladatai. */
"use strict";

const EXAMPLES = (() => {
  /* Gy5/4–5: ha a második függvényt a (0;2)-n tekintjük: f = 3/4 (2x − x²) */
  const F45 = (x) => 0.75 * (x * x - (x * x * x) / 3);
  const s45 = Math.sqrt(0.2);
  const p1 = F45(1 + s45) - F45(1 - s45), p2 = F45(Math.min(2, 1 + 2 * s45)) - F45(Math.max(0, 1 - 2 * s45));
  const E2c = 4 / 3 - 1 / (3 * Math.log(3));
  const sin18 = Math.sqrt(Math.PI ** 2 / 4 - 2 - (Math.PI / 2 - 1) ** 2);
  return [
    {
      topic: "folyt", title: "Melyik lehet eloszlásfüggvény?", src: "Gy5/1",
      text: R`(a) $F(x)=1+e^{1-x}$, ha $x\gt-1$; (b) $F(x)=2-\frac{2}{x+1}$, ha $x\ge0$; (c) $F(x)=1-e^{-x}$, ha $x\ge0$; (d) $F(x)=\frac x4(4-x)$, ha $0\lt x\le2$, és $1$, ha $x\gt2$ (máshol mindegyik 0). Mi a sűrűségfüggvény és $E(\xi)$, ahol lehet?`,
      sol: R`Ellenőrizd: $[0,1]$-beli értékek, monoton növő, határértékek 0 és 1, (balról) folytonos.
        <br>(a) <b>Nem</b>: $x\gt-1$-re $1+e^{1-x}\gt1$, ráadásul csökkenő.
        <br>(b) <b>Nem</b>: monoton növő és $F(0)=0$, de $\lim_{x\to\infty}F(x)=2\ne1$.
        <br>(c) <b>Igen</b> (exponenciális, $\lambda=1$): $f(x)=F'(x)=e^{-x}$ ($x\gt0$), $E(\xi)=\int_0^\infty xe^{-x}dx=1$.
        <br>(d) <b>Igen</b>: $F(0)=0$, $F(2)=\frac24\cdot2=1$, folytonos, és $F'(x)=1-\frac x2\ge0$ a $(0;2)$-n. $f(x)=1-\frac x2$ ($0\lt x\lt2$), $$E(\xi)=\int_0^2 x\Big(1-\frac x2\Big)dx=\Big[\frac{x^2}2-\frac{x^3}6\Big]_0^2=2-\frac43=\frac23.$$`,
      figs: () => [
        figCurve({ f: (x) => (x <= 0 ? 0 : x <= 2 ? (x / 4) * (4 - x) : 1), x0: -0.5, x1: 3, ymaxHint: 1.15, title: R`(d) eloszlásfüggvénye: folytonos, 0-ból 1-be nő` }),
        figCurve({ f: (x) => (x > 0 && x < 2 ? 1 - x / 2 : 0), x0: -0.5, x1: 3, breaks: [0, 2], shade: { a: 0, b: 2, label: "terület = 1" }, title: R`(d) sűrűségfüggvénye: $f(x)=1-\frac x2$` }),
      ],
    },
    {
      topic: "folyt", title: "Melyik lehet sűrűségfüggvény?", src: "Gy5/2",
      text: R`(a) $f(x)=\frac2x$, ha $x\gt1$; (b) $f(x)=\frac{\sin x}{2}$, ha $0\lt x\lt2$; (c) $f(x)=3^{x-1}\ln3$, ha $x\le0$, és $\frac13\sin\frac x2$, ha $0\lt x\lt\pi$; (d) $f(x)=2e^{-2x}$, ha $x\gt0$ (máshol mindegyik 0). Ahol lehet, adja meg $F$-et és $E(\xi)$-t!`,
      sol: R`Feltétel: $f\ge0$ és $\int f=1$.
        <br>(a) <b>Nem</b>: $\int_1^\infty\frac2x\,dx=\infty$.
        <br>(b) <b>Nem</b>: $\int_0^2\frac{\sin x}2\,dx=\frac{1-\cos2}{2}\approx0{,}708\ne1$.
        <br>(c) <b>Igen</b>: $\int_{-\infty}^0 3^{x-1}\ln3\,dx=\big[3^{x-1}\big]_{-\infty}^0=\frac13$ és $\int_0^\pi\frac13\sin\frac x2\,dx=\frac13\big[-2\cos\frac x2\big]_0^\pi=\frac23$; összesen 1, és sehol sem negatív.
        $$F(x)=\begin{cases}3^{x-1}, & x\le0\\ 1-\frac23\cos\frac x2, & 0\lt x\lt\pi\\ 1, & x\ge\pi\end{cases}$$
        $E(\xi)=\int_{-\infty}^0 x\,3^{x-1}\ln3\,dx+\int_0^\pi\frac x3\sin\frac x2\,dx=-\frac{1}{3\ln3}+\frac43 ${approx(E2c)}$ (mindkettő parciális integrálással).
        <br>(d) <b>Igen</b> (exponenciális, $\lambda=2$): $F(x)=1-e^{-2x}$ ($x\gt0$), $E(\xi)=\frac12$.`,
      figs: () => [figCurve({ f: (x) => (x <= 0 ? 3 ** (x - 1) * Math.log(3) : x < Math.PI ? Math.sin(x / 2) / 3 : 0), x0: -4, x1: 4.2, breaks: [0, Math.PI], shade: { a: -4, b: 0, label: "1/3" }, xTicks: [-4, -2, 0, 2, { x: Math.PI, t: "π" }], title: R`(c) sűrűségfüggvénye: a bal oldali rész területe $\frac13$, a jobb oldalié $\frac23$` })],
    },
    {
      topic: "folyt", title: "Melyik $c$ mellett sűrűségfüggvény? (csapda)", src: "Gy5/4–5",
      text: R`Lehet-e $f(x)=c\,(2x-x^3)$, illetve $f(x)=c\,(2x-x^2)$ sűrűségfüggvény a $(0;\frac52)$ intervallumon (máshol 0)? Ha igen, mennyi $c$, és mennyi $P(m-\sigma\lt X\lt m+\sigma)$, $P(m-2\sigma\lt X\lt m+2\sigma)$?`,
      sol: R`Először a <b>nemnegativitást</b> nézd, csak utána integrálj!
        <br>$2x-x^3=x(2-x^2)\lt0$, ha $x\gt\sqrt2\approx1{,}41$; és $2x-x^2=x(2-x)\lt0$, ha $x\gt2$. Mindkettő pozitív is és negatív is a $(0;\frac52)$-n, így $c\gt0$ esetén a végén, $c\lt0$ esetén az elején lenne $f$ negatív. <b>Egyik sem lehet sűrűségfüggvény, semmilyen $c$ mellett.</b> (Ha csak integrálnánk, $c=\frac{24}{25}$ jönne ki a második esetben, ami hibás válasz!)
        <br><br>Ha a második függvényt a $(0;2)$ intervallumon tekintjük: $\int_0^2(2x-x^2)dx=\frac43$, így $c=\frac34$. Ekkor $m=1$ (szimmetria), $E(X^2)=\frac34\int_0^2x^2(2x-x^2)dx=1{,}2$, $\sigma^2=0{,}2$, $\sigma ${approx(s45)}$. $F(x)=\frac34\big(x^2-\frac{x^3}3\big)$, így $P(m-\sigma\lt X\lt m+\sigma) ${approx(p1)}$ és $P(m-2\sigma\lt X\lt m+2\sigma) ${approx(p2)}$.`,
      figs: () => [figCurve({ f: (x) => (x > 0 && x < 2.5 ? 2 * x - x * x : 0), x0: -0.3, x1: 2.8, breaks: [0, 2.5], negShade: true, xTicks: [0, 1, 2, { x: 2.5, t: "5/2" }], title: R`$2x-x^2$ a $(0;\frac52)$-n: a piros rész negatív — ez nem lehet sűrűségfüggvény` })],
    },
    {
      topic: "folyt", title: "Várható értékek (létezik-e?)", src: "Gy5/7",
      text: R`Számoljuk ki $E(\xi)$-t, ha (a) $f(x)=\frac14xe^{-x/2}$, $x\gt0$; (b) $f(x)=c(1-x^2)$, $-1\lt x\lt1$; (c) $f(x)=\frac5{x^2}$, $x\gt5$ (máshol 0).`,
      sol: R`(a) $E(\xi)=\frac14\int_0^\infty x^2e^{-x/2}dx=\frac14\cdot2!\cdot2^3=4$ (kétszeri parciális integrálás, vagy $\int_0^\infty x^ne^{-x/a}dx=n!\,a^{n+1}$).
        <br>(b) $\int_{-1}^1(1-x^2)dx=\frac43\Rightarrow c=\frac34$; $f$ páros függvény, $xf(x)$ páratlan, így $E(\xi)=0$.
        <br>(c) $\int_5^\infty x\cdot\frac5{x^2}dx=5\int_5^\infty\frac{dx}x=\infty$: a várható érték <b>nem létezik</b>.`,
    },
    {
      topic: "folyt", title: "Alkatrész élettartama: $f(x)=1/x^2$", src: "Gy5/8",
      text: R`Egy alkatrész napokban mért élettartamának sűrűségfüggvénye $f(x)=\frac1{x^2}$, ha $x\ge1$. Mi a valószínűsége, hogy ha január 26-án hoztuk haza, február 1-jén még működik? Átlagosan mennyi ideig bír?`,
      sol: R`Január 26 → február 1: 6 nap. $F(x)=\int_1^x\frac{dt}{t^2}=1-\frac1x$, így $P(X\gt6)=\frac16\approx0{,}167$.
        <br>$E(X)=\int_1^\infty x\cdot\frac1{x^2}dx=\int_1^\infty\frac{dx}x=\infty$: a várható élettartam <b>nem létezik</b> (végtelen), bár az alkatrész fele már 2 nap után tönkremegy (medián: $1-\frac1m=\frac12\Rightarrow m=2$).`,
      figs: () => [figCurve({ f: (x) => (x >= 1 ? 1 / (x * x) : 0), x0: 0, x1: 10, breaks: [1], shade: { a: 6, b: 10, label: "" }, marks: [{ x: 2, t: "medián" }], title: R`$f(x)=1/x^2$; satírozva $P(X\gt6)=\frac16$ (a farok a végtelenig tart)` })],
    },
    {
      topic: "folyt", title: "Várható érték és szórás eloszlásfüggvényből", src: "Gy5/18",
      text: R`(a) $F(x)=\sin x$, ha $0\lt x\le\frac\pi2$; (b) $F(x)=x^2$, ha $0\lt x\le1$; (c) $F(x)=\frac{x}{x+1}$, ha $x\gt0$ (alatta 0, fölötte 1).`,
      sol: R`Első lépés mindig: $f=F'$.
        <br>(a) $f(x)=\cos x$: $E=\int_0^{\pi/2}x\cos x\,dx=\frac\pi2-1 ${approx(Math.PI / 2 - 1)}$; $E(X^2)=\int_0^{\pi/2}x^2\cos x\,dx=\frac{\pi^2}4-2$; $D ${approx(sin18)}$.
        <br>(b) $f(x)=2x$: $E=\frac23$, $E(X^2)=\frac12$, $D^2=\frac1{18}$, $D ${approx(Math.sqrt(1 / 18))}$.
        <br>(c) $f(x)=\frac1{(x+1)^2}$: $\int_0^\infty\frac{x}{(x+1)^2}dx=\infty$, tehát sem várható érték, sem szórás nem létezik.`,
    },
    {
      topic: "folyt", title: "Várható érték és szórás sűrűségfüggvényből", src: "Gy5/19",
      text: R`(a) $f(x)=\frac1{x^2}$, ha $x\gt1$; (b) $f(x)=\sin x$, ha $0\le x\le\frac\pi2$; (c) $f(x)=\cos x$, ha $0\le x\le\frac\pi2$.`,
      sol: R`(a) $\int_1^\infty\frac{dx}x=\infty$: nincs várható érték (és szórás sem).
        <br>(b) $E=\int_0^{\pi/2}x\sin x\,dx=\big[-x\cos x+\sin x\big]_0^{\pi/2}=1$; $E(X^2)=\pi-2$; $D^2=\pi-3$, $D ${approx(Math.sqrt(Math.PI - 3))}$.
        <br>(c) $E=\frac\pi2-1 ${approx(Math.PI / 2 - 1)}$, $D ${approx(sin18)}$ — ugyanaz a szórás, mint (b)-ben, mert $\cos x=\sin(\frac\pi2-x)$: a (c) eloszlás a (b) tükörképe, csak eltolva.`,
    },
    {
      topic: "folyteo", title: "Az óra nagymutatója", src: "Gy5/9",
      text: R`Mi a valószínűsége, hogy álomból felriadva a nagymutató a függőleges középvonaltól jobbra áll? És hogy az 5-ös és 6-os számjegy közötti $\frac1{12}$ részen van?`,
      sol: R`A mutató helyzete (szöge) egyenletes a $[0;360°)$-on, így a valószínűség az ívhossz aránya: jobb oldal $\frac{180°}{360°}=\frac12$; az 5 és 6 közti rész $\frac{30°}{360°}=\frac1{12}$.`,
    },
    {
      topic: "folyteo", title: "Három pont, mindegyik harmadba egy", src: "Gy5/10",
      text: R`Mi a valószínűsége, hogy három független, a $(0;1)$-ből egyenletesen választott pont közül pontosan egy-egy esik a $(0;\frac13)$, $(\frac13;\frac23)$, $(\frac23;1)$ intervallumba?`,
      sol: R`Egy adott hozzárendelés (pl. 1. pont az első harmadba, 2. a másodikba, 3. a harmadikba) valószínűsége $\left(\frac13\right)^3$; a pontok $3!$ sorrendben oszthatók szét: $P=3!\cdot\frac1{27}=\frac29\approx0{,}222$.`,
    },
    {
      topic: "folyteo", title: "Labda a kerítésen át", src: "Gy5/11",
      text: R`Egy kerítés egymástól $L$ távolságra (középtől középig) leszúrt, $D$ átmérőjű rudakból áll. Egy $d$ átmérőjű labdát vakon a kerítés felé dobunk. Mi a valószínűsége, hogy érintés nélkül átrepül?`,
      sol: R`Egy periódus ($L$ hosszú szakasz) elég: a labda középpontjának vízszintes helyzete egyenletes rajta. Akkor nem ér a rúdhoz, ha a középpontja mindkét szomszédos rúd középpontjától legalább $\frac{D+d}2$-re van. A kedvező szakasz hossza $L-(D+d)$, így $$P=\frac{L-D-d}{L}\quad(\text{ha }L\gt D+d,\ \text{különben }0).$$`,
    },
    {
      topic: "folyteo", title: "Melyik vonatra szállunk?", src: "Gy5/12",
      text: R`Az A felé tartó vonatok 15 percenként indulnak 7:00-tól, a B felé tartók 15 percenként 7:05-től. Egy utas egyenletes eloszlású időpontban érkezik (a) 7:00 és 8:00, (b) 7:10 és 8:10 között, és a hamarabb induló vonatra száll. Hányad részben megy A, ill. B felé?`,
      sol: R`Minden 15 perces ciklusban (pl. 7:00–7:15): ha 7:00 és 7:05 között érkezik, a következő vonat a 7:05-ös B; ha 7:05 és 7:15 között, a 7:15-ös A. Tehát a ciklus $\frac{10}{15}$ részében A, $\frac5{15}$ részében B.
        <br>(a) Az egy óra pontosan 4 teljes ciklus: <b>A: $\frac23$, B: $\frac13$</b>. (b) A 7:10–8:10 intervallum is egész számú (4) ciklus hosszú, ezért ugyanígy $\frac23$ és $\frac13$. (Nem a vonatok száma számít, hanem az előttük lévő „várakozási ablak” hossza!)`,
    },
    {
      topic: "folyteo", title: "Hova tegyük a buszszervizeket?", src: "Gy5/14",
      text: R`Egy busz a 100 km-re lévő A és B között jár; ha lerobban, az egyenletes eloszlású helyen történik. Most szerviz van A-ban, B-ben és félúton. Javaslat: legyenek A-tól 25, 50 és 75 km-re. Jobb-e? Mi a legjobb elhelyezés?`,
      sol: R`Mérőszám: a legközelebbi szerviz <b>várható távolsága</b>. Egy $\ell$ hosszú szakasz, amelyet egy szerviz lát el: ha a szerviz a szakasz végén van, az átlagos távolság $\frac\ell2$; ha a közepén, $\frac\ell4$.
        <br>Most (0, 50, 100): minden pont a legközelebbihez van rendelve; szakaszok: [0;25] (vég), [25;50], [50;75] és [75;100] (szintén végük a szerviz), mind $\ell=25$, átlag $12{,}5$ km.
        <br>Javaslat (25, 50, 75): [0;25] és [75;100]: vég, átlag $12{,}5$; [25;50] és [50;75] két-két 12,5 km-es fél: átlag $6{,}25$. Összesen $\frac{25\cdot12{,}5+50\cdot6{,}25+25\cdot12{,}5}{100}=9{,}375$ km — <b>jobb</b>.
        <br>Legjobb: minden szerviz egy $\frac{100}3$ km-es szakasz <b>közepén</b>: $\frac{100}6$, $50$, $\frac{500}6$ km-nél (≈16,7; 50; 83,3), az átlagos távolság $\frac{100}{12}\approx8{,}33$ km.`,
    },
    {
      topic: "folyteo", title: "Eltört ropi rövidebb darabja", src: "Gy5/15",
      text: R`Egy $l$ hosszú ropit egyenletesen választott pontban kettétörünk. Mi a rövidebb darab eloszlásfüggvénye?`,
      sol: R`Legyen $X\sim U[0;l]$ a töréspont, $Y=\min(X,l-X)$. $Y\lt y$ akkor, ha $X\lt y$ vagy $X\gt l-y$ (két $y$ hosszú szakasz): $$P(Y\lt y)=\frac{2y}{l},\quad 0\le y\le\frac l2,$$ alatta 0, fölötte 1. Tehát $Y$ egyenletes a $[0;\frac l2]$-n, $E(Y)=\frac l4$.`,
    },
    {
      topic: "folyteo", title: "Buffon-féle tűprobléma", src: "Gy5/16",
      text: R`Egymástól $d$ távolságra húzott párhuzamos egyenesek közé véletlenszerűen leejtünk egy $l\le d$ hosszú tűt. Mi a valószínűsége, hogy a tű metsz egy egyenest?`,
      sol: R`Két független, egyenletes változó: a tű középpontjának távolsága a legközelebbi egyenestől $u\in[0;\frac d2]$, és a tű szöge az egyenesekhez $\theta\in[0;\frac\pi2]$. Metszés, ha $u\le\frac l2\sin\theta$.
        <br>Kedvező terület: $\int_0^{\pi/2}\frac l2\sin\theta\,d\theta=\frac l2$; teljes terület: $\frac d2\cdot\frac\pi2$. $$P=\frac{l/2}{d\pi/4}=\frac{2l}{\pi d}$$ (Ezzel kísérletileg $\pi$ is becsülhető.)`,
      figs: () => {
        const l = 1, d = 1.4, pts = [[0, 0]];
        for (let i = 0; i <= 40; i++) { const t = (Math.PI / 2) * (i / 40); pts.push([t, (l / 2) * Math.sin(t)]); }
        pts.push([Math.PI / 2, 0]);
        return [figPlane({ xr: [0, Math.PI / 2], yr: [0, d / 2], polys: [{ pts, cls: "fav" }], xTicks: [0, { x: Math.PI / 2, t: "π/2" }], yTicks: [0, { y: l / 2, t: "l/2" }, { y: d / 2, t: "d/2" }], xlabel: "θ (szög)", ylabel: "u", size: 300, title: R`Kedvező: $u\le\frac l2\sin\theta$ (a szinuszgörbe alatti rész)` })];
      },
    },
    {
      topic: "folyteo", title: "Szakasz három részre: háromszög?", src: "Gy5/20",
      text: R`Egy egységnyi szakaszt két, egymástól független, egyenletesen választott pontban eltörünk. Mi a valószínűsége, hogy a három darabból háromszög szerkeszthető?`,
      sol: R`A töréspontok $(x,y)\in[0;1]^2$. Háromszög akkor szerkeszthető, ha mindhárom darab rövidebb $\frac12$-nél (háromszög-egyenlőtlenség). Ha $x\lt y$: $x\lt\frac12$, $y-x\lt\frac12$, $y\gt\frac12$ — ez egy $\frac18$ területű háromszög; $y\lt x$ esetén szimmetrikusan még egy. $$P=2\cdot\frac18=\frac14.$$`,
      figs: () => [figPlane({ xr: [0, 1], yr: [0, 1], polys: [{ pts: [[0, 0.5], [0.5, 0.5], [0.5, 1]], cls: "fav" }, { pts: [[0.5, 0], [0.5, 0.5], [1, 0.5]], cls: "fav" }], segs: [{ a: [0, 0], b: [1, 1], cls: "guide" }], xTicks: [0, 0.5, 1], yTicks: [0, 0.5, 1], title: R`A kedvező rész: két $\frac18$ területű háromszög` })],
    },
  ];
})();
