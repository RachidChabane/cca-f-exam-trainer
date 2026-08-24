# CCA-P Exam Bank Review Report

Reviewed 2026-07-23 — `data/ccarp_bank.json` (126 questions: 63 official practice-set imports + 63 AI-generated) against the 5 official course modules in `claude-CA-P/courses/markdown/`. Method: 23 domain-batched checklist reviews, full 126/126 coverage, followed by adversarial verification of every non-APPROVE finding (each verifier instructed to refute the finding against the course text).

## Final Verdict

**EXAM BANK STATUS: ⚠️ CONDITIONAL** — usable as-is; 4 moderate revisions recommended. Zero critical findings: no answer key in the bank is wrong, and no question contains a factual error that flips its key.

## Overall Statistics

- Total questions reviewed: **126 / 126** (0 read errors, 0 skipped)
- First-pass: 119 APPROVE, 7 REVISE — adversarial verification upheld **4**, refuted 3
- Pass rate after verification: **122/126 (96.8%)**
- Questions with warnings (any dimension): 31
- Checklist dimensions: content alignment 97 PASS / 29 WARNING / 0 FAIL · question quality 121/5/0 · answer accuracy 122/4/0
- Questions on topics the courses do not cover (drawn from the official exam guide; flagged WARNING per review scope, not defects): 24

## Module Coverage

The bank is built to the exam guide 7-domain blueprint; mapped onto the 5 course modules:

| Course module | Exam domains | Questions | % of bank |
|---|---|---|---|
| 01 Platform & Solution Design | Solution Design (22) + Models/Prompting/Context (16) | 38 | 30% |
| 01+02 (spans both) | Evaluation, Testing & Optimization | 20 | 16% |
| 02 Enterprise Integration & Production | Integration | 24 | 19% |
| 03 Responsible AI, Safety & Risk | Governance, Safety & Risk | 18 | 14% |
| 04 Stakeholder Engagement & Lifecycle | Stakeholder Communication & Lifecycle | 18 | 14% |
| 05 Team Enablement & Productivity | Developer Productivity | 8 | 6% |

Proportions track the official domain weights (17/13/19/16/14/14/7), so coverage skew is inherited from the blueprint, not a bank defect. Module 05 is the thinnest in both the course (19 KB) and the bank; 4 of its 8 questions touch mechanisms the course text does not name.

## Critical Findings (verified, all moderate — none flip an answer key)

### off-1.7 — Choosing RAG/retrieval vs. fine-tuning vs. context-stuffing vs. relying on training knowledge for a daily-changing product catalogue

**Severity:** moderate · **Recommendation:** REVISE

The finding survives adversarial scrutiny and is directly grounded in the course. Module 01 (01_claude_platform_solution_design.md) builds an entire section — "The most common mistake: retrieval applied to live state" and "The retrieval principle" (~lines 655-663) — around the rule that retrieval is for stable knowledge and tool use / direct lookup is for live state, and the Live-state glossary entry (~line 1139) names "a price" as live state that "require[s] a direct lookup against the source of truth, not a stored snapshot." The routing example even lists "Using retrieval for live order status instead of calling the API directly" under Where-projects-go-wrong. The keyed-correct option B says "Give the model RETRIEVAL access to the live catalogue," and the explanation reinforces it with "Daily-changing factual data is the canonical case for retrieval augmentation" — using the exact term the course reserves for indexed/RAG-over-a-stable-corpus and warns against for live pricing. I checked the one counter-signal (the broad glossary "Retrieval" entry = fetch from an outside source at request time), but the solution-design module consistently uses "retrieval" in the narrow vector-index sense ("Retrieval over a vector index is one example"; the corpus entry says it "works for stable reference material and not for live state"), so the narrow sense governs this domain and does not rescue the wording. Not critical: B remains the only option granting current-data access (A fine-tune is stale, C context-stuffing is the "monolithic context" cost anti-pattern, D is parametric knowledge), so the answer key is still correct. But a candidate who internalized the course's flagship retrieval-vs-tool-call distinction would see the keyed answer describe the anti-pattern by name — a genuine, course-grounded misalignment.

**Fix:** Reword option B to use the course's live-state vocabulary and fix the explanation to match. Option B: "Give the model tool access to query the live catalogue system directly so its answers reflect current prices and promotions." Explanation: replace "Daily-changing factual data is the canonical case for retrieval augmentation — the model always answers from current data without retraining" with "Daily-changing prices and promotions are live state — the course's canonical case for a direct tool call against the source of truth, so the model always answers from current values rather than a stored snapshot." Keep the "Why not the others" clauses (A stale, C costly/won't scale, D accepts wrong answers) unchanged. This keeps B as the correct answer and adds no surface tell, since B is already the only current-data-access option regardless of retrieval-vs-tool wording.

### gen-3.3 — Accuracy-latency trade-off: decoupling a fast synchronous ack from an async extended-thinking classification pass

**Severity:** moderate · **Recommendation:** REVISE

The finding survives against the course text. 01_claude_platform_solution_design.md line 831 states verbatim that "The older manual thinking-token budget (budget_tokens) is deprecated on the 4.6 generation and removed on Claude Sonnet 5, where it returns a 400 error," with the effort parameter as the recommended control (line 1115: on the newest models "it is the only one"). The gen-3.3 stem and all four options build the correct answer around "extended thinking with budget_tokens=8000," so the item teaches a deprecated/removed API surface as current practice. I partially refute the reviewer's answerAccuracy WARNING framing: the keyed answer A is NOT wrong — the tested skill (decouple the latency-bound ack path from the accuracy-heavy async pass, reject the renegotiate-timeout B, few-shot-ceiling C, and nightly-batch D distractors) is sound and parameter-agnostic. Swapping budget_tokens=8000 → effort=high is mechanical and leaves every option's correctness and every distractor's flaw intact. So this is a real content-currency misalignment worth fixing, not a critical answer-key or factual-correctness error. Note the finding cites file 01 while the task pointed at 02; module 02_enterprise_integration_production.md contains no budget_tokens/effort references, so the settling text is unambiguously in 01, which I read directly.

**Fix:** Replace every occurrence of "budget_tokens=8000" (the stem's "enabling extended thinking with budget_tokens=8000" and options A and B) with the adaptive-thinking effort control, e.g. "extended thinking at effort=high," per 01_claude_platform_solution_design.md "What extended thinking controls." In option B, rewrite "Increase budget_tokens further" as "Raise the effort level further" so the distractor's real flaw (negotiating the fixed contractual timeout) is preserved. No change to the correct answer (A) or to the answer key is needed. Alternatively, if budget_tokens is meant to depict an older model generation, state that explicitly in the stem so the parameter is not read as current guidance.

### gen-5.3 — Risk-tiered human-in-the-loop gate scoped to a specific refund failure mode

**Severity:** moderate · **Recommendation:** REVISE

Confirmed internal inconsistency. The stem fixes the failure tier at refunds "above $2,000" (all 12 non-clean cases, 3 of which violated the discount-stacking exception), but keyed answer D and distractor C set the gate at "above $500," and D's explanation claims it is "scoped precisely to the risk tier where the actual failures happened (refunds above $500)" — the parenthetical contradicts the stem's own number. Judged against 03_responsible_ai_safety_risk.md, the "Routing decisions to people by stakes, not by volume" section (lines 394-431) and the tool-call-authorization glossary entry (line 574, "A check before any action with a side effect...It should be deterministic") support D's concept — a deterministic gate at the tool boundary scoped to the high-stakes tier — but that same guidance is what the $500 figure violates: the identified risk tier is $2,000+, so a $500 gate is broader than "the tier where the actual risk was identified." It also undercuts the stem's explicit constraint to add no approval step to "the 96% of requests the agent already handles correctly," since a $500 gate sweeps in the unspecified $500-$2,000 band. This is not answer-key-wrong: D is still the only structurally sound choice (A is a blanket queue, B is a probabilistic prompt fix plus after-the-fact log, C is a brittle text-tag heuristic), so the key does not flip — hence moderate, not critical. But the number mismatch plus the false "scoped precisely" claim in the load-bearing rationale would confuse a careful test-taker reconciling $2,000 against $500, and warrants a fix.

**Fix:** Change the threshold in options C and D from "above $500 / above $500" to "above $2,000" so the gate matches the stem's identified failure/risk tier, and update D's explanation parenthetical from "(refunds above $500)" to "(refunds above $2,000)" so the "scoped precisely to the risk tier where the actual failures happened" claim is true. This keeps C and D differing only in mechanism (brittle text-tag vs. enforced tool-config gate), which is the intended contrast, and aligns the item with 03_responsible_ai_safety_risk.md's guidance to gate at the stakes tier where the risk was actually identified. (Alternatively, retune the stem to describe the failures as occurring above $500, but aligning the options to $2,000 is cleaner because it also preserves the stem's "don't gate the correctly-handled 96%" constraint.)

### gen-7.2 — Standardizing repeated AI-assisted workflows with slash commands

**Severity:** moderate · **Recommendation:** REVISE

Confirmed against Module 5 (05_team_enablement_productivity.md) and a grep of all course modules. The keyed answer C relies on Claude Code project slash commands (.claude/commands/), which appear NOWHERE in any course file (zero grep matches). Meanwhile the course prominently teaches Skills as the mechanism for this exact scenario shape: line 88 'skill packages are repeatable procedures that appear as versioned, reusable units,' line 90 naming project Skills at .claude/skills/, and line 92 'Packaging a team workflow as a distributable skill is how a good local practice becomes a team standard.' So a student reasoning strictly from the course would reach for a Skill answer that is not offered, and cannot distinguish C's real-but-untaught .claude/commands/ path from distractor B's fabricated CLAUDE_SCAFFOLD_TEMPLATE env var — both look like unseen mechanisms. The finding survives: the question tests untaught product knowledge and the course's own emphasis misleads the prepared student. NOT critical, however — C is objectively the best answer (a user-invoked slash command is more deterministic for 'run the identical prompt every time' than a model-invoked Skill, which Claude discovers/applies contextually), so the answer key is correct and there is no factual error in the options. This is a content-alignment/answerability gap worth fixing, hence moderate.

**Fix:** Keep C as the correct answer (do NOT re-key to a Skill — that would be objectively weaker). Close the alignment gap so the answer is learnable from taught content, two coordinated moves: (1) In the explanation, explicitly draw the boundary the course omits — a project Skill is a model-invoked capability Claude discovers and applies when relevant, whereas a slash command is an explicit, user-invoked, deterministic single template, the right fit when the exact same prompt must run identically every time. (2) Prefer replacing the fabricated-env-var distractor B (or subagent D) with 'Package the scaffolding prompt as a project Skill under .claude/skills/ so Claude applies it when relevant' — this converts the untaught mechanism into a taught contrast (Skill vs. slash command) and tests a real boundary instead of leaving a fake-path distractor. Ideally also add a one-line mention of project slash commands (.claude/commands/) to Module 5's 'Improving developer workflows' section as the deterministic user-invoked counterpart to model-invoked Skills, so the keyed mechanism exists somewhere in the course.

## Findings Refuted by Adversarial Verification

