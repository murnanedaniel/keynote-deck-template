# Keynote deck template

A minimal scene-deck engine for scientific talks: a `Stage` that steps through scenes, a timeline that holds the storyboard, one React component per scene, and a screenshot script that checks the result. Stripped down from the ETH talk (`murnanedaniel/ETH-Agentic-AI-for-Collider-Physics`), which descends from `murnanedaniel/NBI-AI-future`. The design rules are in the `keynote-slides` skill (`skills/keynote-slides/` in the course repo).

Light theme only.

Six example scenes, one of each kind: title, big number, diagram with stepper, chart, two-column comparison, quote. The example numbers are real and sourced (`FACTS.md`), but re-check them before reusing.

## Start a new talk

From the course repo (no git history, just the files):

```bash
npx degit murnanedaniel/ai-agents-physics-research/templates/keynote-deck my-talk
cd my-talk && npm install
npm run dev            # http://localhost:3000
```

Or copy the folder by hand (`cp -r templates/keynote-deck ~/talks/my-talk`, then delete any `node_modules`, `.next`, `out` and `shots` that came along). If you later move the template to its own repository, tick "Template repository" in its settings and use GitHub's **Use this template** button instead.

On homebox, serve the dev deck on the tailnet so it can be opened from another device:

```bash
npx next dev --hostname 100.118.51.124 --port <free port>
```

Then edit, in this order:

1. `src/lib/timeline.ts`: the storyboard. One row per scene with the sentence you will say (`line`), the number of reveal steps, the theme and the time budget.
2. `src/content/talk.ts`: title, speaker, venue, date.
3. `src/components/scenes/*.tsx`: one component per scene, wrapped in `SceneFrame`; use `Reveal` for anything that appears on a step.
4. `src/lib/sceneRegistry.tsx`: register each scene (a missing entry is a type error).
5. `src/data/*.ts` and `FACTS.md`: every number, with its source.

Keys: → / space / PageDown advance, ← / PageUp go back, `P` presenter clock (time, scene, step, drift against budget), `R` restart. Deep link: `?scene=chart&step=1`.

## Check it

```bash
npm run build:export     # static site in out/
npm run shoot            # screenshots every scene and step, writes shots/report.md
```

`shots/` gets one PNG per scene per step at 1280x720 and 1920x1080, and `report.md` lists FAIL and warning items (word count, font size, overlaps, overflow, contrast, placeholder text, dead steps, numbers without a source). Exit code is 1 if anything fails. Then open the screenshots and go through `skills/keynote-slides/CHECKLIST.md`.

On homebox, headless Chromium needs local libraries and the cached headless shell:

```bash
export LD_LIBRARY_PATH=$HOME/.local/chromelibs/root/usr/lib/x86_64-linux-gnu
export CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npm run shoot
```

Elsewhere, `npx playwright install chromium` once and leave `CHROMIUM_PATH` unset.

The Latin Geist, Geist Mono and EB Garamond fonts are bundled in `src/app/fonts/` and loaded with `next/font/local`, so builds do not need a Google Fonts connection.

## Publish on GitHub Pages under danielmurnane.com

The user site `murnanedaniel.github.io` has a `CNAME` for `www.danielmurnane.com`. GitHub then serves every project repository's Pages site under that domain at `/<repo-name>/`, for example `https://www.danielmurnane.com/ETH-Agentic-AI-for-Collider-Physics/`. Nothing needs adding to this repository's DNS or CNAME.

What this repository needs:

1. Push it to GitHub as `murnanedaniel/<repo-name>`.
2. Settings → Pages → Source: **GitHub Actions**.
3. Push to `main`. `.github/workflows/deploy.yml` builds a static export with `NEXT_BASE_PATH=/<repo-name>` (taken from the repository name automatically), adds `.nojekyll` and deploys.

The site appears at `https://www.danielmurnane.com/<repo-name>/`.

Why the base path matters: the site is served from a sub-path, so every asset URL needs the `/<repo-name>` prefix. `next.config.ts` passes `NEXT_BASE_PATH` to Next's `basePath`, and to the client as `NEXT_PUBLIC_BASE_PATH`. Next's `<Link>` and `<Image>` add it themselves; for raw `<img src>`, `fetch()` or CSS `url()` wrap the path in `asset("/img/x.png")` from `src/lib/asset.ts`. To test the Pages build locally:

```bash
NEXT_OUTPUT_EXPORT=true NEXT_BASE_PATH=/my-talk npx next build
mkdir -p /tmp/site && rm -rf /tmp/site/my-talk && cp -r out /tmp/site/my-talk
python3 -m http.server 8800 --bind 127.0.0.1 --directory /tmp/site   # open /my-talk/
```

`npm run build:pages` does the same build with the placeholder name `/keynote-deck`; change it in `package.json` to match the repository.

## Files

```
src/lib/timeline.ts          storyboard: order, theme, steps, time budget, spoken line
src/lib/sceneRegistry.tsx    scene id → component
src/components/Stage.tsx     navigation, theme transition, deep links, presenter clock
src/components/kit/          SceneFrame (layout regions), Reveal (step-gated), Source
src/components/scenes/       one file per scene
src/content/talk.ts          title-page metadata
src/data/                    numbers with sources, used by scenes
src/app/globals.css          colour tokens, light theme, type scale (.t-*)
scripts/shoot.mjs            screenshots and measurable checks
FACTS.md                     every number on screen, with its citation
.github/workflows/deploy.yml GitHub Pages deployment
```
