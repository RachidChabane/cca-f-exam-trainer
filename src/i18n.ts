import type { Lang } from '@/types'

/**
 * UI chrome strings in both languages. Content strings (questions, options,
 * explanations, course bodies) live in the data files and are selected by
 * language at render time. Parametrized strings are functions.
 *
 * `fr` is typed as `typeof en`, so the compiler guarantees the two languages
 * stay in lockstep — nothing can be left untranslated.
 */
const en = {
  // Brand / nav
  appName: 'CCA-F Exam Trainer',
  appFull: 'Claude Certified Architect — Foundations',
  tagline: 'Practice trainer',
  navHome: 'Home',
  navExam: 'Exam',
  navStudy: 'Study',
  themeToLight: 'Switch to light mode',
  themeToDark: 'Switch to dark mode',
  langName: 'English',

  // Home
  homeKicker: 'Local practice trainer',
  homeTitle: 'Prepare for the Claude Certified Architect — Foundations exam',
  homeSubtitle:
    'Original, scenario-based questions and skimmable course summaries — grounded in Anthropic’s official documentation. Everything runs locally, in your language.',
  examCardTitle: 'Exam mode',
  examCardDesc:
    'Sit a timed, 60-question mock exam that mirrors the real domain weights, then review every answer with full explanations.',
  examCardCta: 'Start a practice exam',
  studyCardTitle: 'Study mode',
  studyCardDesc:
    'Read fast, well-structured summaries of each course on the learning path, with key concepts and self-check questions.',
  studyCardCta: 'Browse course summaries',
  blueprintTitle: 'Exam blueprint',
  domainsHeading: 'Domains & weights',
  poolStatus: (n: number) => `${n} questions in the pool`,
  coursesStatus: (n: number) => `${n} course summaries`,
  mechQuestions: 'Questions',
  mechMinutes: 'Minutes',
  mechPass: 'Pass mark',
  mechOptions: 'Options each',
  weightOfExam: (pct: number) => `${pct}% of exam`,
  poolCountLabel: (n: number) => `${n} in pool`,

  // Exam intro
  examIntroTitle: 'Practice exam',
  examIntroDesc:
    'A fresh, randomly sampled 60-question session, weighted across the five domains exactly like the real exam. You have 120 minutes. You can flag questions, jump around with the navigator, and revisit answers before submitting.',
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
  autoSubmitNote: 'Time expired — your exam was submitted automatically.',

  // Results
  resultsTitle: 'Your results',
  scaledScore: 'Scaled score',
  outOf1000: '/ 1000',
  verdictPass: 'PASS',
  verdictFail: 'NOT YET',
  passMessage: 'Above the 720 pass mark. Strong work — keep the weak domains sharp.',
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

  // Misc
  domainColon: 'Domain',
}

const fr: typeof en = {
  // Marque / navigation
  appName: 'Entraîneur d’examen CCA-F',
  appFull: 'Architecte Certifié Claude — Fondations',
  tagline: 'Entraînement',
  navHome: 'Accueil',
  navExam: 'Examen',
  navStudy: 'Réviser',
  themeToLight: 'Passer en mode clair',
  themeToDark: 'Passer en mode sombre',
  langName: 'Français',

  // Accueil
  homeKicker: 'Entraînement local',
  homeTitle:
    'Préparez l’examen Architecte Certifié Claude — Fondations',
  homeSubtitle:
    'Des questions originales fondées sur des scénarios et des résumés de cours faciles à parcourir — ancrés dans la documentation officielle d’Anthropic. Tout fonctionne en local, dans votre langue.',
  examCardTitle: 'Mode examen',
  examCardDesc:
    'Passez un examen blanc chronométré de 60 questions, pondéré comme le vrai examen, puis revoyez chaque réponse avec des explications complètes.',
  examCardCta: 'Démarrer un examen blanc',
  studyCardTitle: 'Mode révision',
  studyCardDesc:
    'Lisez des résumés rapides et bien structurés de chaque cours du parcours, avec leurs concepts clés et des questions d’auto-évaluation.',
  studyCardCta: 'Parcourir les résumés de cours',
  blueprintTitle: 'Plan de l’examen',
  domainsHeading: 'Domaines et pondérations',
  poolStatus: (n: number) => `${n} questions dans le pool`,
  coursesStatus: (n: number) => `${n} résumés de cours`,
  mechQuestions: 'Questions',
  mechMinutes: 'Minutes',
  mechPass: 'Seuil de réussite',
  mechOptions: 'Options chacune',
  weightOfExam: (pct: number) => `${pct} % de l’examen`,
  poolCountLabel: (n: number) => `${n} dans le pool`,

  // Présentation de l’examen
  examIntroTitle: 'Examen blanc',
  examIntroDesc:
    'Une nouvelle session de 60 questions tirées au hasard, pondérée sur les cinq domaines exactement comme le vrai examen. Vous disposez de 120 minutes. Vous pouvez marquer des questions, naviguer librement et revoir vos réponses avant de soumettre.',
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
  autoSubmitNote: 'Temps écoulé — votre examen a été soumis automatiquement.',

  // Résultats
  resultsTitle: 'Vos résultats',
  scaledScore: 'Score normalisé',
  outOf1000: '/ 1000',
  verdictPass: 'RÉUSSITE',
  verdictFail: 'PAS ENCORE',
  passMessage:
    'Au-dessus du seuil de 720. Beau travail — gardez vos domaines faibles bien affûtés.',
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

  // Divers
  domainColon: 'Domaine',
}

export type Dict = typeof en
export const DICT: Record<Lang, Dict> = { en, fr }