- **gen-2.8** — first-pass reviewer recommended REVISE; verifier refuted it: Refuted on three grounds. (1) The finding's central overclaim charge is a misquote: the phrase 'near zero' does not occur in gen-2.8's stem, options, or explanation (it appears only in unrelated items at bank lines 528 and 2931). The actual stem is hedged — 'most likely to close this reconciliation gap' — and no option claims near-total reliability. (2) The item is explicitly scoped to prompt engineering: the stem asks 'Which TWO prompt engineering changes...' and the objective is 'Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought)'. Constraining the answer space to prompting techniques is exactly what a technique-selection objective does; the question never asserts prompting is the correct architecture, so it does not contradict the Steerability capability/limitation/mitigation row (01_claude_platform_solution_design.md ~line 240-244: 'For high-stakes numerical accuracy, deterministic computation or tool execution should own the answer'). That row governs architecture-level design, not this prompt-technique exercise. The reviewer's suggested fix (add a code-execution option) would convert a prompt-engineering item into an architecture item, i.e., change what is being assessed. (3) The key is correct within its frame: per 'Technique selection by task complexity' (~line 941, 'add explicit reasoning only if the task's structure demands it'), A (chain-of-thought with running-subtotal verification) supplies the missing arithmetic check and E (three-plus-item matched few-shot examples) covers the exact failure condition; distractors are cleanly wrong (B under-covers with 2 items, C is formatting-only, D is a template lacking a summation check). No factual error, no wrong key, no ambiguity.
- **gen-4.10** — first-pass reviewer recommended REVISE; verifier refuted it: The finding is factually right that "Data/retrieval gap" is not a member of module 02's named four-item "A failure taxonomy" (lines 545-552: Prompt failure, Hallucination, Model mismatch, Orchestrator-workers failure), but the REVISE recommendation does not survive scrutiny. (1) The question is self-contained: the stem supplies all four category definitions inline, so answers come from reasoning on the given definitions, not from recalling the course list. The reviewer itself rated answerAccuracy PASS and questionQuality PASS, and each of the five rows is uniquely and correctly keyed. There is no correctness or answerability defect. (2) "Data/retrieval gap" is a strongly grounded, heavily emphasized course concept — arguably more so than the category it displaces. Module 01 (01_claude_platform_solution_design.md) devotes multiple screens to it: "The index is a snapshot... the answer will be wrong" (line 619), the retrieval-vs-tool-call watch-out and "most common mistake" sections (lines 641-663), and the trace at lines 657-661 where "the corpus held two stale snapshots and no record of where the order was." Session 1 (2026 revision never indexed) and Session 5 (no region-discriminating field, so the retriever cannot select the US doc) are direct instances of that module-01 material. (3) The stated learning objective names only three categories ("prompt failure, hallucinations, model mismatch") with no fourth, so nothing mandates "Orchestrator-workers failure" as the fourth slot; adding a well-grounded fourth category is legitimate. The only residue is the stem word "shared taxonomy," which in context means shared across the five sessions, not quoted from module 02 — no factual overclaim. The finding's heavier suggested fix (replace with Orchestrator-workers failure and rewrite Sessions 1 and 5) would degrade the item by cutting module 01's most-tested RAG theme. This is at most optional polish, not a REVISE-worthy misalignment.
- **gen-7.4** — first-pass reviewer recommended REVISE; verifier refuted it: Refuted on its central claim. The finding asserts a learner "would have no way to distinguish A/E from D without outside product knowledge of the specific filenames," but 05_team_enablement_productivity.md line 82 teaches exactly that discrimination in the body prose: the Claude Code team environment is "a project-level baseline: a shared CLAUDE.md, an agreed set of tools and MCP servers, and a permission posture, so people start from the same place rather than discovering ad hoc settings and drifting apart. That baseline is something you can review, version, and improve once for everyone." That maps directly onto the correct pair (A = shared versioned permission baseline; E = shared MCP servers) versus the manual per-person copy-paste that drifts (D — the incident's own failure mode). Every distractor is eliminable from taught material: D by the shared-versioned-baseline-vs-personal-drift contrast (line 82); C by scope plus the stem's "layer personal overrides" requirement against a centrally/server-managed org-wide lock (line 90); B for the permissions slot by the stem's override requirement (only A names an override layer) reinforced by the body listing CLAUDE.md and "permission posture" as separate components plus the cited Sources line 176 ("CLAUDE.md instructions vs. enforceable settings, permissions"). Critically, the exact filenames (.claude/settings.json, settings.local.json, .mcp.json) appear in the OPTION TEXT — the learner recognizes and maps them rather than recalling them from memory, which is standard exam design. The answer key is factually correct (finding itself grants answerAccuracy PASS). The finding inverts its own example: distinguishing A/E from D is the most explicitly taught point in the module, not the gap.

## Recommendations

1. **Priority 1** — gen-5.3: align the $500 gate threshold in options C/D (and the explanation parenthetical) with the stem’s $2,000 failure tier. Internal numeric inconsistency; most likely to confuse a careful candidate.
2. **Priority 1** — gen-3.3: replace `budget_tokens=8000` with the adaptive-thinking `effort` control throughout stem and options; the course states budget_tokens is deprecated/removed on current models.
3. **Priority 2** — off-1.7: reword option B from “retrieval access to the live catalogue” to a direct tool call against the source of truth — the course’s flagship retrieval-vs-live-state distinction says the keyed answer currently describes the anti-pattern by name.
4. **Priority 2** — gen-7.2: keep key C, but convert a distractor into a project-Skill option and have the explanation draw the Skill-vs-slash-command boundary, so the answer is learnable from taught content.
5. **Priority 3** — the 24 “NOT COVERED” items (concentrated in integration and developer_productivity) are exam-guide-sourced and correct; optionally add course-aligned rationale lines to their explanations so they tie back to taught material.

---

# Per-Question Review

## Solution Design & Architecture (22 questions)

### gen-1.1
**Topic**: Choosing RAG over fine-tuning, multi-agent, or full-context-stuffing for a compliance-review use case needing citations and fast human verification against a quarterly-revised policy manual
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This is a well-constructed contrast case to off-1.7: the 80-page policy manual revised quarterly is exactly the course's 'stable reference material' RAG use case ('a stable knowledge corpus, such as product manuals, internal docs, or regulatory text, is chunked and indexed'), and the requirement for clause-level citations to speed human sign-off matches the course's retrieval-strategy note that citation is a reason to prefer retrieval ('Cases where source citation is a requirement'). B (fine-tuning) is correctly rejected via the fine-tuning caution ('locks you to a fixed model version', requires retraining on every revision); C (per-category multi-agent pipeline) is correctly rejected as unnecessary complexity ('the fewest agents that meet the requirement'); D (80 pages in the system prompt every call) is correctly rejected via the monolithic-context cost/latency warning. All four option-level explanations tie back to specific course mechanisms rather than vague reasoning.
- Course reference: 01_claude_platform_solution_design.md — 'The shapes the industry has already paid to learn' (RAG reference architecture: 'stable knowledge corpus... chunked and indexed') and 'Context strategy: spectrum between progressive and monolithic' (retrieval's case for citation requirements; monolithic's cost/latency breakdown).

**Recommendation**: APPROVE

### gen-1.2
**Topic**: Closing the feedback loop in an end-to-end agentic triage architecture
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (support-ticket triage, 18% silent reassignments) and the keyed answer (log the correction as a structured event and feed it into a recurring eval/tuning dataset) are sound architecture practice and none of the four options contradicts anything in the course. However, the exact framing the objective names — an 'input → processing → output → feedback loops' architecture where production corrections are captured and routed back into evaluation/tuning — is not taught verbatim in Module 1. The closest material is the eval-gating discussion (curated test sets, delta thresholds before shipping a model change) and Module 4's separate 'Signals → Triage → Decide → Act → Review' feedback-loop concept, which is about production monitoring/governance rather than capturing corrections as retraining/eval data. The distractors are all clearly inferior for stated, defensible reasons (drift-detection without capturing the correction, an inference-time fix for a different failure mode, a manual band-aid).
- Course reference: NOT COVERED verbatim — closest adjacent material: 01_claude_platform_solution_design.md — 'Gate every model change with an eval before you ship it' (curated eval sets); 04_stakeholder_engagement_lifecycle.md — 'The feedback loop decides which signals reach a stakeholder' (Signals→Triage→Decide→Act→Review), which is a related but distinct concept from correction-capture-for-tuning.

**Recommendation**: APPROVE

### gen-1.3
**Topic**: Solution Design & Architecture — choosing workflow vs. orchestrator-workers vs. autonomous agent patterns
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly supported by the course's multi-agent systems section: an orchestrator that decomposes work into an unpredictable number of sub-tasks and dispatches bounded worker calls is exactly 'the worked pattern: fan-out over a large work item' and the guidance that 'some problems are too large or too varied for a single agent to hold in one context.' The keyed answer C correctly identifies that a variable 2-15 document fan-out needs delegation rather than a bigger single-call budget (B) or a fixed-sequence chain (A), and D is correctly rejected as over-provisioned autonomy for a bounded, tool-scoped task per the course's autonomy-cost guidance. Distractor B is a well-designed near-miss (it fixes latency for simple claims but leaves the accuracy problem for complex ones untouched), appropriate for professional-level difficulty.
- Course reference: 01_claude_platform_solution_design.md — 'Multi-agent systems and orchestration' / 'The worked pattern: fan-out over a large work item'; 'Composing primitives into augmented call, workflow, agent' for the agent-overkill reasoning in D.

**Recommendation**: APPROVE

### gen-1.4
**Topic**: Multi-agent orchestration: conflict detection at synthesis
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Strong, almost verbatim match to course content: 'Three things must be designed, not assumed: how the work is decomposed into sub-tasks, how each subagent's result is structured so the orchestrator can combine it, and how the orchestrator resolves conflicts or gaps when the results come back.' Option D (diff overlapping claims and re-query only conflicting subagents) is precisely this missing 'resolve conflicts' mechanism. The rejection of A is grounded in the course's explicit tradeoff naming (parallel throughput vs. sequential latency), and B's rejection is grounded in the course's description of subagents running in isolated, non-shared context ('each subagent works in a clean context... independent units run concurrently'). C is a reasonable near-miss (reduces overlap without adding a detection mechanism) appropriate for hard difficulty.
- Course reference: 01_claude_platform_solution_design.md — 'Orchestrator and subagents: roles, delegation, synthesis' and 'When fan-out hid a dropped unit' (coverage-check-at-synthesis failure mode).

**Recommendation**: APPROVE

### gen-1.5
**Topic**: Task decomposition for multi-step agent pipelines
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Well supported: the course teaches that a workflow decomposes a task into named steps orchestrated in code, each with its own bounded context, and separately teaches the context-window 'working-memory cliff' and that long reasoning chains sitting on abstract/combined instructions are exactly where the model drifts from intent. The keyed answer A (split into Extractor/Compliance-checker/Redline-drafter with structured hand-offs) directly instantiates both principles, fixing both the long-document context overload and the in-context flag-overwriting during drafting. Distractors are well-reasoned near-misses: B chunks by document length but leaves task-bundling untouched, C and D repeat the already-tried 'more tokens / more instructions' fix the stem explicitly says didn't move the numbers, which is a nice touch tying the distractor logic back to the stem's own data.
- Course reference: 01_claude_platform_solution_design.md — 'Composing primitives into augmented call, workflow, agent' (workflows as steps wired in code) and 'Context-window sizing: the working-memory cliff' / four-properties table (steerability limitation on abstract/long instructions).

**Recommendation**: APPROVE

### gen-1.6
**Topic**: solution_design — Align solutions to business value pillars
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The five business-value pillars named in the objective (efficiency, transformation, productivity, cost, performance SLAs) are taught almost verbatim in the course, though in the Enterprise Integration module rather than the Solution Design module the question is tagged under. The keyed answer B is objectively correct independent of pillar-labeling nuance: the board's condition is a literal hard requirement ('adopt within two quarters by configuration alone, without new code'), and only B removes the AP-specific hard-coding to satisfy it; A, C, and D each leave the hard-coding intact and are correctly rejected. The explanation's framing of B as advancing the 'transformation pillar' is a slightly loose mapping (transformation is defined as 'work not feasible before becoming possible'), but this labeling nuance doesn't affect the correctness of the key since B is the only option that satisfies the stated condition at all.
- Course reference: 02_enterprise_integration_production.md — 'Business value and ROI mapping: turning a feasible design into a justified investment' (the five pillars: efficiency, transformation, productivity, solution cost, performance SLAs).

**Recommendation**: APPROVE

### gen-1.7
**Topic**: Solution Design & Architecture — translating a business requirement into an agent/tool architecture with a compliance-critical gate
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly and strongly supported by the course's central delegation case study: a rule that must be correct every time (there, a £5,000 senior-adjuster threshold; here, a 70% fraud-confidence threshold) must be enforced as a deterministic check, not left to model discretion, because 'a rule that needs to be right every time was handed to a system that is right most of the time' produces silent, audit-discovered failures. Option C's design (one tool-using agent for judgment work, plus a code-level gate for the compliance threshold) is exactly the fix the course prescribes. D is correctly rejected as the anti-pattern (system-prompt-only compliance gate) the course's worked failure case warns against; B is correctly flagged as over-engineered per the course's 'fewest primitives necessary' guidance; A is correctly rejected as a non-scaling manual band-aid.
- Course reference: 01_claude_platform_solution_design.md — 'Delegation: deciding what Claude is trusted to own' and 'When the deterministic check quietly drifted' (the £5,000 senior-adjuster case study).

**Recommendation**: APPROVE

### gen-1.8
**Topic**: Feedback loops in end-to-end agentic pipeline design
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- D is the only option that turns already-captured override data into a systematic input that changes both future behavior (few-shot examples) and measurement (eval set), which is exactly what the course means by content that must evolve with the task: 'few-shot examples are content to maintain: as the task evolves, stale examples quietly steer the model wrong' and evals as the mechanism because 'you cannot certify behavior you only observed once.' B's dashboard is ruled out by the course's own distinction (from the lifecycle module) between a dashboard that only displays signals and a feedback loop that maps a signal to a trigger/owner/action. A (a second ML classifier service) matches the course's warning against reaching for a heavier mechanism than the job requires, and C (ad hoc manual weekly review) is the kind of unsystematic human patch the course repeatedly flags as non-scalable and unauditable. No unkeyed option is defensibly correct.
- Course reference: 01_claude_platform_solution_design.md — 'Prompt engineering techniques across models' (few-shot maintenance) and 'Gate every model change with an eval before you ship it'; 04_stakeholder_engagement_lifecycle.md — 'The observability stack that replaced the feedback loop' (dashboard vs. feedback loop distinction, supports ruling out B)

**Recommendation**: APPROVE

### gen-1.9
**Topic**: Architectural pattern selection: workflow vs. agentic vs. augmented LLM
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- A and B map directly onto the course's pattern-selection framework: a fixed, invariant three-step sequence with a tight latency SLA is the textbook workflow case ('Use this when... the steps can be determined in advance'), while a step count that varies 2-15 and depends on each tool result is the textbook agentic case ('Use this only when the path through the work cannot be enumerated in advance'). D is directly contradicted by the course's retrospective case study: 'Choosing an agent when you're not sure if it is the right pattern is not a safe default... If the steps are known upfront, choosing an agent over a workflow means paying for flexibility you won't use.' C collapses the multi-step tool orchestration the novel case needs into a single augmented call, which the course defines as bounded, single-pass work only. E's five-retry cap is a reasonable inference (a fixed heuristic cannot substitute for genuine feedback-driven step counts of up to 15) and is not contradicted anywhere.
- Course reference: 01_claude_platform_solution_design.md — 'Composing primitives into augmented call, workflow, agent', 'Mapping use cases by predictability and autonomy', and 'When the team wanted flexibility and got non-determinism'

**Recommendation**: APPROVE

### gen-1.10
**Topic**: Multi-agent orchestration: fan-out/gather design and synchronization
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- A and C are the uniquely correct pair: A is the only remaining call-reduction option once E is ruled out by the scenario's explicit 'preserving each subagent's single-source specialization' constraint, and C installs a deterministic join before synthesis rather than relying on timing. C directly mirrors the course's fan-out failure case, where an orchestrator synthesized over whatever results happened to arrive with 'no rule that the number of results must equal the number of units dispatched,' and the prescribed fix was a coverage/reconciliation gate at synthesis. D (prompt-only ordering) is ruled out by the course's structural-vs-stated-constraint distinction: 'A rule stated in the role can be drifted past. A constraint built into the output contract... cannot be quietly ignored.' B is logically wrong on its own terms (caching only helps repeat occurrences, not the first). No unkeyed option is defensible given the scenario's explicit constraints.
- Course reference: 01_claude_platform_solution_design.md — 'Multi-agent systems and orchestration' / 'When fan-out hid a dropped unit' (coverage-check-at-synthesis principle backs C) and 'Author the reusable prompt asset' (structural constraint vs. stated instruction, backs ruling out D)

**Recommendation**: APPROVE

### gen-1.11
**Topic**: solution_design
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Every row is unambiguous on its own terms: each scenario pre-empts the tempting misread (Row 3's 'billing and troubleshooting look nothing alike' rules out Parallel for Functional work; Row 4's 'each lead splits her own piece further' rules out Functional in favor of Hierarchical). This is a legitimate, internally consistent decomposition taxonomy and directly tests a literal Domain 1 exam-guide objective ('Apply decomposition techniques for complex problem solving'), but none of the four course modules teach Parallel/Sequential/Functional/Hierarchical as a named taxonomy. Partial support exists only for Parallel: the course explicitly names 'fan-out' as the multi-agent shape for independent, same-type subtasks merged at the end (and even titles a screen 'Watch Out: Fan-out Drop'). Sequential, Functional, and Hierarchical decomposition are not covered under these names anywhere in the course markdown.
- Course reference: NOT COVERED (taxonomy as a whole) — 01_claude_platform_solution_design.md — 'Multi-agent systems and orchestration' ("The most common multi-agent shape is a fan-out") partially supports only the Parallel rows; Sequential/Functional/Hierarchical labels do not appear in any of the 5 course modules

**Recommendation**: APPROVE

### off-1.1
**Topic**: Pattern selection: fixed workflow for a stable, repeatable multi-step task
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (stable, fully-known steps: extract, validate, generate) is the textbook workflow case per the course's pattern-selection framework: 'Use this when error cost is real, observability matters, and the steps can be determined in advance.' B is correctly keyed; A and C are ruled out because the course explicitly says agent/multi-agent autonomy is warranted only when the path 'cannot be enumerated in advance,' and D loses step-level validation the course also flags as a workflow advantage. Minor phrasing nit (not a keying issue): option B's text implies every step is 'a discrete, sequenced LLM call,' but the course's own decomposition lesson would route the rate-card check to a deterministic system, not Claude — the explanation doesn't lean on this so it doesn't affect correctness, but a tighter option wording would avoid the implication that all three steps are LLM calls.
- Course reference: 01_claude_platform_solution_design.md — 'Composing primitives into augmented call, workflow, agent'

**Recommendation**: APPROVE

### off-1.2
**Topic**: Pattern selection: autonomous agent for open-ended, path-not-knowable-in-advance research
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Matches the course's agent definition almost verbatim: 'Use this only when the path through the work cannot be enumerated in advance.' D is correctly keyed. Distractors are well-targeted to real course traps: A and B both fail because they require the path to be knowable upfront (the course's own case study shows a team wrongly assuming enumerable paths), and C matches the course's cost discipline against running unnecessary analysis passes.
- Course reference: 01_claude_platform_solution_design.md — 'Composing primitives into augmented call, workflow, agent'

**Recommendation**: APPROVE

### off-1.3
**Topic**: Decomposing a long multi-part task after prompt tuning has plateaued
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The failure mode described (skipped policies, shallow rationale on a single long prompt) is the course's own diagnostic signature for a decomposition problem, and 'already refined the prompt twice' rules out re-prompting (B) per the course's own prompting-before-fine-tuning ladder. C is correctly keyed against the workflow pattern's description of sequenced steps with structured hand-offs. A (bigger model) and D (temperature) are cleanly eliminated — the course treats them as addressing capacity/randomness, not structural coverage.
- Course reference: 01_claude_platform_solution_design.md — 'Composing primitives into augmented call, workflow, agent' and 'Try prompting before you consider fine-tuning'

**Recommendation**: APPROVE

### off-1.4
**Topic**: Orchestration strategy for ordered audit trail and halt-on-exception
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- A supervisor/orchestrator owning sequencing and synthesis is exactly the role the course assigns the orchestrator ('it decomposes the work, decides what to delegate, and synthesizes the results'), and the error-recovery section supports centralized handling of exceptions (retry, route, or drop-and-flag) as an orchestrator responsibility. A is correctly keyed. B, C, and D are each plausible-sounding but each abandons the guaranteed ordering or halt behavior the requirements demand, consistent with the course's fan-out/coverage-check case study on what goes wrong without a single point of control.
- Course reference: 01_claude_platform_solution_design.md — 'Multi-agent systems and orchestration' (Orchestrator and subagents; Error recovery)

**Recommendation**: APPROVE

