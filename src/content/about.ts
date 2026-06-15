import type { Lang } from '@/types'

/**
 * Content for the About page: the one place that explains, in plain language,
 * why and how this trainer mirrors the real CCA-F exam, and is honest about what
 * is officially confirmed versus what we inferred. Authored bilingually with the
 * same `fr: typeof en` parity guarantee as the UI dictionary, so the two
 * languages can never drift. Section bodies are Markdown (rendered with the same
 * editorial styling as Study mode). Dynamic facts (the 6 themes, the 5 domain
 * weights, the live counts) are pulled from the data layer in the view, not
 * duplicated here, so they stay in lockstep with the question pool.
 *
 * Style: no em-dashes in any learner-facing string, and no references to internal
 * repo files. Keep it that way.
 */

export interface AboutSection {
  id: string
  title: string
  /** Markdown, rendered with the shared prose styling. */
  body: string
}

export interface MirrorRow {
  /** What the real exam does. */
  real: string
  /** How this trainer reproduces it. */
  ours: string
}

export interface AboutSource {
  label: string
  detail: string
  url: string
  kind: 'first-party' | 'community'
}

export interface AboutContent {
  kicker: string
  title: string
  lead: string
  tocLabel: string
  sections: AboutSection[]
  themesIntro: string
  domainsIntro: string
  mirrorTitle: string
  mirrorRealHead: string
  mirrorOursHead: string
  mirror: MirrorRow[]
  confirmedTitle: string
  confirmedNote: string
  confirmed: string[]
  inferredTitle: string
  inferredNote: string
  inferred: string[]
  sourcesTitle: string
  sourcesNote: string
  firstPartyLabel: string
  communityLabel: string
  sources: AboutSource[]
  updated: string
}

