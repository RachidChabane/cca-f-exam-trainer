# AI-Generated-UI Audit Checklist

A reusable checklist of tell-tale signs that a web UI was AI-generated ("AI slop"),
compiled from current (2024–2026) design critiques and dev/UX discussions, then
applied to this project. Each item is a **binary, observable check**.

**Sources** (corroborated across multiple): _Why Your AI Keeps Building the Same
Purple Gradient Website_ (prg.sh) · _Hallmark: stop AI-generated UI slop_ (dev.to/rams901)
· _The AI Purple Problem_ (dev.to/jaainil) · _Why Every AI-Generated Landing Page
Looks the Same_ (dev.to) · _We Don't Want a Beige Internet_ (wheelsupcollective.com)
· _How to Spot AI-Generated Design_ (uxplanet.org).

Legend: ✅ clean · ⚠️ minor / partial (intentional) · ❌ confirmed tell to fix · N/A

---

## A. Color & gradient
- [ ] **Blue/indigo→purple diagonal gradient** on the hero or primary CTA (`from-blue-600 to-purple-600`, `from-indigo-500 to-purple-500`)? — the single most-cited AI fingerprint. → **✅** No gradients anywhere; backgrounds and CTAs are solid tokens.
- [ ] **Default Tailwind indigo/violet accent** (`indigo-500/600`, `violet-*`) with no custom brand token? → **✅** Custom champagne-amber primary `hsl(32 48% 62%)` / `#c9a173`, defined as HSL design tokens (`src/index.css:67`).
- [ ] **Gradient-clipped text headline** on a dark hero (`background-clip:text`, neon purple)? → **✅** None; headings are solid `foreground`.
- [ ] **Glassmorphism overuse** — multiple frosted blur panels over a gradient/blob background? → **✅** One restrained `backdrop-blur-md` on the sticky header (`AppHeader.tsx:89`); no blob/aurora backgrounds.

## B. Layout & composition
- [ ] **Centered hero: headline + subhead + two side-by-side buttons**? → **⚠️** Home hero is center-aligned text (`HomeView.tsx:62`) but the headline is product-specific and there is **no twin-CTA in the hero** (the CTAs are two functional nav cards below). Intentional for a focused tool; not the full pattern.
- [ ] **Identical 3-(or 4-)card feature grid** with icon-top/heading/paragraph below the hero? → **✅** Two **functional navigation** cards (`sm:grid-cols-2`), not a 3-up decorative feature grid.
- [ ] **Boilerplate section order** hero → features → testimonials → pricing → CTA, with sections present even without real content? → **✅** Home is hero → 2 mode cards → real blueprint (weights, pool counts). No testimonials/pricing/CTA-band.
- [ ] **Uniform border-radius on everything** (one global radius, nothing varied)? → **✅** Real radius scale in use: `rounded-md` ×24, `rounded-full` ×9 (badges), `rounded-lg` ×7, plus `rounded-[5px]/[6px]`.
- [ ] **Faint uniform ~0.1-opacity drop shadow on every card**? → **✅** Cards are **flat with a 1px border**; the only shadow is one `shadow-2xl` on the modal (appropriate elevation).
- [ ] **Over-perfect symmetry / undifferentiated even spacing** with no asymmetry or intentional whitespace? → **⚠️** Layouts are centered/stacked (common for a study tool); offset by the asymmetric exam runner (sticky context panel + question column).

