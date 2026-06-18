import type { Lang } from '@/types'

/**
 * UI chrome strings in both languages. Content strings (questions, options,
 * explanations, course bodies) live in the data files and are selected by
 * language at render time. Parametrized strings are functions.
 *
 * `fr` is typed as `typeof en`, so the compiler guarantees the two languages
 * stay in lockstep, so nothing can be left untranslated.
 */
const en = {
  // Brand / nav
  appName: 'CCA-F Exam Trainer',
  appFull: 'Claude Certified Architect (Foundations)',
  tagline: 'Practice trainer',
  navHome: 'Home',
  navExam: 'Exam',
  navStudy: 'Study',
  navAbout: 'About',
  themeToLight: 'Switch to light mode',
  themeToDark: 'Switch to dark mode',
  langName: 'English',

  // Home
  homeKicker: 'Local practice trainer',
  homeTitle: 'Prepare for the Claude Certified Architect (Foundations) exam',
  homeSubtitle:
    'Original, scenario-based questions and skimmable course summaries, grounded in Anthropic’s official documentation. Everything runs locally, in your language.',
  examCardTitle: 'Exam mode',
  examCardDesc:
    'Sit a timed mock built like the real exam: 4 of 6 scenario sets, each framing ~15 linked questions under one dense production context. Full review after.',
  examCardCta: 'Start a practice exam',
  studyCardTitle: 'Study mode',
  studyCardDesc:
    'Read fast, well-structured summaries of each course on the learning path, with key concepts and self-check questions.',
  studyCardCta: 'Browse course summaries',
  blueprintTitle: 'Exam blueprint',
  domainsHeading: 'Domains & weights',
  poolStatus: (n: number) => `${n} questions in the pool`,
  coursesStatus: (n: number) => `${n} course summaries`,
  loading: 'Loading…',
  mechQuestions: 'Questions',
  mechMinutes: 'Minutes',
  mechPass: 'Pass mark',
  mechOptions: 'Options each',
  weightOfExam: (pct: number) => `${pct}% of exam`,
  poolCountLabel: (n: number) => `${n} in pool`,

  // Exam intro
  examIntroTitle: 'Practice exam',
  examIntroDesc:
    'A fresh sitting built like the real exam: 4 of the 6 fixed scenario themes, each framing a ~15-question set that shares one dense production context (≈60 questions, 120 minutes). The scenario stays pinned beside every question. Flag, jump with the navigator, and revisit before submitting.',
  examFormatHeading: 'This session',
  distributionHeading: 'Domain distribution',
  startExam: 'Start exam',
  resumeExam: 'Resume exam',
  notEnoughTitle: 'Not enough questions yet',
  notEnoughBody: (have: number, need: number) =>
    `The pool currently holds ${have} questions; a full session needs ${need}. The session will use every available question for now.`,
  questionsUnit: 'questions',
  minutesUnit: 'minutes',

  // Exam runner
  questionOf: (n: number, total: number) => `Question ${n} of ${total}`,
  timeRemaining: 'Time remaining',
  timeAlmostUp: 'Less than 10 minutes left',
  flag: 'Flag',
  flagged: 'Flagged',
  unflag: 'Unflag',
  previous: 'Previous',
  next: 'Next',
  navigator: 'Navigator',
  navigatorHint: 'Jump to any question',
  legendAnswered: 'Answered',
  legendUnanswered: 'Unanswered',
  legendFlagged: 'Flagged',
  legendCurrent: 'Current',
  submitExam: 'Submit exam',
  answeredCount: (a: number, total: number) => `${a}/${total} answered`,

  // Submit dialog
  submitTitle: 'Submit your exam?',
  submitBodyAll: 'You have answered every question. Submit for grading?',
  submitBodySome: (n: number) =>
    `You still have ${n} unanswered question${n === 1 ? '' : 's'}. Unanswered questions are marked incorrect. Submit anyway?`,
  confirmSubmit: 'Submit',
  cancel: 'Cancel',
  autoSubmitNote: 'Time expired. Your exam was submitted automatically.',

  // Results
  resultsTitle: 'Your results',
  scaledScore: 'Scaled score',
  outOf1000: '/ 1000',
  verdictPass: 'PASS',
  verdictFail: 'NOT YET',
  passMessage: 'Above the 720 pass mark. Strong work; keep the weak domains sharp.',
  failMessage: 'Below the 720 pass mark. Focus on your weakest domains below and try again.',
  rawScore: (c: number, t: number) => `${c} of ${t} correct`,
  passLineLabel: 'Pass mark: 720',
  byDomainHeading: 'Accuracy by domain',
  weakestDomain: 'Weakest domain',
  strongestDomain: 'Strongest domain',
  reviewAnswers: 'Review all questions',
  newExam: 'New exam',
  backHome: 'Back to home',
  scoreNoteTitle: 'About this score',
  scoreNote:
    'Anthropic’s official scaling is proprietary. This trainer uses a documented linear approximation: 100 + (correct / 60) × 900, so the 720 line sits at ~70% correct.',

  // Review
  reviewTitle: 'Answer review',
  filterAll: 'All',
  filterIncorrect: 'Incorrect',
  filterFlagged: 'Flagged',
  yourAnswer: 'Your answer',
  correctAnswer: 'Correct answer',
  notAnswered: 'Not answered',
  tagCorrect: 'Correct',
  tagIncorrect: 'Incorrect',
  whyCorrect: 'Why this is the best answer',
  whyIncorrect: 'Why this falls short',
  whyOthers: 'Why the others fall short',
  backToResults: 'Back to results',
  noneMatch: 'No questions match this filter.',
  reviewCountOf: (shown: number, total: number) => `Showing ${shown} of ${total}`,

  // Study
  studyTitle: 'Course summaries',
  studyIntro:
    'Fast, original recaps of every course on the CCA-F learning path. Pick a course on the left; reveal each check answer only after you’ve tried it.',
  coursesHeading: 'Courses',
  keyConcepts: 'Key concepts',
  checkUnderstanding: 'Check your understanding',
  showAnswer: 'Show answer',
  hideAnswer: 'Hide answer',
  officialSource: 'Official course page',
  selectCourse: 'Select a course to begin',
  prevCourse: 'Previous',
  nextCourse: 'Next',
  mapsToDomain: 'Exam domain',
  checkOf: (n: number, total: number) => `Question ${n} of ${total}`,

  // Study mini-quizzes + exam traps
  studyTabCourses: 'Courses',
  studyTabQuiz: 'Quiz by theme',
  studyTabTraps: 'Exam traps',
  studyTabsLabel: 'Study sections',
  quizThemeIntro:
    'A quick multiple-choice quiz on the key architectural calls for this scenario theme. Pick an answer to see why it is right or wrong.',
  quizCourseIntro:
    'Check yourself: pick an answer to reveal why it is right and why the others fall short.',
  quizPickTheme: 'Choose a theme',
  quizTryAgain: 'Try again',
  quizScore: (c: number, total: number) => `${c} / ${total} correct`,
  quizEmpty: 'The quiz for this section is coming soon.',
  trapsToggleTheme: 'By scenario',
  trapsToggleDomain: 'By domain',
  trapsIntro: 'The tempting-but-wrong moves that cost marks, with the correct call for each.',
  trapPickTheme: 'Choose a theme',
  trapPickDomain: 'Choose a domain',
  trapThe: 'The trap',
  trapWhy: 'Why it’s wrong',
  trapRight: 'The right call',
  trapsEmpty: 'The traps for this section are coming soon.',

  // Practice / drills / history
  practiceHeading: 'Practice by domain',
  practiceDesc: 'Untimed drills to grind a weak area: no countdown, full review after.',
  drillButton: 'Drill',
  untimed: 'Untimed',
  drillResultsTitle: 'Drill results',
  drillScoreLine: (c: number, t: number) => `${c} of ${t} correct`,
  retryWrongCount: (n: number) => `Retry ${n} wrong`,
  recentAttempts: 'Recent attempts',
  recentNone: 'No attempts yet. Finish a mock or a drill and your scores appear here.',
  clearHistoryAction: 'Clear',
  attemptFull: 'Mock',
  attemptDrill: 'Drill',
  resumeInProgress: 'You have an exam in progress.',
  backToPractice: 'Back to practice',
  scenarioStart: 'Scenario mode (4 of 6)',
  scenarioDesc:
    'The same scenario-set structure as the exam above: 4 of the 6 fixed themes, each framing its linked question set. A preserved entry point for your study plan.',
  scenarioTag: 'Scenario',
  scenarioLabel: 'Scenario',
  scenarioProgress: (n: number, total: number) => `Question ${n} of ${total} in this scenario`,
  scenarioContextToggle: 'Scenario context',

  // Misc
  domainColon: 'Domain',
}

