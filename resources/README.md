# CCA-F — Official Source Manifest

This folder records the **first-party Anthropic sources** used to ground the
content in this trainer. All questions and course summaries are **original**
(written for this project); these sources were used only to verify concepts and
the exam definition. No third-party / paid question banks were scraped or copied.

- **Access date:** 2026-06-08
- **Exam blueprint (machine-readable):** [`blueprint.json`](./blueprint.json)

> Note on doc domains: Anthropic's developer documentation now lives at
> `platform.claude.com/docs` (API & build-with-Claude) and `code.claude.com/docs`
> (Claude Code). Older `docs.anthropic.com` / `docs.claude.com` links redirect
> there. French documentation is published under the same paths with `/docs/fr/…`.

---

## 1. The exam: Claude Certified Architect — Foundations (CCA-F)

CCA-F is Anthropic's first official technical certification, launched in
**March 2026** as part of the **Claude Partner Network**. It targets solution
architects building production applications with Claude and tests **architectural
judgment** through realistic production scenarios.

> **Verification update (2026-06-15).** The mechanics below are split into what
> is **confirmed in Anthropic's official exam guide** — the *Claude Certified
> Architect – Foundations Certification Exam Guide*, published on the Anthropic
> Academy / Skilljar course CDN — versus what is only **community-reported** by
> third-party prep sites and absent from that guide. The trainer keeps the
> community-reported numbers as reasonable simulation defaults; they are **not**
> authoritative. Treat the official **Practice Exam** as your true readiness signal.

**First-party confirmed** (official exam guide):

| Property | Value |
|---|---|
| Format | Scenario-based, multiple choice |
| Options per question | 4 — one correct, three distractors |
| Guessing penalty | None (unanswered = incorrect) |
| Scoring | Scaled **100–1000**, **pass = 720** (scaled scoring equates across forms — i.e. non-linear) |
| Scenario structure | **4 scenarios per sitting, drawn at random from a fixed pool of 6**; each scenario frames a *set* of questions |
| Domains & weights | 27 / 18 / 20 / 20 / 15 (below) |

**Community-reported only** (third-party prep sites; NOT in the official guide):

| Property | Value | Note |
|---|---|---|
| Question count | 60 | consistent across prep sites; some dumps say 77 |
| Time limit | 120 minutes | prep sites only |
| Delivery | Proctored | prep sites only |
| Fee | $99 | conflicts with documented free early access for the first ~5,000 partner-company employees |
| Level | 301 / "applied practitioner" | varies (300 vs 301 vs "Level 3") across sources |