### off-1.5
**Topic**: Criteria for selecting an organization's first AI use case
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This specific framing — choosing a first project from a slate of candidate use cases by weighing measurable business value against feasibility and risk — is not taught as a discrete lesson in any of the five course modules. It is consistent in spirit with related course material (the Decomposition screen's reversibility/stakes/accountability lens, and the discovery module's four-bucket 'what must the system prove/cost' framework), but no screen states this exact selection criterion, and this item lacks the 'hardened' flag the sibling official items carry. C is a generically sound, industry-standard answer and none of A/B/D is defensible as correct, so answer accuracy holds on general-knowledge grounds even though the course itself is silent.
- Course reference: NOT COVERED (closest related material: 01_claude_platform_solution_design.md — 'Where Claude fits' decomposition lens; 04_stakeholder_engagement_lifecycle.md — discovery's four-category constraint set)

**Recommendation**: APPROVE
**Suggested Fix**: Optional: since the concept isn't taught, consider adding a short course-aligned rationale line to the explanation citing the reversibility/stakes/accountability framing from Module 1 decomposition, so the item ties back to taught material rather than resting purely on general business judgment.

### off-1.6
**Topic**: Closing the production-correctness gap with a feedback loop into an evaluable dataset
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The keyed answer maps directly onto Module 4's feedback-loop framework (Signals → Triage → Decide → Act → Review) and Module 2's guidance to 'capture the consultant's acceptance or revision... as the outcome signal' feeding an evaluable record. D is correctly keyed, and A/B/C are cleanly wrong per course material: A conflates model capability with measured accuracy, B monitors cost not correctness, C monitors prompt configuration not output correctness. One observation for record-keeping rather than a defect: this item is domain-tagged solution_design, but the supporting course content sits in Module 4 (stakeholder_lifecycle domain) and Module 2, not Module 1 — worth a look if domain-weighted practice sets are meant to isolate Module 1 content, though this does not affect the question's own correctness.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'The feedback loop decides which signals reach a stakeholder' (Signals→Triage→Decide→Act→Review); 02_enterprise_integration_production.md — outcome-signal capture example

**Recommendation**: APPROVE

### off-1.7
**Topic**: Choosing RAG/retrieval vs. fine-tuning vs. context-stuffing vs. relying on training knowledge for a daily-changing product catalogue
**Content Alignment**: ✓ PASS
**Question Quality**: ⚠ WARNING
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (daily-changing catalogue/pricing/promotions) correctly rules out fine-tuning (A, stale within days and locks to a fixed model version per 'Try prompting before you consider fine-tuning'), context-stuffing (C, the 'monolithic context is the silent budget killer' cost note), and relying on parametric knowledge (D). B is the best of the four choices since it grants access to current data with the phrase 'live catalogue' and 'stay current' signalling source-of-truth access rather than a stale index. However, the course draws a sharp, repeated distinction between 'retrieval' (RAG over a periodically-refreshed index of stable material) and 'tool use'/direct lookup for live state, and its own glossary explicitly lists 'a price' as a live-state example requiring 'a direct lookup against the source of truth, not a stored snapshot' rather than retrieval. Using the word 'retrieval' for the keyed-correct option in a scenario about live pricing is imprecise given the course's own vocabulary discipline, even though B remains the only defensible answer among the four.
- Course reference: 01_claude_platform_solution_design.md — 'The most common mistake: retrieval applied to live state' / 'Watch Out: Retrieval vs Tool Call' (~line 641-663) and the glossary entry for 'Live state' (~line 1139): 'an order status, an inventory count, a price... Systems that need live state require a direct lookup against the source of truth, not a stored snapshot.'

**Recommendation**: REVISE (finding upheld on adversarial verification — moderate)
**Suggested Fix**: Reword option B to use the course's live-state vocabulary and fix the explanation to match. Option B: "Give the model tool access to query the live catalogue system directly so its answers reflect current prices and promotions." Explanation: replace "Daily-changing factual data is the canonical case for retrieval augmentation — the model always answers from current data without retraining" with "Daily-changing prices and promotions are live state — the course's canonical case for a direct tool call against the source of truth, so the model always answers from current values rather than a stored snapshot." Keep the "Why not the others" clauses (A stale, C costly/won't scale, D accepts wrong answers) unchanged. This keeps B as the correct answer and adds no surface tell, since B is already the only current-data-access option regardless of retrieval-vs-tool wording.

### off-1.8
**Topic**: Recognizing an overloaded single agent (declining tool-selection accuracy as scope grows) and recommending domain-specific agents behind a router
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The symptom described — one agent with 35 tools and a 6,000-token multi-domain prompt showing declining tool-selection accuracy as capabilities are added — matches the course's guidance to keep the tool entry point as narrow as the task allows and its routing reference architecture ('Classify intent... then route to the right backend'). Option A (split into domain-specific agents behind a router) is well supported; B and C both compound the overload the course explicitly warns against, and D misdiagnoses the failure as a knowledge gap rather than a scope/selection problem. All four distractors are clearly wrong per the material, and the explanation correctly ties the key to the course's overload/routing framing.
- Course reference: 01_claude_platform_solution_design.md — 'The shapes the industry has already paid to learn' / routing reference architecture ('classify intent... route to the right backend') and 'Keep the tool entry point as narrow as the task allows' (Pattern Selection risk note).

**Recommendation**: APPROVE

### off-1.9
**Topic**: Characteristics that favour a fixed workflow over an autonomous agent (known/identical steps, auditability)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- B and D map directly onto the course's definition of a workflow: 'Use this when error cost is real, observability matters, and the steps can be determined in advance' and the compliance/audit failure trace where an agent's non-determinism became a compliance problem because there was 'no discrete, auditable step to point to.' A and E are textbook agent-favouring conditions (unpredictable input handling, autonomous recovery from failures), and C's 'creatively exploring multiple candidate paths' matches the agent's high-autonomy, low-predictability quadrant rather than a workflow's fixed shape. The multi-select framing is unambiguous and every option is independently checkable against the course.
- Course reference: 01_claude_platform_solution_design.md — 'Composing primitives into augmented call, workflow, agent' and 'When the team wanted flexibility and got non-determinism' (auditability/compliance trace).

**Recommendation**: APPROVE

### off-1.10
**Topic**: Characteristics that justify a multi-agent design over a single augmented agent (distinct specializations, parallelizable independent sub-tasks)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- C and E are a near-verbatim match to the course's fan-out rationale: 'Some problems are too large or too varied for a single agent to hold in one context' and 'the win is twofold: each subagent works in a clean context sized to its unit, and independent units run concurrently.' A (volume), B (budget), and D (prestige/sophistication) are each explicitly called out elsewhere in the course as non-architectural drivers ('Reach for the pattern when the work genuinely exceeds one context, not as a default'), so the distractors are cleanly wrong rather than trick options.
- Course reference: 01_claude_platform_solution_design.md — 'Multi-agent systems and orchestration' / 'The worked pattern: fan-out over a large work item' and its Cost note ('Reach for the pattern when the work genuinely exceeds one context, not as a default').

**Recommendation**: APPROVE

### off-1.11
**Topic**: Matching five scenarios to single augmented call / fixed workflow / autonomous agent / multi-agent system
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Each row-to-pattern mapping is directly supported: row 1 and row 5 (single transformation with supplied context) match 'a single model invocation... you can add tool use, retrieval, or extended thinking to that call'; row 2 (same five steps every time) matches the workflow definition ('the steps can be determined in advance'); row 3 (diagnostic path depends on what each log query reveals) mirrors the course's own Claude Code example of an agent that 'decides which files to read based on what it has already found'; row 4 (legal/financial/technical specialists coordinated into one recommendation) matches the orchestrator/subagent multi-agent structure. No row is ambiguous between two patterns, and the explanation for each row cites the discriminating feature the course teaches.
- Course reference: 01_claude_platform_solution_design.md — 'Composing primitives into augmented call, workflow, agent' (three pattern definitions) and 'Multi-agent systems and orchestration' (orchestrator/subagent roles).

**Recommendation**: APPROVE

## Claude Models, Prompting & Context Engineering (16 questions)

### gen-2.1
**Topic**: Model selection trade-offs (cost/latency vs. task complexity)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The key (A) mirrors the course's own worked example almost exactly: the 7x-cost-overrun case routes a bounded classifier step to Haiku while keeping Opus on the step an eval showed actually earned the higher tier. Distractors are each addressed by course principles: B contradicts 'start with Sonnet, move deliberately' by uniformly reassigning both steps without per-step justification; C inverts the course's per-step matching rule; D treats a caching/volume lever as a substitute for the model-tier mismatch, which the course treats as a separate axis. One nuance worth noting: the course insists every model-tier decision be gated by an eval before shipping ('Gate every model change with an eval before you ship it'), and option A doesn't mention running one — this is a minor questionQuality footnote, not an accuracy defect, since no answer choice offers an eval-first path and A is still the only choice that doesn't touch the CSAT-critical step.
- Course reference: 01_claude_platform_solution_design.md — 'Model selection: start with Sonnet, move deliberately' and 'When defaulting to Opus everywhere produced a 7x cost overrun'

**Recommendation**: APPROVE

### gen-2.2
**Topic**: System prompt templates & guardrails — separating data from instructions, deterministic checks for high-stakes actions
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Very strongly supported. Module 3's guardrail-placement section states almost verbatim that 'tool-call authorization runs before any action with side effects, such as sending an email, writing to a database, or issuing a refund' and its worked risk-assessment example prescribes 'an action-authorization check that runs before the refund tool executes, independent of the model's output' — exactly what key B adds. Module 1's template guidance ('the fixed scaffolding carries the consistency and safety guarantees... build it into the output contract as a structural constraint, not a sentence in the role text') supports delimiting customer text structurally rather than relying on more prose instructions, which is exactly why distractor A is wrong ('a rule stated in the role can be drifted past'). C (keyword heuristic) and D (external scoring service bolted on) are both addressed by the course's point that brittle/added layers don't fix an untouched template and ungated action.
- Course reference: 03_responsible_ai_safety_risk.md — 'Where guardrails sit in a request path' (tool-call authorization) and 'Assess the risks in a proposed architecture' (refund-tool mitigation); 01_claude_platform_solution_design.md — 'Templates: consistency and safety, enforced' and 'Author the reusable prompt asset' (structural guardrail enforcement)

**Recommendation**: APPROVE

### gen-2.3
**Topic**: Few-shot prompting vs. chain-of-thought for multi-label classification
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Well supported by the course's technique-selection guidance: 'start zero-shot, add examples only if the task needs them, and add explicit reasoning only if the task's structure demands it.' The failure described (model defaults to tagging only the first-mentioned issue) is a pattern-imitation gap, which is what few-shot examples fix per the course, not a reasoning-space gap, which is what chain-of-thought (distractor A) would fix. B (an ever-growing rulebook) and D (a brittle keyword scanner) are each addressed by course principles favoring structured, maintainable prompt assets over prose enumeration or bolted-on heuristics outside the model's own judgment.
- Course reference: 01_claude_platform_solution_design.md — 'Prompt engineering techniques across models' (technique selection by task complexity, few-shot vs. chain-of-thought progression)

**Recommendation**: APPROVE

### gen-2.4
**Topic**: Context window optimization and token usage management
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Strongly supported, including against the course's own caveat about compaction losing load-bearing detail: D persists the complete output to disk for later retrieval, which directly answers the course's compaction-plus-retrieval combination taught in the long-running coding-agent worked example ('what earlier material can be compressed without losing decision-relevant detail? -> drives the compaction policy' paired with 'what might it need to fetch on demand? -> drives the retrieval layer'). A (bigger context window) and B (prompt caching) are each explicitly distinguished in the course from actually reducing counted context tokens; C (a compliance instruction) is undermined by the course's point that a model instruction is probabilistic, not a structural guarantee.
- Course reference: 01_claude_platform_solution_design.md — 'Context strategy: spectrum between progressive and monolithic' and 'In practice, strategies may be combined' (long-running coding agent worked example: compaction + retrieval-on-demand)

**Recommendation**: APPROVE

### gen-2.5
**Topic**: Prompt caching: cache_control breakpoint placement for a shared prefix across multiple system-prompt variants
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The keyed concept — that prompt caching is a strict prefix match, so a breakpoint placed after persona-specific text prevents any two personas from sharing a cache entry, and moving it to the shared/persona boundary pools all calls onto one warm entry — is directly taught in '01_claude_platform_solution_design.md' under 'Caching mechanics, modular prompts, and Skills': the worked anecdote there is almost the same failure (dynamic content placed before the fixed block breaks the prefix match) with the same fix (reorder fixed content first, dynamic last). Distractors B, C, D are each clearly wrong for reasons the course supports: B degrades caching by leading with per-persona text; C (Skills) is a real reuse/DRY win per 'Modular prompt libraries vs Skills' but doesn't touch render position, matching the course's framing of Skills as packaging, not a caching lever; D's specific numbers (a fabricated 'cache-duration: 24h' header, and the claim the real max is a 1h TTL) are not verified anywhere in the course text I read (courses only state a 5-minute default TTL in 02_enterprise_integration_production.md, without mentioning an extended-TTL option), so that supplementary technical detail sits outside course coverage even though it does not contradict it and is consistent with the primary, well-covered lesson that duration was never the bottleneck here — the breakpoint position was.
- Course reference: 01_claude_platform_solution_design.md — 'Caching mechanics, modular prompts, and Skills' (the reorder-prefix anecdote); TTL specifics partially NOT COVERED (course only states a 5-minute default TTL, in 02_enterprise_integration_production.md, line ~300)

**Recommendation**: APPROVE

### gen-2.6
**Topic**: Matching Claude model tier (Haiku vs Opus) to per-step task complexity in a two-step pipeline
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This scenario closely mirrors the course's own worked case study 'When defaulting to Opus everywhere produced a 7x cost overrun,' where the fix was routing a simple classifier step to Haiku while keeping Opus on the one step (final response composition) where the eval showed the higher tier earned its place — the same per-step logic the keyed answer B applies to triage-classifier vs. escalation-drafting. Distractor D is well-grounded in the course's explicit distinction that 'the effort parameter controls how much a given model thinks within its own capability... not which capability tier it has access to' ('What extended thinking controls'). One minor gap: the course insists every model swap be gated by an eval set before shipping ('Gate every model change with an eval before you ship it'), and neither the question stem nor B's explanation mentions building that eval — the question tests correct directional reasoning about tier-to-task-complexity fit, not the eval-gating discipline the course treats as mandatory, so a strict reading could argue the explanation understates that requirement. This is a minor scope simplification, not a keyed-answer error.
- Course reference: 01_claude_platform_solution_design.md — 'Model selection: start with Sonnet, move deliberately' and 'When defaulting to Opus everywhere produced a 7x cost overrun'

**Recommendation**: APPROVE

### gen-2.7
**Topic**: Structural (code-level and template) guardrails vs. prompt-only reinforcement for a monetary-accuracy failure
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Both keyed answers map directly onto the course's guardrail-design principle: 'Build it into the output contract as a structural constraint the format requires, not as a sentence in the role text. A rule stated in the role can be drifted past. A constraint built into the output contract shapes the response format and cannot be quietly ignored' (Author the reusable prompt asset — model answer). D is a template-level instance of exactly that structural constraint (sourcing the figure from tool output rather than model prose); A is the code-level backstop version of the same idea, consistent with the four-properties lesson that 'confidence is not validity' and verification must be architectural, not hoped for. B is correctly rejected because the course explicitly treats more emphasis/few-shot on an already-instructed prompt as still probabilistic reinforcement, not a guarantee. E is correctly rejected on the stem's own stated constraint (no added latency for the compliant 96%). No ambiguity found between the two keyed options and the three distractors.
- Course reference: 01_claude_platform_solution_design.md — 'Designing system prompts, templates, and guardrails' (Templates: consistency and safety, enforced) and 'Author the reusable prompt asset' model answer

**Recommendation**: APPROVE

### gen-2.8
**Topic**: Chain-of-thought and few-shot prompting to fix an arithmetic reconciliation failure in a monetary refund draft
**Content Alignment**: ⚠ WARNING
**Question Quality**: ⚠ WARNING
**Answer Accuracy**: ⚠ WARNING

**Assessment**:
- The keyed pairing (A: chain-of-thought running-subtotal check, E: matching few-shot examples) is a defensible prompting-only improvement, and the course's technique-selection guidance ('add explicit reasoning only if the task's structure demands it') supports using CoT for a structured summation task. However, the scenario as written is precisely the failure case the course flags elsewhere and offers a different, stronger fix for: under the four properties (Steerability), the course states 'tasks requiring precise numerical or logical computation... For high-stakes numerical accuracy, deterministic computation or tool execution should own the answer,' with the matching mitigation 'Use system prompts, structured outputs, and code execution for anything requiring logical precision.' This scenario is explicitly framed as high-stakes ('SLA requires that every number... reconcile before a human ever sees it') and is pure arithmetic (summing line items), which is exactly the case the course says should be handed to deterministic computation or tool execution rather than solved by better prompting alone — yet no code-execution/tool-based option is offered among the five choices, and the explanation asserts CoT+few-shot are 'most likely to close this reconciliation gap... to near zero,' overclaiming reliability for a probabilistic mechanism on a task the course explicitly earmarks for a deterministic mechanism instead.
- Course reference: 01_claude_platform_solution_design.md — 'The four properties and their design consequences' (Steerability capability/limitation/mitigation row, ~line 240-244) contradicts the framing that prompting alone should be the go-to fix for this arithmetic-accuracy scenario; 'Prompt engineering techniques across models' (Technique selection by task complexity) supports CoT/few-shot as a lighter-weight technique in general

**Recommendation**: APPROVE (first-pass REVISE refuted on adversarial verification)

### off-2.1
**Topic**: Model tier selection for a high-volume, cost/latency-sensitive classification task
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly tests the course's core model-selection rule: 'The default starting point is still Sonnet. Move up to Opus only when an eval set tells you Sonnet isn't meeting your quality bar. Move down to Haiku only when an eval set confirms the quality tradeoff is acceptable' plus 'Gate every model change with an eval before you ship it.' The scenario (comparable accuracy across the family, 400k msgs/day, cost- and latency-sensitive) maps cleanly onto 'smallest model that meets the target, confirmed with ongoing evaluation.' Option A is explicitly refuted by the course's 'Opus Everywhere' 7x-cost-overrun case study; B contradicts the eval-gating principle; D is a nonsensical distractor with no course support.
- Course reference: 01_claude_platform_solution_design.md — 'Model selection: start with Sonnet, move deliberately' and 'Gate every model change with an eval before you ship it' / 'When defaulting to Opus everywhere produced a 7x cost overrun'

**Recommendation**: APPROVE

### off-2.2
**Topic**: Prompt-caching cache-hit failure caused by dynamic content at the start of the prompt
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Near-identical to the course's own worked example: 'A team put their reusable analysis prompt into production and saw none of the cost savings caching was supposed to bring... they had placed the per-request content... at the top of the prompt, ahead of the large fixed instruction block. Because the cache matches on a stable prefix, putting dynamic content first meant the prefix changed on every request and the cache never hit.' Option A (timestamp/request-ID at position zero) is the same mechanism restated. B invents a cache size limit not described anywhere in the course; C misstates caching (it matches the stable prefix, not the trailing turn); D invents an eviction mechanism not covered. All three distractors are cleanly wrong per course material.
- Course reference: 01_claude_platform_solution_design.md — 'Caching mechanics, modular prompts, and Skills' (the reordering anecdote: 'the cache matches on a stable prefix... putting dynamic content first meant the prefix changed on every request')

**Recommendation**: APPROVE

### off-2.3
**Topic**: Applying chain-of-thought selectively based on measured task benefit
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Matches the course's technique-selection principle: 'The progression is deliberate: start zero-shot, add examples only if the task needs them, and add explicit reasoning only if the task's structure demands it. Each step adds tokens and latency, so reach for the lightest technique that meets the requirement.' The scenario (CoT helps a complex task, hurts a simple one with no accuracy gain) is a direct instantiation of that rule, and option D restates it. A discards a proven gain on the complex feature; B doubles down on a technique already shown not to help; C is a fabricated claim about model-size gating that appears nowhere in the course and is correctly rejected.
- Course reference: 01_claude_platform_solution_design.md — 'Prompt engineering techniques across models — Technique selection by task complexity'

**Recommendation**: APPROVE

### off-2.4
**Topic**: Fixing inconsistent adherence to a critical rule buried mid-prompt via repositioning
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The keyed mechanism (positional/attention effects degrading adherence to instructions buried mid-context, fixed by moving critical rules to the start or end with clear structural separation) is a real, well-established Claude prompting practice, but it is not explicitly taught anywhere in this course file or the other four modules — I grepped for 'position', 'primacy', 'recency', 'buried', 'lost in the middle', 'salien' etc. across all five course markdown files and found no coverage of this specific technique. The closest adjacent material is the monolithic-context breakdown note ('Attention quality can degrade on very long contexts well before the hard limit is reached') and the System-Prompt/Template screens on structure and explicitness, but neither states the positional-repositioning fix. Distractors are correctly wrong on general grounds (temperature and capitalization affect neither rule salience nor position), and 'temperature' is never mentioned in the course at all, so C also relies on outside knowledge, though it is uncontroversially wrong. Because the course is silent rather than contradictory, this is not a reject-worthy defect, but it is drawn from outside the taught material.
- Course reference: NOT COVERED

**Recommendation**: APPROVE
**Suggested Fix**: Optional: if strict course-groundedness is required, either add a line to the 'System-Prompt Architecture' or 'Diagnosing underspecification gaps' section of 01_claude_platform_solution_design.md naming positional/attention effects on mid-prompt instructions, or retag this item's courseRef as exam-guide-only content so reviewers know it draws on general Claude prompting practice rather than the course text.