const fr: typeof en = {
  // Marque / navigation
  appName: 'Entraîneur d’examen CCA-F',
  appFull: 'Architecte Certifié Claude (Fondations)',
  tagline: 'Entraînement',
  navHome: 'Accueil',
  navExam: 'Examen',
  navStudy: 'Réviser',
  navAbout: 'À propos',
  themeToLight: 'Passer en mode clair',
  themeToDark: 'Passer en mode sombre',
  langName: 'Français',

  // Accueil
  homeKicker: 'Entraînement local',
  homeTitle:
    'Préparez l’examen Architecte Certifié Claude (Fondations)',
  homeSubtitle:
    'Des questions originales fondées sur des scénarios et des résumés de cours faciles à parcourir, ancrés dans la documentation officielle d’Anthropic. Tout fonctionne en local, dans votre langue.',
  examCardTitle: 'Mode examen',
  examCardDesc:
    'Passez un examen blanc bâti comme le vrai : 4 jeux de scénarios sur 6, chacun encadrant ~15 questions liées sous un même contexte de production dense. Revue complète ensuite.',
  examCardCta: 'Démarrer un examen blanc',
  studyCardTitle: 'Mode révision',
  studyCardDesc:
    'Lisez des résumés rapides et bien structurés de chaque cours du parcours, avec leurs concepts clés et des questions d’auto-évaluation.',
  studyCardCta: 'Parcourir les résumés de cours',
  blueprintTitle: 'Plan de l’examen',
  domainsHeading: 'Domaines et pondérations',
  poolStatus: (n: number) => `${n} questions dans le pool`,
  coursesStatus: (n: number) => `${n} résumés de cours`,
  loading: 'Chargement…',
  mechQuestions: 'Questions',
  mechMinutes: 'Minutes',
  mechPass: 'Seuil de réussite',
  mechOptions: 'Options chacune',
  weightOfExam: (pct: number) => `${pct} % de l’examen`,
  poolCountLabel: (n: number) => `${n} dans le pool`,

  // Présentation de l’examen
  examIntroTitle: 'Examen blanc',
  examIntroDesc:
    'Une session bâtie comme le vrai examen : 4 des 6 thèmes de scénario fixes, chacun encadrant un jeu d’environ 15 questions partageant un même contexte de production dense (≈60 questions, 120 minutes). Le scénario reste épinglé à côté de chaque question. Marquez, naviguez et revoyez avant de soumettre.',
  examFormatHeading: 'Cette session',
  distributionHeading: 'Répartition par domaine',
  startExam: 'Commencer l’examen',
  resumeExam: 'Reprendre l’examen',
  notEnoughTitle: 'Pas encore assez de questions',
  notEnoughBody: (have: number, need: number) =>
    `Le pool contient actuellement ${have} questions ; une session complète en demande ${need}. La session utilisera pour l’instant toutes les questions disponibles.`,
  questionsUnit: 'questions',
  minutesUnit: 'minutes',

  // Déroulé de l’examen
  questionOf: (n: number, total: number) => `Question ${n} sur ${total}`,
  timeRemaining: 'Temps restant',
  timeAlmostUp: 'Moins de 10 minutes restantes',
  flag: 'Marquer',
  flagged: 'Marquée',
  unflag: 'Retirer la marque',
  previous: 'Précédent',
  next: 'Suivant',
  navigator: 'Navigateur',
  navigatorHint: 'Accéder à n’importe quelle question',
  legendAnswered: 'Répondu',
  legendUnanswered: 'Sans réponse',
  legendFlagged: 'Marquée',
  legendCurrent: 'Actuelle',
  submitExam: 'Soumettre l’examen',
  answeredCount: (a: number, total: number) => `${a}/${total} répondues`,

  // Boîte de dialogue de soumission
  submitTitle: 'Soumettre votre examen ?',
  submitBodyAll: 'Vous avez répondu à toutes les questions. Soumettre pour notation ?',
  submitBodySome: (n: number) =>
    `Il vous reste ${n} question${n === 1 ? '' : 's'} sans réponse. Les questions sans réponse sont comptées comme fausses. Soumettre quand même ?`,
  confirmSubmit: 'Soumettre',
  cancel: 'Annuler',
  autoSubmitNote: 'Temps écoulé. Votre examen a été soumis automatiquement.',

  // Résultats
  resultsTitle: 'Vos résultats',
  scaledScore: 'Score normalisé',
  outOf1000: '/ 1000',
  verdictPass: 'RÉUSSITE',
  verdictFail: 'PAS ENCORE',
  passMessage:
    'Au-dessus du seuil de 720. Beau travail ; gardez vos domaines faibles bien affûtés.',
  failMessage:
    'En dessous du seuil de 720. Concentrez-vous sur vos domaines les plus faibles ci-dessous et retentez.',
  rawScore: (c: number, t: number) => `${c} bonnes réponses sur ${t}`,
  passLineLabel: 'Seuil de réussite : 720',
  byDomainHeading: 'Précision par domaine',
  weakestDomain: 'Domaine le plus faible',
  strongestDomain: 'Domaine le plus fort',
  reviewAnswers: 'Revoir toutes les questions',
  newExam: 'Nouvel examen',
  backHome: 'Retour à l’accueil',
  scoreNoteTitle: 'À propos de ce score',
  scoreNote:
    'La normalisation officielle d’Anthropic est propriétaire. Cet entraîneur utilise une approximation linéaire documentée : 100 + (bonnes réponses / 60) × 900, ce qui place le seuil de 720 à environ 70 % de bonnes réponses.',

  // Révision
  reviewTitle: 'Revue des réponses',
  filterAll: 'Toutes',
  filterIncorrect: 'Fausses',
  filterFlagged: 'Marquées',
  yourAnswer: 'Votre réponse',
  correctAnswer: 'Bonne réponse',
  notAnswered: 'Sans réponse',
  tagCorrect: 'Correct',
  tagIncorrect: 'Incorrect',
  whyCorrect: 'Pourquoi c’est la meilleure réponse',
  whyIncorrect: 'Pourquoi c’est insuffisant',
  whyOthers: 'Pourquoi les autres sont insuffisantes',
  backToResults: 'Retour aux résultats',
  noneMatch: 'Aucune question ne correspond à ce filtre.',
  reviewCountOf: (shown: number, total: number) => `Affichage de ${shown} sur ${total}`,

  // Révision des cours
  studyTitle: 'Résumés de cours',
  studyIntro:
    'Des synthèses rapides et originales de chaque cours du parcours CCA-F. Choisissez un cours à gauche ; ne révélez chaque réponse de contrôle qu’après avoir essayé.',
  coursesHeading: 'Cours',
  keyConcepts: 'Concepts clés',
  checkUnderstanding: 'Vérifiez votre compréhension',
  showAnswer: 'Afficher la réponse',
  hideAnswer: 'Masquer la réponse',
  officialSource: 'Page officielle du cours',
  selectCourse: 'Sélectionnez un cours pour commencer',
  prevCourse: 'Précédent',
  nextCourse: 'Suivant',
  mapsToDomain: 'Domaine d’examen',
  checkOf: (n: number, total: number) => `Question ${n} sur ${total}`,

  // Mini-quiz de révision + pièges d’examen
  studyTabCourses: 'Cours',
  studyTabQuiz: 'Quiz par thème',
  studyTabTraps: 'Pièges d’examen',
  studyTabsLabel: 'Sections de révision',
  quizThemeIntro:
    'Un quiz rapide à choix multiple sur les décisions d’architecture clés de ce thème de scénario. Choisissez une réponse pour voir pourquoi elle est juste ou fausse.',
  quizCourseIntro:
    'Testez-vous : choisissez une réponse pour découvrir pourquoi elle est juste et pourquoi les autres sont insuffisantes.',
  quizPickTheme: 'Choisissez un thème',
  quizTryAgain: 'Réessayer',
  quizScore: (c: number, total: number) => `${c} / ${total} correctes`,
  quizEmpty: 'Le quiz de cette section arrive bientôt.',
  trapsToggleTheme: 'Par scénario',
  trapsToggleDomain: 'Par domaine',
  trapsIntro: 'Les choix tentants mais faux qui coûtent des points, avec la bonne décision pour chacun.',
  trapPickTheme: 'Choisissez un thème',
  trapPickDomain: 'Choisissez un domaine',
  trapThe: 'Le piège',
  trapWhy: 'Pourquoi c’est faux',
  trapRight: 'La bonne approche',
  trapsEmpty: 'Les pièges de cette section arrivent bientôt.',

  // Exercices / révisions ciblées / historique
  practiceHeading: 'Réviser par domaine',
  practiceDesc:
    'Exercices sans chronomètre pour travailler un point faible : pas de compte à rebours, revue complète ensuite.',
  drillButton: 'S’exercer',
  untimed: 'Sans chronomètre',
  drillResultsTitle: 'Résultats de l’exercice',
  drillScoreLine: (c: number, t: number) => `${c} bonnes réponses sur ${t}`,
  retryWrongCount: (n: number) => `Reprendre ${n} fausse${n === 1 ? '' : 's'}`,
  recentAttempts: 'Tentatives récentes',
  recentNone:
    'Aucune tentative pour l’instant. Terminez un examen ou un exercice et vos scores apparaîtront ici.',
  clearHistoryAction: 'Effacer',
  attemptFull: 'Examen',
  attemptDrill: 'Exercice',
  resumeInProgress: 'Vous avez un examen en cours.',
  backToPractice: 'Retour aux exercices',
  scenarioStart: 'Mode scénarios (4 sur 6)',
  scenarioDesc:
    'La même structure en jeux de scénarios que l’examen ci-dessus : 4 des 6 thèmes fixes, chacun encadrant son jeu de questions liées. Un point d’entrée conservé pour votre plan de révision.',
  scenarioTag: 'Scénario',
  scenarioLabel: 'Scénario',
  scenarioProgress: (n: number, total: number) => `Question ${n} sur ${total} de ce scénario`,
  scenarioContextToggle: 'Contexte du scénario',

  // Divers
  domainColon: 'Domaine',
}

export type Dict = typeof en
export const DICT: Record<Lang, Dict> = { en, fr }