## C. Typography
- [ ] **Inter (or system-ui/Geist) as the sole typeface**, hierarchy only by size/weight, no pairing? → **✅** Three intentional faces: **Fraunces** serif for headings (`.font-serif`), **Inter** for body, **JetBrains Mono** for code/exhibits (`src/index.css:45–49`).
- [ ] **The recurring "AI font combo"** (Inter + Space Grotesk / Instrument Serif / Geist; one serif-italic hero word)? → **✅** Fraunces is a deliberate, non-default display face; no italic-serif gimmick word.
- [ ] **Emoji used as heading/section-label decoration** in the UI? → **✅** No emoji in any UI string (`src/i18n.ts`). (README uses flags/icons; that's docs, not the app.)

## D. Components & icons
- [ ] **Unmodified shadcn/Tailwind defaults** (`--radius: 0.5rem`, default neutral/zinc, stock `--primary`/`--ring`)? → **✅** `--radius: 0.6rem`, bespoke warm-graphite palette, custom Button/Badge/Card variants tied to semantic tokens.
- [ ] **Untouched Lucide/Heroicons set + sparkle/emoji glyphs as icons**? → **⚠️** Uses Lucide, but **purposefully and contextually** (GraduationCap/BookOpen/Timer/Target/Dumbbell…), no sparkle/emoji icons. A quality icon library used intentionally is standard practice, not slop.
- [ ] **Colored 3–4px left/top border stripe** as a card's main differentiator? → **✅** None.
- [ ] **Fake testimonials / stock avatars** (pravatar, ui-faces) and **"trusted by" logo bars**? → **✅** None anywhere.
- [ ] **Stock illustrations** (Undraw/Storyset/Saly, plastic 3D blobs)? → **✅** None; no decorative imagery at all.
- [ ] **Custom favicon** (not the default Vite logo)? → **✅** Bespoke "cca" monogram in brand amber (`public/favicon.svg`).

## E. Copy & content voice
- [ ] **Vague, industry-agnostic hero headline** ("Build the future of work", "Your all-in-one platform")? → **✅** "Prepare for the Claude Certified Architect — Foundations exam" — names the exact product.
- [ ] **AI cliché vocabulary** (seamless, elevate, delve, leverage, unlock, empower, supercharge, cutting-edge, best-in-class)? → **✅** None present (grep-verified across `src/i18n.ts`).
- [ ] **Temporal-cliché openers** ("In today's fast-paced world", "In an era where")? → **✅** None.
- [ ] **Em-dash-saturated prose** (multiple per sentence as the dominant connector)? → **✅** Em-dashes appear at most once per string; idiomatic editorial use in EN & FR.
- [ ] **Vague hype CTAs** ("Get Started", "Unlock", "Supercharge")? → **✅** CTAs name the action/outcome: "Start a practice exam", "Browse course summaries", "Drill", "Review all questions".
- [ ] **Formulaic feature copy** ("[Adjective] [noun] that helps you [verb]") / empty mission filler? → **✅** Copy is specific and concrete (domain weights, question counts, mechanics).

## F. Information architecture & real data
- [ ] **Dead-end CTAs** (`href="#"`, `javascript:void(0)`, buttons that loop to self)? → **✅** Every control is wired (Zustand view/state actions); no `#` links.
- [ ] **No real data** — placeholder pricing/stats/use-cases, "Feature 1/2/3", `[Your Company]` tokens? → **✅** Entirely real data: 360 bilingual questions, 11 course summaries, the actual exam blueprint.
- [ ] **Invented trust signals / fabricated stats** ("10,000+ customers", "99.9% uptime")? → **✅** The only numbers shown are real, computed counts (pool size, course count, domain weights).
- [ ] **Numbered "1-2-3 how it works"** restating generic onboarding? → **✅** None.

## G. Accessibility & technical
- [ ] **Clickable `<div onClick>`** with no role/tabindex/keyboard handler? → **✅** Every interactive element is a real `<button>` (grep-verified); radios use `role="radio"`.
- [ ] **Icon-only buttons/SVGs without `aria-label`** (and decorative SVGs without `aria-hidden`)? → **✅** Theme toggle, language group, and navigator button all carry `aria-label`; the decorative brand monogram is `aria-hidden`.
- [ ] **Missing semantic landmarks / heading hierarchy** (styled `<div>` instead of `<main>/<nav>/<h2>/<ul>`)? → **✅** `<header><nav>`, `<main>`, `<footer>`, real `<h1>/<h2>`, lists as `<ul>/<li>`.
- [ ] **Barely-passing/failing contrast** (grey body text just under 4.5:1 in dark mode)? → **✅** WCAG-AA across both themes; lowest measured pair **4.81:1**, muted text ≥ 4.87:1.
- [ ] **Permanent dark-only theme** with no toggle / no `prefers-color-scheme`? → **✅** Full light/dark toggle + `color-scheme` set per theme.
- [ ] **`prefers-reduced-motion` not respected** (fade/rise/transform animations always run)? → **❌ FIXED** — was absent; added a `@media (prefers-reduced-motion: reduce)` block that neutralizes `fade-in`/`rise-in`/transforms (`src/index.css`).

---

## Audit summary (this project)

| Category | Checks | Clean ✅ | Minor/intentional ⚠️ | Tell ❌ |
|---|---|---|---|---|
| Color & gradient | 4 | 4 | 0 | 0 |
| Layout & composition | 6 | 4 | 2 | 0 |
| Typography | 3 | 3 | 0 | 0 |
| Components & icons | 6 | 5 | 1 | 0 |
| Copy & content | 6 | 6 | 0 | 0 |
| IA & real data | 4 | 4 | 0 | 0 |
| Accessibility & technical | 6 | 5 | 0 | 1 (fixed) |
| **Total** | **35** | **31** | **3** | **1 (fixed)** |

**Verdict:** the trainer reads as intentionally, human-designed — a bespoke warm-graphite/
champagne-amber system, a real serif/sans/mono type pairing, real data end-to-end, wired
interactions, AA contrast, and no gradients/glass/testimonials/placeholder slop. The single
concrete tell — no reduced-motion handling — has been fixed. The ⚠️ items (centered home
hero, two icon-top nav cards, purposeful Lucide usage) are deliberate and were left as-is.