### off-2.5
**Topic**: Using few-shot examples to fix inconsistent adherence to a precise output format
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Fits the course's technique-selection framework, which explicitly ranks zero-shot < few-shot < chain-of-thought and ties the choice to task complexity/structure, implying few-shot examples are the right escalation when prose instructions alone under-specify a concrete target like exact formatting. The course's related Templates screen reinforces that structural/example-based mechanisms outperform prose instructions for consistency ('the fixed scaffolding carries the consistency and safety guarantees'). B (max tokens) addresses length, not fidelity; C (raise temperature) increases variance, directly counter to the stated goal; D (split into per-section calls) adds engineering overhead without addressing the format-adherence problem itself. All three are cleanly wrong.
- Course reference: 01_claude_platform_solution_design.md — 'Prompt engineering techniques across models — Technique selection by task complexity' and 'Templates: consistency and safety, enforced'

**Recommendation**: APPROVE

### off-2.6
**Topic**: Retrieval over the full 150k-token corpus to fix both recall degradation and cost
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Matches the course's context-strategy table almost exactly: retrieval 'earns its place' for 'Knowledge bases too large to fit in context' and 'Domains where any single query needs only a small slice of available material,' while monolithic context 'breaks down' because 'Attention quality can degrade on very long contexts well before the hard limit is reached' and cost/latency scale linearly with input length. Option C (retrieve only relevant sections) is the textbook fix for exactly this pairing of symptoms. A (move question to top) doesn't reduce token cost and isn't a recall fix taught anywhere in the course; B (read twice) adds latency with no stated benefit; D (strip structure) contradicts the course's RAG design guidance that structure preservation matters for retrieval quality ('Fixed-size chunking cuts across section boundaries and loses the structural context the query depends on').
- Course reference: 01_claude_platform_solution_design.md — 'Model, context window, and context strategy — Context strategy: spectrum between progressive and monolithic' (retrieval strategy table) and 'Design the RAG pipeline' (structure-preserving chunking guidance)

**Recommendation**: APPROVE

### off-2.7
**Topic**: Prompt caching and on-demand instruction loading for cost reduction
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Key (A, D) is directly supported: the course's caching-mechanics section teaches that a cacheable static prefix followed by dynamic content is what makes prompt caching pay off, and the glossary/progressive-context material explicitly endorses loading specialised instructions on demand ('the pattern shows up in skills that load reference files on demand') as a cost lever. All three distractors fail for course-stated reasons: B and C add tokens on every call (course: 'heavier techniques cost tokens and latency on every call'), and E inverts the caching fix the course's own worked example corrects (moving dynamic content ahead of the stable prefix breaks the cache).
- Course reference: 01_claude_platform_solution_design.md — 'Caching mechanics an architect designs around' (cache-prefix ordering example) and 'Context strategy: spectrum between progressive and monolithic' (progressive/on-demand loading)

**Recommendation**: APPROVE

### off-2.8
**Topic**: System prompt structure, conflict priority, and few-shot examples for instruction adherence
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The key (B, E) is course-supported: structured system prompts with explicit constraints (module 1, 'System-prompt architecture for enterprise reuse') and concrete examples of correct handling for failing cases (module 1, 'Prompt engineering techniques') are both taught levers for instruction adherence. However, two distractor rationales rely on facts the courses never state: that temperature increases interpretive variance (temperature is never mentioned in any course file) and that the middle of a prompt receives the weakest model attention ('lost-in-the-middle' is not taught anywhere in the material). Both claims are generally true and standard practice, so they don't contradict the courses, but they are outside-course general knowledge, which is why contentAlignment is a WARNING rather than a PASS. The key itself is not affected.
- Course reference: 01_claude_platform_solution_design.md — 'Designing system prompts, templates, and guardrails' (structure/constraints) and 'Prompt engineering techniques across models' (technique selection, examples); temperature and prompt-position-attention effects: NOT COVERED

**Recommendation**: APPROVE

## Integration (24 questions)

### gen-3.1
**Topic**: Tool/agent configuration capability bloat (least-privilege tool trimming)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly matches the course's 'Least-privilege tool configuration' guidance: 'Audit the tool set... for each connected tool, ask whether it is essential to the task or merely convenient, and remove the ones that are out of scope.' The scenario's two symptoms (schema-token overhead and 8% misrouting) both trace to the same root cause -- an over-provisioned, under-curated tool list -- and only option C removes that cause. Distractors are each a plausible partial fix (routing layer, prompt nudge, new orchestrator layer) that the explanations correctly show leaves the root cause (unused tools still registered) untouched.
- Course reference: 02_enterprise_integration_production.md -- 'Least-privilege tool configuration'

**Recommendation**: APPROVE

### gen-3.2
**Topic**: MCP server identity/authorization gap (shared service-account token vs. per-user scoped credential)
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The general principle behind the key is taught: 'Identity verification belongs on the server... Identity must come from your authentication layer rather than from user input,' and the multi-tenant risk box states 'Separate API keys per tenant are required for attribution and isolation.' Both support D's direction (stop trusting one shared, over-broad credential). However, the specific mechanism in the key -- the MCP server performing an on-behalf-of token exchange for a per-user scoped credential at the downstream API boundary -- is not spelled out anywhere in the course; the course's identity guidance is about injecting verified role/identity into the prompt, not about downstream API-to-API credential scoping. This is an extrapolation from taught principles rather than a directly-taught mechanism, but it is not contradicted and is a defensible, professional-level answer.
- Course reference: 02_enterprise_integration_production.md -- 'Identity and authorization: where the verification happens' (general principle); the specific per-user credential-exchange mechanism is NOT COVERED

**Recommendation**: APPROVE

### gen-3.3
**Topic**: Accuracy-latency trade-off: decoupling a fast synchronous ack from an async extended-thinking classification pass
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ⚠ WARNING

**Assessment**:
- The tested skill -- separating a latency-bound ack path from an accuracy-heavy async pass, and rejecting the 'renegotiate the fixed timeout' and 'nightly batch is too slow' distractors -- is sound and consistent with the course's cost/latency-tradeoff framing of extended thinking. But the question and every option build the correct answer around 'extended thinking with budget_tokens=8000' as the live control knob. The sibling course file states plainly: 'The older manual thinking-token budget (budget_tokens) is deprecated on the 4.6 generation and removed on Claude Sonnet 5, where it returns a 400 error,' with adaptive thinking's effort parameter now the recommended (and on the newest models, only) control. A question whose keyed answer hinges on a parameter the course says is removed on current-generation models is testing a deprecated API surface as if it were current practice.
- Course reference: 01_claude_platform_solution_design.md -- 'What extended thinking controls' (budget_tokens explicitly called deprecated/removed on Claude Sonnet 5)

**Recommendation**: REVISE (finding upheld on adversarial verification — moderate)
**Suggested Fix**: Replace every occurrence of "budget_tokens=8000" (the stem's "enabling extended thinking with budget_tokens=8000" and options A and B) with the adaptive-thinking effort control, e.g. "extended thinking at effort=high," per 01_claude_platform_solution_design.md "What extended thinking controls." In option B, rewrite "Increase budget_tokens further" as "Raise the effort level further" so the distractor's real flaw (negotiating the fixed contractual timeout) is preserved. No change to the correct answer (A) or to the answer key is needed. Alternatively, if budget_tokens is meant to depict an older model generation, state that explicitly in the stem so the parameter is not read as current guidance.

### gen-3.4
**Topic**: Distributed tracing / correlation IDs for multi-agent, multi-service observability
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course teaches the underlying problem and its shape -- 'Request-level tracing... every request should produce a trace' and, specifically for multi-agent systems, 'trace across the orchestrator and its subagents... Attribution requires a trace that spans both' -- which supports the general direction of the key (a shared, propagated identifier that lets a single query reconstruct the full path). But the specific technique named in the key, generating one correlation ID at entry and carrying it through every hop as a structured log/trace field, is standard distributed-systems practice that is not spelled out in either course file under that name. The distractors (centralize+DEBUG logs, add anomaly detection, manual timestamp matching) are each clearly inferior to the key and don't contradict anything taught.
- Course reference: 02_enterprise_integration_production.md -- 'Observability: what to log, what to trace, and why' / 'Orchestrator-workers failure' (general multi-agent tracing taught); the specific correlation-ID propagation technique is NOT COVERED

**Recommendation**: APPROVE

### gen-3.5
**Topic**: RAG chunking strategy for structured, numbered procedural content
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Strongly supported. The sibling course file states chunking approach is 'chosen by the structure of the source material, not by a default size,' and its worked example prescribes exactly this pattern for structured, section-numbered material: 'Hierarchical chunking that preserves section and subsection structure... Fixed-size chunking cuts across section boundaries and loses the structural context the query depends on.' Numbered repair procedures are structurally identical to the course's contracts/methodology-handbook example. The distractors (bigger fixed chunks, reranker, more overlap) are each addressed by the course's framing that fixed-size/overlap approaches only shift or reduce the odds of the same boundary failure rather than eliminating it.
- Course reference: 01_claude_platform_solution_design.md -- 'Chunking: how you break the corpus, by what the corpus is' / 'Design the RAG pipeline' worked example (hierarchical chunking for structured, section-numbered content)

**Recommendation**: APPROVE

### gen-3.6
**Topic**: Matching retrieval strategy to data shape: keyed lookup for structured identifiers vs. dense-vector search for open-ended queries
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Well supported by two course threads: (1) the reference-architecture principle that 'the most common reference architecture mistake is using retrieval where a tool call belongs... call the system that owns the live state directly rather than retrieving a cached version of it,' which matches routing order/invoice lookups to the transactional records store; and (2) the RAG pipeline exercise's indexing guidance that 'sparse handles exact-target lookups where specific identifiers matter; dense handles concept-lookup... Neither alone covers both patterns,' which supports the diagnosis that a single dense-only index can't serve exact numeric-ID queries well. Distractors (raise top-k, better embeddings, prompt instruction) are each correctly shown as symptom patches that don't change the fundamental mismatch between similarity ranking and exact-match retrieval.
- Course reference: 01_claude_platform_solution_design.md -- 'The most common mistake: retrieval applied to live state' and 'Design the RAG pipeline' (hybrid/sparse indexing for exact-match identifiers)

**Recommendation**: APPROVE

### gen-3.7
**Topic**: Integration: choosing MCP vs agent-to-agent vs direct API/CLI
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Key A is directly supported: the course states MCP shifts tool-definition maintenance into a reusable server and that you 'pick MCP when one tool entry point needs to be reachable from multiple Claude clients' — exactly the scenario's growing endpoint count plus multiple internal agents needing access. Distractor C (patch token caching into the existing tool) is a real partial fix but correctly loses because it doesn't scale to new endpoints/agents, which the course frames as the reuse criterion for MCP. B (agent-to-agent/subagent delegation) is properly rejected since course subagent material (orchestrator-worker, fan-out) frames that pattern for decomposing oversized reasoning work, not wrapping a deterministic REST integration. D invents a non-existent settings.json feature, consistent with this bank's deliberate anti-surface-tell hardening pattern (also seen in gen-3.9's invented 'tool_priority' field).
- Course reference: 01_claude_platform_solution_design.md — 'MCP and API tool use: different layers, not alternatives' (line ~1025) and Glossary 'Model Context Protocol'

**Recommendation**: APPROVE

### gen-3.8
**Topic**: Progressive tool discovery vs. monolithic context loading in MCP integrations
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Key B generalizes the course's progressive-vs-monolithic context principle ('capabilities are loaded in stages as the work requires them... the pattern shows up in skills that load reference files on demand') directly to MCP tool schemas: a lightweight catalog by default, full schema on selection. The question is precisely worded ('cut this upfront token overhead') to discriminate the key from the strongest distractor, D (gateway prompt caching): caching reduces reprocessing cost/latency on repeat requests but does not shrink the token count in a session's first request, which is exactly what the course's caching description implies (it preserves/reuses the processed prefix, it does not remove tokens from the payload). A is a monolithic pattern that still scales with total tool count; C is an unenforced prompt instruction. No ambiguity in the key.
- Course reference: 01_claude_platform_solution_design.md — 'Context strategy: spectrum between progressive and monolithic' and Glossary 'Progressive context'; 02_enterprise_integration_production.md — 'Cost and latency modeling' (caching mechanics) for distractor D

**Recommendation**: APPROVE

### gen-3.9
**Topic**: Tool/agent configuration — identifying and trimming capability bloat
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Key option B is squarely supported: the course's 'Least-privilege tool configuration' section instructs auditing the tool set and removing anything not essential, which is exactly the 8-of-14 dead-tool cut. Key option C (rewriting the two overlapping tool descriptions) is a reasonable and correct fix for the 18% misselection, but the specific practice of disambiguating near-identical tool schemas by scenario is not explicitly taught in any course file — hence the WARNING rather than a clean PASS. Distractors are well-reasoned: A adds a component instead of removing bloat, D is a probabilistic nudge that doesn't touch the ambiguous schema, and E invents a non-existent priority field (consistent with the bank's anti-tell hardening).
- Course reference: 02_enterprise_integration_production.md — 'Least-privilege tool configuration' (supports B); tool-description disambiguation for C is NOT COVERED in course text

**Recommendation**: APPROVE

### gen-3.10
**Topic**: Integration — auth/authz gap analysis for MCP-connected tool access
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Both keyed answers are well grounded. B (replace shared admin token with narrowly scoped per-workflow grants) matches the course's identity/authorization guidance that verified identity and scope must come from the authentication layer, and the 'Least-privilege tool configuration' instruction to scope access to what a task actually requires. D (deny-by-default gateway allowlist) is supported cross-module by Module 3's definition of a proper pre-action check: 'deterministic, an allowlist plus identity and scope, so the decision is provable and auditable.' A and C are correctly rejected as probabilistic layers (prompt instruction, risk classifier) standing in for a deterministic authorization fix, and E (rotation/secrets hygiene) correctly doesn't narrow what the token can do. B and D are non-redundant — different layers, proper defense-in-depth — consistent with course philosophy of preferring deterministic controls over probabilistic ones.
- Course reference: 02_enterprise_integration_production.md — 'Identity and authorization: where the verification happens' and 'Least-privilege tool configuration'; 03_responsible_ai_safety_risk.md — deterministic pre-action check definition (line ~574)

**Recommendation**: APPROVE

### gen-3.11
**Topic**: integration — accuracy-latency trade-offs and configuration justification
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Key B (run the independent extraction and lookup calls concurrently) is well supported by the course's fan-out/orchestration principle that 'independent units run concurrently,' correctly applied here since the lookup's only input (jurisdiction code) is available before extraction runs, cutting p95 from 23s to ~14s and clearing the 15s SLA without touching the thinking budget (preserving the audited recall floor). Key E (async ack + callback to decouple the webhook timeout) is general software-architecture practice not explicitly taught in any course file, so this sub-point is NOT COVERED — hence the WARNING. It is not contradicted by course content and its stated purpose (removing tail-latency contracts from the failure path) is logically sound given p95 still leaves a tail. A and C correctly risk the audit-mandated recall floor; D is correctly rejected since the stem states jurisdiction codes rarely repeat, so a hash cache would rarely hit.
- Course reference: 01_claude_platform_solution_design.md — orchestrator/subagent fan-out, 'independent units run concurrently' (line ~556) supports B; async webhook-decoupling pattern (E) is NOT COVERED

**Recommendation**: APPROVE

### gen-3.12
**Topic**: integration_observability_monitoring_at_scale
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Strongly and precisely supported by the course's observability taxonomy. Row 1 (per-request tool-call sequence for one stalled conversation) and row 5 (post-incident reconstruction of subagent/tool call order) both key to 'Request-level tracing,' matching the course's explicit statement that 'attribution requires a trace that spans both' orchestrator and subagents. Row 2 (fleet-wide p95/error-rate view) matches 'Metric aggregation... the metrics the dashboard displays.' Row 3 (automatic paging on a 5% threshold breach) matches 'Anomaly detection... threshold alerts.' Row 4 (curt tone shift with no metric movement) matches the course's Discernment concept almost verbatim: 'A team without Discernment watches metrics move and never asks whether the underlying outputs were actually good' — only manual transcript review catches this. The reused-tracing trap (rows 1 and 5) is explicitly and correctly flagged in the explanation as intentional, appropriate for professional-level difficulty.
- Course reference: 02_enterprise_integration_production.md — 'Observability at scale: instrumentation design, dashboards, anomaly detection' and 'Discernment: judging the output'

**Recommendation**: APPROVE

### off-3.1
**Topic**: Entry-point/integration pattern selection for many systems x many consuming apps (MCP)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (twelve systems, decentralized team ownership, frequent tool churn, multiple consuming applications) is exactly the shape the course names as MCP's home ground: 'MCP shifts the work of building and maintaining tool definitions away from your application code and into reusable servers' and 'pick MCP when one tool entry point needs to be reachable from multiple Claude clients.' The course even runs the counter-example (a bank with no other MCP clients, where MCP was overkill) — this question flips that condition by explicitly stating multiple AI applications need to reuse the connections, which is the correct trigger. Distractors are each clearly wrong per the course: custom middleware creates a bottleneck/SPOF, hard-coding multiplies maintenance by app count, and direct DB access bypasses business logic and access control (echoed by the 'access control before passing content to Claude' pattern used elsewhere).
- Course reference: 01_claude_platform_solution_design.md — 'Once an entry point is picked...' / MCP glossary entry; contrast case 'MCP was carried forward from a prior project as a default integration layer'

**Recommendation**: APPROVE

### off-3.2
**Topic**: Tool catalogue bloat: pruning unused tools and progressive discovery
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Half of the keyed answer is directly supported — 'Least-privilege tool configuration' instructs auditing every connected tool and removing what is out of scope, which matches 'audit and remove unused or overlapping tools.' The other half, 'progressive discovery to narrow requests' as a named remedy for tool-selection accuracy at 45 tools, is not covered verbatim; the course only teaches 'progressive context' as a context-loading strategy (staging what the model sees), not a tool-catalogue-narrowing technique. The reasoning is a defensible extension of a taught principle, and no course content contradicts the key or supports a distractor instead, so this is a coverage gap rather than a wrong answer. All three distractors remain clearly worse under the course's cost/complexity framing (heavier primitives cost latency/tokens 'every request').
- Course reference: 02_enterprise_integration_production.md — 'Least-privilege tool configuration' (audit/remove); 01_claude_platform_solution_design.md — glossary 'Progressive context' (partial match only, term 'progressive discovery' for tools is NOT COVERED)

**Recommendation**: APPROVE
**Suggested Fix**: Optional: tighten the explanation to lean on the taught 'least-privilege tool audit' language rather than the uncovered term 'progressive discovery,' or add a short course pointer so the tie to taught material is explicit.

### off-3.3
**Topic**: Authorization enforced in the prompt vs. in the access-control layer
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Strongly supported by two sections. Module 2: 'Identity verification belongs on the server, before the Claude call... Identity must come from your authentication layer rather than from user input,' and Module 3 gives the near-identical failure pattern: a team assumed cross-unit data-access restriction was covered by the model's general safety behavior and 'never built an authorization check for it' — same root cause (instructions are not enforcement). Distractors are all clearly wrong: B invents a compliance rule, C expands blast radius by adding write access, D is a credential-handling anti-pattern the course never endorses. Answer key A is the only defensible choice.
- Course reference: 02_enterprise_integration_production.md — 'Identity and authorization: where the verification happens'; 03_responsible_ai_safety_risk.md — training-time vs. inference-time control and the cross-unit-disclosure case study

**Recommendation**: APPROVE

### off-3.4
**Topic**: Chunking strategy for structured legal documents (fixed-size vs. section/clause-aligned)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Near-verbatim match to the course's worked exercise: 'Contracts and methodology handbook: Hierarchical chunking that preserves section and subsection structure... retrieving at the section level keeps the clause or procedure intact and self-contained. Fixed-size chunking cuts across section boundaries and loses the structural context the query depends on.' This is exactly the failure and fix described in the question. Distractors are each addressed by the course's framing: shrinking chunk size worsens fragmentation, flooding with more retrieved chunks doesn't restore lost structural context, and discarding semantic retrieval for headings-only keyword search contradicts the course's hybrid/structure-matched retrieval guidance.
- Course reference: 01_claude_platform_solution_design.md — 'Chunking and indexing' exercise, model answer for 'Contracts and methodology handbook'

**Recommendation**: APPROVE

### off-3.5
**Topic**: Hybrid (sparse + dense) retrieval for exact identifiers vs. natural-language queries
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly supported: 'Sparse handles exact-target lookups where specific identifiers matter; dense handles concept-lookup and synthesis queries where meaning, not exact terms, drives the match. Neither alone covers both patterns.' The question's part-number-vs-natural-language split is precisely this sparse/dense split, and the keyed hybrid answer follows the course's own worked recommendation ('Hybrid dense-plus-sparse ... query set genuinely needs both modes'). Distractors are sound: full keyword replacement breaks the NL queries that already work, a larger embedding model doesn't fix a fundamentally lexical mismatch, and pushing the fix onto users contradicts the course's system-design-first stance.
- Course reference: 01_claude_platform_solution_design.md — 'Indexing: how you make chunks findable' exercise, model answer 'Indexing strategy: Hybrid dense-plus-sparse'

**Recommendation**: APPROVE

### off-3.6
**Topic**: Quantitative trade-off: accuracy gain vs. added latency against a contractual SLA
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Re-ranking itself is not a named technique in the course (reciprocal rank fusion is a different, related concept for merging hybrid results), but the load-bearing skill being tested — quantify both sides of a change against the SLA rather than reacting on instinct — is core module content: p95 is named as the correct design target against SLA breaches, and the A/B section explicitly asks 'is the effect large enough to justify the operational overhead... did any secondary metric degrade?' The arithmetic checks out (1.6s + 0.5s = 2.1s, under the 3s SLA), matching the key. Distractors map cleanly onto the course's own warnings: B is dogma ('latency should never be accepted') where the course insists on quantified analysis, C fragments behavior without justification, D defers a decision the data already supports (mirrors the course's critique of unjustified deferral in the payback-period section).
- Course reference: 02_enterprise_integration_production.md — 'Cost and latency modeling' (p95 as design target) and 'A/B testing and observability — Reading results without overclaiming'