const en: AboutContent = {
  kicker: 'Why this trainer is shaped the way it is',
  title: 'How this platform mirrors the real exam',
  lead: 'The Claude Certified Architect (Foundations), or CCA-F, exam does not ask trivia. It drops you inside a production system and asks you to make the right architectural call, over and over, about the same system. This trainer is built around that exact shape. Below you will find how the real exam works, how its scenarios connect to their questions, and the precise choices we made to reproduce it, with sources and an honest line between what is confirmed and what we inferred.',
  tocLabel: 'On this page',

  sections: [
    {
      id: 'how-real',
      title: 'How the real exam is built',
      body: `CCA-F is Anthropic's first official technical certification, launched in **March 2026** as part of the Claude Partner Network. It targets solution architects building production systems with Claude, and it tests **architectural judgment rather than recall**.

Every question is multiple choice (**one correct answer and three distractors**), but no question is asked in a vacuum. Each one is *wrapped in a scenario*: a description of a real production system. A single sitting presents **four scenarios, drawn at random from a fixed pool of six**, and every question is anchored to one of those four.

- **Format:** scenario-based multiple choice; 4 options (1 correct + 3 plausible distractors)
- **Length:** about **60 questions in 120 minutes**
- **Scoring:** scaled **100–1000**, with a **pass mark of 720** (scaled scoring equates difficulty across forms)
- **No guessing penalty:** an unanswered question simply counts as incorrect

The distractors are the hard part: each is *almost* right. You cannot pattern-match your way through; you have to know **why** one architecture beats the others for that specific system.`,
    },
    {
      id: 'scenario-questions',
      title: 'How a scenario connects to its questions',
      body: `This is the heart of the format, and the thing most flat question banks get wrong.

A scenario is **not** a one-line setup for a single question. It is a **dense, shared context** (a production system with its constraints, its tools, its failure modes), and a **whole set of questions hangs off it**. You read the system once, then answer a run of linked questions that all interrogate *that same system* from different angles.

Two consequences follow, and both shape how you should think:

1. **The questions are grouped, not standalone.** Within a scenario the questions interconnect; you stay "inside" one system for the whole block rather than context-switching every question.
2. **One scenario spans multiple domains.** A single customer-support system will ask you an *agentic-architecture* question, then a *tool-design* question, then a *context-management* question, all about the same agent. Recognising the scenario type early lets you apply one mental model across the whole set instead of treating each question in isolation.

As the prep community puts it: on this exam you are **"solving systems, not questions."** That is precisely why we anchor every question to a rich scenario and keep that scenario in front of you the entire time you work its set.`,
    },
    {
      id: 'how-we-mirror',
      title: 'How this trainer mirrors it',
      body: `We rebuilt the trainer around the scenario-set format end to end: not a flat list of one-off questions, but **24 original scenarios** (four distinct instances of each of the six themes), each a multi-paragraph production brief with exhibits (code sketches, tool tables, configs) that frames a **15-question set** spanning all five domains.

A practice sitting reproduces the real draw: it picks **4 of the 6 themes at random**, one instance of each, and presents each scenario's questions as a contiguous block while the **scenario context stays pinned beside every question** in the set. The table below maps each real-exam behaviour to the choice we made to reproduce it.`,
    },
    {
      id: 'confirmed-inferred',
      title: "What's confirmed vs. what we inferred",
      body: `We hold answer accuracy and honesty as non-negotiable, so we are explicit about our evidence. Some of the format is stated in Anthropic's official exam guide; some of the finer numbers are only consistently reported by third-party prep sites and are reasonable simulation defaults, not authoritative facts. We label both clearly, right here.`,
    },
  ],

  themesIntro:
    'The six fixed scenario themes. A sitting presents four of these, drawn at random:',
  domainsIntro:
    'The five exam domains and their official weights. Every scenario in this trainer carries all five:',

  mirrorTitle: 'Real exam → this trainer',
  mirrorRealHead: 'The real exam',
  mirrorOursHead: 'This trainer',
  mirror: [
    {
      real: 'Presents 4 scenarios, drawn at random from a fixed pool of 6.',
      ours: 'Each sitting draws 4 of the same 6 themes at random, one instance of each.',
    },
    {
      real: 'Every question is anchored to a production scenario.',
      ours: "The scenario's context stays pinned beside every question for that whole set.",
    },
    {
      real: 'Questions are grouped by scenario, not standalone.',
      ours: 'Questions are delivered in contiguous per-scenario blocks; the navigator groups them by scenario.',
    },
    {
      real: 'One scenario spans multiple domains.',
      ours: 'Every scenario carries a fixed 4/3/3/3/2 split across all five domains.',
    },
    {
      real: 'About 60 questions in 120 minutes.',
      ours: 'A 60-question, 120-minute timed mock (4 sets × 15 questions).',
    },
    {
      real: 'Scaled 100–1000, pass mark 720.',
      ours: 'Same scale and pass mark, via a documented linear approximation.',
    },
    {
      real: 'Distractors are plausible, almost-right answers.',
      ours: 'Every distractor carries its own written rebuttal in the answer review.',
    },
    {
      real: 'Six fixed real-world themes.',
      ours: '24 original scenarios, four distinct instances per theme, so replay stays fresh.',
    },
  ],

  confirmedTitle: 'Confirmed by Anthropic',
  confirmedNote: "Stated in Anthropic's official exam guide / program materials:",
  confirmed: [
    'The scenario-based, multiple-choice format with 4 options (1 correct + 3 distractors).',
    'The 4-of-6 scenario structure, and the six fixed scenario themes.',
    'The five domains and their 27 / 18 / 20 / 20 / 15 weights.',
    'Scaled scoring from 100–1000 with a pass mark of 720.',
    'No guessing penalty: unanswered counts as incorrect.',
  ],

  inferredTitle: 'Inferred or community-reported',
  inferredNote: 'Consistent across third-party prep sites or derived by us; reasonable defaults, not authoritative:',
  inferred: [
    'The 60-question count and 120-minute limit (consistent across prep sites; not in the official guide).',
    'The 15 questions per scenario: our derivation from 60 ÷ 4 scenarios; the real split per scenario is not published.',
    'The uniform 4/3/3/3/2 per-scenario domain split: our choice so any 4-of-6 draw lands on the official weights (a deliberate design decision, explained on this page).',
    'The exact scaled-score curve: Anthropic’s is proprietary, so we use a transparent linear approximation, 100 + (correct / 60) × 900.',
  ],

  sourcesTitle: 'Sources',
  sourcesNote:
    'All questions and summaries in this trainer are original, written for this project and grounded only in first-party Anthropic material; no third-party question banks were copied. The sources below ground the exam format described on this page.',
  firstPartyLabel: 'First-party (Anthropic)',
  communityLabel: 'Community / prep sites',
  sources: [
    {
      label: 'Claude Partner Network',
      detail: 'Program announcement introducing the Claude Certified Architect, Foundations certification.',
      url: 'https://www.anthropic.com/news/claude-partner-network',
      kind: 'first-party',
    },
    {
      label: 'Anthropic Academy',
      detail: 'Course platform hosting the CCA-F learning path and the official exam guide.',
      url: 'https://anthropic.skilljar.com/',
      kind: 'first-party',
    },
    {
      label: 'Anthropic Learn',
      detail: 'AI learning resources hub.',
      url: 'https://www.anthropic.com/learn',
      kind: 'first-party',
    },
    {
      label: 'The Claude Certified Architect Exam: 5 Domains, 6 Scenarios',
      detail: 'Describes the 4-of-6 scenario draw and that questions are grouped by scenario, not standalone.',
      url: 'https://dev.to/aws-builders/the-claude-certified-architect-exam-5-domains-6-scenarios-and-everything-you-need-to-know-4le3',
      kind: 'community',
    },
    {
      label: 'How to Pass the CCA-F Exam: 2026 Study Guide',
      detail: 'Notes that scenarios are shared production-system backdrops and questions layer through each.',
      url: 'https://aiforanything.io/blog/claude-certified-architect-cca-exam-guide-2026',
      kind: 'community',
    },
    {
      label: 'CCA-F 2026: Claude Certified Architect (Foundations) Guide',
      detail: 'Corroborates the 60-question / 120-minute format and 720 scaled pass mark.',
      url: 'https://open-exam-prep.com/blog/cca-f-claude-certified-architect-foundations-guide-2026',
      kind: 'community',
    },
    {
      label: 'Claude Certified Architect (CCA-F): Complete Guide 2026',
      detail: 'Corroborates the scenario-anchored question style and domain weights.',
      url: 'https://preporato.com/blog/claude-certified-architect-complete-guide-2026',
      kind: 'community',
    },
  ],

  updated: 'Reviewed June 2026 against current first-party and community sources.',
}

