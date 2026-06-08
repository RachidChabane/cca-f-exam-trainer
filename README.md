# CCA-F Exam Trainer

A local, bilingual (🇬🇧 English / 🇫🇷 French) practice trainer for the
**Claude Certified Architect — Foundations (CCA-F)** exam. Original,
scenario-based questions and skimmable course summaries, grounded in Anthropic's
official documentation. Everything runs locally; nothing is stored in the browser
or sent to any backend.

> 🇫🇷 **Version française plus bas** — voir [§ Français](#français).

![Built with Vite + React + Tailwind](https://img.shields.io/badge/Vite-React-informational)

---

## ✨ What's inside

- **Exam mode** — a timed, 60-question mock exam, randomly sampled to mirror the
  real domain weights (no repeats within a session), with a 120-minute countdown
  (soft warning in the last 10 minutes, auto-submit at zero), question flagging,
  a navigator grid, a **scaled score (100–1000, pass 720)**, a **per-domain
  accuracy breakdown**, and a full answer review with explanations.
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
npm run build        # type-check + production build
npm run preview      # preview the production build
npm run check:data   # validate the question/course data files
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
- **Switch language:** use the **EN / FR** toggle (top-right). It changes
  everything instantly. Language and theme are in-memory only — a refresh resets
  to English + dark.

## 🗂️ Project layout

```
data/
  questions.json     # the exam question pool (bilingual)
  courses.json       # the course summaries (bilingual)
resources/
  blueprint.json     # exam mechanics, domains, weights, scoring
  README.md          # official source manifest (what was used to ground content)
scripts/
  check-data.mjs     # data validation
src/                 # the Vite + React + TypeScript app
```

## ➕ Adding your own content

Both data files are plain JSON arrays — **append** items and the app picks them
up on the next reload. Run `npm run check:data` to validate.

### Add a question — append to `data/questions.json`

```jsonc
{
  "id": "aa-082",                         // unique id
  "domain": "agentic_architecture",        // one of the 5 domain keys below
  "scenario": { "en": "…", "fr": "…" },
  "question": { "en": "…", "fr": "…" },
  "options": {
    "en": ["A …", "B …", "C …", "D …"],    // exactly 4
    "fr": ["A …", "B …", "C …", "D …"]     // same 4, aligned by index
  },
  "correct_index": 0,                      // 0–3, identical for both languages
  "explanation": { "en": "why it's best", "fr": "…" },
  "distractor_explanations": {
    "en": ["why A …", "why B …", "why C …", "why D …"],  // 4, aligned to options
    "fr": ["…", "…", "…", "…"]
  }
}
```

Domain keys: `agentic_architecture`, `claude_code`, `prompt_engineering`,
`tool_design_mcp`, `context_management`.

> Sessions sample per-domain counts from `resources/blueprint.json`
> (`session.domain_session_counts`). Adding more questions deepens the pool the
> session draws from — you don't need to change anything else.

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

---

<a name="français"></a>

# 🇫🇷 Français

Un **entraîneur d'examen local et bilingue** (français / anglais) pour la
certification **Architecte Certifié Claude — Fondations (CCA-F)**. Des questions
originales fondées sur des scénarios et des résumés de cours faciles à parcourir,
ancrés dans la documentation officielle d'Anthropic. Tout fonctionne en local ;
rien n'est stocké dans le navigateur ni envoyé à un serveur.

## ✨ Contenu

- **Mode examen** — un examen blanc chronométré de 60 questions, tirées au hasard
  pour refléter la pondération réelle des domaines (sans répétition dans une
  session), avec un compte à rebours de 120 minutes (alerte dans les 10 dernières
  minutes, soumission automatique à zéro), le marquage de questions, une grille de
  navigation, un **score normalisé (100–1000, seuil 720)**, une **répartition de
  la précision par domaine** et une revue complète des réponses avec explications.
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
- **Changer de langue :** la bascule **EN / FR** (en haut à droite) change tout
  instantanément. La langue et le thème ne sont qu'en mémoire — un rafraîchissement
  revient à l'anglais + sombre.

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