**Recommendation**: APPROVE

### off-3.7
**Topic**: Observability strategy at scale (structured traces + sampled full-payload capture triggered on errors)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course's Observability section directly supports the key: request-level tracing (model, tokens, latency, stop reason, tool calls) plus the four required log categories, and explicitly frames full-payload/manual approaches as insufficient at scale ('Standard logging... doesn't catch a response that is quietly incorrect', 'Per-request decomposition is critical: aggregate metrics can look healthy while a small fraction of requests consume most of the budget'). Distractor A contradicts 'Build logging to answer the questions you will need to answer, before you need to ask them'; B loses the intermediate steps the course says agents fail on; D is undercut by the course's whole premise that observability must be designed in, not reactive.
- Course reference: 02_enterprise_integration_production.md — 'Observability: what to log, what to trace, and why' and 'Observability at scale: instrumentation design, dashboards, anomaly detection'

**Recommendation**: APPROVE

### off-3.8
**Topic**: Cross-organisation agent coordination without exposing internal systems (agent-to-agent protocol)
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- No course file (across all five modules) introduces 'agent-to-agent communication', an 'A2A protocol', or any named mechanism for cross-organisation agent coordination — grepped for 'agent-to-agent', 'A2A', 'cross-organi[sz]ation', 'negotiat', 'supplier' with no hits. The key is nonetheless the only defensible answer given the stated constraint (neither org will expose internal tools/systems): A, C, and D each require exposing exactly what the scenario rules out. Nothing in the course material contradicts the key; it is simply silent on this specific mechanism.
- Course reference: NOT COVERED

**Recommendation**: APPROVE

### off-3.9
**Topic**: Fixing RAG staleness after a content refresh (re-indexing pipeline + version-aware retrieval)
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course teaches adjacent RAG-staleness concepts strongly (index is a snapshot that can go stale; 'a pipeline that was correct at launch can degrade silently as documents are added'; manual spot-checks are explicitly criticized elsewhere as an inadequate substitute for systematic verification), but it never spells out the specific fix pair keyed here (automated re-index validation, document-versioning metadata with filtering). This is a defensible engineering extension of taught principles rather than a contradicted or invented one. Distractor reasoning matches course logic closely: A and E don't change what's retrieved (echoing 'A better embedding model or a shorter refresh interval won't fix this issue'), and B mirrors the course's rejection of manual spot-checks as a systematic control.
- Course reference: 01_claude_platform_solution_design.md — 'The most common mistake: retrieval applied to live state' / 'Chunking and indexing' (Complexity note: 'a pipeline that was correct at launch can degrade silently'); exact remediation not spelled out

**Recommendation**: APPROVE

### off-3.10
**Topic**: Reducing tool-selection errors among overlapping tools (description rewrite + consolidation)
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- No course file gives guidance on writing tool descriptions, tool granularity, or consolidating overlapping tools — grepped for 'tool description', 'tool selection', 'overlapping tool', 'redundant tool', 'consolidat', 'overlap' with no hits outside an unrelated use of 'redundant'. Module 1's 'Tools' primitive is defined in one line with no design guidance. The keyed pair (A, E) is nonetheless standard, well-established practice and clearly better than the distractors, which increase ambiguity (B), institutionalize errors (C), or discard typed interfaces (D, consistent with the course's general preference for structured/schema-driven outputs elsewhere).
- Course reference: NOT COVERED

**Recommendation**: APPROVE

### off-3.11
**Topic**: When progressive discovery beats a monolithic context strategy
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Strongly and precisely supported. The course's progressive-vs-monolithic table states progressive 'earns its place' for 'Knowledge bases too large to fit in context... any single query needs only a small slice' (matches B) and monolithic 'breaks down' when 'Attention quality can degrade on very long contexts' while progressive is 'the right default for most production workloads' (matches D). A matches monolithic's stated strength ('Bounded tasks with predictable input size', every tool always needed); E matches monolithic's other strength (stable, comfortably-fitting material); C describes a single-invocation constraint incompatible with discovery's need for intermediate tool calls. All five options map cleanly onto the course's own framework.
- Course reference: 01_claude_platform_solution_design.md — 'Context strategy: spectrum between progressive and monolithic'

**Recommendation**: APPROVE

### off-3.12
**Topic**: Matching integration needs to MCP server / direct API integration / agent-to-agent protocol
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Rows 1, 4, and 5 are well supported: the course states the MCP-vs-direct-API decision rule verbatim ('pick MCP when one tool entry point needs to be reachable from multiple Claude clients; pick raw API tool use when the tools live inside one product only'), matching rows 1/4 (multi-consumer, discoverable) and row 5 (single scoped call in an owned pipeline) exactly. Row 2 (a deterministic batch push with 'no model involvement') is a defensible point-to-point/no-broker-needed case even though it sits outside the course's Claude-specific framing of 'direct API integration' — it deliberately contrasts with row 5 to test that students don't over-associate the pattern with one scenario shape, rather than signaling a flawed key. Row 3's key, 'agent-to-agent protocol', is not introduced in any reviewed course file (same gap as off-3.8), so the row rests on the exam-guide's own vocabulary rather than the courses.
- Course reference: 01_claude_platform_solution_design.md — 'A way to keep these terms separate' (MCP and API tool use); row 3 (agent-to-agent protocol) is NOT COVERED

**Recommendation**: APPROVE

## Evaluation, Testing & Optimization (20 questions)

### gen-4.1
**Topic**: Choosing the right latency metric to catch an SLA compliance gap (p95 vs. average)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The keyed answer is stated near-verbatim in the course: 'SLA breaches are usually caused by slower requests at the high end. That is why p95 is a more useful design target than the median [average].' The scenario (average hides a 6% tail violation from tool-retry spikes) is a faithful illustration of exactly that principle. Distractors are cleanly wrong: A measures cost not latency compliance, B over-engineers a new service where a metric change suffices (consistent with course's 'wrong eval suite' framing), and D changes system behavior rather than what's measured, which the stem specifically asks for.
- Course reference: 02_enterprise_integration_production.md — 'Cost and latency modeling: Know the numbers before you build' (p95 vs. median, line ~229)

**Recommendation**: APPROVE

### gen-4.2
**Topic**: Mixed-methodology eval design to catch multi-turn regressions missed by single-turn exact-match suites
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly supported by two course principles combined: multi-turn evals require 'their own golden dataset' built from real conversation transcripts (single-turn sets can't detect multi-turn regressions), and grading method should be chosen per behavior — code-based for deterministic fields, LLM-judge for interpretive quality. The keyed answer (D) combines both correctly. Distractors are well-differentiated: A scales the same flawed single-turn methodology (would still miss the regression, as the course's postmortem on non-representative eval sets illustrates), B only changes grading rigor on existing single-turn data without adding conversation coverage, and C is a manual human-review gate, not an automated repeatable framework — which the course treats as the point of eval infrastructure.
- Course reference: 02_enterprise_integration_production.md — 'A single-turn eval set will not tell you how the system holds up across a conversation... this category needs its own golden dataset' (line ~173) and code-based vs. LLM-judge grading (line ~152-158)

**Recommendation**: APPROVE

### gen-4.3
**Topic**: A/B test validity: confound control via randomization vs. post-hoc fixes
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course explicitly teaches that a proper A/B test needs a treatment and control group with a sample size large enough to be meaningful, and the worked RFP example stresses ensuring 'similar distributions' between groups and segmenting by input type -- exactly the sequential-rollout/ticket-mix confound this item hinges on. Option A (randomize concurrently, then stratify by category) is the only option that fixes the actual design flaw rather than patching the one known symptom, matching the course's framing that non-randomized sequential rollouts confound the treatment with any time-correlated factor. Distractors B (wrong variable), C (reweighting patches one confound but leaves the sequential design), and D (manual review, doesn't scale) are all clearly inferior per the course's own emphasis on randomized, well-powered, stratified experiments.
- Course reference: 02_enterprise_integration_production.md — 'Structured A/B testing for live Claude systems' and the RFP-system decision box ('A/B testing posture... ensure the treatment and control groups have similar distributions... Segment by RFP type if possible')

**Recommendation**: APPROVE

### gen-4.4
**Topic**: Diagnosing hallucination root cause in a RAG-backed support assistant
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course's failure taxonomy directly states that hallucination is 'confident, fluent content that is not grounded in the input... The fix is grounding through retrieval, tool use, or verification. Stronger instruction will not resolve it' -- this precisely supports keying B and rejecting C (the refusal-prompt fix). The retrieval-similarity evidence (0.35 vs. 0.6+) in the stem correctly isolates the cause to retrieval rather than model capability (A) or an over-engineered new subsystem (D), consistent with the course's classify-before-fixing discipline.
- Course reference: 02_enterprise_integration_production.md — 'A failure taxonomy: classifying what you are looking at' (Hallucination vs. Prompt failure vs. Model mismatch)

**Recommendation**: APPROVE

### gen-4.5
**Topic**: Managing multi-turn context growth: summarization + prompt caching for cost/latency
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course directly recommends 'summarizing across turns when context is getting long' and a progressive context strategy that 'retrieves just-in-time, summarizes across turns, and loads only what the next step needs,' plus it flags that 'prompt caching is harder when carried-forward context mutates each turn' -- which is exactly why option C's combination (bound the transcript with a rolling summary, then cache the now-stable prefix) is correct and B (caching only the already-stable prefix while the transcript keeps growing) is insufficient. A (smaller model, same unbounded prompt) and D (retry/timeout tuning) target the wrong root cause per the course's own diagnostic framing.
- Course reference: 01_claude_platform_solution_design.md — 'Context strategy: spectrum between progressive and monolithic' ('get into the practice of summarizing across turns when context is getting long'; 'Prompt caching is harder when carried-forward context mutates each turn')

**Recommendation**: APPROVE

### gen-4.6
**Topic**: Distributed tracing for multi-stage latency regressions
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course teaches request-level tracing ('every request should produce a trace that includes the model... latency, stop reason, and any tool calls made... Per-request decomposition is critical') and change attribution as the mechanism for diagnosing where a regression comes from, which supports the general shape of the correct answer (structured, correlated, per-request tracing beats ad hoc manual timing or brittle log-grepping). However, the specific implementation named in the key -- OpenTelemetry spans tagged per pipeline stage under a shared trace ID -- is a standard industry technique not spelled out verbatim in the course text, which discusses tracing at the whole-request level rather than explicitly breaking a request into retrieval/tool/model sub-spans. The reasoning for rejecting the three distractors (canary only detects, doesn't diagnose; log-grepping is brittle; manual print-statement timing doesn't scale) is solidly grounded in the course's stated preference for durable, automated, structured observability over manual workarounds, so the key itself is not contradicted -- just extended slightly beyond the literal text.
- Course reference: 02_enterprise_integration_production.md — 'Observability at scale: instrumentation design, dashboards, anomaly detection' (request-level tracing, per-request decomposition, change attribution); specific term 'OpenTelemetry' and per-stage span breakdown is an extension not verbatim in the course text

**Recommendation**: APPROVE

### gen-4.7
**Topic**: Evaluation & Testing – defining safety/security metrics alongside accuracy and latency
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course's worked claims-processing example defines a security metric almost identically to this item's key: 'Security, no cross-claimant data leakage: Code-based eval. Cross-claimant leakage can be checked by scanning each summary for identifiers...' and separately treats accuracy, latency, safety, and security as distinct gated dimensions that must each be measured on their own surface -- directly supporting why A (score PII across the full tool-call trace, the actual leak surface) is correct while B (raising the accuracy bar) and C (scanning only the already-clean final message) miss the diagnosed channel, and D (bespoke ML classifier + new microservice) is premature relative to extending the existing check.
- Course reference: 02_enterprise_integration_production.md — worked claims eval-framework example ('4. Security, no cross-claimant data leakage: Code-based eval... scanning each summary for identifiers that appear in any input claim other than the one being processed')

**Recommendation**: APPROVE

### gen-4.8
**Topic**: Mixed-methodology eval design: pairing deterministic graders with LLM judges and targeted dataset expansion
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This item is a near-direct application of the course's 'grading ladder': 'Code-based grading, wherever the behavior allows it... If a behavior can be checked in code, then it should be' paired with 'LLM-as-judge, when the behavior needs interpretation,' plus the guidance to include adversarial/underrepresented cases in the golden dataset -- exactly what options C (deterministic numeric-extraction grader) and D (stratified dataset expansion targeting the failure cluster) do. A (more few-shot examples) and B (second LLM judge, cross-checked) both keep the fix inside the same probabilistic-judgment mechanism the course explicitly says should be replaced by code wherever a behavior is checkable deterministically; E (manual routing) contradicts the course's 'favor volume over perfection' guidance against unscalable manual review as the primary eval mechanism.
- Course reference: 02_enterprise_integration_production.md — 'The grading ladder: choosing how to grade' and 'Defining success criteria... Include adversarial inputs'

**Recommendation**: APPROVE

### gen-4.9
**Topic**: A/B testing statistical rigor and iteration
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario mirrors the course's own worked example almost point for point: the course's '50-session winner that wasn't' explicitly states a 6-point difference on a high-variance metric 'requires a sample size in the hundreds to reach statistical significance' and calls out failure to pre-specify the primary metric as one of three fatal flaws; the Decision-5 exercise separately demonstrates a formal power calculation driving required sample size. Both keyed answers (extend to the power-calculation sample size; keep the single pre-registered metric) map directly onto these passages, and the distractors (ship on p=0.12, subgroup-fish for significance, substitute manual read-through for the metric) are each explicitly or implicitly rejected by the same material. No unkeyed option is defensible as correct.
- Course reference: 02_enterprise_integration_production.md — 'A/B testing and observability at scale' and 'The 50-session winner that wasn't'

**Recommendation**: APPROVE