**Domains & weights** (official exam-guide numbering — the trainer's domain order now matches this):

1. Agentic Architecture & Orchestration — **27%**
2. Tool Design & MCP Integration — **18%**
3. Claude Code Configuration & Workflows — **20%**
4. Prompt Engineering & Structured Output — **20%**
5. Context Management & Reliability — **15%**

**Official exam scenario themes** (the pool of 6, 4 presented per sitting):
Customer Support Resolution Agent · Code Generation with Claude Code ·
Multi-Agent Research System · Developer Productivity with Claude ·
Claude Code for Continuous Integration · Structured Data Extraction

**Exam / program sources:**

- Anthropic — *Claude Partner Network* announcement ($100M investment, introduces
  the Claude Certified Architect, Foundations certification):
  <https://www.anthropic.com/news/claude-partner-network>
- Anthropic — *Learn / AI learning resources* hub:
  <https://www.anthropic.com/learn>
- Anthropic Academy (course platform, Skilljar): <https://anthropic.skilljar.com/>

---

## 2. Anthropic Academy course catalog (enumerated live, 2026-06-08)

The live catalog at <https://anthropic.skilljar.com/> listed **18 public
courses**. The trainer's **Study mode summarizes the 11 courses that make up the
CCA-F technical learning path** (developer/architect track). The remaining 7 are
audience-specific *AI Fluency* repackagings or cloud-deployment courses that sit
outside the five exam domains; they are listed here for completeness but not
summarized.

### CCA-F learning path — summarized in `data/courses.json` (11)

| # | Course | URL | Primary exam domain |
|---|---|---|---|
| 1 | Claude 101 | https://anthropic.skilljar.com/claude-101 | Foundations |
| 2 | AI Fluency: Framework & Foundations | https://anthropic.skilljar.com/ai-fluency-framework-foundations | Foundations |
| 3 | AI Capabilities and Limitations | https://anthropic.skilljar.com/ai-capabilities-and-limitations | Context / reliability |
| 4 | Building with the Claude API | https://anthropic.skilljar.com/claude-with-the-anthropic-api | Prompt Eng. / Tools |
| 5 | Claude Code 101 | https://anthropic.skilljar.com/claude-code-101 | Claude Code |
| 6 | Claude Code in Action | https://anthropic.skilljar.com/claude-code-in-action | Claude Code |
| 7 | Introduction to subagents | https://anthropic.skilljar.com/introduction-to-subagents | Agentic Architecture |
| 8 | Introduction to agent skills | https://anthropic.skilljar.com/introduction-to-agent-skills | Claude Code / Agentic |
| 9 | Introduction to Claude Cowork | https://anthropic.skilljar.com/introduction-to-claude-cowork | Agentic Architecture |
| 10 | Introduction to Model Context Protocol | https://anthropic.skilljar.com/introduction-to-model-context-protocol | Tool Design & MCP |
| 11 | Model Context Protocol: Advanced Topics | https://anthropic.skilljar.com/model-context-protocol-advanced-topics | Tool Design & MCP |

Each of these course pages was fetched live and its real module list + key
concepts were used to ground the original summaries in `data/courses.json`.

### Other catalog courses (adjacent / not summarized) (7)

| Course | URL | Why excluded |
|---|---|---|
| AI Fluency for educators | https://anthropic.skilljar.com/ai-fluency-for-educators | Audience-specific AI literacy |
| AI Fluency for students | https://anthropic.skilljar.com/ai-fluency-for-students | Audience-specific AI literacy |
| Teaching AI Fluency | https://anthropic.skilljar.com/teaching-ai-fluency | Educator-focused |
| AI Fluency for nonprofits | https://anthropic.skilljar.com/ai-fluency-for-nonprofits | Audience-specific AI literacy |
| AI Fluency for Small Businesses | https://anthropic.skilljar.com/ai-fluency-for-small-businesses | Audience-specific AI literacy |
| Claude with Amazon Bedrock | https://anthropic.skilljar.com/claude-in-amazon-bedrock | Cloud deployment (platform-specific) |
| Claude with Google Cloud's Vertex AI | https://anthropic.skilljar.com/claude-with-google-vertex | Cloud deployment (platform-specific) |

> If Anthropic adds or renames courses, treat the live Academy catalog as the
> source of truth and extend `data/courses.json` accordingly.

---

## 3. Product documentation consulted, by exam domain

These first-party docs were read to verify the concepts behind the question pool.

### Agentic Architecture & Orchestration
- https://www.anthropic.com/engineering/building-effective-agents
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- https://claude.com/blog/building-agents-with-the-claude-agent-sdk
- https://code.claude.com/docs/en/agent-sdk/overview

### Claude Code Configuration & Workflows
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/settings
- https://code.claude.com/docs/en/commands
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/headless
- https://code.claude.com/docs/en/permission-modes
- https://code.claude.com/docs/en/context-window
- https://code.claude.com/docs/en/github-actions

### Prompt Engineering & Structured Output
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- https://platform.claude.com/docs/en/test-and-evaluate/define-success
- https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
- https://platform.claude.com/docs/en/api/messages

### Tool Design & MCP Integration
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool
- https://platform.claude.com/docs/en/agents-and-tools/mcp-connector
- https://www.anthropic.com/engineering/writing-tools-for-agents
- https://modelcontextprotocol.io/introduction
- https://modelcontextprotocol.io/docs/learn/architecture
- https://modelcontextprotocol.io/docs/learn/server-concepts

### Context Management & Reliability
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://platform.claude.com/docs/en/build-with-claude/context-windows
- https://platform.claude.com/docs/en/build-with-claude/context-editing
- https://platform.claude.com/docs/en/build-with-claude/compaction
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- https://platform.claude.com/docs/en/build-with-claude/streaming
- https://platform.claude.com/docs/en/api/errors
- https://platform.claude.com/docs/en/api/rate-limits

French documentation (same paths under `/docs/fr/…`) was consulted to align the
French technical terminology used throughout the trainer.

---

## 4. Methodology & copyright

- **Original content only.** Every exam question and course summary was authored
  for this project, grounded in the concepts in the sources above. Anthropic's
  course text and docs were **not reproduced verbatim**.
- **No third-party banks.** No content was taken from paid/third-party question
  banks (Udemy, SkillCertPro, CertSafari, etc.). They are copyrighted.
- **Bilingual.** All learner-facing content exists in idiomatic English **and**
  French, using Anthropic's own French terminology where applicable.
