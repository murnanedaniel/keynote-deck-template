// Screenshot every scene at every reveal step, at 1280x720 and 1920x1080, and
// run the measurable checks from skills/keynote-slides/CHECKLIST.md.
//
//   npm run build:export && npm run shoot            # serves out/ itself
//   node scripts/shoot.mjs --url http://localhost:3000/   # or a running dev server
//   node scripts/shoot.mjs --only chart,diagram           # a subset of scenes
//
// Env: CHROMIUM_PATH=/path/to/chrome-headless-shell if Playwright's own
// browser is not installed (you may also need LD_LIBRARY_PATH, see README).
// Writes shots/<WxH>/NN-<id>-s<step>.png and shots/report.md. Exit code 1 if
// any check FAILs.

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const OUT = join(ROOT, "shots");
const VIEWPORTS = (opt("viewports", "1280x720,1920x1080")).split(",").map((v) => v.split("x").map(Number));
const only = opt("only", "") ? opt("only").split(",") : null;

// Budgets. Change them here, not per scene: a scene that needs more words
// needs splitting.
const MAX_WORDS = 80;        // visible words on the final step, sources excluded
const WARN_WORDS = 60;
const MIN_FONT_PX = 12;      // at 1280x720; sources may sit at the minimum
const MIN_BODY_PX = 18;      // anything that is not a label or source
const MIN_CONTRAST = 4.5;
const MIN_CONTRAST_LARGE = 3; // text >= 24px

