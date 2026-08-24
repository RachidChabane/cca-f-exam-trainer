# CCA-F Trap Cheat Sheet

> The real trap = the option that's OK/defensible but NOT the most effective.
> **✗** = tempting trap · **✓** = best · _italic_ = why best wins.
> Printable version: `cheatsheet.pdf` (one A4 landscape, 2 columns). Source: `cheatsheet.html` → regenerate the PDF with:
> `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --no-pdf-header-footer --print-to-pdf=data/cheatsheet.pdf file://$PWD/data/cheatsheet.html`

## ☠ Reflex trap words → reach for the "instead"

| ✗ see this option | ✓ instead |
|---|---|
| confidence score / threshold routing | explicit criteria + examples, or a hard check |
| bigger / higher-tier model · larger context | restructure: decompose, structured data, reorder |
| more precise prose / numbered spec | concrete input→output examples |
| merge tools / routing classifier | fix the tool descriptions |
| PostToolUse undo after | PreToolUse deny (block before) |
| "system prompt: X is mandatory" | programmatic prerequisite / gate |
| /compact · /clear | context:fork or Task subagent |
| footnote discarded / keep higher-confidence | surface both, mark unresolved |
| ~/.claude for shared work | commit to project .claude/ |
| "batches finish in ~1h" | up to 24h; keep blocking work sync |

## 🧩 Agentic architecture

| Situation — ✗ tempting | ✓ best |
|---|---|
| Wrong tool, thin desc — ✗ few-shot / classifier / merge | ✓ rewrite descriptions _(boundary vs sibling, sample query)_ |
| Wrong tool, desc already clear — ✗ add neg. examples | ✓ keyword conditional in the system prompt _(clue: desc isn't the cause)_ |
| Few-shot for tool pick — ✗ 10-15 clear / grouped | ✓ 4-6 ambiguous cases + reasoning _(already nails clear ones)_ |
| Migration w/ unknowns — ✗ codemod / tests / module-by-module | ✓ Plan mode, approve approach first _(others miss the design-level bug)_ |
| Subagent output too big — ✗ summarizer / bigger ctx / vector db | ✓ upstream returns structured data _(fix at source)_ |
| Agents overlap — ✗ shared scratchpad / dedupe after | ✓ coordinator partitions subtopics up front |
| Coverage gaps — ✗ blame synth/search agent | ✓ coordinator decomposition too narrow |
| Worker dies silent — ✗ "all collected = ok" / abort | ✓ require returned success per dispatched item _(no result = fail)_ |
| Subagent error types — ✗ timeout & "0 results" both fail | ✓ timeout=retry, 0-results=valid; recover transient locally |
| Conflicting data — ✗ keep higher-conf + footnote | ✓ return both, mark unresolved, owner decides |
| Partial coverage — ✗ global preamble / soften all | ✓ per-section confidence note |
| Escalate? — ✗ angry / threat / multi-concern / contradiction | ✓ only policy-interp gap OR dead-end (no route to act) |
| Destructive write — ✗ prompt "wait" / snapshot / revert | ✓ approval checkpoint blocks the apply |
| Must-never (refund/credit/delete) — ✗ session log / token / PostToolUse / guard clause | ✓ PreToolUse deny OR read authoritative record _(before money moves)_ |
| Deterministic transform — ✗ temp-0 agent / regex / LSP | ✓ codemod over the AST, run once _(regex hits same-named local var)_ |
| Sequential indep. lookups — ✗ composite tool / speculative / max_tokens | ✓ parallel tool_use blocks in one turn |

## 🧠 Context & batch

| Situation — ✗ tempting | ✓ best |
|---|---|
| Batch fit? — ✗ batch both / timeout-fallback / smaller batches | ✓ sync if blocks merge·push·release OR human deadline; batch only unattended |
| Batch + tool loop — ✗ batch the whole exchange | ✓ keep gathering sync, batch only the final self-contained call |
| Verbose discovery — ✗ /compact / multi-session / scratch-reload | ✓ Explore subagent returns a summary |
| Lost in the middle — ✗ summarize-all / bigger model / rotate | ✓ digest at start+end + headers; or verbatim quote per field |
| Critical fact compacted — ✗ keep numbers in summary / raise threshold / pin turn | ✓ write to external/case record, prepend every turn |
| Cache read=0 — ✗ 5-min TTL / workspace scope | ✓ volatile id before breakpoint → move it after |

## 🗂 Claude Code config

| Situation — ✗ tempting | ✓ best |
|---|---|
| Team / clone-ready — ✗ ~/.claude / root commands/ / doc section | ✓ commit .claude/commands/ or .claude/CLAUDE.md |
| Personal override of team skill — ✗ same name / override:true | ✓ a NEW command name /my-x _(same name won't shadow)_ |
| Skill won't auto-fire — ✗ phrasings in body / CLAUDE.md / few-shot | ✓ user phrasings in the description frontmatter |
| Modular, always-on — ✗ rules/ + paths glob | ✓ @import lines in CLAUDE.md _(rules+paths loads only for matching files)_ |
| Path/file-type rules — ✗ CLAUDE.md sections | ✓ .claude/rules/ + paths: glob |
| MCP creds, shared file — ✗ .env / :-default / op:// / user scope | ✓ ${ENV_VAR} in committed .mcp.json + document it |

## 📝 Prompt & output

| Situation — ✗ tempting | ✓ best |
|---|---|
| Structured output — ✗ "respond only JSON"+strip+retry / few-shot / temp 0 | ✓ forced tool_choice + input_schema, read tool_use _(prefill `{` = smallest fix for preamble)_ |
| Force the tool — ✗ mark all fields required | ✓ tool_choice forces the CALL |
| Missing field — ✗ drop from required / "none" token | ✓ keep required, type `["string","null"]` |
| Schema-validate fail — ✗ separate reformat call / pre-normalize | ✓ tool_result is_error:true, Claude reissues _(only it has the source)_ |
| Self-review blind spot — ✗ self-critique prompt / extended thinking | ✓ 2nd independent instance, no generator reasoning |
| Inconsistent severity — ✗ mapping table / relative-to-PR / reasoning-then-adjust | ✓ explicit criteria + borderline anchor / fixed budget |
| False-positive noise — ✗ uniform cut / confidence display / slow few-shot | ✓ disable noisy category, fix offline, restore |
| Prose reinterpreted each iter — ✗ more precise spec / parser first | ✓ 2-3 input→output examples |
| Ambiguous multi-match — ✗ re-query filters / confirm the one picked | ✓ list the matches, user picks, before acting |
| Hallucinated API names — ✗ typecheck+regen / dump SDK to CLAUDE.md | ✓ fetch real signatures from MCP doc, just-in-time |
| CI accuracy gate — ✗ average / one field / vs last run | ✓ gate on the MIN per-field rate |
| Scanned/low-quality docs — ✗ augment prompt / OCR→shared / pass label | ✓ own path per stream; scans read the image |
