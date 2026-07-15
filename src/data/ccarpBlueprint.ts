import type { Bi, CcarpDomainKey } from '@/types'

/**
 * The CCA-P (Claude Certified Architect – Professional, exam code CCAR-P)
 * blueprint, transcribed from the official exam guide v1.0 (July 2026) —
 * data/CCA-P-exam-guide.pdf, sections 5 and 6.
 *
 * Kept as a hand-written module rather than JSON because it is small, static, and
 * every view needs it: importing it must never pull in the question bank.
 */

export const CCARP_EXAM = {
  code: 'CCAR-P',
  name: {
    en: 'Claude Certified Architect – Professional',
    fr: 'Claude Certified Architect – Professional',
  } as Bi,
  /** Guide section 5, "Exam Details at a Glance". */
  mechanics: {
    question_count: 63,
    time_limit_minutes: 120,
    scaled_score: { min: 100, max: 1000, pass: 720 },
    fee_usd: 175,
    validity_months: 12,
    // The guide's format table names multiple-choice and multiple-response only.
    // The imported practice set also contains scenario-matching items, described
    // by an author who sat the exam. We support all three: a matching item is
    // mechanically several classifications against one shared option set, which a
    // glance-table could fairly summarise as "multiple response".
    formats: ['mc', 'mr', 'matching'] as const,
  },
  soft_warning_remaining_minutes: 10,
} as const

export interface CcarpDomain {
  key: CcarpDomainKey
  /** Guide's domain number (1-7). */
  n: number
  name: Bi
  /** Percentage of scored items, per the guide's blueprint table. */
  weight: number
  /** Items on a 63-question sitting = round(weight% x 63). Sums to 63. */
  items: number
  /** The guide's objectives for this domain — the generation spec + study list. */
  objectives: BiObjectives
}

interface BiObjectives {
  en: string[]
  fr: string[]
}