// ---- storyboard: parse src/lib/timeline.ts (id, steps, theme) ----
const tl = readFileSync(join(ROOT, "src/lib/timeline.ts"), "utf8");
// Tolerant parser: one scene object per {...}, keys quoted or not, fields in
// any order, theme and line optional. Works on older decks' timelines too.
const field = (obj, k) => obj.match(new RegExp(`"?${k}"?\\s*:\\s*"?([^",}]+)"?`))?.[1]?.trim();
const scenes = [...tl.matchAll(/\{[^{}]*?"?id"?\s*:\s*"[^"]+"[^{}]*?\}/g)]
  .map(([obj]) => ({ id: field(obj, "id"), theme: field(obj, "theme") ?? "light", steps: Number(field(obj, "steps") ?? 1), line: field(obj, "line") ?? "" }))
  .filter((s) => s.id && Number.isFinite(s.steps))
  .filter((s) => !only || only.includes(s.id));
if (!scenes.length) { console.error("No scenes parsed from timeline.ts"); process.exit(2); }

// ---- serve out/ unless --url given ----
let base = opt("url", "");
let server;
if (!base) {
  const dir = join(ROOT, "out");
  if (!existsSync(dir)) { console.error("No out/ directory. Run `npm run build:export` or pass --url."); process.exit(2); }
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".ico": "image/x-icon", ".json": "application/json", ".txt": "text/plain" };
  server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let f = join(dir, p);
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
    if (!existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": types[extname(f)] ?? "application/octet-stream" });
    res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}/`;
}

const browser = await chromium.launch({
  args: ["--no-sandbox"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});

// Runs in the page: measure everything visible on the current step.
function measure({ theme }) {
  const bgOf = theme === "light" ? [246, 241, 231] : [5, 6, 7];
  const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const effOpacity = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };
  const backdrop = (el) => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      // The stage, the scene section, body and html carry the theme colour or
      // a transition value: use the theme surface for those.
      if (["SECTION", "BODY", "HTML"].includes(e.tagName) || e.matches("[role=button]")) continue;
      if (c.length >= 3 && (c[3] ?? 1) > 0.5) return c.slice(0, 3);
    }
    return bgOf;
  };
  const vw = innerWidth, vh = innerHeight;
  const items = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || el.closest("script,style,title,desc,.sr-only,[aria-hidden=true],nextjs-portal")) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const op = effOpacity(el);
    if (op < 0.05) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    if (!rects.length) continue;
    // SVG text scales with the viewBox: use rendered height, not computed font-size.
    const isSvg = !!el.closest("svg");
    const size = isSvg ? Math.max(...rects.map((r) => r.height)) * 0.8 : parseFloat(cs.fontSize);
    const fg = parse(cs.fill && isSvg && cs.fill !== "none" ? cs.fill : cs.color).slice(0, 3);
    const bg = backdrop(el);
    const blended = fg.map((c, i) => c * op + bg[i] * (1 - op));
    const isSource = !!el.closest("[data-region=source],.t-source,.t-label");
    items.push({
      text, size: Math.round(size * 10) / 10, isSource,
      dim: !!el.closest("[data-dim]"), // deliberately ghosted (upcoming stage, the losing column)
      contrast: Math.round(ratio(blended, bg) * 100) / 100,
      rects: rects.map((r) => [r.left, r.top, r.right, r.bottom].map(Math.round)),
      out: rects.some((r) => r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1),
      clipped: (() => { const reg = el.closest("[data-region]"); if (!reg) return false; const b = reg.getBoundingClientRect(); // 6px slack for italic overhang
      return rects.some((r) => r.bottom > b.bottom + 6 || r.right > b.right + 6 || r.top < b.top - 6 || r.left < b.left - 6); })(),
    });
  }
  // Overlaps between different text runs (two lines of one paragraph never overlap).
  const overlaps = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    for (const a of items[i].rects) for (const b of items[j].rects) {
      const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
      const h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
      // Line boxes of tight display type overlap a little by design: only
      // count overlaps deeper than a third of the smaller line.
      const minH = Math.min(a[3] - a[1], b[3] - b[1]);
      const big = Math.max(items[i].size, items[j].size) >= 40; // display type has tall line boxes
      if (w > 3 && h > Math.max(3, minH * (big ? 0.33 : 0.12))) overlaps.push(`"${items[i].text.slice(0, 30)}" × "${items[j].text.slice(0, 30)}"`);
    }
  }
  // Text crossing the edge of a card, pill or panel it does not belong to
  // (the title-into-cards collision). Boxes = visible border or background.
  const boxes = [...document.querySelectorAll("body *")].filter((e) => {
    if (["SECTION", "svg"].includes(e.tagName) || e.matches("[role=button],[data-region]") || e.closest("svg")) return false;
    const cs = getComputedStyle(e); if (effOpacity(e) < 0.05) return false;
    const bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth);
    const bc = parse(cs.borderTopColor), bg = parse(cs.backgroundColor);
    const r = e.getBoundingClientRect();
    return r.width > 20 && r.height > 12 && r.width < vw * 0.9 && ((bw > 0 && (bc[3] ?? 1) > 0.1) || (bg.length >= 3 && (bg[3] ?? 1) > 0.1));
  });
  const crossings = [];
  for (const t of items) for (const box of boxes) {
    const b = box.getBoundingClientRect();
    for (const a of t.rects) {
      const w = Math.min(a[2], b.right) - Math.max(a[0], b.left);
      const h = Math.min(a[3], b.bottom) - Math.max(a[1], b.top);
      const inside = a[0] >= b.left - 2 && a[2] <= b.right + 2 && a[1] >= b.top - 2 && a[3] <= b.bottom + 2;
      if (w > 3 && h > 3 && !inside) crossings.push(`"${t.text.slice(0, 30)}" crosses a box edge`);
    }
  }
  return { items, overlaps: [...new Set([...overlaps, ...crossings])] };
}

const results = [];
for (const [w, h] of VIEWPORTS) {
  const vp = `${w}x${h}`;
  mkdirSync(join(OUT, vp), { recursive: true });
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [i, s] of scenes.entries()) {
    let prev = null;
    for (let step = 0; step < s.steps; step++) {
      await page.goto(`${base}?scene=${s.id}&step=${step}`, { waitUntil: "networkidle" });
      // Decks without &step= support (older Stage.tsx): press → instead.
      const cur = await page.evaluate(() => document.querySelector("[data-step]")?.getAttribute("data-step"));
      if (cur !== String(step)) for (let k = 0; k < step; k++) { await page.waitForTimeout(500); await page.keyboard.press("ArrowRight"); }
      await page.waitForTimeout(1800); // let entrance and reveal animations settle
      const file = join(OUT, vp, `${String(i + 1).padStart(2, "0")}-${s.id}-s${step}.png`);
      const png = await page.screenshot({ path: file });
      const m = await page.evaluate(measure, { theme: s.theme });
      const r = { vp, id: s.id, step, file, fails: [], warns: [] };
      if (prev && Buffer.compare(prev, png) === 0) r.fails.push(`step ${step} changes nothing visible`);
      prev = png;
      if (m.overlaps.length) r.fails.push(`overlapping text: ${m.overlaps.slice(0, 3).join("; ")}`);
      const out = m.items.filter((t) => t.out || t.clipped);
      if (out.length) r.fails.push(`text outside viewport or its region: ${out.slice(0, 3).map((t) => `"${t.text.slice(0, 30)}"`).join(", ")}`);
      if (w === 1280) {
        const tiny = m.items.filter((t) => t.size < MIN_FONT_PX - 0.5);
        if (tiny.length) r.fails.push(`text under ${MIN_FONT_PX}px: ${tiny.slice(0, 3).map((t) => `"${t.text.slice(0, 24)}" ${t.size}px`).join(", ")}`);
        const smallBody = m.items.filter((t) => !t.isSource && t.size < MIN_BODY_PX - 0.5 && t.size >= MIN_FONT_PX - 0.5);
        if (smallBody.length) r.warns.push(`non-label text under ${MIN_BODY_PX}px: ${smallBody.slice(0, 3).map((t) => `"${t.text.slice(0, 24)}" ${t.size}px`).join(", ")}`);
      }
      const low = m.items.filter((t) => !t.dim && t.contrast < (t.size >= 24 ? MIN_CONTRAST_LARGE : MIN_CONTRAST));
      if (low.length) r.warns.push(`low contrast: ${low.slice(0, 3).map((t) => `"${t.text.slice(0, 24)}" ${t.contrast}:1`).join(", ")}`);
      const all = m.items.map((t) => t.text).join(" ");
      if (/\bTODO\b|\bTBD\b|lorem|\{\{|\[\?|XXX/i.test(all)) r.fails.push("placeholder text visible");
      if (/—/.test(all)) r.warns.push("em dash in visible text");
      if (step === s.steps - 1) {
        const words = m.items.filter((t) => !t.isSource).map((t) => t.text).join(" ").split(/\s+/).filter((x) => /[A-Za-z]/.test(x)).length; // numbers and tick labels are not words
        r.words = words;
        if (words > MAX_WORDS) r.fails.push(`${words} words on screen (max ${MAX_WORDS})`);
        else if (words > WARN_WORDS) r.warns.push(`${words} words on screen (aim ≤ ${WARN_WORDS})`);
        // A "number" is a quantity: a value with a unit, a decimal, or 3+ digits
        // that is not a year. Dates, clock times and step counters do not count.
        const quantity = (txt) => {
          const t = txt.replace(/\b(19|20)\d\d\b/g, "").replace(/\b\d{1,2}:\d{2}\b/g, "");
          return /\d[\d.,]*\s*(%|×|x\b|k\b|M\b|million|billion|GeV|TeV|MeV|ms\b|Hz|kHz|MHz)/.test(t) || /\b\d+\.\d+\b/.test(t) || /\b\d{3,}\b/.test(t);
        };
        const hasNumber = m.items.some((t) => !t.isSource && quantity(t.text));
        const hasSource = m.items.some((t) => t.isSource && /source|arxiv|doi|et al|\d{4}|tdr|phys|table|fig/i.test(t.text));
        if (hasNumber && !hasSource) r.warns.push("numbers on screen but no source line");
      }
      if (errors.length) r.fails.push(`page errors: ${errors.splice(0).join(" | ").slice(0, 200)}`);
      results.push(r);
    }
  }
  await page.close();
}
await browser.close();
server?.close();

const lines = ["# shoot report", "", `${scenes.length} scenes · viewports ${VIEWPORTS.map((v) => v.join("x")).join(", ")}`, "", "| viewport | scene | step | words | result |", "|---|---|---|---|---|"];
for (const r of results) {
  const res = [...r.fails.map((f) => `FAIL ${f}`), ...r.warns.map((x) => `warn ${x}`)].join("<br>") || "ok";
  lines.push(`| ${r.vp} | ${r.id} | ${r.step} | ${r.words ?? ""} | ${res} |`);
}
lines.push("", "Now open the screenshots and read them. The script cannot judge whether the scene says one thing.");
writeFileSync(join(OUT, "report.md"), lines.join("\n"));
const nFail = results.filter((r) => r.fails.length).length;
const nWarn = results.filter((r) => r.warns.length).length;
console.log(lines.join("\n"));
console.log(`\n${results.length} captures · ${nFail} with FAIL · ${nWarn} with warnings · screenshots in ${OUT}`);
process.exit(nFail ? 1 : 0);
