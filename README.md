# CCA-F Exam Trainer

A local, bilingual (🇬🇧 English / 🇫🇷 French) practice trainer for the
**Claude Certified Architect — Foundations (CCA-F)** exam. Original,
scenario-based questions and skimmable course summaries, grounded in Anthropic's
official documentation. Everything runs locally — your in-progress exam, results
history, and preferences are saved only in your browser's `localStorage`, and
nothing is ever sent to a backend.

> 🇫🇷 **Version française plus bas** — voir [§ Français](#français).

![Built with Vite + React + Tailwind](https://img.shields.io/badge/Vite-React-informational)

---

## ✨ What's inside

- **Exam mode (scenario sets)** — a timed mock built like the real exam: **4 of
  the 6 fixed scenario themes**, each presented as a dense, multi-paragraph
  production scenario (with exhibits — configs, code, logs, tables) that **frames
  a set of ~15 linked questions**. The scenario context stays **pinned beside
  every question** in its set, the way the real exam makes you reason over one
  situation at a time. ~60 questions, a 120-minute countdown (soft warning in the
  last 10 minutes, auto-submit at zero), flagging, a **scenario-grouped
  navigator**, a **scaled score (100–1000, pass 720)**, a **per-domain accuracy
  breakdown**, and a full answer review with explanations.
- **A deep pool for replay** — the trainer ships **4 distinct instances of each of
  the 6 themes (24 scenarios, 360 questions)**. Each sitting picks one random
  instance per theme, so no two sittings feel alike. Every scenario carries the
  same per-domain split (4/3/3/3/2 — the rounding of the 27/18/20/20/15 weights to
  15), so any 4-of-6 sitting lands on the real domain distribution.
- **Scenario mode (4 of 6)** — a preserved entry point (referenced by external
  study plans) that launches the same scenario-set sitting as Exam mode.
- **Practice & progress** — untimed **per-domain drills**, a **retry-wrong-only**
  pass after any session, **resume** of an in-progress timed mock after a refresh
  or slept laptop, and a **recent-attempts** score history — all saved locally in
  your browser.
- **Study mode** — fast, original summaries of every course on the CCA-F learning
  path, with the key concepts surfaced and self-check questions whose answers stay
  hidden until you reveal them.
- **Instant 🇬🇧/🇫🇷 toggle** — flips *all* UI chrome and *all* content
  (questions, options, explanations, course bodies) at once.
- **Dark / light theme**, tuned for long, low-eye-strain sessions.

## 🚀 Install & run

Requires **Node.js ≥ 20** (developed on Node 25).

```bash
npm install      # one-time: install dependencies
npm run dev      # start the app
```

Then open **http://localhost:5173** in your browser. That's the whole setup —
no environment variables, no database, no accounts.

Other scripts:

```bash
npm run build         # type-check + production build
npm run preview       # preview the production build
npm run check:data    # validate the question/course data schema
npm run fact-check    # verify the exam facts against the official guide
npm run fact-check:llm # optional AI review of answer keys (needs ANTHROPIC_API_KEY)
npm run verify        # check:data + fact-check + build, in one shot
npm run test:e2e      # build, boot a preview server, run the Playwright suite
```

## 🧭 Using the app

- **Take an exam:** click **Exam → Start exam**. Answer with the radio options,
  move with **Previous/Next** or the **Navigator** grid, **Flag** anything to
  revisit, then **Submit** (or let the timer auto-submit). You'll get a scaled
  score, a pass/fail verdict, a per-domain breakdown, and a full review of every
  question — your answer, the correct answer, why it's best, and why each
  distractor falls short.
- **Study:** click **Study**, pick a course in the left index, read the summary,
  scan the key concepts, and test yourself with the **Show answer** check
  questions.
- **Practice a single domain:** on the Exam screen, use **Practice by domain** to
  start an untimed drill of your weakest area — no countdown, full review after.
- **Retry your misses:** after any exam or drill, hit **Retry _n_ wrong** to
  re-quiz only the questions you got wrong.
- **Resume & track progress:** an in-progress timed mock survives a refresh or a
  slept laptop (pick it back up from the home banner), and **Recent attempts** on
  the Exam screen shows your score trend across sessions.
- **Switch language:** use the **EN / FR** toggle (top-right). It changes
  everything instantly. Language, theme, and progress persist across refreshes
  (stored locally in your browser).

## 🔁 CI/CD

Every push and PR to `main` runs a GitHub Actions pipeline
([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) with four jobs:

1. **Validate** — schema validation (`check:data`), **automated fact-checking**
   (`fact-check`), and a type-checked production build.
2. **End-to-end** — the **Playwright** suite runs against the real production
   bundle (served by `vite preview`); the HTML report is uploaded as an artifact.
3. **AI fact-check** *(optional)* — if an `ANTHROPIC_API_KEY` repository secret is
   set, Claude reviews a sample of answer keys for factual errors. A safe no-op
   (and never a blocker) when the secret is absent.
4. **Deploy** — on a green `main`, the app is built with the Pages base path and
   published to **GitHub Pages**.

The two fact-check layers are deliberate: `fact-check` is **deterministic** — it
pins the first-party CCA-F parameters (domains, weights, scaled scoring, the
4-of-6 scenarios) and fails the build on drift, while also enforcing that
community-reported numbers stay *labeled* as such. `fact-check:llm` is the
advisory AI layer for the answer keys themselves.

## 🗂️ Project layout

```
data/
  scenarios.json     # the scenario-set pool: 24 scenarios × 15 linked questions (bilingual)
  courses.json       # the course summaries (bilingual)
resources/
  blueprint.json     # exam mechanics, domains, weights, scoring
  README.md          # official source manifest (what was used to ground content)
scripts/
  check-data.mjs     # data-schema validation
  fact-check.mjs     # deterministic fact-check vs. the official exam guide
  fact-check-llm.mjs # optional Claude-powered answer-key review
e2e/                 # Playwright end-to-end tests
playwright.config.ts # E2E config (runs against the production preview build)
.github/workflows/   # CI/CD pipeline (validate · e2e · fact-check · deploy)
src/                 # the Vite + React + TypeScript app
```

## ➕ Adding your own content

Both data files are plain JSON arrays — **append** items and the app picks them
up on the next reload. Run `npm run check:data` to validate.

### Add a scenario — append to `data/scenarios.json`

Each item is a **scenario set**: one dense, shared production context plus its 15
linked questions (split `4/3/3/3/2` across the five domains).

```jsonc
{
  "id": "customer_support-05",             // unique id, "<theme>-NN"
  "theme": "customer_support",             // one of the 6 theme ids below
  "instance": 5,                           // instance number within the theme
  "title": { "en": "…", "fr": "…" },
  "context": { "en": "## dense markdown + an exhibit", "fr": "…" },  // shared by every question
  "domains": ["agentic_architecture","tool_design_mcp","claude_code","prompt_engineering","context_management"],
  "questions": [
    {
      "id": "customer_support-05-q01",
      "domain": "agentic_architecture",     // one of the 5 domain keys
      "stem": { "en": "Given the architecture above, …", "fr": "…" },  // leans on the context
      "options": {
        "en": ["A …", "B …", "C …", "D …"],  // exactly 4
        "fr": ["A …", "B …", "C …", "D …"]   // same 4, aligned by index
      },
      "correct_index": 0,                    // 0–3, identical for both languages
      "explanation": { "en": "why it's best", "fr": "…" },
      "distractor_explanations": {
        "en": ["Correct: …", "why B …", "why C …", "why D …"],  // 4, aligned to options
        "fr": ["Correct : …", "…", "…", "…"]
      }
    }
    // … 15 questions: agentic ×4, tool_design_mcp ×3, claude_code ×3, prompt_engineering ×3, context_management ×2
  ]
}
```

Theme ids: `customer_support`, `code_generation`, `multi_agent_research`,
`developer_productivity`, `continuous_integration`, `structured_extraction`.
Domain keys: `agentic_architecture`, `claude_code`, `prompt_engineering`,
`tool_design_mcp`, `context_management`.

> A sitting draws 4 of the 6 themes and one random instance of each. Adding more
> instances per theme deepens replay value — `npm run check:data` enforces the
> 15-question, 4/3/3/3/2 shape so every 4-of-6 sitting stays weight-correct.

### Add a course summary — append to `data/courses.json`

```jsonc
{
  "id": "my-course",
  "course_title": { "en": "…", "fr": "…" },
  "source_url": "https://anthropic.skilljar.com/…",
  "domain": "tool_design_mcp",            // optional: a domain key
  "summary": { "en": "## markdown …", "fr": "## markdown …" },
  "key_concepts": { "en": ["…"], "fr": ["…"] },   // same length, aligned
  "check_questions": [
    { "q": { "en": "…", "fr": "…" }, "a": { "en": "…", "fr": "…" } }
  ]
}
```

`summary` is rendered as Markdown. Provide at least 3 `check_questions`.

## 🧮 How scoring works

The real exam's scaling is proprietary. This trainer uses a documented linear
approximation so the pass line behaves realistically:

```
scaled = round(100 + (correct / total) × 900)     // pass at 720 ≈ 70% correct
```

## 🛠️ Tech

Vite · React 19 · TypeScript · Tailwind CSS v4 · Zustand · react-markdown.
Design language adapted from the *Bayan / Knowledge Master* project (warm
graphite + champagne-amber, Inter / Fraunces / JetBrains Mono).

## 📄 Content & sources

All questions and summaries are **original**, grounded in first-party Anthropic
documentation — see [`resources/README.md`](./resources/README.md) for the full
source manifest. No third-party question banks were used.

> **About the exam facts.** Anthropic's official exam guide confirms the
> **format** (scenario-based, 4 options, 1 correct, no guessing penalty), the
> **scoring** (scaled 100–1000, pass 720), the **4-of-6 scenario structure**, and
> the **five domains + weights** (27/18/20/20/15). The **60-question count**,
> **120-minute** limit, **proctoring**, **$99** fee, and **"301" level** are
> *community-reported* (third-party prep sites, not the official guide) — kept as
> reasonable simulation defaults, but verify your real registration details with
> Anthropic and treat the official **Practice Exam** as your true readiness gauge.

---

<a name="français"></a>

# 🇫🇷 Français

Un **entraîneur d'examen local et bilingue** (français / anglais) pour la
certification **Architecte Certifié Claude — Fondations (CCA-F)**. Des questions
originales fondées sur des scénarios et des résumés de cours faciles à parcourir,
ancrés dans la documentation officielle d'Anthropic. Tout fonctionne en local —
votre examen en cours, votre historique de résultats et vos préférences sont
enregistrés uniquement dans le `localStorage` de votre navigateur, et rien n'est
jamais envoyé à un serveur.

## ✨ Contenu

- **Mode examen (jeux de scénarios)** — un examen blanc chronométré bâti comme le
  vrai : **4 des 6 thèmes de scénario fixes**, chacun présenté comme un scénario de
  production dense et multi-paragraphe (avec des pièces jointes — configs, code,
  journaux, tableaux) qui **encadre un jeu d'environ 15 questions liées**. Le
  contexte du scénario reste **épinglé à côté de chaque question** de son jeu.
  ≈60 questions, compte à rebours de 120 minutes (alerte dans les 10 dernières
  minutes, soumission automatique à zéro), marquage, un **navigateur groupé par
  scénario**, un **score normalisé (100–1000, seuil 720)**, une **répartition de la
  précision par domaine** et une revue complète des réponses.
- **Un pool profond pour la rejouabilité** — l'entraîneur fournit **4 instances
  distinctes de chacun des 6 thèmes (24 scénarios, 360 questions)**. Chaque session
  choisit une instance au hasard par thème, donc deux sessions ne se ressemblent
  jamais. Chaque scénario porte la même répartition par domaine (4/3/3/3/2), donc
  toute combinaison 4 sur 6 retombe sur la pondération réelle.
- **Mode scénarios (4 sur 6)** — un point d'entrée conservé (référencé par des
  plans de révision externes) qui lance la même session en jeux de scénarios.
- **Entraînement et progression** — des **exercices par domaine** sans
  chronomètre, une reprise des **seules questions fausses** après une session, la
  **reprise** d'un examen chronométré en cours après un rafraîchissement, et un
  **historique des tentatives** — le tout enregistré localement dans votre navigateur.
- **Mode révision** — des résumés rapides et originaux de chaque cours du parcours
  CCA-F, avec les concepts clés mis en évidence et des questions d'auto-évaluation
  dont la réponse reste masquée jusqu'à ce que vous la révéliez.
- **Bascule 🇫🇷/🇬🇧 instantanée** — change *toute* l'interface et *tout* le
  contenu (questions, options, explications, cours) d'un coup.
- **Thème sombre / clair**, pensé pour de longues sessions reposantes pour les yeux.

## 🚀 Installation et lancement

Nécessite **Node.js ≥ 20** (développé avec Node 25).

```bash
npm install      # une fois : installer les dépendances
npm run dev      # lancer l'application
```

Ouvrez ensuite **http://localhost:5173**. C'est toute la configuration — aucune
variable d'environnement, aucune base de données, aucun compte.

## 🧭 Utilisation

- **Passer un examen :** **Examen → Commencer l'examen**. Répondez avec les
  options, naviguez avec **Précédent/Suivant** ou la grille du **Navigateur**,
  **Marquez** les questions à revoir, puis **Soumettez** (ou laissez le minuteur
  soumettre automatiquement). Vous obtenez un score normalisé, un verdict
  réussite/échec, une répartition par domaine et une revue complète de chaque
  question.
- **Réviser :** **Réviser**, choisissez un cours dans l'index de gauche, lisez le
  résumé, parcourez les concepts clés et testez-vous avec les questions
  « Afficher la réponse ».
- **Réviser un seul domaine :** sur l'écran Examen, utilisez **Réviser par
  domaine** pour lancer un exercice sans chronomètre sur votre point faible —
  pas de compte à rebours, revue complète ensuite.
- **Reprendre vos erreurs :** après un examen ou un exercice, cliquez sur
  **Reprendre _n_ fausses** pour ne réviser que les questions ratées.
- **Reprise et suivi :** un examen chronométré en cours survit à un
  rafraîchissement ou à une mise en veille (reprenez-le depuis la bannière
  d'accueil), et **Tentatives récentes** affiche l'évolution de vos scores.
- **Changer de langue :** la bascule **EN / FR** (en haut à droite) change tout
  instantanément. La langue, le thème et la progression persistent entre les
  rafraîchissements (stockés localement dans votre navigateur).

## ➕ Ajouter votre propre contenu

Les deux fichiers de données sont de simples tableaux JSON — **ajoutez** des
éléments et l'application les prend en compte au rechargement suivant. Lancez
`npm run check:data` pour valider. Le schéma de chaque question et de chaque cours
est documenté dans la section anglaise ci-dessus (champs identiques) ; chaque
champ textuel existe en `en` et `fr`, les options sont au nombre de 4 et alignées
par index, et `correct_index` est identique dans les deux langues.

## 📄 Contenu et sources

Toutes les questions et tous les résumés sont **originaux**, ancrés dans la
documentation Anthropic de première partie — voir
[`resources/README.md`](./resources/README.md). Aucune banque de questions tierce
n'a été utilisée.

> **À propos des faits d'examen.** Le guide officiel d'Anthropic confirme le
> **format** (scénarios, 4 options, 1 correcte, sans pénalité), le **score**
> (échelle 100–1000, seuil 720), la **structure 4 scénarios sur 6** et les **cinq
> domaines + pondérations** (27/18/20/20/15). Le **nombre de 60 questions**, la
> limite de **120 minutes**, la **surveillance**, les **frais de 99 $** et le
> **niveau « 301 »** sont *rapportés par la communauté* (sites tiers, absents du
> guide officiel) — conservés comme valeurs de simulation raisonnables, mais
> vérifiez vos informations d'inscription réelles auprès d'Anthropic et utilisez
> l'**examen blanc officiel** comme véritable indicateur de préparation.