/** Domain order matches the exam guide's numbering (1-7). */
export const CCARP_DOMAINS: CcarpDomain[] = [
  {
    key: 'solution_design',
    n: 1,
    name: { en: 'Solution Design & Architecture', fr: 'Conception de solution et architecture' },
    weight: 17,
    items: 11,
    objectives: {
      en: [
        'Translate business problems into Claude-based AI solutions',
        'Design end-to-end architectures (input → processing → output → feedback loops)',
        'Select appropriate architectural patterns (workflow, agentic, augmented LLM)',
        'Design multi-agent systems and orchestration strategies',
        'Apply decomposition techniques for complex problem solving',
        'Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs)',
      ],
      fr: [
        'Traduire les problèmes métier en solutions IA basées sur Claude',
        'Concevoir des architectures de bout en bout (entrée → traitement → sortie → boucles de rétroaction)',
        'Choisir les patterns architecturaux adaptés (workflow, agentique, LLM augmenté)',
        'Concevoir des systèmes multi-agents et des stratégies d’orchestration',
        'Appliquer des techniques de décomposition pour les problèmes complexes',
        'Aligner les solutions sur les piliers de valeur métier (efficacité, transformation, productivité, coût, SLA de performance)',
      ],
    },
  },
  {
    key: 'models_prompting_context',
    n: 2,
    name: {
      en: 'Claude Models, Prompting & Context Engineering',
      fr: 'Modèles Claude, prompting et ingénierie du contexte',
    },
    weight: 13,
    items: 8,
    objectives: {
      en: [
        'Select appropriate Claude models based on trade-offs',
        'Design system prompts, templates, and guardrails',
        'Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought)',
        'Optimize context windows and manage token usage',
        'Implement prompt reuse strategies (caching, modular prompts, Skills)',
      ],
      fr: [
        'Choisir les modèles Claude adaptés selon les compromis',
        'Concevoir des prompts système, des templates et des garde-fous',
        'Appliquer les techniques de prompt engineering (zero-shot, few-shot, chaîne de pensée)',
        'Optimiser les fenêtres de contexte et gérer la consommation de tokens',
        'Mettre en œuvre des stratégies de réutilisation de prompts (caching, prompts modulaires, Skills)',
      ],
    },
  },
  {
    key: 'integration',
    n: 3,
    name: { en: 'Integration', fr: 'Intégration' },
    weight: 19,
    items: 12,
    objectives: {
      en: [
        'Evaluate tool/agent configuration for capability bloat',
        'Analyze authentication and authorization requirements to identify security gaps',
        'Evaluate accuracy-latency trade-offs and justify configuration decisions',
        'Analyze observability challenges and select monitoring strategies at scale',
        'Design a RAG pipeline with appropriate chunking and indexing strategies',
        'Apply retrieval strategies matched to data shape and query pattern',
        'Evaluate connection protocols and select the appropriate integration mechanism (MCP, API/CLI, agent-to-agent)',
        'Evaluate progressive discovery vs. monolithic context strategy',
      ],
      fr: [
        'Évaluer la configuration des outils/agents face à l’inflation de capacités',
        'Analyser les exigences d’authentification et d’autorisation pour identifier les failles',
        'Évaluer les compromis précision-latence et justifier les choix de configuration',
        'Analyser les défis d’observabilité et choisir des stratégies de supervision à l’échelle',
        'Concevoir un pipeline RAG avec les stratégies de découpage et d’indexation adaptées',
        'Appliquer des stratégies de récupération adaptées à la forme des données et au motif de requête',
        'Évaluer les protocoles de connexion et choisir le mécanisme d’intégration approprié (MCP, API/CLI, agent-à-agent)',
        'Évaluer la découverte progressive vs. une stratégie de contexte monolithique',
      ],
    },
  },
  {
    key: 'evaluation_testing',
    n: 4,
    name: { en: 'Evaluation, Testing & Optimization', fr: 'Évaluation, tests et optimisation' },
    weight: 16,
    items: 10,
    objectives: {
      en: [
        'Define evaluation metrics (accuracy, latency, cost, safety, security)',
        'Design evaluation datasets and test frameworks using mixed methodologies',
        'Conduct A/B testing and iterative improvements',
        'Diagnose system issues (prompt failure, hallucinations, model mismatch)',
        'Optimize token usage, latency, and cost-performance trade-offs',
        'Monitor system performance using logging and observability tools',
      ],
      fr: [
        'Définir les métriques d’évaluation (précision, latence, coût, sûreté, sécurité)',
        'Concevoir des jeux de données d’évaluation et des frameworks de test mixtes',
        'Mener des tests A/B et des améliorations itératives',
        'Diagnostiquer les problèmes système (échec de prompt, hallucinations, inadéquation de modèle)',
        'Optimiser la consommation de tokens, la latence et les compromis coût-performance',
        'Superviser les performances via les outils de logging et d’observabilité',
      ],
    },
  },
  {
    key: 'governance_safety',
    n: 5,
    name: {
      en: 'Governance, Safety & Risk Management',
      fr: 'Gouvernance, sûreté et gestion des risques',
    },
    weight: 14,
    items: 9,
    objectives: {
      en: [
        'Implement guardrails and safety controls',
        'Identify risks, limitations, and failure modes of LLM systems',
        'Apply human-in-the-loop validation strategies',
        'Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP)',
        'Address ethical AI considerations (bias, fairness, transparency)',
      ],
      fr: [
        'Mettre en œuvre des garde-fous et des contrôles de sûreté',
        'Identifier les risques, limites et modes de défaillance des systèmes LLM',
        'Appliquer des stratégies de validation avec intervention humaine',
        'Assurer la conformité réglementaire (p. ex. RGPD, HIPAA, FedRAMP)',
        'Traiter les considérations éthiques de l’IA (biais, équité, transparence)',
      ],
    },
  },
  {
    key: 'stakeholder_lifecycle',
    n: 6,
    name: {
      en: 'Stakeholder Communication & Lifecycle Management',
      fr: 'Communication avec les parties prenantes et gestion du cycle de vie',
    },
    weight: 14,
    items: 9,
    objectives: {
      en: [
        'Conduct structured discovery and requirement gathering',
        'Communicate architectural decisions and trade-offs',
        'Manage stakeholder feedback loops and expectation alignment (including SLAs)',
        'Document architectures and provide implementation guidance',
        'Support lifecycle phases (discovery, design, handoff, monitoring, iteration)',
      ],
      fr: [
        'Mener une découverte structurée et un recueil des exigences',
        'Communiquer les décisions d’architecture et les compromis',
        'Gérer les boucles de retour et l’alignement des attentes (y compris les SLA)',
        'Documenter les architectures et fournir des recommandations de mise en œuvre',
        'Accompagner les phases du cycle de vie (découverte, conception, transfert, supervision, itération)',
      ],
    },
  },
  {
    key: 'developer_productivity',
    n: 7,
    name: {
      en: 'Developer Productivity & Operational Enablement',
      fr: 'Productivité des développeurs et activation opérationnelle',
    },
    weight: 7,
    items: 4,
    objectives: {
      en: [
        'Configure Claude tools and environments for teams (e.g., Claude Code)',
        'Improve developer workflows using AI-assisted tooling',
        'Support debugging and operational issue resolution',
      ],
      fr: [
        'Configurer les outils et environnements Claude pour les équipes (p. ex. Claude Code)',
        'Améliorer les workflows de développement avec l’outillage assisté par IA',
        'Accompagner le débogage et la résolution d’incidents opérationnels',
      ],
    },
  },
]

export const CCARP_DOMAIN_ORDER: CcarpDomainKey[] = CCARP_DOMAINS.map((d) => d.key)

export const CCARP_DOMAIN_BY_KEY = Object.fromEntries(CCARP_DOMAINS.map((d) => [d.key, d])) as Record<
  CcarpDomainKey,
  CcarpDomain
>

/** Items per domain on a full 63-question sitting. Sums to 63 by construction. */
export const CCARP_SESSION_COUNTS = Object.fromEntries(
  CCARP_DOMAINS.map((d) => [d.key, d.items]),
) as Record<CcarpDomainKey, number>