const fr: AboutContent = {
  kicker: 'Pourquoi cet entraîneur est conçu ainsi',
  title: 'Comment cette plateforme reflète le vrai examen',
  lead: "L'examen Architecte Certifié Claude (Fondations), ou CCA-F, ne pose pas de questions de mémorisation. Il vous place à l'intérieur d'un système de production et vous demande de faire le bon choix d'architecture, encore et encore, à propos du même système. Cet entraîneur est bâti autour de cette forme exacte. Vous trouverez ci-dessous comment fonctionne le vrai examen, comment ses scénarios se relient à leurs questions, et les choix précis que nous avons faits pour le reproduire, avec nos sources et une ligne honnête entre ce qui est confirmé et ce que nous avons déduit.",
  tocLabel: 'Sur cette page',

  sections: [
    {
      id: 'how-real',
      title: 'Comment le vrai examen est construit',
      body: `Le CCA-F est la première certification technique officielle d'Anthropic, lancée en **mars 2026** dans le cadre du Claude Partner Network. Il s'adresse aux architectes de solutions qui bâtissent des systèmes de production avec Claude, et il évalue le **jugement architectural plutôt que la mémorisation**.

Chaque question est à choix multiple (**une bonne réponse et trois distracteurs**), mais aucune n'est posée hors contexte. Chacune est *enveloppée dans un scénario* : la description d'un système de production réel. Une session présente **quatre scénarios, tirés au hasard d'un pool fixe de six**, et chaque question est rattachée à l'un de ces quatre.

- **Format :** choix multiple fondé sur des scénarios ; 4 options (1 correcte + 3 distracteurs plausibles)
- **Longueur :** environ **60 questions en 120 minutes**
- **Notation :** score normalisé **100–1000**, avec un **seuil de réussite de 720** (la normalisation égalise la difficulté entre les formes)
- **Pas de pénalité :** une question sans réponse compte simplement comme fausse

Les distracteurs sont le piège : chacun est *presque* juste. Impossible de s'en sortir par reconnaissance de motifs ; il faut savoir **pourquoi** une architecture l'emporte sur les autres pour ce système précis.`,
    },
    {
      id: 'scenario-questions',
      title: 'Comment un scénario se relie à ses questions',
      body: `C'est le cœur du format, et ce que la plupart des banques de questions à plat ratent.

Un scénario n'est **pas** une amorce d'une ligne pour une seule question. C'est un **contexte dense et partagé** (un système de production avec ses contraintes, ses outils, ses modes de défaillance), et **tout un jeu de questions en découle**. Vous lisez le système une fois, puis répondez à une série de questions liées qui interrogent toutes *ce même système* sous différents angles.

Deux conséquences en découlent, et elles changent votre façon de penser :

1. **Les questions sont groupées, pas isolées.** Au sein d'un scénario, les questions s'enchaînent ; vous restez « à l'intérieur » d'un système pour tout le bloc au lieu de changer de contexte à chaque question.
2. **Un scénario couvre plusieurs domaines.** Un même système de support client posera une question d'*architecture agentique*, puis une de *conception d'outils*, puis une de *gestion du contexte*, toutes à propos du même agent. Reconnaître tôt le type de scénario permet d'appliquer un seul modèle mental à tout le jeu plutôt que de traiter chaque question isolément.

Comme le résume la communauté de préparation : à cet examen, vous **« résolvez des systèmes, pas des questions »**. C'est exactement pourquoi nous rattachons chaque question à un scénario riche et le gardons sous vos yeux tout le temps où vous traitez son jeu.`,
    },
    {
      id: 'how-we-mirror',
      title: 'Comment cet entraîneur le reproduit',
      body: `Nous avons rebâti l'entraîneur autour du format en jeux de scénarios de bout en bout : non pas une liste plate de questions isolées, mais **24 scénarios originaux** (quatre instances distinctes de chacun des six thèmes), chacun un dossier de production de plusieurs paragraphes avec des pièces jointes (esquisses de code, tableaux d'outils, configurations) qui encadre un **jeu de 15 questions** couvrant les cinq domaines.

Une session d'entraînement reproduit le tirage réel : elle choisit **4 des 6 thèmes au hasard**, une instance de chacun, et présente les questions de chaque scénario en bloc contigu tandis que le **contexte du scénario reste épinglé à côté de chaque question** du jeu. Le tableau ci-dessous relie chaque comportement du vrai examen au choix que nous avons fait pour le reproduire.`,
    },
    {
      id: 'confirmed-inferred',
      title: 'Ce qui est confirmé et ce que nous avons déduit',
      body: `Nous tenons l'exactitude des réponses et l'honnêteté pour non négociables ; nous sommes donc explicites sur nos preuves. Une partie du format figure dans le guide officiel d'Anthropic ; certains chiffres plus fins ne sont rapportés de façon constante que par des sites de préparation tiers et constituent des valeurs de simulation raisonnables, non des faits autoritatifs. Nous étiquetons les deux clairement, ici même.`,
    },
  ],

  themesIntro:
    'Les six thèmes de scénario fixes. Une session en présente quatre, tirés au hasard :',
  domainsIntro:
    'Les cinq domaines de l’examen et leurs pondérations officielles. Chaque scénario de cet entraîneur porte les cinq :',

  mirrorTitle: 'Vrai examen → cet entraîneur',
  mirrorRealHead: 'Le vrai examen',
  mirrorOursHead: 'Cet entraîneur',
  mirror: [
    {
      real: 'Présente 4 scénarios, tirés au hasard d’un pool fixe de 6.',
      ours: 'Chaque session tire 4 des 6 mêmes thèmes au hasard, une instance de chacun.',
    },
    {
      real: 'Chaque question est rattachée à un scénario de production.',
      ours: 'Le contexte du scénario reste épinglé à côté de chaque question de tout le jeu.',
    },
    {
      real: 'Les questions sont groupées par scénario, pas isolées.',
      ours: 'Les questions arrivent en blocs contigus par scénario ; le navigateur les groupe par scénario.',
    },
    {
      real: 'Un scénario couvre plusieurs domaines.',
      ours: 'Chaque scénario porte une répartition fixe 4/3/3/3/2 sur les cinq domaines.',
    },
    {
      real: 'Environ 60 questions en 120 minutes.',
      ours: 'Un examen blanc chronométré de 60 questions en 120 minutes (4 jeux × 15).',
    },
    {
      real: 'Score normalisé 100–1000, seuil de réussite 720.',
      ours: 'Même échelle et même seuil, via une approximation linéaire documentée.',
    },
    {
      real: 'Les distracteurs sont plausibles, presque justes.',
      ours: 'Chaque distracteur porte sa propre réfutation écrite dans la revue des réponses.',
    },
    {
      real: 'Six thèmes fixes inspirés du réel.',
      ours: '24 scénarios originaux, quatre instances distinctes par thème, pour que la reprise reste fraîche.',
    },
  ],

  confirmedTitle: 'Confirmé par Anthropic',
  confirmedNote: 'Indiqué dans le guide officiel / les supports du programme d’Anthropic :',
  confirmed: [
    'Le format à choix multiple fondé sur des scénarios, avec 4 options (1 correcte + 3 distracteurs).',
    'La structure 4 scénarios sur 6, et les six thèmes de scénario fixes.',
    'Les cinq domaines et leurs pondérations 27 / 18 / 20 / 20 / 15.',
    'La notation normalisée de 100 à 1000 avec un seuil de réussite de 720.',
    'Pas de pénalité de réponse : une absence de réponse compte comme fausse.',
  ],

  inferredTitle: 'Déduit ou rapporté par la communauté',
  inferredNote: 'Constant sur les sites de préparation tiers ou déduit par nous ; valeurs raisonnables, non autoritatives :',
  inferred: [
    'Le nombre de 60 questions et la limite de 120 minutes (constants sur les sites de préparation ; absents du guide officiel).',
    'Les 15 questions par scénario : notre déduction à partir de 60 ÷ 4 scénarios ; la répartition réelle par scénario n’est pas publiée.',
    'La répartition uniforme 4/3/3/3/2 par scénario : notre choix pour que tout tirage 4 sur 6 retombe sur les pondérations officielles (un choix de conception délibéré, expliqué sur cette page).',
    'La courbe exacte de normalisation : celle d’Anthropic est propriétaire, nous utilisons donc une approximation linéaire transparente, 100 + (bonnes / 60) × 900.',
  ],

  sourcesTitle: 'Sources',
  sourcesNote:
    "Toutes les questions et tous les résumés de cet entraîneur sont originaux, rédigés pour ce projet et ancrés uniquement dans des supports Anthropic de première main ; aucune banque de questions tierce n'a été copiée. Les sources ci-dessous étayent le format d'examen décrit sur cette page.",
  firstPartyLabel: 'Première main (Anthropic)',
  communityLabel: 'Communauté / sites de préparation',
  sources: [
    {
      label: 'Claude Partner Network',
      detail: 'Annonce du programme introduisant la certification Architecte Certifié Claude, Fondations.',
      url: 'https://www.anthropic.com/news/claude-partner-network',
      kind: 'first-party',
    },
    {
      label: 'Anthropic Academy',
      detail: "Plateforme de cours hébergeant le parcours CCA-F et le guide officiel de l'examen.",
      url: 'https://anthropic.skilljar.com/',
      kind: 'first-party',
    },
    {
      label: 'Anthropic Learn',
      detail: "Pôle de ressources d'apprentissage de l'IA.",
      url: 'https://www.anthropic.com/learn',
      kind: 'first-party',
    },
    {
      label: 'The Claude Certified Architect Exam : 5 Domains, 6 Scenarios',
      detail: 'Décrit le tirage 4 sur 6 et le fait que les questions sont groupées par scénario, non isolées.',
      url: 'https://dev.to/aws-builders/the-claude-certified-architect-exam-5-domains-6-scenarios-and-everything-you-need-to-know-4le3',
      kind: 'community',
    },
    {
      label: 'How to Pass the CCA-F Exam : 2026 Study Guide',
      detail: 'Note que les scénarios sont des toiles de fond partagées et que les questions s’y superposent.',
      url: 'https://aiforanything.io/blog/claude-certified-architect-cca-exam-guide-2026',
      kind: 'community',
    },
    {
      label: 'CCA-F 2026 : Claude Certified Architect (Foundations) Guide',
      detail: 'Corrobore le format 60 questions / 120 minutes et le seuil normalisé de 720.',
      url: 'https://open-exam-prep.com/blog/cca-f-claude-certified-architect-foundations-guide-2026',
      kind: 'community',
    },
    {
      label: 'Claude Certified Architect (CCA-F) : Complete Guide 2026',
      detail: 'Corrobore le style de questions ancrées dans des scénarios et les pondérations par domaine.',
      url: 'https://preporato.com/blog/claude-certified-architect-complete-guide-2026',
      kind: 'community',
    },
  ],

  updated: 'Revu en juin 2026 au regard des sources actuelles, de première main et communautaires.',
}

export const ABOUT: Record<Lang, AboutContent> = { en, fr }