### gen-4.10
**Topic**: evaluation_testing
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course's own named 'A failure taxonomy' section lists exactly four categories — Prompt failure, Hallucination, Model mismatch, Orchestrator-workers failure — with definitions matching this question's Prompt failure/Hallucination/Model capability mismatch rows closely (including the course's specific claim that a real capability ceiling survives step-by-step instructions and decomposition, which Session 4 tests precisely). But the question substitutes a fourth category, 'Data/retrieval gap,' that is not part of that named taxonomy; the closest course support is the RAG section's point that a stale/incomplete index produces wrong answers regardless of instructions ('The index is a snapshot... the answer will be wrong'), which supports the concept but not the specific taxonomy label used here or its inclusion in a 'shared taxonomy' alongside the course's other three named categories. Within the question's own given definitions the five classifications are all internally consistent and unambiguous (each row's diagnosis is the only one of the four definitions that fits, including the deliberate double-keying of 'Data/retrieval gap' across two structurally analogous rows, which the explanation justifies rather than leaving ambiguous). Since the question is self-contained (it supplies its own definitions in the stem), a candidate can answer correctly through reasoning alone without needing to recall the course's exact category list, but the mismatch between the tested taxonomy and the course's explicit one — plus the stated learning objective naming only 'prompt failure, hallucinations, model mismatch' with no fourth category — is worth tightening.
- Course reference: 02_enterprise_integration_production.md — 'A failure taxonomy: classifying what you are looking at' (Prompt failure/Hallucination/Model mismatch definitions); 'Data/retrieval gap' concept traces only to 01_claude_platform_solution_design.md — 'Reference Architectures' (RAG index staleness), not to the named failure taxonomy itself

**Recommendation**: APPROVE (first-pass REVISE refuted on adversarial verification)

### off-4.1
**Topic**: Defining task-specific eval metrics with launch thresholds before a launch decision
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (a contract-review assistant, anecdotal pilot feedback, no formal measures, a steering committee asking 'is it good enough to launch') is essentially the course's own contract-review postmortem case study, where a team that skipped representative, threshold-bound eval criteria shipped and regressed two weeks later. Key D matches the course's 'Defining success criteria' guidance directly: turn the business requirement into measurable, thresholded criteria before deciding launch-readiness. Distractors are each cleanly wrong for a stated reason (generic model benchmark, anecdote, cost-only comparison) and none is defensibly correct.
- Course reference: 02_enterprise_integration_production.md — 'Defining success criteria: turning a business requirement into a measurable threshold' and 'The eval suite that measured the wrong thing'

**Recommendation**: APPROVE

### off-4.2
**Topic**: Composing a trustworthy evaluation dataset for a customer-support assistant
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Course material states an eval suite must reflect the real input distribution plus adversarial/edge-case coverage, and explicitly warns that a dataset built from convenient (non-representative) inputs measures a different system than the one shipped. Key B (real anonymised queries plus deliberately constructed edge cases) matches this directly. Distractors are each identifiably weaker: synthetic-only data inherits doc blind spots, system-prompt examples only test memorization, and engineer-written questions test the builders' own assumptions rather than real usage — none is a live contender against B.
- Course reference: 02_enterprise_integration_production.md — 'Defining success criteria... Include adversarial inputs' and 'The decisions that led us here' (non-representative dataset root cause)

**Recommendation**: APPROVE

### off-4.3
**Topic**: Choosing a grading methodology for subjective quality (tone/brand) at scale
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course's 'grading ladder' explicitly assigns LLM-as-judge to behaviors that need interpretation (tone, style) and requires periodic calibration against human-labeled examples to keep the judge trustworthy — this is key A verbatim in spirit. The stem's constraint ('human review of every output is infeasible') directly eliminates option C (full human review, no scaling) by design. Option B (exact string match) is explicitly the wrong grading tool per the ladder since tone/brand alignment is not a code-expressible check, and D abandons a measurable requirement, which the course frames as unacceptable. No option other than A survives scrutiny.
- Course reference: 02_enterprise_integration_production.md — 'The grading ladder: choosing how to grade' (LLM-as-judge, calibration against human-labeled examples)

**Recommendation**: APPROVE

### off-4.4
**Topic**: Validating an offline eval improvement before full production rollout
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This scenario closely mirrors the course's own '50-session winner that wasn't' case study: an offline/small-sample gain (there, 6 points) disappeared once exposed to real production traffic and its full input distribution. Key C (a fraction-of-traffic A/B test watching quality and guardrail metrics before ramping) is exactly the corrective practice the course teaches — 'Structured A/B testing for live Claude systems' and the warning that offline gains don't reliably transfer. Distractor B (re-running the same offline suite) is directly invalidated by the course's point that repeating the same benchmark doesn't test the production distribution; A skips the risk control the case study shows is necessary; D substitutes opinion for evidence.
- Course reference: 02_enterprise_integration_production.md — 'Structured A/B testing for live Claude systems' and 'The 50-session winner that wasn't'

**Recommendation**: APPROVE

### off-4.5
**Topic**: Evidence-based cost optimization versus a single blunt lever (model downgrade)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Key B (analyse per-workload cost traces, target the dominant driver, check quality impact) matches the course's evidence-based cost-optimization stance: the 'Gate every model change with an eval' case shows exactly this pattern (per-document-type analysis identified two types as the real cost/quality tension, enabling a partial migration instead of a blanket swap), and the 7x-Opus-overrun case shows the cost of skipping per-step analysis. The course does not use the literal phrase 'cost trace' but the underlying practice (request-level tracing, per-request cost decomposition, targeting the dominant driver before acting) is directly taught, so this is a terminology gap rather than a content gap. Distractors are each clearly inferior: A applies one lever blindly (the exact anti-pattern in the 7x-overrun case), C refuses the mandate outright, D truncates uniformly regardless of where the actual cost driver sits.
- Course reference: 01_claude_platform_solution_design.md — 'Gate every model change with an eval before you ship it' and 'When defaulting to Opus everywhere produced a 7x cost overrun'; 02_enterprise_integration_production.md — 'Metric aggregation... Per-request decomposition is critical'

**Recommendation**: APPROVE

### off-4.6
**Topic**: Rollout practice for adopting a new model version safely
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Key D (full eval suite, then canary rollout with regression monitoring before cutover) combines two directly-taught practices: 'any change to the model... is a change to the system's behavior... treat model swaps as releases' with a mandatory eval gate, and bounded-exposure live testing with monitoring from the A/B/shadow-testing section. The word 'canary' itself is not used verbatim in the course, but the practice (small, bounded exposure plus regression monitoring before full cutover) is exactly what 'Structured A/B testing' and the partial-migration salvage move in the eval-gating case teach, so this is a terminology gap, not a content gap. Distractors are each clearly weaker: A assumes newer is better without evidence (the anti-pattern the eval-gate section warns against), B forfeits improvements for no safety gain, C splits exposure without adding any eval or monitoring safeguard for either segment.
- Course reference: 01_claude_platform_solution_design.md — 'Gate every model change with an eval before you ship it'; 02_enterprise_integration_production.md — 'Structured A/B testing for live Claude systems' and 'Shadow testing: validating a change before any user sees it'

**Recommendation**: APPROVE

### off-4.7
**Topic**: Leading indicator of RAG quality degradation in production
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The keyed answer (retrieval relevance decline + rising 'no grounded answer found' rate) is a pipeline-internal signal that precedes user-visible failure, consistent with the course's framing that 'retrieval quality is not visible in the output, it has to be measured against a labeled set' and its emphasis on request-level tracing/model-drift detection as proactive signals rather than complaint-driven reaction. Distractors are cleanly wrong on separate axes: complaints (A) and DAU drop (D) are lagging/coarse, cost (B) measures spend not quality — none is defensibly correct. The term 'leading indicator' itself isn't verbatim in the course, but the underlying concept (internal telemetry catches degradation before users do) is squarely taught.
- Course reference: 02_enterprise_integration_production.md — 'Observability: what to log, what to trace, and why' (anomaly detection / model drift, line ~542) and the RAG risk discussion ('Retrieval quality is not visible in the output...')

**Recommendation**: APPROVE

### off-4.8
**Topic**: Pre-production eval framework components for a regulated-domain assistant
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Both keyed options are directly supported: the course explicitly instructs to 'include adversarial inputs' in the golden dataset and separately treats expert-labelled golden datasets as foundational eval infrastructure. The three distractors are each clearly disqualified by course logic — a curated demo (A) is not a test set, a general-knowledge benchmark (D) measures the wrong thing entirely, and a post-launch satisfaction survey (E) arrives after the eval-before-code principle the course insists on. No unkeyed option is defensibly correct for a regulated-domain pre-production framework.
- Course reference: 02_enterprise_integration_production.md — 'Evals as acceptance criteria' (golden dataset / 'Include adversarial inputs' bullet, line ~167)

**Recommendation**: APPROVE

### off-4.9
**Topic**: Diagnosing intermittent production quality degradation with latency/model/prompts unchanged
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Correctly keys end-to-end traces and input-distribution drift analysis, both explicitly named in the course's change-attribution framework: 'data drift (the input distribution changed)' and request-level tracing as 'the raw material for everything else.' The scenario's constraint (code/model/prompts unchanged) is the exact setup the course uses to motivate distinguishing model drift from data drift. Distractors are unambiguously off-topic for a quality diagnosis: request volume (B), billing (C), and uptime (E) each measure a different axis (volume, cost, availability) that the course explicitly separates from quality/task-success signals.
- Course reference: 02_enterprise_integration_production.md — 'Change attribution' (model drift vs. data drift vs. model update effects, line ~543) and 'Request-level tracing' (line ~540)

**Recommendation**: APPROVE

### off-4.10
**Topic**: Classifying system failure signatures: prompt failure vs. hallucination vs. model mismatch
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This matching item is drawn almost verbatim from the course's three-way failure taxonomy: prompt failure ('instruction was ambiguous or underspecified... fix is in the prompt'), hallucination ('confident, fluent content not grounded in the input or a reliable source'), and model mismatch ('the chosen tier is wrong for the task... despite well-structured prompts' — row 4 explicitly rules out prompt failure by stating prompts are well-structured). All five rows key cleanly to one category each with no ambiguity: rows 1 and 4 are capability/task-fit gaps (model mismatch), row 2 is a self-inflicted instruction conflict (prompt failure), and rows 3 and 5 are confident fabrications ungrounded in source/tool data (hallucination).
- Course reference: 02_enterprise_integration_production.md — 'Prompt failure / Hallucination / Model mismatch / Orchestrator-workers failure' definitions (line ~549-551)

**Recommendation**: APPROVE

## Governance, Safety & Risk Management (18 questions)

### gen-5.1
**Topic**: Deterministic guardrail vs. prompting to enforce a hard refund cap
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario is a clean illustration of the course's core distinction: system-prompt instructions are not enforcement ('anything an adversarial or unusual input can talk Claude out of'), while a deterministic check on a crisp, well-defined pattern (a dollar figure against a cap) reliably closes the gap. Option C is a plausible distractor whose flaw is genuine — 'flag transcripts' implies post-hoc review of completed conversations, i.e., detection after the customer already saw the offer, consistent with the explanation.
- Course reference: 03_responsible_ai_safety_risk.md — Glossary 'Output screening' (validator for known strings and schema violations) and 'Why model-based and deterministic checks fail differently, and why you chain them'

**Recommendation**: APPROVE

### gen-5.2
**Topic**: Confabulation/hallucination in a RAG system despite correct retrieval
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This concept is not in module 03's own risk-category list (prompt injection, token exhaustion, tool abuse, data exposure), but it is directly taught in module 02's failure taxonomy: 'Hallucination. The model produced confident, fluent content that is not grounded in the input or a reliable source... Stronger instruction will not resolve it.' The scenario's engineered detail — retrieval logs confirmed correct chunks were passed — precisely isolates hallucination from the retrieval-failure distractor (A), and the distinct, narratively-consistent per-filing figures rule out a reused prompt-template artifact (B). Difficulty is appropriately high for professional-level scenario reasoning.
- Course reference: 02_enterprise_integration_production.md — 'A failure taxonomy: classifying what you are looking at' (Hallucination entry)

**Recommendation**: APPROVE

### gen-5.3
**Topic**: Risk-tiered human-in-the-loop gate scoped to a specific refund failure mode
**Content Alignment**: ✓ PASS
**Question Quality**: ⚠ WARNING
**Answer Accuracy**: ⚠ WARNING

**Assessment**:
- The underlying concept (a deterministic checkpoint built into the tool call itself, scoped to the risk tier where failures occurred, versus a blanket queue, a probabilistic prompt fix, or a brittle text-tag heuristic) is well supported by the course's tool-authorization and stakes-routing material. However, the question stem states the observed violations occurred on refunds 'above $2,000' (all 12 non-clean cases fall in that tier), while both the keyed answer D and distractor C set the gate threshold at 'above $500' — a different, lower number that does not match the failure population described. The explanation then claims D is 'scoped precisely to the risk tier where the actual failures happened,' which is not accurate given the $500 figure; it is scoped to a broader tier than the one where failures were observed. This is an internal inconsistency (likely carried over from the $500 cap used in gen-5.1) that could confuse a careful test-taker trying to reconcile the numbers, and weakens the stated rationale for the key even though D remains the best conceptual choice among the four options.
- Course reference: 03_responsible_ai_safety_risk.md — 'Routing decisions to people by stakes, not by volume' (reversibility/cost set stakes; gate placed at the risk tier) and 'A check before any action with a side effect...should be deterministic' (tool-call authorization glossary entry)

**Recommendation**: REVISE (finding upheld on adversarial verification — moderate)
**Suggested Fix**: Change the threshold in options C and D from "above $500 / above $500" to "above $2,000" so the gate matches the stem's identified failure/risk tier, and update D's explanation parenthetical from "(refunds above $500)" to "(refunds above $2,000)" so the "scoped precisely to the risk tier where the actual failures happened" claim is true. This keeps C and D differing only in mechanism (brittle text-tag vs. enforced tool-config gate), which is the intended contrast, and aligns the item with 03_responsible_ai_safety_risk.md's guidance to gate at the stakes tier where the risk was actually identified. (Alternatively, retune the stem to describe the failures as occurring above $500, but aligning the options to $2,000 is cleaner because it also preserves the stem's "don't gate the correctly-handled 96%" constraint.)

### gen-5.4
**Topic**: HIPAA compliance - PHI in third-party logging pipelines (BAA + deterministic redaction)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly grounded in the course's compliance section and glossary: the BAA glossary entry states plainly that 'Without it, handling that data through the vendor is non-compliant regardless of the technical controls,' which matches option A's two-part fix (deterministic redaction + signed BAA) rather than a technical-only or contractual-only fix. Distractor C ('update the system prompt to never include PHI') is directly refuted by the course's repeated point that 'instructions are not enforcement' and that deployment rules must be enforced by inference-time controls, not trained/prompted behavior. B and D are reasonably eliminated (over-engineered rebuild; unscalable manual review) without contradicting any course claim.
- Course reference: 03_responsible_ai_safety_risk.md — 'Turning each compliance obligation into a control with evidence' and Glossary entry for 'Business Associate Agreement (BAA)'; 'Justify the control choice' screen uses the identical obligation ('Protected health data must be handled under a formal agreement (HIPAA)')

**Recommendation**: APPROVE

### gen-5.5
**Topic**: Remediating a proxy-variable bias finding in a lending assistant
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course's fairness model names exactly four injection points where unequal outcomes enter: the retrieval corpus, prompt framing, few-shot examples, and downstream routing. This scenario's mechanism — structured input FIELDS (employer name, education, address history) acting as proxies for zip code — is a fifth, distinct pathway (feature-level proxy discrimination) that the course never enumerates or names 'proxy-variable analysis.' The surrounding reasoning in the correct answer is well grounded (deterministic gate over prompt-based ask; decision logging/per-cohort dashboard tracking matches the course's transparency-checklist and decision-logging sections; human-review routing for a systemic, high-cost finding matches the routing-by-stakes rule), so the answer itself is not contradicted by anything in the course, but the specific diagnostic technique tested is outside the four-point taxonomy actually taught.
- Course reference: 03_responsible_ai_safety_risk.md — 'Where unequal outcomes enter, and what the system must explain' (four entry points do not include structured-field proxy discrimination); 'Routing decisions to people by stakes, not by volume' partially supports option B's human-review-queue element — proxy-variable analysis itself is NOT COVERED

**Recommendation**: APPROVE
**Suggested Fix**: Optional tightening only: reframe the scenario so the proxy signal enters via one of the four named points (e.g., a retrieval corpus of past-approval examples that skews by geography) so the question maps cleanly onto the course's fairness taxonomy; as written it is defensible general fair-lending knowledge but not directly taught.

### gen-5.6
**Topic**: Guardrails: deterministic tool-level validation vs. prompt reinforcement
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Squarely and precisely grounded. The course defines tool-call authorization in the glossary as a check that 'should be deterministic, an allowlist plus identity and scope, so the decision is provable and auditable,' and separately states 'instructions are not enforcement' for the prompt-layer failure mode — this maps exactly onto why C is correct and A is wrong (A repeats the exact prompt-reinforcement mechanism the course flags as insufficient). B and D are reasonable, well-differentiated distractors (probabilistic detection + review bottleneck; solving an adjacent threshold problem) consistent with the course's guidance that model-based/manual controls don't substitute for a deterministic precondition at the point of action.
- Course reference: 03_responsible_ai_safety_risk.md — 'Where guardrails sit in a request path' (tool-call authorization definition) and Glossary entry for 'tool-call authorization'; 'Training-time alignment and inference-time control' section ('instructions are not enforcement')

**Recommendation**: APPROVE

### gen-5.7
**Topic**: LLM failure modes: confabulation and automation bias in a clinical documentation system
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The confabulation concept (D) is directly supported, though under the term 'hallucination' in a sibling module: 'The model produced confident, fluent content that is not grounded in the input or a reliable source' — this is a verbatim match for finding #1's fabricated, unsourced, reproducible dosage. The automation-bias concept (E) is supported by Module 1's 'Confidence is not validity. Claude can produce a wrong answer in the same fluent, assured tone it uses for a right one... human-in-the-loop placement and verification are architectural choices' (explicitly flagged as feeding Module 3), plus this module's consent-fatigue material on reviewers ceasing genuine scrutiny. The stem does careful, deliberate work ruling out A (no adversarial phrasing found) and C (no formulary match at all, current or superseded) with specific evidenced details, which is strong distractor design rather than a trick.
- Course reference: 02_enterprise_integration_production.md — 'Instrumentation tells you a metric moved... Hallucination' (grounds D under a different but equivalent term); 01_claude_platform_solution_design.md — 'Confidence is not validity' (grounds E); 03_responsible_ai_safety_risk.md — 'consent fatigue' glossary entry (adjacent support for E)

**Recommendation**: APPROVE

### gen-5.8
**Topic**: Human-in-the-loop validation design for agentic approval workflows
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Well grounded in the course's routing-by-stakes and reviewer-context sections. B directly reflects the course's variables (cost/reversibility should route the highest-risk cases to stronger review) and the register concept of a fixed, auditable criterion. A is a scenario-specific application of 'what the reviewer sees decides whether review is accurate' (surfacing changed fields, preventing instant clicks) — a reasonable professional-level extension of a taught principle rather than a contradiction. C is directly refuted by 'instructions are not enforcement' logic; D and E are well-differentiated distractors (volume-reduction vs. quality; a relative rather than fixed threshold, which the course's routing-rule screen explicitly favors against — 'Reversibility and the cost of a wrong answer are the deciding controls, not confidence' implies fixed criteria, not batch-relative ones).
- Course reference: 03_responsible_ai_safety_risk.md — 'What the reviewer sees decides whether review is accurate,' 'Routing decisions to people by stakes, not by volume,' and 'Build the review-routing rule' (fixed-criteria reasoning)

**Recommendation**: APPROVE

### gen-5.9
**Topic**: Matching compliance-gap scenarios to HIPAA / GDPR / FedRAMP / internal-governance-only
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Row 1 (HIPAA/BAA) is strongly and specifically grounded — it is nearly identical to the course's own worked example ('Protected health data must be handled under a formal agreement (HIPAA)'). Rows 2, 3, and 5, however, rest on regulatory detail the course never teaches: GDPR's specific right-to-erasure mechanism and response-window expectation, the FedRAMP trigger distinguishing a multi-agency commercial SaaS offering from a single agency's internal ATO/FISMA process, and the requirement for cross-border transfer mechanisms (e.g., SCCs) beyond a standard commercial contract. None of these specifics (nor terms like FISMA, NIST RMF, right to erasure, or SCCs) appear anywhere in the course markdown files I checked. The answers are objectively correct as general regulatory/compliance knowledge and nothing in the course contradicts them, but three of five rows test literacy the course assumes as a prerequisite (it treats HIPAA/GDPR/FedRAMP as a given 'pre-filter') rather than material it teaches.
- Course reference: 03_responsible_ai_safety_risk.md — Glossary entries for HIPAA/BAA (strongly supports row 1) and GDPR/FedRAMP (only generic definitions, no erasure-right, ATO-vs-FedRAMP, or SCC detail) — rows 2, 3, and 5's distinguishing facts are NOT COVERED

**Recommendation**: APPROVE
**Suggested Fix**: Optional: for a course-aligned variant, swap rows 2/3/5's distinguishing detail for something the course explicitly teaches (e.g., row 3 could hinge on 'no evidence artifact/owner for the FedRAMP control' rather than the multi-agency-vs-single-agency ATO distinction) — as written it is accurate but leans on outside regulatory knowledge more than this module's content.

### off-5.1
**Topic**: Human-in-the-loop gate placement by reversibility/impact, not volume or timing
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (agent drafting emails, updating records, issuing POs up to $50k) maps directly onto the course's checkpoint-pattern guidance: place a gate before irreversible or high-stakes actions and let low-risk steps proceed automatically. Distractors are each a named anti-pattern in the course: A is 'routing everything' (review collapses into rubber-stamping), B reviews after the irreversible action already happened, D is an arbitrary volume/time sample rather than a stakes-based rule. The key (C) and the rejection logic for A/B/D are all directly supported.
- Course reference: 03_responsible_ai_safety_risk.md — 'Routing decisions to people by stakes, not by volume' and 'Diligence: the competency behind human review': 'Place a gate before any irreversible or high-stakes action an agent would otherwise take autonomously, and sample lower-stakes actions instead of gating each one.' (Same gate vocabulary introduced in 01_claude_platform_solution_design.md — 'Human-in-the-loop checkpoint patterns for agent workflows'.)

**Recommendation**: APPROVE

### off-5.2
**Topic**: GDPR data minimization as an architectural control for third-party data sharing
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario tests whether the reader distinguishes data minimization from notice (A), transit protection (B), and retention-period tweaks (C) — none of which reduce what personal data reaches the third party. The course teaches the identical architectural move (server-side redaction/minimization before data crosses a trust boundary) in a different context (redacting PII before the Claude API call); GDPR's data-minimization requirement is named explicitly in the module 3 glossary. The transfer of the principle to a vendor-analytics scenario is a reasonable professional-level application, not a contradiction.
- Course reference: 02_enterprise_integration_production.md — PII-redaction pattern: 'a server-side redaction step that strips non-essential PII fields before the Claude call'; 03_responsible_ai_safety_risk.md glossary, GDPR entry: '...requires a lawful basis for processing, data minimization, and protection.'

**Recommendation**: APPROVE

### off-5.3
**Topic**: HIPAA/PHI compliance must be resolved at architecture stage, not retrofitted
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly matches the course's HIPAA/BAA treatment: agreements must be signed before PHI flows, and compliance controls are a design-stage prerequisite, not a post-launch enhancement. The three distractors (color palette, tone, conference selection) are transparently cosmetic/irrelevant, giving no ambiguity about the key.
- Course reference: 03_responsible_ai_safety_risk.md — glossary, HIPAA entry: 'When a vendor processes PHI on a covered entity's behalf, HIPAA requires a Business Associate Agreement (BAA)...' and 'Turning each compliance obligation into a control with evidence': 'A regulation states an outcome... you supply the control and the proof it is operating.'

**Recommendation**: APPROVE

### off-5.4
**Topic**: Proxy variables (postcode) encoding protected characteristics despite excluded demographic fields
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course teaches the surrounding concept — unequal outcomes concentrated in a subgroup can persist even when a system looks compliant on its face, and the fix is structured cross-group evaluation plus ongoing monitoring, which is exactly what key A prescribes. What the course does not name explicitly is the specific mechanism (a correlated feature like postcode acting as a proxy for a protected characteristic) or the résumé-screening scenario type; its worked fairness examples are RAG/prompting entry points (corpus, framing, examples, routing) rather than classifier input features. The key is a well-established, objectively correct fairness principle and the distractors are cleanly wrong (B mistakes formal compliance for fairness, C ignores the application layer's levers, D hides rather than fixes the harm).
- Course reference: 03_responsible_ai_safety_risk.md — 'Where unequal outcomes enter, and what the system must explain': 'The outcome metric can look fine overall while harm is concentrated in one subgroup. An unlogged or unmeasured injection point can hide unfairness until someone outside the team finds it,' and the fairness checklist ('...can you query the log and provide an answer?'). The specific term 'proxy variable' and the postcode/protected-characteristic correlation are not named in any course file.

**Recommendation**: APPROVE

### off-5.5
**Topic**: Indirect prompt injection via retrieved documents violates trust separation between data and instructions
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This is a near-verbatim match to the course's dedicated treatment of indirect prompt injection through retrieved content. The key (D) states the trust-separation principle exactly as taught, and each distractor fails for a reason the course substantiates: narrowing sources (A) doesn't fix the trust model, encrypting the system prompt (B) protects secrets not behavior, and blocking documents with imperative sentences (C) would over-block legitimate content — mirroring the course's point that a deterministic rule 'over-blocks anything that resembles a restricted pattern.'
- Course reference: 03_responsible_ai_safety_risk.md — 'A second injection vector: instructions arriving through retrieved content and tool outputs': 'a malicious instruction in a retrieved document reaches the model after input screening has already passed... screen retrieved content and tool outputs before they are appended to the model's context'; risk category #2, 'Indirect prompt injection.'

**Recommendation**: APPROVE

### off-5.6
**Topic**: Transparency obligations for a public-facing AI assistant: disclosure, limitations, human escalation path
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Two of the key's three clauses are course-adjacent — 'a path to a human for consequential matters' echoes the stakes-based human-review routing rule, and 'describe its limitations' echoes module 4's 'frame limitations honestly, since a security stakeholder trusts a system whose limits are clearly stated.' But the course's own 'transparency' content is specifically decision-level explainability/logging (why a given output happened, for users/regulators/team), not the general obligation to disclose to end users that they are interacting with an AI system at all — that specific clause of key B is not addressed in any course file. The key is still the only defensible answer: A discloses an irrelevant technical fact, C is invisible metadata, D is the opposite of the obligation.
- Course reference: NOT COVERED (for the AI-disclosure-to-users clause specifically) — course's transparency material (03_responsible_ai_safety_risk.md, 'Where unequal outcomes enter, and what the system must explain') covers decision explainability via logging, not general-purpose AI-nature disclosure; adjacent but distinct concepts appear in 03 (human-review routing by stakes) and 04_stakeholder_engagement_lifecycle.md ('frame limitations honestly').

**Recommendation**: APPROVE

### off-5.7
**Topic**: Layered controls to guarantee no incorrect financial commitments reach customers
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The keyed pair (mandatory human approval + output guardrails blocking non-policy commitments) matches the course's repeated theme that a single control point has a blind spot the next layer must catch, and that detection (D: quarterly log review) or input-side improvements (A: bigger context window, B: staff prompt training) do not provide the 'guarantee' a regulator is asking for. The blanket 100% human-review-before-send is a defensible reading of the course's stakes model (irreversible + high-cost communications to customers), not the 'routing everything' anti-pattern the course warns about, because it is scoped to one narrowly-defined, uniformly high-stakes output type rather than all system decisions.
- Course reference: 03_responsible_ai_safety_risk.md — 'Placing screening and authorization so the system degrades safely' (output screening + tool/action gates) and 'Routing decisions to people by stakes, not by volume' (reversibility and cost of a wrong answer set the stakes)

**Recommendation**: APPROVE

### off-5.8
**Topic**: Hardening a RAG agent against prompt injection carried in retrieved documents
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Both keyed options map directly onto the course's explicit mitigations: treating retrieved content as untrusted/screening it before it enters context, and restricting tool privileges so a successful injection cannot cause damage. The distractors are all clearly wrong per the course: model scale does not confer immunity to injection, temperature has no bearing on instruction-following susceptibility, and audit logging is explicitly framed as detective rather than preventative.
- Course reference: 03_responsible_ai_safety_risk.md — 'Assess the risks in a proposed architecture' (indirect prompt injection mitigation: treat retrieved text as untrusted; tool abuse mitigation: authorization check independent of model output) and 'A second injection vector: instructions arriving through retrieved content and tool outputs'

**Recommendation**: APPROVE

### off-5.9
**Topic**: Matching risk scenarios to primary control type (preventative guardrail / human-in-the-loop / monitoring and audit)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Each row keys cleanly to course concepts: absolute never-output requirements map to preventative output screening; a high-cost, high-consequence per-decision judgment (loan approval) maps to human-in-the-loop routing by stakes; and both 'reconstruct months later' and 'fleet-wide trend detection' map to decision logging/observability, which the course explicitly separates from preventative controls. The three-bucket taxonomy is a reasonable pedagogical compression of the course's five-layer model for a matching format.
- Course reference: 03_responsible_ai_safety_risk.md — 'Where guardrails sit in a request path' (output screening before the response reaches the user), 'Routing decisions to people by stakes, not by volume' (reversibility and cost set stakes), and 'Decision logging is what makes those explanations possible' plus 'A/B testing and observability at scale' cross-referenced from 02_enterprise_integration_production.md

**Recommendation**: APPROVE

## Stakeholder Communication & Lifecycle Management (18 questions)

### gen-6.1
**Topic**: Structured discovery and requirement gathering
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (a data signal — 12% claim reopens — that no stakeholder named) is a direct application of the course's translation step: 'translate that into requirements, assumptions, and unresolved constraints' and 'each answer sharpens the design.' Key D (reconvene stakeholders, including claims processors, to name reopen rate as its own requirement) matches the course's insistence on writing items down and confirming with the right stakeholders before design. Distractor A mirrors the 'watch out' failure of taking a stated preference at face value; B mirrors the discovery-call-that-became-a-design-session pitfall (solutioning before discovery closes); C's proportional folding-in is a plausible-sounding but course-inconsistent shortcut that hides the root cause rather than naming it as its own row.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'A discovery call is a structured elicitation, not a conversation' and 'The discovery call that turned into a design session'

**Recommendation**: APPROVE

### gen-6.2
**Topic**: Communicating architectural decisions and trade-offs
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario tests pitching an architectural rationale at the right altitude for the actual audience, which the course states explicitly: 'the executive is asking a simpler question… what it needs is translation into something a person can understand' and 'lead with the business outcome rather than the architecture.' Key A (one-page brief: threshold, latency cost, fraud benefit, adjustment path) matches this and loosely echoes the tradeoff framing (gain/give-up/reversal-ish lever). Distractor B is precisely the 'wrong altitude' failure the course names (technical vocabulary vs. translation); C is a non-scaling manual workaround; D solves a different (customer-facing, not stakeholder-facing) problem, matching the course's emphasis on the actual requester's need.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'Present a tradeoff so the stakeholder can act on it' (Description competency: 'lead with the business outcome rather than the architecture… frame limitations honestly… anticipate the peer-proof demand')

**Recommendation**: APPROVE

### gen-6.3
**Topic**: Stakeholder feedback loops and SLA expectation alignment
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (SLA breach surfaced via customer escalation, not internal reporting) is a near-direct restatement of the course's own worked failure: 'the alert log shows a sustained drift… the review calendar shows no review… a drift with no trigger is invisible until a human happens to notice.' Key B (recurring checkpoint with real-time metrics and pre-agreed thresholds) is exactly the fix the course prescribes: build the governance table mapping signal → trigger → owner → action before the next breach. The stem requires solving both 'realign expectations' and 'prevent recurrence' — A resets the number but keeps the broken cadence, C repeats the exact after-the-fact reporting pattern the course calls out as the failure mode, and D (internal Slack alert) explicitly routes to engineering, not the stakeholder, matching the course's monitoring-vs-feedback-loop distinction.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'The observability stack that replaced the feedback loop' and 'The feedback loop decides which signals reach a stakeholder, and the SLA names what you owe when one breaks'

**Recommendation**: APPROVE

### gen-6.4
**Topic**: Writing a versioned, implementation-independent interface spec to close a multi-agent handoff-schema gap
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario's root cause (an undefined handoff format left to each squad's interpretation) maps directly onto the course's multi-agent design principle that 'how each subagent's result is structured so the orchestrator can combine it' must be designed, not assumed. The audit charter's hard constraints (versioned, written, implementation-independent, two-week deadline) cleanly eliminate A (no artifact), B (repeats the vague clause), and D (a shared library is itself an implementation, and misses the deadline), leaving C as the only option that produces the required artifact and fixes the root cause. CI-gating specifics go slightly beyond what the course states verbatim but do not contradict it.
- Course reference: 01_claude_platform_solution_design.md — 'Multi-agent systems and orchestration' ("how each subagent's result is structured so the orchestrator can combine it" must be designed, not assumed); supporting theme also in 04_stakeholder_engagement_lifecycle.md — 'Documentation that survives your absence...' (undocumented reasoning/specs create downstream failures)

**Recommendation**: APPROVE

### gen-6.5
**Topic**: Treating a post-launch knowledge-base gap as a scoped iteration routed through required change control
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario tests correctly classifying a lifecycle phase (a content gap surfaced in production is an iteration-phase fix, not a discovery restart or a prompt-engineering patch) while honoring an explicit SOW gate — both are course themes: the discovery→design→handoff→monitoring→iteration framework, and the principle that governance obligations are binding constraints on how a fix is deployed. D is the only option that both correctly scopes the fix and respects the change-control requirement; A explicitly bypasses the gate, B is disproportionate, C never touches the actual content gap. The specific mechanics of 'change-request process' and 'regression-test suite' are generic SOW/process detail not spelled out verbatim in the course, but nothing in the course contradicts this framing.
- Course reference: 04_stakeholder_engagement_lifecycle.md — lifecycle framework ("discovery → design → handoff → monitoring → iteration") and 'The feedback loop decides which signals reach a stakeholder...' (Decide step: team fix vs. stakeholder review vs. no action)

**Recommendation**: APPROVE

### gen-6.6
**Topic**: Reconciling conflicting fraud-team and operations-team requirements during discovery
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course teaches the core discovery discipline this question rewards — translating vague, conflated statements into distinct, traceable requirements captured one row per item, rather than averaging them into a single unowned metric — which is exactly what collapsing 'accuracy' does wrong and what option A fixes. However, the specific elicitation technique keyed as correct ('interview separately, then reconcile') is not itself stated in the course; the material describes translation and documentation but not a separate-vs-joint interviewing method. B, C, and D are each defensibly weaker (sponsor fiat, premature tooling, papering over with shared vocabulary) regardless of that gap, so the key holds.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'A discovery call is a structured elicitation, not a conversation' and 'Each item found in discovery becomes one row in a translation table...' (distinct, traceable requirements); the specific 'interview stakeholder groups separately' technique is NOT COVERED verbatim

**Recommendation**: APPROVE

### gen-6.7
**Topic**: Communicating a multi-agent architecture's cost/latency-vs-accuracy trade-off to a VP ahead of a board review
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Strongly grounded: the course's tradeoff-presentation frame (gain / give-up / reversal cost) and its explicit guidance to reframe cost in the stakeholder's own business metric supports A, and the same section's warning that a stakeholder needs a bounded, defensible decision supports C's rollback checkpoint. D is directly contradicted by the course's point that a VP-level conversation needs translation, not more technical detail ('the room does not need more detail, what it needs is translation'), and E's relative-comparison framing is a recognizable anti-pattern the course would not endorse. B is a plausible but adjacent future investment, correctly excluded as not this task.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'Present a tradeoff so the stakeholder can act on it...' (gain/give-up/reversal-cost frame; 'the room does not need more detail, what it needs is translation') and 'Cost is the expectation that breaks most often after launch...' (consumption forecast, spend-control posture)

**Recommendation**: APPROVE

### gen-6.8
**Topic**: Re-establishing a tracked feedback loop and re-baselining an SLA after a capacity change
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly grounded in the course's central distinction between raw signals/ad hoc reporting and a governance table that maps each signal to a trigger, owner, and action — the failure described (a Slack-raised issue with no committed handling path) is exactly the gap the course's feedback-loop section warns produces invisible drift. D matches the course's guidance that SLA thresholds must trace to something tangible and be re-confirmed when the underlying assumption (standby capacity) changes, rather than left stale. B and C are correctly excluded as unscalable manual patches, and E targets a different concern (delivery-pace reassurance, not tracking/SLA validity).
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'The feedback loop decides which signals reach a stakeholder...' (governance table: signal → trigger → owner → action) and 'the SLA names what you owe when one breaks' (thresholds must trace to a tangible source and be defensible)

**Recommendation**: APPROVE

### gen-6.9
**Topic**: Matching five documentation scenarios to ADR / operational runbook / executive briefing / reference implementation
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Three of the four artifact types are well grounded: the course's glossary defines the ADR concept verbatim ('a record of each architectural choice that captures not just the decision but the alternatives rejected and the tradeoff each resolved') without using the acronym, module 05 explicitly defines and names the runbook, and the tradeoff/briefing section repeatedly stresses translating architecture into business terms for a non-technical executive. 'Reference implementation' as a named documentation category does not appear in any course file, though the underlying idea (one canonical example other teams copy) is a reasonable extension under the official exam-guide objective 'Document architectures and provide implementation guidance.' Row 1 vs. row 2 both correctly keying ADR (a chosen decision and a rejected one are the same artifact type) is a well-designed test against superficial one-to-one-mapping assumptions, and no row is ambiguous between two of the four categories.
- Course reference: 04_stakeholder_engagement_lifecycle.md — Glossary (ADR concept, undefined acronym) and 'Present a tradeoff...' (executive/stakeholder framing); 05_team_enablement_productivity.md — runbook definition ("captures the known symptom-to-cause-to-action paths"); 'reference implementation' as a term is NOT COVERED

**Recommendation**: APPROVE

### off-6.1
**Topic**: Expectation management / probabilistic systems
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The scenario (executive sponsor demands '100% accuracy') is a direct application of the discovery module's core move: a stakeholder's absolute preference should be translated into a testable, bounded constraint rather than accepted, refused, or silently engineered around. Key B combines that translation move with the cross-module fact that Claude is a probabilistic system (explicitly taught in modules 1 and 2) and with risk-tiered human review (module 3's 'human review as a budget' — route on confidence/stakes). Distractors are cleanly eliminable: A commits to an impossible target the course's SLA-traceability logic would reject, C (walking away) contradicts the entire discovery philosophy of investigating rather than refusing, and D changes the error rate without addressing the expectation itself.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'A discovery call is structured elicitation' (translate preference into constraint) + 01_claude_platform_solution_design.md — 'What broke: a deterministic rule handed to a probabilistic system' + 03_responsible_ai_safety_risk.md — human-review-as-budget (risk-based routing)

**Recommendation**: APPROVE

### off-6.2
**Topic**: Discovery before solutioning
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- This is a near-verbatim application of the module's headline lesson: 'we need a chatbot' is a proposed solution, not a problem statement, and structured discovery (what the system must do/not do/cost/prove) must run before any architecture is proposed. Key C is directly supported. Distractors map to the module's own cautionary example: A prices an unvalidated solution, B is exactly the 'discovery call that turned into a design session' failure mode the course names and diagrams, and D outsources judgment rather than running discovery.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'A discovery call is structured elicitation, not a conversation' and 'The discovery call that turned into a design session'

**Recommendation**: APPROVE

### off-6.3
**Topic**: Cost-vs-quality tradeoff communication
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Matches the tradeoff-presentation section closely: quantify what is gained/given up, name the reversal cost, and let the accountable stakeholder decide with full information — 'the stakeholder is not adopting your architecture; they are accepting a decision they will have to defend.' Key A mirrors this. B is deception the course never sanctions, C withholds material information the 'Description' competency requires surfacing, and D (escalating before the conversation happens) inverts the course's order of operations, which is presentation first, escalation only if needed.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'Present a tradeoff so the stakeholder can act on it' and 'The approval that was not an informed choice'

**Recommendation**: APPROVE

### off-6.4
**Topic**: SLA and latency expectation management
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Core SLA teaching is that thresholds 'should never be arbitrary' and must trace back to a real source such as the user-experience latency expectation — which is exactly what key D does (show the breakdown, agree a realistic number). The 'streaming or progress feedback' clause is a true, general engineering practice not verbatim taught in this module, but it is not load-bearing: the question is answerable and every distractor eliminable on the SLA-traceability teaching alone (A signs up for an untraceable, doomed target; B sacrifices the capability that justifies the system; C is demo-only deception that guarantees the gap resurfaces in production).
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'The feedback loop decides which signals reach a stakeholder, and the SLA names what you owe when one breaks' (SLA thresholds must trace to a real source); 'streaming/progress feedback' itself is not module content (module 1 mentions streaming only as SDK boilerplate) but is not needed to select the key

**Recommendation**: APPROVE

### off-6.5
**Topic**: Handoff documentation artifacts
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly supported by the documentation-for-handoff section: the inheriting team needs decision records with rejected alternatives and tradeoffs (not just a diagram), reinforced by the 'design rationale that lived in the Architect's head' cautionary case where a missing decision record caused a compliance-breaking rollback. Key C is well-formed; 'runbooks' is taught explicitly in module 5 (team enablement) as the handoff artifact for operational continuity, and 'evaluation baselines' aligns with the SLA section's eval-derived quality thresholds, though the exact phrase is not verbatim in module 4. Distractors are all things the module explicitly distinguishes from load-bearing documentation: A is 'an artefact of the journey,' B is prompt history not operational knowledge, D documents what wasn't built.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'Documentation that survives your absence' and 'The design rationale that lived in the Architect's head'; runbooks specifically taught in 05_team_enablement_productivity.md

**Recommendation**: APPROVE

### off-6.6
**Topic**: Outcome reporting to sponsors
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Closely mirrors the module's own cautionary case, 'The outcome document that measured the wrong thing,' where a report built only from volume/latency/error-rate metrics failed to answer a CFO's business-value question. Key A (report against the business success criteria agreed at discovery, technical metrics as supporting detail) is exactly the fix the course prescribes. B, C, and D are each a variant of the failure mode the course names: more of the same wrong content, removing the feedback loop entirely, and deepening the technical-metric mismatch respectively.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'Entry point selection... and the outcome document' / 'The outcome document that measured the wrong thing'

**Recommendation**: APPROVE

### off-6.7
**Topic**: Discovery-phase outputs before design begins
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The stem asks what must be documented 'before design begins,' which maps directly to the course's discovery/design phase split (line 220: joint-scoping prep requires 'data conditions… compliance concerns… and success criteria' from discovery). Off-6.9 row 5 independently keys 'agree what success will mean and how it will be measured' as discovery, confirming option A. Distractors B (exact system prompt), D (pinned model/endpoint), and E (UI layout) are unambiguously design/build outputs per the course's discovery→design phase boundary, so they are cleanly wrong rather than merely less-good.
- Course reference: 04_stakeholder_engagement_lifecycle.md — joint-scoping prep list ('a documented view of requirements and constraints… data conditions, technical environment, compliance concerns, and success criteria') and off-6.9 row 5 keying 'agree what success will mean' as discovery

**Recommendation**: APPROVE

### off-6.8
**Topic**: In-flight scope and change management during build
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course does not explicitly teach a scope-baseline/re-baselining discipline for mid-build change requests — module 04 covers discovery, tradeoff presentation, feedback loops, documentation, and entry-point/outcome docs, none of which is 'handling scope creep during build.' The two keyed options (B: assess against baseline and surface impact; E: re-baseline with sponsor sign-off) are nonetheless objectively sound and echo the course's broader transparency/traceability themes (nothing hidden, thresholds traced to a source), and the three distractors (silent absorption, blanket refusal, quietly cutting testing) are unambiguously poor practice with no defensible reading. No unkeyed option is co-correct.
- Course reference: NOT COVERED (module 04 does not teach in-flight scope/change management explicitly; distantly consistent with its general transparency-and-traceability themes, e.g. SLA thresholds 'trace back to something tangible')

**Recommendation**: APPROVE

### off-6.9
**Topic**: Lifecycle phase identification (discovery/design/handoff/monitoring)
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- All five rows key correctly against the course's explicit phase mapping ('discovery → design → handoff → monitoring → iteration'; 'the feedback loop is the monitoring-and-iteration stage'; 'documentation is the handoff stage'). Row 2 ('selecting the retrieval strategy… for the agreed use case') is correctly keyed design rather than discovery, since the use case is already agreed by that point — a precise discriminator, not an ambiguity. Row 3 (runbooks/ownership transfer) and row 4 (production eval review driving next iteration) map cleanly to handoff and monitoring-and-iteration respectively.
- Course reference: 04_stakeholder_engagement_lifecycle.md — 'Across these five topics runs the project lifecycle itself: discovery → design → handoff → monitoring → iteration' and Glossary entry for 'Project/Deployment lifecycle'

**Recommendation**: APPROVE

## Developer Productivity & Operational Enablement (8 questions)

### gen-7.1
**Topic**: Configuring Claude Code environments for teams (shared permissions/settings)
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Conceptually aligned with the course's team-baseline teaching (a project-level baseline every member starts from, versioned so it can be reviewed and improved once for everyone), which is what a committed project-level settings.json accomplishes. However, the course never names '.claude/settings.json' or explains the clone-inherits-automatically mechanism explicitly — it only speaks generically of 'a permission posture' as part of the baseline. The keyed answer is not contradicted by anything in the course, and the distractors (CLAUDE.md as enforcement, per-user manual copy, custom wrapper script) are correctly identified as inferior to a version-controlled shared baseline, consistent with course framing.
- Course reference: 05_team_enablement_productivity.md — 'Configuring Claude tooling and environments for teams' (project-level baseline, permission posture); specific settings.json mechanism NOT COVERED by name

**Recommendation**: APPROVE

### gen-7.2
**Topic**: Standardizing repeated AI-assisted workflows with slash commands
**Content Alignment**: ⚠ WARNING
**Question Quality**: ⚠ WARNING
**Answer Accuracy**: ⚠ WARNING

**Assessment**:
- The scenario (a single repeated procedure pasted 340 times by many engineers, causing inconsistent output) is exactly the shape the course defines as a Skill candidate: 'skill packages are repeatable procedures that appear as versioned, reusable units... Packaging a team workflow as a distributable skill is how a good local practice becomes a team standard.' The course spends substantial content on Claude Code project Skills (.claude/skills/, versioned with the repo) as the taught answer to standardizing a repeated team procedure, yet 'package it as a Skill' is not offered as an option — the keyed slash-command mechanism is real Claude Code functionality but is never mentioned in any course file, so a student reasoning strictly from the course has no way to prefer it over the taught Skill pattern, and no distractor addresses that overlap.
- Course reference: 05_team_enablement_productivity.md — 'Configuring Claude tooling and environments for teams' (Skills distribution: 'skill packages are repeatable procedures... versioned, reusable units'); slash commands (.claude/commands/) are NOT COVERED in any course file

**Recommendation**: REVISE (finding upheld on adversarial verification — moderate)
**Suggested Fix**: Keep C as the correct answer (do NOT re-key to a Skill — that would be objectively weaker). Close the alignment gap so the answer is learnable from taught content, two coordinated moves: (1) In the explanation, explicitly draw the boundary the course omits — a project Skill is a model-invoked capability Claude discovers and applies when relevant, whereas a slash command is an explicit, user-invoked, deterministic single template, the right fit when the exact same prompt must run identically every time. (2) Prefer replacing the fabricated-env-var distractor B (or subagent D) with 'Package the scaffolding prompt as a project Skill under .claude/skills/ so Claude applies it when relevant' — this converts the untaught mechanism into a taught contrast (Skill vs. slash command) and tests a real boundary instead of leaving a fake-path distractor. Ideally also add a one-line mention of project slash commands (.claude/commands/) to Module 5's 'Improving developer workflows' section as the deterministic user-invoked counterpart to model-invoked Skills, so the keyed mechanism exists somewhere in the course.

### gen-7.3
**Topic**: developer_productivity: surfacing tool crashes vs. genuine negative results in Claude-powered on-call triage
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The exact on-call-triage scenario isn't in Module 5's brief 'symptom-to-cause' section, but the governing principle — a component that silently absorbs a failure and emits output indistinguishable from a genuine negative result is dangerous and must be forced to fail visibly — is directly taught under 'Fail open versus fail closed: how your guardrail layer behaves under failure' (03_responsible_ai_safety_risk.md: 'An operator-built guardrail that silently passes traffic when it errors is worse than one that blocks traffic, because it gives you the reassurance of having control while providing none of the protection'). Module 2's circuit-breaker/observability material reinforces the same 'don't let failures degrade silently' theme. D is the only option that narrows the catch-all and gives unanticipated exceptions their own distinct label, satisfying the stated runbook requirement for ANY crash (not just this one schema mismatch); C is a good but incomplete fix correctly marked wrong since it leaves the general catch-all untouched. No ambiguity in the key.
- Course reference: 03_responsible_ai_safety_risk.md — 'Fail open versus fail closed: how your guardrail layer behaves under failure' (silently-passing failures principle); reinforced by 02_enterprise_integration_production.md — circuit breaker / observability material

**Recommendation**: APPROVE

### gen-7.4
**Topic**: Claude Code: shared project settings, .mcp.json, and enterprise managed policy for teams
**Content Alignment**: ⚠ WARNING
**Question Quality**: ⚠ WARNING
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The underlying concept — a reviewable, versionable, project-level shared baseline (CLAUDE.md, agreed tools/MCP servers, permission posture) that every engineer starts from instead of ad hoc personal setups — is squarely taught in 'Configuring Claude tooling and environments for teams.' However, the course prose never names the concrete mechanisms the key depends on: .claude/settings.json, the gitignored settings.local.json override layer, or a project-root .mcp.json file; these appear only in the module's Sources footnote ('CLAUDE.md instructions vs. enforceable settings, permissions, hooks, MCP, and managed settings'), not in the body text a learner actually studies. The facts themselves are accurate to the real Claude Code product and nothing in the course contradicts them, so the key is correct, but a learner relying solely on the module text would have no way to distinguish A/E from D (manual wiki copy-paste) without outside product knowledge of the specific filenames.
- Course reference: 05_team_enablement_productivity.md — 'Configuring Claude tooling and environments for teams' (general shared-baseline concept covered; specific mechanisms .claude/settings.json / settings.local.json / .mcp.json are NOT COVERED by name in the body text, only gestured at in the Sources footnote)

**Recommendation**: APPROVE (first-pass REVISE refuted on adversarial verification)

### off-7.1
**Topic**: Team-scale rollout of AI coding tools: shared vs personal configuration
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Directly matches the course's core team-setup teaching: 'the team agrees on a project-level baseline... a permission posture, so people start from the same place... a baseline you can review, version, and improve once for everyone.' Option B's 'shared, version-controlled configuration... personal preference on top' is a faithful paraphrase. Distractors (personal configs, restricting access to two engineers, hand-rewriting every suggestion) are clearly inferior per the course's emphasis on broad, enabled adoption rather than restriction.
- Course reference: 05_team_enablement_productivity.md — 'Configuring Claude tooling and environments for teams' (project-level baseline paragraph)

**Recommendation**: APPROVE

### off-7.2
**Topic**: Review quality for AI-authored code: independent vs same-session review
**Content Alignment**: ⚠ WARNING
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- The course teaches the surrounding principle strongly (Diligence: 'holding AI-generated code to the same standards as any other code' and watching for engineers accepting output they no longer understand), but the specific mechanism keyed here — a fresh, unanchored session/agent reviewing code so it doesn't inherit the authoring session's blind spots — is not stated anywhere in the module. It is a defensible, well-known best practice and no unkeyed option is equally correct (A removes review, B repeats the anchoring problem, C only restricts scope), so the key itself is not contradicted by course material.
- Course reference: 05_team_enablement_productivity.md — 'Improving developer workflows with AI tooling' (Diligence / verification checklist) covers the review-discipline theme generally; the specific 'independent session, unanchored to reasoning' mechanism is NOT COVERED

**Recommendation**: APPROVE

### off-7.3
**Topic**: Operational debugging discipline: diagnose before treating
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Matches the course's operational-support teaching precisely: the Architect's job is 'connecting the operational symptom to its architecture cause: the same diagnostic discipline Module 2 built for production systems.' Inspecting traces of the affected sessions before touching the prompt is exactly this symptom-to-cause discipline. Distractors (blind prompt rewrite, unrelated model rollback, permanent shutdown) are clearly premature or disproportionate interventions the course warns against.
- Course reference: 05_team_enablement_productivity.md — 'Supporting debugging and operational issue resolution'

**Recommendation**: APPROVE

### off-7.4
**Topic**: Scaling AI-assisted development without operational risk
**Content Alignment**: ✓ PASS
**Question Quality**: ✓ PASS
**Answer Accuracy**: ✓ PASS

**Assessment**:
- Option C matches the shared, version-controlled baseline theme of module 5 ('a shared CLAUDE.md, an agreed set of tools and MCP servers, and a permission posture... you can review, version, and improve once for everyone'). Option D matches the 'governing layers' from module 1 ('Hooks, permission boundaries, approval flows, sandboxing, and restricted execution' govern what the agent is allowed to touch). Distractors (unrestricted standing credentials, barring code inspection, adopting every new tool unvetted) are clearly the risk-maximizing opposite of both taught principles.
- Course reference: 05_team_enablement_productivity.md — 'Configuring Claude tooling and environments for teams'; 01_claude_platform_solution_design.md — governing-layers paragraph (line ~1031)

**Recommendation**: APPROVE

