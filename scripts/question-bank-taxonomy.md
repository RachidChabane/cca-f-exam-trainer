# CCA-F Question Bank — style & trap taxonomy (generation spec)

Derived from the 60 imported source questions (`data/question_bank.json`,
`source: "official"`). This is the spec the AI-generated siblings must hit so
they read as authentic exam items rather than obvious copies.

## Source shape (per question)

- `text` — the stem. 1–4 sentences. Almost always **grounded in a production
  observation** before it asks anything: *"Production logs show…"*, *"After
  running the system on…"*, *"In 12% of cases…"*, *"Developers report…"*. Often
  carries a concrete number, tool name, or log detail.
- The ask is a superlative decision: **"most effective"**, **"most likely root
  cause"**, **"best first step"**, **"what determines…"**. It asks for the *one*
  best move, not a true/false.
- `options` — exactly **4** (A–D), each `{label, text, explanation}`. Options are
  parallel in grammar and **comparable in length** (no giveaway where the correct
  one is the longest, most-qualified answer).
- `correct` — one letter. (Source answer key is skewed: A 43×, B 15×, C 2×, D 0×.
  This is a source artifact — generated items deliberately balance A/B/C/D.)
- `explanation` — overall rationale: states why the key is right **and** names the
  other letters and why they fail.
- per-option `explanation` — a focused rebuttal/confirmation for that one option.
- `difficulty` — `easy` (recall a documented fact/mechanism), `medium` (apply a
  principle to a wrinkle), `hard` (a subtle trade-off where two options look right).
- `topic` — short label; maps to one of the five exam domains.

## The recurring distractor strategies

This menu is the *reason* a distractor is ultimately wrong — NOT a template for how
it should read. The cardinal sin is a **strawman**: an option a competent engineer
would never propose ("continue as if it succeeded", "stand up a whole new vector
DB", "agentify everything"), or one stuffed with self-incriminating words. Those
make the answer guessable with zero domain knowledge.

Instead, dress every distractor as a **plausible, specific approach a competent
engineer would actually propose in this scenario** — and let it be wrong only for a
subtle, scenario-specific reason drawn from the menu below. If you cannot write a
convincing one-sentence "why a smart person would pick this", it is still a
strawman: rewrite it. Pick the 2–3 menu reasons that fit; don't reuse the same
three every time.

1. **Prompt-when-you-need-a-guarantee.** Offer a system-prompt tweak, "stronger
   instructions", or few-shot examples as the fix for something that needs a
   *deterministic* guardrail (programmatic precondition, code-level check, schema
   enforcement). Tempting because prompting is the usual lever; wrong because it
   relies on probabilistic LLM compliance where the cost of the 5–12% failure is
   unacceptable. (src #625)

2. **Solves an adjacent problem.** A real, sensible action that fixes a *different*
   issue than the one asked — e.g. tool-*availability* routing when the problem is
   tool-*ordering*; more format instructions when the gap is *consistency*. (#625D, #856A)

3. **Over-engineering / premature complexity.** Build a classifier, a routing
   layer, a new service, or merge/split tools when a simpler documented fix (better
   tool *descriptions*, one frontmatter flag) is the right first step. The exam
   rewards the minimal effective change. (#626C/D, #706C)

4. **Silent swallow vs. surface-to-orchestrator.** On a subagent/tool failure:
   silently skip, or hard-crash the whole workflow, or blind-retry N times — versus
   returning the error *with context* to the coordinator to decide. Anthropic's
   guidance favors making failures visible to the controlling agent. (#750)

5. **Brittle heuristic vs. the documented mechanism.** Parse response text for
   phrases, count iterations, sniff keywords — instead of the actual field/API
   (`stop_reason == "tool_use"`, etc.). Distractors sound reasonable but ignore the
   first-party mechanism. (#701)

6. **Invented-but-plausible API/flag/config.** A fabricated flag, env var, or
   frontmatter key that *sounds* real (`--batch`, `CLAUDE_HEADLESS=true`,
   `.claude/config.json` commands array) against the one that actually exists
   (`-p`, `.claude/commands/`). Tests whether the candidate knows the real surface. (#606, #599)

7. **Wrong scope / location.** Right idea, wrong place: user-level `~/.claude` vs
   project `.claude`, global rule vs path-specific, CLAUDE.md vs a skill/command.
   (#599)

8. **Symptom not root cause.** In "most likely root cause" items, blame a
   downstream component that's working fine, when the logs point upstream (the
   coordinator's narrow decomposition, not the search/synthesis agents). Each wrong
   option indicts a plausible but exonerated part. (#634)

9. **Relative/proportional instead of absolute.** Grade severity "relative to this
   PR" or normalize within a batch, vs. fixed absolute criteria with concrete
   examples — relative scoring reintroduces the very inconsistency being fixed. (#839D)

10. **Manual / human-in-the-loop band-aid.** "Have a person calibrate", "review
    each one by hand" — doesn't scale and isn't the architectural fix asked for. (#839C)

## Generation rules (quality bar — inherited from the rebalanced site standard)

- **One BEST answer among plausible competitors — NOT one defensible answer.** The
  goal is a question where 2–3 options sound reasonable and a knowledgeable reader
  must reason about *this* scenario to pick the best. "Only one option is even
  defensible" is the definition of an obvious question — avoid it. There is still
  exactly one *best* answer; the others are good-but-beaten, not absurd.
- **Must pass the two-solver test.** (a) an expert reasoning fully, blind to the
  key, must still pick the keyed answer (correctness). (b) a *test-wise reader with
  no domain knowledge*, guessing only from surface cues (which sounds most
  "best-practice", which avoids absolutist words, which isn't over-engineered),
  must NOT reliably land on the key. If a cue-reader can guess it, it is too
  obvious — for `medium`/`hard` items especially. (`easy` items may be more
  surface-readable.)
- **No tells.** Ban self-incriminating phrasing in distractors ("as if it
  succeeded", "always/never", "silently", "regardless", "hard-code/ignore"). The
  correct option must NOT recite the rubric or name the principle ("reserving agent
  autonomy for open-ended tasks") — make the reader infer it. Don't telegraph in
  the stem ("Following Anthropic's guidance on X…"). No cartoonish over-engineering
  as a throwaway distractor; if you use the over-engineering reason, make the heavy
  option genuinely tempting for the scenario.
- **Balanced option lengths.** The correct answer must not be the longest or most
  hedged. Vary which option is longest.
- **Balanced correct position.** The orchestrator assigns each sibling a target
  correct letter round-robin (A/B/C/D) so the generated set is ~15 each — killing
  the source's A-bias and any position tell.
- **Concept-matched, not copied.** Each sibling targets the *same concept/trap* as
  one source question but with a **new scenario detail, numbers, tool names, and
  framing**. It must not be a paraphrase; a candidate who memorized the source
  item shouldn't recognize it.
- **Self-consistent within the scenario.** Reuse the scenario's tools/setting
  (e.g. `get_customer`, `lookup_order` for support) so siblings feel native.
- **Grounded stem.** Open with a production observation, as the source does.
- **Full explanations.** Overall rationale naming all letters + a per-option
  rebuttal/confirmation for each of the four.
- **Verbatim source untouched.** Generated items live alongside, tagged
  `source: "ai_generated"`, never edited into the official set.
