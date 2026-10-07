# Valszám gyakorló

Statikus weboldal a Valószínűségszámítás 1–5. heti gyakorlataihoz és a ZH-felkészüléshez:

- **Tudástár**: minden definíció, tétel és képlet témakörönként, kidolgozott példafeladatokkal
- **Kártyák**: fogalom ↔ leírás kártyák. A nem tudott kártyák hamarosan újra előjönnek, a haladást a böngésző megjegyzi.
- **Kvíz**: feleletválasztós kérdések magyarázattal, plusz a kártyákból generált fogalomfelismerő kérdések
- **Számolás**: 42 feladattípus a gyakorlatokról, **fix** (eredeti számokkal) vagy **véletlen** számokkal. Az oldal ellenőrzi a választ, tippet ad, és ábrás, kidolgozott megoldást mutat.
- **ZH**: korábbi zárthelyik (2016, 2017, 2018, 2022) és véletlen próba-ZH. **ZH-mód**: segítség nélkül, időkorláttal, pontozással; **tanuló mód**: tipp, azonnali ellenőrzés, lépésenkénti levezetés ábrákkal.

Nincs build-lépés: sima HTML + CSS + JavaScript. A képleteket a KaTeX rajzolja ki (CDN-ről töltődik be).

## Feltöltés GitHub Pagesre

1. Hozz létre egy új repót a GitHubon (pl. `valszam-gyakorlo`).
2. Töltsd fel a mappa **tartalmát** a repó gyökerébe: `index.html`, `assets/`, `.nojekyll`, `README.md`.
   - Böngészőből: *Add file → Upload files*, és húzd be a fájlokat. A `.nojekyll` rejtett fájl, ha nem látszik, nem baj, nélküle is működik.
   - Vagy parancssorból:
     ```bash
     cd valszam-gyakorlo
     git init && git add . && git commit -m "Valszám gyakorló"
     git branch -M main
     git remote add origin https://github.com/<felhasznalonev>/valszam-gyakorlo.git
     git push -u origin main
     ```
3. A repóban: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, Branch: `main`, mappa: `/ (root)`, majd **Save**.
4. 1–2 perc múlva elérhető: `https://<felhasznalonev>.github.io/valszam-gyakorlo/`

## Helyi kipróbálás

Az `index.html` dupla kattintással is megnyitható, vagy indíthatsz helyi szervert:

```bash
python3 -m http.server 8000   # majd: http://localhost:8000
```

## Bővítés

- Új fogalom / tétel: `assets/data-theory.js` → `CARDS` tömb (automatikusan bekerül a Tudástárba, a kártyák közé és a generált kvízkérdésekbe).
- Új kvízkérdés: ugyanitt a `MCQ` tömb. Az **első** válaszlehetőség a helyes, a sorrendet az oldal keveri.
- Új számolós feladat: `assets/problems.js` → `PROBLEMS` tömb. Mindegyiknek van `fixed` paraméterkészlete, `random()` generátora és `build(p)` függvénye (szöveg, részkérdések a helyes értékkel, megoldás). Tipp: `PROBLEM_HINTS`, ábra: `assets/problem-figs.js`.
- Új kidolgozott (nem generált) példa a Tudástárba: `assets/examples.js`.
- Új ZH: `assets/zh.js` → `EXAMS` tömb; feladatonként szöveg, részkérdések pontszámmal (`pts`), tipp és lépések (`steps`, opcionális ábrákkal a `figs.js` függvényeiből).
