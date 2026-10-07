/* Segédfüggvények: véletlen számok, kombinatorika, számformázás, kifejezés-kiértékelő. */
"use strict";

const R = String.raw;

/* ---------- véletlen ---------- */
const rnd = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  /* a..b közötti, step többszöröse (pl. 0.05 lépésköz) */
  step: (a, b, step) => {
    const n = Math.round((b - a) / step);
    return +(a + step * rnd.int(0, n)).toFixed(10);
  },
  shuffle: (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  /* k darab pozitív egész, összegük total, mindegyik a step többszöröse és >= min */
  partition: (total, k, step, min) => {
    for (;;) {
      const parts = [];
      let rest = total;
      for (let i = 0; i < k - 1; i++) {
        const v = step * rnd.int(min / step, (rest - (k - 1 - i) * min) / step);
        parts.push(v);
        rest -= v;
      }
      parts.push(rest);
      if (parts.every((v) => v >= min)) return rnd.shuffle(parts);
    }
  },
};

/* ---------- kombinatorika ---------- */
function fact(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function binom(n, k) {
  if (k < 0 || k > n || n < 0) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}
function variation(n, k) {
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}
const binPmf = (n, p, k) => binom(n, k) * p ** k * (1 - p) ** (n - k);
const hypPmf = (N, K, n, k) => (binom(K, k) * binom(N - K, n - k)) / binom(N, n);
const poiPmf = (l, k) => (Math.exp(-l) * l ** k) / fact(k);
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

/* ---------- normális eloszlás ---------- */
/* erf: Abramowitz–Stegun 7.1.26 (hiba < 1,5·10⁻⁷) */
function erf(x) {
  const s = Math.sign(x), a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return s * y;
}
/* standard normális eloszlásfüggvény és sűrűségfüggvény */
const Phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
const phi = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
const normPdf = (x, m, s) => phi((x - m) / s) / s;
/* Φ⁻¹(p): Acklam-féle közelítés (relatív hiba ~1e-9) */
function invPhi(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q, r;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pl) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = p - 0.5;
  r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/* ---------- formázás ---------- */
/* Magyar tizedesvessző, felesleges nullák nélkül. Nagyon kicsi számnál normálalak. */
function fmtParts(x, digits = 4) {
  if (!isFinite(x)) return { mant: String(x), exp: null };
  if (Number.isInteger(x) && Math.abs(x) < 1e15) return { mant: groupInt(x), exp: null };
  const ax = Math.abs(x);
  if (ax !== 0 && ax < 1e-4) {
    const e = Math.floor(Math.log10(ax));
    let m = +(x / 10 ** e).toFixed(3);
    return { mant: String(m).replace(".", ","), exp: e };
  }
  let d = digits;
  if (ax < 0.01) d = digits + 2;
  let s = (+x.toFixed(d)).toString();
  const [ip, fp] = s.split(".");
  return { mant: groupInt(+ip, ip.startsWith("-0")) + (fp ? "," + fp : ""), exp: null };
}
function groupInt(n, negZero) {
  const s = Math.abs(n).toString();
  const g = s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : s;
  return (n < 0 || negZero ? "-" : "") + g;
}
/* szövegbe */
function fmt(x, digits) {
  const { mant, exp } = fmtParts(x, digits);
  return exp === null ? mant : `${mant}·10^${exp}`;
}
/* TeX-be */
function tn(x, digits) {
  const { mant, exp } = fmtParts(x, digits);
  const m = mant.replace(",", "{,}").replace(/ /g, "\\,");
  return exp === null ? m : `${m}\\cdot 10^{${exp}}`;
}
/* közelítő érték TeX: "\approx 0{,}123" vagy "= 12" */
function approx(x, digits) {
  const exact = Number.isInteger(x) || Math.abs(x - +x.toFixed(digits || 4)) < 1e-12;
  return (exact ? "= " : "\\approx ") + tn(x, digits);
}
/* tört TeX */
const fr = (a, b) => `\\frac{${a}}{${b}}`;

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- kifejezés-kiértékelő a válaszokhoz ----------
   Támogatott: + - * / ^ ! % ( ), tizedesvessző vagy pont, 2.5e-3,
   e, pi, sqrt(), ln(), log(), exp(), abs(), C(n;k) / C(n,k) / binom(n,k).
   A C(n,k)-n belül a vessző argumentum-elválasztó (vagy használj ;-t). */
function evaluate(input) {
  const src = String(input)
    .trim()
    .replace(/[·×⋅∙]/g, "*")
    .replace(/[−–]/g, "-")
    .replace(/:/g, "/")
    .replace(/\s+/g, "");
  if (!src) throw new Error("üres");
  const toks = [];
  const stack = [];
  /* vessző csak a többargumentumú függvényekben (C, binom, V) elválasztó, máshol tizedesvessző */
  const MULTI = ["c", "binom", "ncr", "v"];
  const sepCtx = () => MULTI.includes(stack[stack.length - 1]);
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/[0-9.]/.test(c) || (c === "," && /[0-9]/.test(src[i + 1] || "") && !sepCtx() && /[0-9]/.test(src[i - 1] || ""))) {
      let j = i;
      let s = "";
      while (j < src.length) {
        const ch = src[j];
        if (/[0-9.]/.test(ch)) { s += ch; j++; continue; }
        if (ch === "," && !sepCtx() && /[0-9]/.test(src[j + 1] || "")) { s += "."; j++; continue; }
        break;
      }
      if (/[eE]/.test(src[j] || "") && /^[eE][+-]?[0-9]/.test(src.slice(j))) {
        const m = src.slice(j).match(/^[eE][+-]?[0-9]+/)[0];
        s += m;
        j += m.length;
      }
      const v = Number(s);
      if (!isFinite(v)) throw new Error("hibás szám: " + s);
      toks.push({ t: "num", v });
      i = j;
      continue;
    }
    if (/[a-zA-Zπ]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Zπ]/.test(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if (c === "(") {
      const prev = toks[toks.length - 1];
      stack.push(prev && prev.t === "id" ? prev.v : "group");
    } else if (c === ")") stack.pop();
    if ("+-*/^!%(),;".includes(c)) {
      toks.push({ t: c === ";" ? "," : c });
      i++;
      continue;
    }
    throw new Error("ismeretlen jel: " + c);
  }

  let p = 0;
  const peek = () => toks[p] && toks[p].t;
  const eat = (t) => {
    if (peek() !== t) throw new Error("hiányzó " + t);
    p++;
  };
  const consts = { e: Math.E, pi: Math.PI, "π": Math.PI };
  const funcs = {
    sqrt: Math.sqrt, gyok: Math.sqrt, ln: Math.log, log: Math.log, exp: Math.exp, abs: Math.abs,
    c: binom, binom: binom, ncr: binom, v: variation,
    phi: Phi, fi: Phi, invphi: invPhi,
  };

  function expr() {
    let v = term();
    while (peek() === "+" || peek() === "-") {
      const op = toks[p++].t;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term() {
    let v = unary();
    while (peek() === "*" || peek() === "/" || peek() === "(" || peek() === "num" || peek() === "id") {
      const t = peek();
      if (t === "*" || t === "/") {
        p++;
        const r = unary();
        v = t === "*" ? v * r : v / r;
      } else v *= unary(); /* implicit szorzás: 2(3) , 3e^-2 */
    }
    return v;
  }
  function unary() {
    if (peek() === "-") { p++; return -unary(); }
    if (peek() === "+") { p++; return unary(); }
    return power();
  }
  function power() {
    const b = postfix();
    if (peek() === "^") { p++; return b ** unary(); }
    return b;
  }
  function postfix() {
    let v = primary();
    for (;;) {
      if (peek() === "!") {
        p++;
        if (!Number.isInteger(v) || v < 0) throw new Error("faktoriális csak nemnegatív egészre");
        v = fact(v);
      } else if (peek() === "%") { p++; v /= 100; }
      else return v;
    }
  }
  function primary() {
    const tk = toks[p];
    if (!tk) throw new Error("hiányos kifejezés");
    if (tk.t === "num") { p++; return tk.v; }
    if (tk.t === "(") { p++; const v = expr(); eat(")"); return v; }
    if (tk.t === "id") {
      p++;
      if (peek() === "(" && funcs[tk.v]) {
        p++;
        const args = [expr()];
        while (peek() === ",") { p++; args.push(expr()); }
        eat(")");
        return funcs[tk.v](...args);
      }
      if (tk.v in consts) return consts[tk.v];
      throw new Error("ismeretlen név: " + tk.v);
    }
    throw new Error("váratlan jel: " + tk.t);
  }
  const v = expr();
  if (p !== toks.length) throw new Error("fölösleges jel a végén");
  if (!isFinite(v)) throw new Error("nem véges érték");
  return v;
}

/* Válasz ellenőrzése: relatív ~0,5%, vagy kerekítésnyi abszolút eltérés. */
function isClose(user, truth) {
  const a = Math.abs(truth);
  if (Number.isInteger(truth) && a >= 1 && a < 1e7) return Math.abs(user - truth) < 0.5;
  if (a < 0.01) return Math.abs(user - truth) <= Math.max(a * 0.02, 1e-15) || (a > 1e-4 && Math.abs(user - truth) < 5e-5);
  return Math.abs(user - truth) <= Math.max(a * 0.005, 6e-4);
}

/* ---------- tárolás (localStorage hibatűrően) ---------- */
const store = {
  get(key, def) {
    try {
      const v = localStorage.getItem("valszam:" + key);
      return v === null ? def : JSON.parse(v);
    } catch (e) {
      return def;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem("valszam:" + key, JSON.stringify(val));
    } catch (e) { /* privát mód stb. */ }
  },
};
