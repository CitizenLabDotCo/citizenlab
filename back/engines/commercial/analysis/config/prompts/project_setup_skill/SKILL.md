---
name: govocal-project-setup
description: "Draft a Go Vocal participation project from the captured project intake. Use when a GSM says 'draft the project', 'create a consultation', 'turn the intake into a project', 'run the setup skill on intake X', or otherwise asks to turn the captured project intake (from the upstream `govocal-project-intake` skill or the in-product intake step) into a project on a client tenant. The skill reads the captured intake, classifies the project archetype, applies the statutory modifier if present, picks one or two empirically-grounded method recipes, sets duration / form length / tone, generates the project content + form content + project settings configuration, and pushes the result to the client tenant as a draft project via the Go Vocal MCP tools, together with a GSM decision report that explains the design and flags what to review before publishing."
metadata:
  version: "0.13.0"

---

# Go Vocal MCP — Project Setup (excellence and good practice) Skill 

## What this skill does

You turn the **captured project intake** into a real **project** on a Go Vocal client tenant. You are run by an LLM that has the Go Vocal MCP tools, and your two jobs are:

1. **Build the project on the platform** — classify, design the phases/survey/content/settings, then create it on the tenant by calling the Go Vocal MCP tools (see §7 for the tool sequence). The project is created as a **draft** (`publication_status: draft`) — you build it, you do not publish it.
2. **Return a GSM decision report** — a narrative explaining every meaningful call you made and why, plus what to review, so the GSM can scan it in 60 seconds and decide whether to publish.

You push to the platform directly via the MCP tools; there is no Notion hand-off. Publishing stays a human decision: leave the project in draft for the GSM to review, adjust, and publish.

---

## Inputs

You receive the **captured intake** — the brief plus the answers to the intake dimensions below. It arrives as structured input in-product (the in-product intake step) or, when run manually, from the upstream `govocal-project-intake` skill. Either way, these are the dimensions that drive the draft, so make sure you have them before building:

- `Project nickname`, `Tenant URL`, `Driver - what & why now`
- `Proposal fixedness`, `Real influence level`
- `Target audience`, `Audience distinctiveness`
- `Output success`, `Process success`
- `Hard deadline`, `In and out of scope`
- `What participants hear back`, `Feedback timing commitment`
- `Compliance requirements` (drives statutory flag)
- `Anonymity level`, `Tone direction`
- `Open flags for review`, `Probes triggered`

If a dimension is missing or vague, don't invent it — proceed with sensible defaults and flag the gap in the GSM decision report (§7) rather than blocking. The tenant to build on comes with the request (`Tenant URL`).

---

## Where the result goes

Straight onto the tenant, as a **draft project**, by calling the Go Vocal MCP tools in order:

`create_phase` (per phase) → `update_project_layout` (page content) → `replace_form_fields` (per survey phase) → `create_event` (per event) → `update_project` (visibility + title + preview) → `update_phase_permission` (access).

The phases, page content and survey are the **core** of the project — a tool failure there means the draft isn't usable. Events, visibility and access are **best-effort**: report a tool error but still leave the GSM a usable draft. Payload shape and the GSM decision report in §7 below.

---

## Reference files (read on demand)

This body stays lean; method- and config-specific detail lives in `references/` and is read **only when the relevant phase or condition applies**. All are source-verified against the Go Vocal codebase / support docs.

| Reference | Read when |
|---|---|
| `references/statutory.md` | `statutory: true` (Steps 2–3) — fields to capture, recipe overlay, influence ceiling |
| `references/ideation-views.md` | the recipe has an `ideation` phase (and `proposals`, which inherits it) — minimal input form, List/Map/Perspectives views, reactions & commenting toggles |
| `references/survey-design.md` | the recipe has a `native_survey` phase — question-type catalogue, selection by insight, per-question config (required, randomise), FormSync, parallel/spotlight (standalone) surveys |
| `references/voting-methods.md` | the recipe has a `voting` phase — Approval / Cumulative / Budget allocation; options added later by admin |
| `references/proposals.md` | the recipe has a `proposals` phase — petition-style threshold + expiry, scaled by population |
| `references/common-ground.md` | the recipe has a `common_ground` phase — agree/unsure/disagree on statements; convergence after ideation/survey |
| `references/project-config.md` | **every draft** — access rights (`permitted_by` per action), demographic user-fields, visibility/listing, content metadata |

---

## Orchestration flow

Walk these steps in order. Each step references the section below that holds the lookup logic.

### Step 1 — Classify the archetype
Use §1 (Archetypes). Classify the project into one of the 5 archetypes using the intake's Driver + Fixedness + Influence level. If two archetypes compete, apply the failure test and decision-landing rule. Record the chosen archetype + a one-sentence justification citing the intake fields used.

### Step 2 — Detect the statutory modifier
Use §3 (Statutory modifier). Set `statutory: true | false` based on `Compliance requirements`. If true, **read `references/statutory.md`** and capture `jurisdiction`, `instrument`, and the constraints the recipe must respect. If false, skip that reference.

### Step 3 — Pick the recipe(s)
Use §2 (Recipes) to look up the canonical/default method recipe for the archetype. Then use §5 (Variant rules) to decide 1 or 2 variants if needed. If 2, pick a meaningfully different second method recipe.

If `statutory: true`, apply the statutory overlay from `references/statutory.md` (pinned formal-input phase, minimum duration, closing info phase publishing the response document).

### Step 4 — Set duration, form length, tone
Use §4 (Duration / form / tone). Apply archetype defaults, if override from project intake is required, applied those regarding  `Hard deadline` and `Tone direction`. If `Tone direction = Auto` and you can't scan the tenant site, default to professional friendly and mark "deferred to GSM" in output report.

### Step 5 — Generate the project content
Use §6 (Scoring rubric) to draft against the scoring criteria.

Before writing the project description, optionally run the **Local grounding pass** (§6) — 1–2 web searches to confirm proper nouns and public facts so the description reads like a local wrote it, not boilerplate. Skip it when the intake is already specific; when the intake is thin, prefer probing the client over leaning on the web.

For each phase in the recipe, generate:
- Phase title
- Phase description (explaining what participants do *in this phase* and how it contributes — see Process Design rules)
- For `ideation` / `native_survey` phases: follow the form-design guidance and **run the bias checklist** before returning. Pick field/question types from §2b — for spatial asks, ideation forms MUST use a location field and surveys SHOULD use map question types with per-pin follow-ups. Add the **offline-participation nudge** to the phase description (§6 rule 9) and flag the paper-form location in the report.
- **Ideation forms default to minimal** — Title + Description + (optional) Image only. Do **not** add other fields unless the intake nudges for it (e.g. a spatial ask → location field; "categorise the ideas" → a select). This is the opposite of the survey default; ideation lowers the barrier to submitting, surveys capture structure. See `references/ideation-views.md`.
- For `ideation` (and `proposals`) phases, set the **reactions & commenting** toggles per `references/ideation-views.md`: commenting on; likes `unlimited` (or `limited` to force prioritisation); **down-votes off** unless the intake explicitly wants to surface disagreement — and in that case prefer `common_ground`. (Who is *allowed* to comment/react is the separate permission layer in `references/project-config.md`.)
- For `native_survey` phases specifically, **read `references/survey-design.md`** and deliberately **diversify question types** — match each question to the insight you're after and the respondent experience (open vs. closed, scale vs. choice, image choice, matrix, ranking, sentiment, mapping). Do **not** default to short-answer / single-choice. Use **spatial questions** (`point` / `line` / `polygon`) whenever the ask is clearly about a place, route, or area. Be **confident** reaching for matrix, sentiment, and image-choice where they fit. If image-choice images can't be generated, keep the question and **flag it for the admin** (§7 #4). Mind mobile (matrix), page long surveys, and check FormSync offline support if offline reach matters. On **every** question, deliberately set `required` (default optional — only essential questions required; open-text always optional) and **randomise response options by default** (`random_option_ordering: true`), keeping a fixed order only when it aids legibility (ordinal scales, sequential, long alphabetical; "Other"/opt-out always last). For **demographics**, don't author them as survey questions — attach the platform demographic **user-fields as the survey's last page** by setting the survey permission's `user_fields_in_form: true` (see `references/project-config.md`).
- For `ideation` phases, select the input **view(s)** — List / Map / Perspectives — using the decision table in §2b, and populate `view_config` on the phase. List needs no extra config; if you pick **Map** or **Perspectives**, **read `references/ideation-views.md`** and apply it (Map → set the form location field + populate project-level `map_config`, looking the tenant's coordinates up online when no default exists; Perspectives → set `perspectives_config` and add the auto-tagging steps to the GSM report).
- For `voting` phases, **read `references/voting-methods.md`**: infer the voting method from the intake — **Approval** (one vote per option / clear winner), **Cumulative** (multiple votes per option / strength of preference), or **Budget allocation** (costed options + a fixed pot / participatory budgeting) — and populate `voting_config`. Remember **voting options are ideas added by the admin *after* the upstream phase**, so a new draft only sets the phase title, description, and voting config (no options yet). Flag this for the GSM, and never invent options or monetary amounts.
- For `proposals` phases, **read `references/proposals.md`**: it's ideation + a threshold, so use the **minimal ideation form** plus set `reacting_threshold` (votes per proposal, **scaled to the tenant's population** — under 500 for a small municipality, 1,200–2,500 for a large city), `expire_days_limit` (default 90), and `input_term` (`proposal` / `petition` / `initiative` to match the intake). Base the threshold on population; if unknown, look it up or flag for the GSM.
- For `common_ground` phases, **read `references/common-ground.md`**: residents react agree/unsure/disagree to short trade-off statements. Place it **after** an ideation/survey phase to converge the community. Set the phase config, but **don't author the final statements** — they're added by the admin (usually AI-generated from the upstream phase via Sensemaking, ~25 trade-off statements ≤120 chars); flag this and surface the prompt for the GSM.

Generate the project-level fields:
- Project title (derived from intake nickname, in the chosen tone)
- Project description (≤1500 chars, **structured for readability with light emoji** per §6 rules 7–8, answering: why, what's up for influence, how input is used)
- Imagery — populate the `imagery` block per §4 (from intake refs, or a flagged fallback). Never leave it blank.
- Events — if the intake signals in-person/live gatherings (info sessions, talks, workshops, open days, launch/closing events), populate the `events` block per §4 as a **project-level module, not a phase**. Use `[date — to confirm]` / `[location — to confirm]` for unknowns. Omit if none signalled; never invent events.
- **Project-level configuration** — set **access rights** (`permitted_by` per action), **demographic user-fields**, **visibility/listing**, and content metadata (header alt text, description preview, areas/topics) per `references/project-config.md`. Defaults: `permitted_by: users`, `visible_to: public`, minimal required demographics; go `verified`/`groups` only for binding/statutory or a restricted audience. Match `languages` to the tenant locale (e.g. `nl-BE`).

### Step 6 — Prepare the GSM decision report
Use §7 (Output format). Produce the report with the 6 sections (summary, link, decisions + why, things to review, things missing + why, reference projects). Use §8 (Exemplars) to pick 2–3 reference projects.

### Step 7 — Build the project on the platform
Call the Go Vocal MCP tools in the order in "Where the result goes" (`create_phase` → `update_project_layout` → `replace_form_fields` → `create_event` → `update_project` → `update_phase_permission`), realizing the §7 payload. The project is created as a **draft** (`publication_status: draft`) — never publish it. If a core tool (phases / page / survey) fails, stop and report; if a best-effort tool (events / visibility / access) fails, record the error and carry on so the GSM still gets a usable draft. If 2 variants, build each as its own draft project.

### Step 8 — Recap to the GSM
A 4–6 line message: archetype, recipe (or variant pair), duration, and a link to the draft project. End with the 1–2 most important items from "Things to review," and remind the GSM it's a draft awaiting their review and publish.

---

## Operating principles

1. **Cite the intake.** Every decision in the report must cite the intake field that drove it. Never make a call "because." Always "because intake said X."
2. **Surface uncertainty.** If an intake field is vague (check `Probes triggered` and `Open flags for review`), name it in the report under "Things missing."
3. **Build, don't publish.** You push the project to the platform, but always as a **draft** (`publication_status: draft`). Publishing is the GSM's call after review — never publish, and never flip a project live.
4. **Self-eval against the scoring rubric.** Before building the draft, predict the Project Library score for each dimension. If any predicted score < 4, flag it in the report and explain why.
5. **Plain language in the project content.** Internal jargon (archetype, recipe, statutory dimension) stays inside the skill — the project description that lands on the platform must be plain, resident-friendly. 
6. **Never invent facts about the consultation itself, or about residents' views.** If the intake didn't say it, you don't assert it as the client's intent, scope, or what locals think/want. Leave such fields blank and flag in "Things missing." Verifiable, public context about *named places, plans, or budgets* may be added to enrich the description — but only via the Local grounding pass (§6), provenance-tagged for GSM review. Web texture never substitutes for missing substance.

---

## What you do NOT do

- Do not publish the project — build it as a draft and leave publishing to the GSM.
- Do not modify the captured intake.
- Do not skip the GSM decision report.
- Do not invent recipes outside the empirical table without flagging it as an experiment.

---

# §1 — Archetypes (taxonomy and classification)

Every project belongs to **one** of five mutually-exclusive archetypes. Statutory consultation is **not** an archetype — it's a dimension applied on top (see §3).

## The five archetypes

| # | Archetype | What the client is trying to do | IAP2 closest | Influence ceiling | Canonical recipe |
|---|---|---|---|---|---|
| 1 | **Information & transparency** | Communicate about a project or decision | Inform | 1–2 | Single information phase |
| 2 | **Issue identification & agenda-setting** | "What matters? What should we work on?" | Consult / Involve | 2–4 | Ideation → information, OR `proposals` (continual) |
| 3 | **Co-creation & design** | Shape a specific proposal, plan, or site | Involve / Collaborate | 3–4 | Iterative ideation → information |
| 4 | **Devolved decision-making** | Citizens make the final call (PB, voting between options) | Empower | 4–5 | Ideation → voting → information |
| 5 | **Community engagement** | Identity, celebration, social cohesion | Spans the spectrum | Variable | Open ideation / showcase |

## How to classify

Use the intake fields in this order of weight:

1. **Driver (`Driver - what & why now`)** — what is the client trying to achieve?
2. **Proposal fixedness (`Proposal fixedness`)** — fixed / mostly fixed / early-stage / fully open
3. **Real influence level (`Real influence level`)** — Inform / Consult / Involve / Collaborate / Empower

### Quick-match rules

- Driver mentions "inform residents," "communicate the decision," "make sure people know" + Influence = Inform → **Information & transparency**
- Driver mentions "what should we prioritize," "what matters," "where should funds go," no fixed proposal → **Issue identification & agenda-setting**
- Driver mentions "shape the plan," "co-design," "design the site/space," Fixedness = early-stage or mostly fixed → **Co-creation & design**
- Driver mentions "vote," "citizens decide," "PB," "allocate budget," Influence = Empower → **Devolved decision-making**
- Driver mentions "celebrate," "identity," "festival," "anniversary," "community cohesion" → **Community engagement**

## Tiebreakers for ambiguous cases

### The failure test
"What would make the client say this project failed?"
- "We missed the legal deadline / the response document was inadequate" → statutory floor matters (apply modifier, archetype is still about purpose)
- "We ran a beautiful process but the plan didn't change" → Co-creation
- "We still don't know what residents care about" → Issue identification
- "Attendance was flat / no community energy" → Community engagement
- "Citizens didn't get to vote / the budget was decided behind closed doors" → Devolved

### The decision-landing rule (for sequential projects)
If the project contains phases pointing at different objectives (e.g. ideation → vote), the archetype is **whichever one the binding decision lands in**. Ideation that feeds a vote → archetype is Devolved.

### The community-engagement stickiness rule
When "celebrate / connect / identity / anniversary" appears in the driver, default to Community engagement even if other objectives are also mentioned. Nest the secondary objective as a phase, don't make it the spine.

## Common ambiguous combinations and how to resolve them

| Looks like | Real archetype | Why |
|---|---|---|
| Statutory consultation on master plan with "more than tick-box" ambition | Co-creation (+ statutory: true) | Purpose is co-creation; statutory is the legal frame |
| Anniversary festival that also asks for cultural-strategy input | Community engagement | Failure = flat attendance, not bad strategy data |
| PB-style "suggest then vote" budget allocation | Devolved | The binding vote is the spine |
| Statutory consultation on a fixed bin-collection schedule with no real input | Information & transparency (+ statutory: true) | Nothing is up for influence; calling it consultation is misleading |
| "Continual" residents-can-submit-proposals platform | Issue identification (use `proposals` method) | Ongoing agenda-setting, not a one-off project |

## Output of this step

Record in the draft row:
- `archetype` (one of the 5)
- `archetype_justification` — one sentence citing the intake fields used
- `archetype_alternatives_considered` — if ambiguous, list the runner-up and why it lost

---

# §2 — Recipes (empirical lookup by archetype)

Recipes are ordered phase patterns. They come from analyzing ~13,500 finished/archived projects in `cl2_library` (Project Library scoring 1–5 across Participation, Process, Influence, Feedback).

## Cross-cutting findings (apply to every archetype)

1. **Always close with an information phase.** The closing info phase reliably adds ~1 point on Feedback. Never produce a draft without one.
2. **Single-phase projects underperform.** ~4,000 projects use a single phase and score in the 2–3 range. Refuse to draft single-phase projects unless the archetype is Information & transparency.
3. **3 phases is the sweet spot for Process Design.** 1–2 lack context; 4+ add complexity without consistent uplift.
4. **Don't prepend a redundant leading information phase.** The bookend (`info → engagement → info`) shows up in high-scoring recipes, but the *leading* info phase only earns its place when there is genuinely separate context to stage before people can take part. In most projects the **project description already carries the why / what's-open / how-input-is-used framing** (Process Design rule 1), so a standalone leading info phase just adds a click in front of the thing residents came to do. **Default: start directly with the engagement phase (`ideation` / `native_survey`).** If extra context is genuinely needed beyond the project description, prefer (a) a short blurb in the engagement phase's own description, or (b) an **intro page** at the top of the input form — form pages are ideal for intro blurbs — rather than a separate phase. The **trailing/closing** information phase is different: keep it always (finding #1) — that's where the Feedback uplift actually comes from. Only lead with an info phase when the intake calls for staging substantial material first (e.g. a statutory document to read, a complex plan to present before input opens).
5. **Breadth vs. depth lever.** `native_survey` reaches more people (~270 avg); `ideation` enables higher Influence but smaller crowds (~110 avg). Pick based on the intake's `Output success` and audience size.

## Recipes by archetype

### Information & transparency
- **Default:** Single information phase
- **Avg scores:** Part 2.83, Process 3.30, Infl 2.03, Feed 2.22 (n=1,197)
- **Structural ceiling:** ~2.5 total. Accept this — don't over-engineer.

### Issue identification & agenda-setting
- **Default (one-off):** `ideation → information`
- **Default (continual):** `proposals` method (n=102, Avg Influence 4.00 — small sample but powerful)
- When the brief suggests an ongoing input mechanism, or mentions **petitions / initiatives / threshold-based backing**, prefer `proposals` over a one-off ideation phase. Configure the vote threshold (by population), expiry, and input term per `references/proposals.md`.

### Co-creation & design (ideation-led)

| Recipe | n | Part | Process | Infl | Feed | Avg participants |
|---|---|---|---|---|---|---|
| **`ideation → ideation → information`** ✅ recommended | 55 | **4.22** | **4.18** | **3.64** | **3.82** | 111 |
| `ideation → information → information` | 507 | 3.65 | 3.74 | 3.31 | 3.22 | 44 |
| `ideation → ideation → ideation → ideation` | 58 | **4.54** | 3.75 | 3.83 | 3.42 | 236 |
| `ideation → information → ideation → information → information` | 55 | 4.14 | 4.25 | 3.75 | 3.75 | 154 |
| `ideation` (alone) ❌ anti-pattern | **2,050** | 2.30 | 3.53 | 3.17 | **2.37** | 36 |

**Reads:**
- Iterative ideation (2+ phases) beats single ideation across Process and Feedback.
- Ideation-alone is the biggest anti-pattern in the library (~15% of all projects).
- Interleaved info between ideation rounds (5-phase variant) raises Process and Influence — use when the GSM brief emphasizes "input visibly shaped the next round."

### Devolved decision-making

| Recipe | n | Part | Process | Infl | Feed | Avg participants |
|---|---|---|---|---|---|---|
| **`ideation → voting → information`** ✅ recommended (canonical PB) | 25 | **4.35** | 3.90 | **4.29** | 3.57 | 217 |
| `voting → information → information` | 70 | 4.30 | 3.94 | 4.14 | 3.04 | 176 |
| `voting → information` | 37 | 4.25 | 3.87 | 4.20 | 3.17 | 153 |
| `ideation → information → voting → information` | 23 | 4.00 | **4.33** | 4.11 | 3.56 | **371** |
| `ideation → ideation → voting → ideation` (Influence-max) | 15 | 3.00 | 4.33 | **5.00** | 4.00 | 77 |
| `voting` (alone) ❌ anti-pattern | 80 | 2.97 | 3.26 | 3.98 | **2.10** | 221 |

**Reads:**
- 4-phase `ideation → information → voting → information` reaches the biggest crowds (avg 371). Use when budget is big and stakes are public.
- Influence-max variant scores Influence 5.00 but participation drops — use when intake emphasizes deep co-design over reach.

### Community engagement
- **n=521**, Avg Part 3.49, Process 3.52, Infl 3.21, Feed **2.60**
- **Weak spot: Feedback.** Community projects rarely close the loop.
- **Easy skill win:** enforce a results/showcase phase even for fun/light projects.

## Method selection: native_survey vs. ideation

When the archetype recipe says "ideation," check intake `Output success` and audience size:
- "Reach 200+ residents" / "5% of community" / large audience → consider swapping in `native_survey`
- "30 actionable ideas" / "co-design with neighborhood committee" / smaller audience → keep `ideation`
- **Spatial ask** (driver is about *places* — walls, sites, locations, routes, problem spots) → the engagement phase MUST capture location, not just text. Use an `ideation` phase with a **location field** (drop-a-point submissions), and consider a `native_survey` with **spatial question types** as a second variant (see §2b and §5). A plain "where is it?" text question is a defect for spatial asks.

Document the trade-off in the GSM decision report when swapping.

---

# §2b — Platform capabilities (methods, form fields, question types)

Before drafting, ground every phase in what the Go Vocal platform can actually be configured to do. Do not invent methods or field types. When you need the precise field identifiers, parameter names, or response shapes, consult the **`govocal-api`** skill and its `references/endpoints.md` (note: that skill is extraction-focused — it documents `custom_field_values` and the data model, but the configuration vocabulary below is the canonical list to draft against).

## Methods (phase types)
- `information` — static content / updates. No input collected.
- `ideation` — open submissions ("ideas") that others can view, comment on, and react to. Each submission runs through a **submission form** (see fields below). Submitted inputs can be displayed in three **views** — **List** (default scrollable feed), **Map** (inputs as pins; requires a location field on the form), or **Perspectives** (AI clusters inputs into topics/subtopics — for high-volume processes). The view choice drives extra configuration — pick it with the rule just below and apply `references/ideation-views.md` for Map / Perspectives.
- `native_survey` — a structured questionnaire. Supports the widest range of **question types**, including spatial ones. A survey normally sits on the timeline, but can also run **standalone (in parallel)** with the timeline as a **spotlight survey** — use it to run concurrent surveys for different stakeholders, or to offer residents an either/or choice of participation. Setup (the `placement_type: standalone` rule + the required Spotlight-surveys page widget) → `references/survey-design.md`.
- `voting` — allocate votes/budget across pre-defined options (baskets). Three methods, inferred from the intake: **Approval** (one vote per option — clear winner), **Cumulative** (multiple votes/tokens per option — strength of preference), **Budget allocation** (each option has a cost, residents spend a fixed pot — participatory budgeting). Choosing and configuring a voting phase → `references/voting-methods.md`.
- `proposals` — **petition-style** method: continual, citizen-initiated submissions that others **back with up-votes**; a proposal that reaches a **vote threshold** within an expiry window advances. It's **ideation + a threshold** (inherits the minimal ideation form). Use when the intake mentions petitions / initiatives / threshold-based backing. Configuring it (threshold by population, expiry, input term) → `references/proposals.md`.
- `common_ground` — residents react **agree / unsure / disagree** to short **trade-off statements** (like voting, but on statements); surfaces consensus vs. division and is very sticky (~80% completion). Best placed **after** an ideation or survey phase to converge the community. Configuring it (statements, sequencing, reactions) → `references/common-ground.md`.

## Project-level modules (not methods)

Some platform features attach to the **project**, not to a phase. They run *alongside* the phase timeline rather than being a step in it. Never model them as phases or fold them into a recipe.

- **Events** — scheduled in-person (or live online) gatherings: info sessions, a series of talks, workshops, co-design sessions, open days, town-halls, launch or closing events, exhibitions. In the data model an event is linked at the **project level** and carries a title, date/time, location, and optional registration. Events show on the project's events tab independently of the phase sequence. An event can *feed* a phase — e.g. ideas raised at a workshop are entered as `ideation` submissions, often via paper forms auto-imported through FormSync (see offline participation below) — but it is **not itself a phase**.

Resolve project-level modules in Step 5, alongside imagery (see §4 — Events).

## Ideation submission-form fields
**Default to a minimal form.** An ideation form *can* hold many of the same field types as a survey, but for project creation the skill keeps it lean to lower the barrier to submitting an idea. Default to **Title + Description + (optional) Image**, and add nothing else unless the intake nudges for it (location, a category select, one structured attribute). Full rule in `references/ideation-views.md` ("Input form — default to minimal").

Available fields (use beyond the default three only on an intake nudge):
- Title, description (rich text) — the default
- Image / file upload (`image_files`) — optional; include when a photo helps (see §4 Imagery)
- **Location field** (`point`) — submitter drops a point on a map. **Add whenever the idea is inherently about a place** (a wall, a site, a bench, a problem spot); this is the same signal that selects Map view (§ ideation views).
- Topic / category tags, or a single/multi-select — only if the intake wants ideas categorised/filterable
- Other custom fields (short/long text, select, number) — only when the intake explicitly needs that structured attribute

## Ideation input views (List / Map / Perspectives)

Every `ideation` phase needs a **view** for how submitted inputs are shown to residents. List is the default and needs no extra config; Map and Perspectives carry extra setup that lives in **`references/ideation-views.md`** — read that file when you pick either.

| Signal in the intake | View | Extra config |
|---|---|---|
| **Smaller** ideation consultation; non-spatial | **List** | none — just the form |
| **Spatial ask** — residents drop a pin on the map to show *where* (e.g. "where would you like to see more greenery / a bench / a crossing?") | **Map** | location field on the form + project-level `map_config` (centre/zoom; look the tenant's coordinates up online **only if no default is already set** — never override an existing one) |
| **Larger-scale** consultation — **>50 inputs expected** | **Perspectives** | AI auto-tagging setup (clear default tags, enable auto-tagging, remove the Tags question from the form) |

- Views are independent toggles — List stays on, and a large-scale spatial ask can enable Map **and** Perspectives. Pick a `primary_view` by the dominant need.
- **Map ⟺ location field**: enabling Map without a form location field (or vice-versa) is a defect — flag it.
- **Volume threshold for Perspectives is ~50 inputs.** Below that, List is fine; above it, the AI topic clustering earns its keep.
- When the expected volume is genuinely unclear, default to List and flag for the GSM rather than over-configuring Perspectives.
- Decision logic and payload detail (map coordinate lookup, perspectives back-office steps) → `references/ideation-views.md`.

## Survey (`native_survey`) question types
Surveys support a **wide palette** of question types — far more than short-answer/single-choice. **Don't default to simple types**: pick each question from the insight you're after and the respondent experience. Full catalogue + UX-driven selection guidance live in **`references/survey-design.md`** — read it when drafting any `native_survey` phase.
- Standard: short / long answer, single-choice, multiple-choice, **image choice**, **linear scale**, **rating** (stars), **sentiment scale** (emoji), **matrix**, **ranking**, number, file upload
- **Spatial question types** — respondent interacts with a map:
  - **Point** — drop one or more pins (e.g. "Mark walls that could use a mural")
  - **Line** — draw a route
  - **Area / polygon** — outline a zone
- Spatial answers can be followed by **per-pin follow-up questions** (e.g. for each pin: "Why this spot?", "City-owned or private?"). This is the key reason to consider a survey variant when a spatial ask also has several structured follow-ups — it captures geometry *and* structured attributes per location in one flow.

## Drafting implication
- Spatial ask + want depth/discussion, smaller crowd → `ideation` with a **location field** (people see and debate each other's pins).
- Spatial ask + several structured follow-ups + want breadth → `native_survey` with a **point** question + per-pin follow-ups. This pairing is a standard Variant A / Variant B contrast (see §5).

## Offline participation (paper forms via FormSync)

Any `ideation` submission form or `native_survey` questionnaire can also be completed **on paper** — online and offline responses live side by side in the same phase. Handwritten responses are scanned back in and auto-imported via the **Form parser (FormSync)** feature, landing as normal submissions. There are **two ways to gather the paper input**, and the draft should suggest whichever fits the method and audience:

- **The official printed form.** In the back office an admin downloads a PDF of that phase's ideation form / survey, prints copies, and makes them available in person. This is the cleanest round-trip through FormSync (question lettering and lettered options are laid out for the parser).
- **Improvised paper.** Post-it notes, postcards, comment cards, a workshop flip-chart, a stall at the market. Handwritten responses gathered any of these ways can be entered into the same phase via FormSync — the generated PDF is **not** required to run an offline moment.

This is **best practice and actively encouraged** — it reaches residents who can't or won't participate online and widens real reach. Treat it as a default to surface, not an afterthought.

- **Applies to `ideation` and `native_survey` phases only.** `information` and `voting` phases collect no form responses, so no paper option.
- **Drafting consequence:** whenever a drafted recipe contains an `ideation` or `native_survey` phase, add the offline-participation nudge to that phase's description (see §6, Process Design rule 9) and, in the GSM report, suggest a concrete offline route — download the PDF form *or* gather on improvised paper (post-its / postcards / cards) — with the pickup location for GSM confirmation (see §7 #4).

---

# §3 — Statutory modifier (a dimension, not an archetype)

Statutory consultation is a legal regime under which a project runs, not a purpose. A project under statutory rules still has one of the 5 archetypes. The statutory dimension modifies *how* the recipe runs — not *what* the project is for.

## When to set `statutory: true`

Check intake `Compliance requirements`. Set true if any of:
- Mentions a named legal instrument (`enquête publique`, `openbaar onderzoek`, `Bürgerbeteiligung`, `planning application consultation`, etc.)
- Mentions a regulatory body requiring input (planning authority, regional government, statutory consultee)
- Mentions a minimum duration set by law
- Mentions a required response document or evidence-of-consideration obligation

Also check `Open flags for review` — the intake skill sometimes flags this without surfacing it as an explicit answer.

## If `statutory: true` → read the handling reference

The fields to capture, the statutory recipe lookup, the recipe overlay, the worked examples, and the influence ceiling all live in **`references/statutory.md`**. Read that file now, before Step 3, and apply it. If `statutory: false`, skip the reference entirely — nothing else in this section applies.

---

# §4 — Duration, form length, and tone

Defaults by archetype. Override only when the intake specifies otherwise.

## Project duration

| Archetype | Default duration |
|---|---|
| Information & transparency | 2–4 weeks |
| Issue identification & agenda-setting | 4–8 weeks |
| Co-creation & design | 6–12 weeks |
| Devolved decision-making | 8–12 weeks |
| Community engagement | 6–12 weeks |

**Statutory modifier:** if `statutory: true`, minimum duration is `minimum_duration_days` (typically 30–60 days). If archetype default is shorter than the legal floor, take the floor.

**Intake overrides:**
- If `Hard deadline` is specified, work backwards from that date. If the resulting window is shorter than the archetype default, flag in "Things to review" with projected impact on Participation score.
- If `Hard deadline` window is wider, distribute the slack across phases (lengthen ideation/survey phases, not info phases).

## Form length (for `native_survey` or `ideation` phases)

| Archetype | Default form length |
|---|---|
| Information & transparency | 0–2 quick questions |
| Issue identification | 3–5 open-ended prioritized |
| Co-creation & design | 6–10 mixed qual + quant |
| Devolved decision-making | 2–5 (most input is votes/ideas) |
| Community engagement | 1–3 simple choices |

**Statutory modifier:** if `statutory: true`, default to 8–15 structured questions on the pinned formal-input phase.

**Adjustments:**
- Small audience (< 500) or low-engagement context → adjust down ~30%.
- Wide audience (> 5,000) or high public interest → can support the upper end.

## Tone of voice

Priority order:
1. **Intake `Tone direction`** — if not "Auto", use directly.
2. **Tenant scan (Auto)** — scan tenant homepage + 2–3 project pages to infer formal vs warm, bureaucratic vs conversational, "we" vs "the council." For v1, if scraping isn't wired in, default per archetype and flag for GSM review.
3. **Archetype default** (fallback):
   - Information & transparency → institutional / formal
   - Issue identification → warm / inviting
   - Co-creation & design → warm / collaborative
   - Devolved → confident / civic
   - Community engagement → celebratory / inviting

**Intake override:** `Tone direction` always wins.

## Imagery (required output — never silently omit)

Every draft MUST resolve imagery and MUST report what it did. Imagery is not optional and not skippable: the payload carries an `imagery` block and the GSM report's "Things missing / to review" MUST state the imagery status in every run. If you cannot point to an imagery decision in your output, the draft is incomplete.

**When intake `Local imagery references` provides specific photos / places / visuals:** use them directly. Record them in the payload `imagery` block. No flag needed.

**When intake `Local imagery references` is empty:**
- Do NOT leave imagery blank.
- Avoid generic stock photography ("people in a meeting").
- Default to symbolic / abstract over generic literal.
- Propose concrete fallback search terms: topic + tenant-country (e.g. Unsplash / creative-commons "street art mural Flanders").
- Record the fallback in the payload `imagery` block with `source: "fallback"`.
- **Always flag in the GSM report:** "Local imagery would meaningfully improve this project — recommend asking the client for 1–2 photos of the actual site/subject."

**Payload:** populate `project.imagery` (see §7 schema) with `{ source: "intake" | "fallback", header_image, suggested_search_terms, notes }`. A draft with no `imagery` block fails self-eval.

## Events (project-level module — attach when the intake signals in-person gatherings)

Events are **not** a phase, method, or recipe step (see §2b). They are a separate module linked at the **project level** in the data model. Resolve them in Step 5, alongside imagery — optional, attached only when signalled.

**When to attach.** Scan the intake — especially `Driver - what & why now`, `In and out of scope`, and `Process success` — for any live gathering the client intends to run: an info session, a series of talks, workshops, co-design sessions, an open day, a town-hall, a launch or closing event, an exhibition. If one is signalled, populate the payload `events` block. If none is signalled, omit it — **never invent events the client didn't ask for** (principle #6).

**Module, not phase — the call to get right.** A phase is an online participation method on the timeline (submit / vote / read). An event is a real gathering on a date. They coexist: a workshop (event) can feed an `ideation` phase, and paper forms collected there auto-import via FormSync (§2b). Do **not** turn "we'll run three workshops" into three `ideation` phases — keep the recipe intact and attach the workshops as events. If an event is clearly meant to gather structured input, attach it as an event *and* point it at the phase it feeds via `feeds_phase`.

**Facts you almost never have — never invent them.** Exact date, time, and venue are rarely in the intake. Use clearly-marked placeholders (`[date — to confirm]`, `[location — to confirm]`), exactly as with paper-form locations (§6 rule 9, principle #6). Never invent a real venue or date.

**Payload:** populate `project.events` (see §7 schema) — a list of `{ title, type, date, location, registration_required, description, feeds_phase }`. Surface every placeholder in the GSM report "Things to review" (§7 #4) for the GSM to confirm before publish.

---

# §5 — Variant rules (when to draft 1 vs 2)

**Default: single draft.** Generate 2 variants only when ≥2 of these triggers apply:

| Trigger | Source in intake | What it looks like |
|---|---|---|
| **High-stakes** | `Risks and sensitivities`, `Open flags for review` | Political sensitivity flagged, prior project flopped, unusually large or small audience |
| **Novel** | Cross-check archetype × topic against §8 exemplars | Archetype + topic combination is rare or absent in high-scoring exemplars |
| **Strategic ambiguity** | `Proposal fixedness` | Fixedness = "mostly fixed" or "early-stage" |
| **GSM override** | Explicit ask | "Give me two options," "client pitch coming up," etc. |
| **Influence mismatch** | `Real influence level` vs participation-excellence principles | Client requests minimal influence but principles call for more — show both shapes |
| **Spatial ask** | `Driver - what & why now` + `Output success` | Driver is about places (walls, sites, routes) AND there are multiple structured follow-ups per place — offer an ideation+location variant and a map-survey variant |

**Spatial exception to the ≥2 rule:** if the **Spatial ask** trigger fires *and* the intake has multiple structured follow-up questions, draft 2 variants even if it is the only trigger met — the ideation-with-location vs. map-survey contrast is genuinely structural, not cosmetic.

## How to pick a meaningful second variant

The two variants must be **structurally different** — not the same recipe with one swap. Contrast axes:

| Axis | Variant A example | Variant B example |
|---|---|---|
| **Method-led** | Ideation-led: `ideation → ideation → information` (depth, smaller crowd) | Survey-led: `information → native_survey → information` (reach, larger crowd) |
| **Phase count** | 3-phase canonical | 5-phase iterative interleave |
| **Influence intensity** | Standard recipe | Influence-max variant (e.g. `ideation → ideation → voting → ideation` for Devolved) |
| **Audience strategy** | One channel for all | Bookended info phases + targeted engagement phase |
| **Spatial input** | `ideation` with a location field — people see and debate each other's pins (depth, discussion) | `native_survey` with a point question + per-pin follow-ups — captures geometry plus structured attributes (breadth, cleaner data) |

## What NOT to do

- Variant A = canonical and variant B = canonical-with-minor-tweak. Not a real choice.
- Two variants with the same recipe shape. Defeats the point.
- More than 2 variants. Run the skill again with different framing if more options are needed.

## Cross-linking variants

When 2 variants are written, populate `Linked variant` on each row pointing at the other. In the GSM decision report, include a one-line "how they differ" summary at the top:

> *"Variant A: iterative ideation focus, smaller crowd (~100), Influence ~3.6"*
> *"Variant B: structured survey-led for breadth, larger crowd (~280), Influence ~3.0"*

---

# §6 — Project Library scoring rubric (drafting rules to hit 5)

The skill drafts against the Project Library scoring framework. Predict each dimension before writing the draft; flag any predicted < 4.

## The four dimensions

- **Participation** (1–5) — actual participant numbers vs. audience size
- **Process Design** (1–5) — clarity of process and purpose in project + phase descriptions
- **Influence** (1–5) — degree to which input shapes outcomes
- **Feedback** (1–5) — whether and how participants hear back

Three of the four (Process / Influence / Feedback) are graded **purely from project text** — what gets drafted determines the score.

## Process Design — drafting rules to hit 5

1. **Project description must answer three questions explicitly:**
   - **Why** is this happening?
   - **What** is up for influence and what is not?
   - **How** will input be used?

2. **Each phase description must explain:**
   - What participants are being asked to do *in this phase specifically*
   - How this phase contributes to the overall purpose

3. **Use plain, non-bureaucratic language.** Apply the tone selected in §4.

4. **Include where useful:** stakeholder groups impacted, who's analyzing results, who's deciding and when, when results will be public, scope in/out.

5. **Don't pad with marketing fluff.** Score rewards clarity, not length.

6. **Length target:** Project description ≤1500 characters. Each phase description 200–500 characters.

7. **Structure the project description for readability.** Don't write one dense block. Use short, scannable labelled sections so a resident can find what they care about — e.g. a one-line hook, then **Why this matters**, **What you can shape** (and what's already decided), **What happens with your input**, **Timeline**. Keep sentences short.

8. **Light, purposeful emoji.** At most a few, only where one helps guide attention to a section (e.g. a single marker before a heading like "Timeline" or "What you can shape"). Never decorative, never more than one per section, never in formal/institutional-tone projects. When in doubt, leave them out.
   - **This applies to form answer options too.** A single leading emoji on a *concrete, iconic* answer option aids scannability and makes a survey feel a little more human — e.g. 🌳 Greenery and trees, 🚲 Separated cycling space, 🚶 Wider walking space, 🪑 A small green seating area, 🗑️ Waste and recycling, 🚚 Delivery and loading. Use them on `select` / `multiselect` / `multiselect_image` / `ranking` / `matrix` options and rows where each option maps cleanly to a recognisable icon. Rules: **one emoji per option, leading the label, applied consistently across all options in a question** (don't emoji half of them), skip options that have no obvious icon, and skip entirely for formal/institutional-tone projects. Scale labels (`linear_scale` / `sentiment_linear_scale`) and open-text questions don't take option emojis. See `references/survey-design.md`.

9. **Offline-participation nudge on `ideation` / `native_survey` phases.** Whenever a phase is `ideation` or `native_survey`, add one short line to that phase's description inviting in-person participation on paper (paper forms are auto-imported via FormSync — see §2b). This is best practice and should appear by default, not on request.
   - Phrase it in the project's tone, plain and welcoming, e.g. *"Prefer pen and paper? Paper forms will be available at [location] for anyone who'd rather take part in person."*
   - **Location is a fact you almost never have from the intake.** Use a clearly-marked placeholder like `[location — to confirm]`; never invent a real venue (same rule as principle #6). Flag it for the GSM in §7 #4.
   - **Also suggest a concrete offline route to the GSM** (not just the resident-facing line): either print the phase's downloadable PDF form, or gather responses on improvised paper — post-its, postcards, comment cards, workshop sheets — and import them via FormSync (§2b). Pick what fits the method and audience; both land in the same phase.
   - Only `ideation` and `native_survey` phases get this line — `information` and `voting` phases collect no form responses.

## Local grounding pass (optional, guardrailed)

A description that names the actual square, the real plan, the right neighbourhood reads like a local wrote it. A description full of *invented* local detail reads like a fraud to the one audience that matters — and a real resident spots it instantly. This pass exists to get the first without risking the second.

**When to run it.** Optional, before writing the project description. Run it when the intake is *thin on specifics* (check `Audience distinctiveness`, `Driver - what & why now`, and any attachment). Skip it when the intake is already specific and local. Even when the intake is thin, the *higher-quality* fix is to send the client 2–3 probing questions (flag in "Things missing", §7 #5) — web grounding is a fallback texture pass, never a replacement for asking the client, who is the real local expert.

**What it may add — texture only.** 1–2 web searches to confirm *verifiable, public* facts about the consultation's subject:
- Correct proper nouns: the official name of the square / park / street / district, the formal title of the plan or budget, the tenant municipality's correct name and spelling.
- Public, checkable facts directly about the subject (e.g. "the library is a 2019 building", "the budget is part of the city's 2030 mobility plan") — only if a reputable source states it plainly.

**What it must NEVER do — two hard stops:**
1. **Never fabricate resident sentiment.** No "locals have long cherished…", "the community has always wanted…", "residents are frustrated by…". You cannot know this from a search, and asserting it is the highest-embarrassment failure mode.
2. **Never add substance.** The *why*, *what's up for influence*, and *how input is used* come **only** from the intake. A nice web detail must never paper over a thin intake — if substance is missing, it stays flagged in "Things missing", grounding pass or not.

**Provenance is mandatory.** Every fact pulled from the web is tagged and surfaced in the GSM report under "Things to review" (§7 #4) with its source link and a "verify before publish" note. The GSM — the actual local — signs off before anything lands. If you cannot find a reputable source for a detail, drop it; do not guess.

**Honest note on scoring.** This pass does **not** move the Process / Influence / Feedback rubric — those reward clarity of why/what/how, not local colour. Its payoff is resident trust and (indirectly) Participation. Keep it light; do not over-invest, and do not let it tip the description into marketing fluff (rule 5).

## Influence — drafting rules

- Use language matching the actual IAP2 level from intake `Real influence level`. Do not overstate.
- Be specific about the next step: "Council will vote on X at the May meeting" — not "input will be taken into account."
- If `Branching scenarios` was captured, name them: "If a majority prefers A, next step is X; if B, next step is Y."

### Influence ceiling by archetype

| Archetype | Realistic ceiling |
|---|---|
| Information & transparency | 1–2 |
| Issue identification & agenda-setting | 2–4 |
| Co-creation & design | 3–4 |
| Devolved decision-making | 4–5 |
| Community engagement | Variable |
| (Statutory channel alone) | ~3.0 |

Predict honestly; don't inflate.

## Feedback — drafting rules

- **Always include a closing information phase** (#1 highest-leverage move per §2).
- The closing phase description must commit to:
  - What participants will hear back (summary of input / how it shaped the decision / final outcome + reasoning)
  - When (specific timing — "within 2 weeks of close" or "at the September council meeting")
- Use `What participants hear back` and `Feedback timing commitment` from intake. If both blank, flag in "Things missing" and use conservative defaults.

## Participation — drafting rules

Participation is mostly driven by recipe choice and tenant context, not text. Still:
- Pick the recipe whose empirical avg-participants matches the intake `Output success` reach target.
- For wide reach, prefer recipes with leading info phases (e.g. `information → native_survey → information` averages 509 participants).
- Predict participant range based on chosen recipe; flag if intake success target is incompatible.

## Form design — pre-launch bias checklist

> Scorers read project + phase descriptions but NOT the form questions inside the phases. A well-described project can still score 4–5 while asking biased or poorly worded questions. **This skill fills that gap directly.**

Run every generated question through this checklist before returning the draft. Flag failures.

| Bias / issue | What it looks like | How to fix |
|---|---|---|
| **Leading question** | "Don't you agree that…?", "How much do you support our excellent new policy?" | Reframe as neutral. |
| **Double-barreled** | "Do you support adding bike lanes AND reducing car parking?" | Split into two separate questions. |
| **Loaded language** | Emotionally charged words ("dangerous", "wasteful", "world-class") | Use neutral terminology. |
| **Acquiescence bias** | Phrasing that makes "yes" the easy answer | Balance framing or split into pro/con prompts. |
| **Jargon / acronyms** | Internal council terminology, undefined acronyms | Plain-language equivalents. |
| **False dichotomy** | Forces yes/no when middle ground exists | Add neutral / "don't know" / open-ended option. |
| **Demographic-prime** | Demographic questions first → response bias | Demographics at the end, optional. |

For any flag, auto-rewrite or pass to the GSM in "Things to review" with the bias label per question.

## Self-eval before saving

Before building the draft, predict scores:

| Dimension | Predicted score | Confidence (H/M/L) | If < 4: why |
|---|---|---|---|
| Participation | _ | _ | _ |
| Process Design | _ | _ | _ |
| Influence | _ | _ | _ |
| Feedback | _ | _ | _ |

Include this table in the GSM decision report.

---

# §7 — Output format (what you push + the GSM decision report)

## Draft attributes (record these in the report)

These are the key decisions behind the draft. Set the ones that are real project fields (title, visibility, …) via the tools, and summarise all of them in the GSM decision report so the human reviewer can see what was chosen. They are notes for the reviewer, not a separate database record.

| Attribute | Type | Notes |
|---|---|---|
| `Title` | title | From intake `Project nickname` (or generated if blank); set on the project via `update_project` |
| `Status` | — | The project's own publication status — always `draft` when you hand it over |
| `Tenant URL` | URL | From intake — the tenant you build on |
| `Archetype` | select | The 5 archetypes |
| `Statutory` | checkbox | From statutory modifier |
| `Jurisdiction` | select | e.g. `BE-Flanders`, `UK-England` |
| `Instrument` | text | Named legal instrument if `Statutory = true` |
| `Recipe` | text | e.g. `ideation → ideation → information` |
| `Phase count` | number | |
| `Duration (weeks)` | number | |
| `Form length` | text | e.g. `6–10 mixed qual+quant` |
| `Tone` | select | `Institutional` / `Warm` / `Celebratory` / `Conversational` / `Auto` |
| `Variant` | number | `1` (single) or `1` / `2` (when two) |
| `Linked variant` | relation → self | Cross-links variant pair |
| `Predicted Part` | number | 1–5 |
| `Predicted Process` | number | 1–5 |
| `Predicted Influence` | number | 1–5 |
| `Predicted Feedback` | number | 1–5 |
| `Confidence` | select | `High` / `Medium` / `Low` (overall) |
| `Events attached` | number | Count of project-level events attached (`0` if none) |
| `Skill version` | text | e.g. `0.1.0` |
| `Generated at` | date | |

## Project content payload

This is the plan you realize through the MCP tools — the fields map onto `create_phase` / `update_project_layout` / `replace_form_fields` / `create_event` / `update_project` / `update_phase_permission`. Shape:

```json
{
  "project": {
    "title": "...",
    "description": "...",
    "imagery": {
      "source": "intake | fallback",
      "header_image": "url or description of the chosen image",
      "suggested_search_terms": ["...", "..."],
      "notes": "what to use, and the client-photo flag if source is fallback"
    },
    "settings": {
      "anonymity": "full | standard | verified",
      "languages": ["en"],
      "tone": "warm"
    },
    "events": [
      {
        "title": "...",
        "type": "info_session | workshop | talk | open_day | town_hall | launch | closing | exhibition | other",
        "date": "ISO datetime or [date — to confirm]",
        "location": "venue or [location — to confirm]",
        "registration_required": true,
        "description": "...",
        "feeds_phase": "optional — order or title of the phase this event feeds, if any"
      }
    ],
    "map_config": {
      "default_latitude": 50.8503,
      "default_longitude": 4.3517,
      "zoom_level": 11,
      "source": "intake | web_lookup | tenant_default",
      "layers": []
    }
  },
  "phases": [
    {
      "order": 1,
      "method": "ideation | native_survey | voting | information | proposals | common_ground",
      "title": "...",
      "description": "...",
      "duration_days": 21,
      "ideation_form": {
        "location_field": true,
        "image_upload": true,
        "fields": [
          { "key": "title", "type": "short_text", "required": true },
          { "key": "why_here", "type": "long_text", "required": true }
        ]
      },
      "view_config": {
        "views": ["list", "map", "perspectives"],
        "primary_view": "map",
        "perspectives_config": {
          "auto_tagging": true,
          "default_tags_cleared": true,
          "tags_question_in_form": false
        }
      },
      "form_questions": [
        {
          "type": "open | single_choice | multi_choice | rating | ranking | number | map_point | map_line | map_area",
          "question": "...",
          "options": ["..."],
          "per_pin_followups": ["...optional follow-up questions asked for each dropped pin..."],
          "required": true,
          "bias_check": "passed | flagged: leading | flagged: double-barreled | ..."
        }
      ]
    }
  ]
}
```

Notes on the spatial fields:
- The `ideation_form` above shows a *spatial* example. The **default** ideation form is minimal — `title` + `body` (+ optional image), with **no** `location_field` and no extra `fields`. Add `location_field` / extra `fields` only on an intake nudge (see §2b and `references/ideation-views.md`).
- For an `ideation` phase about places, set `ideation_form.location_field: true` so submitters drop a point on a map (not a text "where is it?" question).
- For a `native_survey` capturing locations, use a `map_point` (or `map_line` / `map_area`) question and attach `per_pin_followups` for the structured attributes you need per location.

Note on `events`:
- `events` sits at the **project** level, parallel to `imagery` and `settings` — not inside `phases`. Include the array only when the intake signals a live gathering (§4 — Events); omit it entirely otherwise. Keep `[date — to confirm]` / `[location — to confirm]` placeholders for any fact the intake didn't supply.

Note on ideation views:
- `view_config` is **per ideation phase**; `map_config` is **project-level** (the platform shares one map config across all phases). Populate `map_config` only when at least one ideation phase enables Map view, and include `perspectives_config` only when Perspectives is enabled. Full logic — the coordinate-lookup rule and the Perspectives back-office checklist — lives in `references/ideation-views.md`.
- An ideation phase also carries a `reactions` block (`commenting_enabled`, `reacting_enabled`, `reacting_like_method` + `reacting_like_limited_max`, `reacting_dislike_enabled` + dislike method/max). Defaults: commenting on, likes unlimited, **dislikes off**. Rules + recommendations in `references/ideation-views.md`. (This is the phase toggle; *who can* comment/react is the permission layer in `references/project-config.md`.)

Note on voting phases:
- A `voting` phase carries a `voting_config` block: `voting_method`, `voting_min_total`, `voting_max_total`, `voting_max_votes_per_idea` (cumulative only), per-option `budget` (budgeting only), `vote_term_singular` / `vote_term_plural`, and the `options` list. The three-method decision rule and full field mapping live in `references/voting-methods.md`. Field names are confirmed against the internal `IVotingPhaseAttributes` type; only the `voting_method` enum strings (`single_voting` / `multiple_voting` / `budgeting`) remain to verify against current code.

Note on survey questions:
- For `native_survey` phases, `form_questions` should use the **full `input_type` catalogue** (image choice, linear scale, rating, sentiment scale, matrix, ranking, number, file upload, mapping types, page breaks) with per-type `config` — not just `open` / `single_choice`. The catalogue, the insight→type selection guidance, UX/mobile/paging rules, and FormSync offline support live in `references/survey-design.md`. `input_type` strings are confirmed from `CustomField::INPUT_TYPES` in the codebase.

Note on proposals phases:
- A `proposals` phase is **ideation + a threshold**: reuse the minimal `ideation_form` and add a `proposals_config` block — `reacting_threshold` (votes per proposal, scaled to population; default 300), `expire_days_limit` (default 90), `reacting_dislike_enabled: false` (up-votes only), `prescreening_mode` (optional moderation). Set `input_term` to `proposal` / `petition` / `initiative`. Full rules + confirmed field names in `references/proposals.md`.

Note on common-ground phases:
- A `common_ground` phase votes on **statements** (agree/unsure/disagree). Set the phase + a `common_ground_config`, but leave `proposed_statements` empty by default — the admin adds ~25 trade-off statements (≤120 chars, title-only, no image), usually AI-generated from the upstream phase via Sensemaking. Full rules + confirmed field names in `references/common-ground.md`.

Note on project-level configuration:
- Beyond the method, set a project-level `project_config` block: **access rights** (`permitted_by` per action — `everyone` / `everyone_confirmed_email` / `users` / `admins_moderators` / `verified`), **demographic user-fields** (`permissions_custom_fields`, `user_data_collection`), **`visible_to`** (`public`/`groups`/`admins`) + `listed`, and content metadata (header alt text, description preview, areas/topics). Confirmed fields, defaults, and the payload shape in `references/project-config.md`.

## GSM decision report (returned with the draft)

Alongside the draft project you built, return this report to the GSM. Use the six-section structure below, in this order:

### 1. Summary of the job
One paragraph, 3–5 sentences. "Here's what I did: archetype X, recipe Y, duration Z, draft saved at [link]." Enough that the GSM can scan and know what they're looking at.

### 2. Links to the draft(s)
Direct links. If 2 variants, one-line description of how they differ.

> *"Variant A: iterative ideation focus / Variant B: structured survey-led for breadth."*

### 3. Decisions the skill made — and why
For every meaningful call, name what was chosen and cite the intake field that drove it:

- **Archetype** — `Co-creation & design` *(based on intake "early-stage" fixedness + driver "shape the plan with the neighborhood")*
- **Statutory modifier** — `false` *(intake compliance field empty; no legal instrument named)*
- **Recipe** — `ideation → ideation → information` *(canonical for Co-creation; chose over 5-phase variant because audience is small and intake didn't call out need for mid-process synthesis)*
- **Duration** — 8 weeks *(archetype default 6–12; weighted shorter given intake `Hard deadline = Q3 council meeting`)*
- **Tone** — warm / community-oriented *(intake `Tone direction` overrode skill default)*
- **Imagery** — Unsplash with "park redevelopment Ghent" search *(intake `Local imagery references` was empty; flagged below)*
- **Events** — attached 2 project-level events (kick-off info session + closing workshop) *(intake `In and out of scope` named "two public sessions"; attached as a module, not phases; dates/venues placeholdered — flagged below)*. State "none signalled — no events attached" when that is the case.
- **Ideation view(s)** — for each ideation phase, name the view chosen and why *(e.g. "Map view — driver is about specific street locations, so inputs are pinned; coordinates looked up online, flagged below")*. Always report it, even when it's the default List view.

### 4. Things to review — uncertainties and flags
Specific items needing GSM attention before they publish:

- **Bias-checklist flags** from form-question generation, if any (with the bias label per question)
- **Paper-form location to confirm** — for every `ideation` / `native_survey` phase, the offline-participation nudge (§6 rule 9) carries a `[location — to confirm]` placeholder. List one line per such phase asking the GSM to confirm where printed forms will be available, so it can be filled before publish. Include this whenever the draft has at least one of those phases.
- **Event date / location / registration to confirm** — for every attached project-level event (§4 — Events), the payload carries `[date — to confirm]` / `[location — to confirm]` placeholders. List one line per event asking the GSM to confirm the date, venue, and whether registration is required, before publish. Include this whenever the draft has at least one event.
- **Map centre/zoom from web lookup** — when an ideation phase uses **Map** view and `map_config.source = "web_lookup"` (§ `references/ideation-views.md`), state that the municipality coordinates were looked up online, with the source link and a "verify before publish" note.
- **Perspectives auto-tagging checklist** — when an ideation phase uses **Perspectives** view, list the 3 back-office steps the GSM must complete before publish (clear the default input tags, enable Auto-tagging, delete the Tags question from the input form). The MCP can't perform these yet, so they must be done manually.
- **Survey image-choice images to supply** — when a `native_survey` uses an image-choice question (`select_image` / `multiselect_image`) and the images couldn't be generated, list which questions need images (with suggested sources or search terms) for the admin to add before publish. Never silently drop the image-choice question.
- **Access / visibility / demographics** — flag the access level per participation action (and the barrier vs. inclusivity trade-off of `everyone` or `verified`/`groups`), any restricted `visible_to`, any required demographic fields (confirm they're proportionate), and whether a verification method is enabled if any action is `verified`. See `references/project-config.md`.
- **Web-sourced local details** from the Local grounding pass (§6), if any — each with its source link and a "verify before publish" note, since the GSM is the local expert who confirms them
- **Ambiguous intake answers** the skill made an interpretive call on
- **Predicted scores below 4** — which dimension and why
- **Confidence rating per dimension** (Part / Process / Influence / Feedback) — High / Medium / Low

### 5. Things missing — and why
What couldn't be drafted well because the intake didn't supply enough. Make it easy for the GSM to fill the gap and re-generate.

**Mandatory line every run — Imagery status:** state whether imagery came from the intake or a flagged fallback, and (if fallback) the recommendation to get 1–2 real photos. This line is never omitted, even when everything else is complete.

- *"Intake `Audience distinctiveness` was generic — descriptions will read as boilerplate until specifics are added."* **Suggest:** go back to client with 2–3 probing questions about local context.
- *"Intake `Local imagery references` had no specific photos — used Unsplash stock."* **Suggest:** ask client for 1–2 photos of the actual site.
- *"Intake `Output success` didn't specify learning goals — generated generic open-ended form questions."* **Suggest:** review form questions specifically before publishing.

### 6. Reference projects — what inspired this draft
2–3 high-scoring exemplars (see §8). Direct URLs. Tells the GSM "we're not making this up — here's what well-scoring projects of this archetype look like in the wild."

Example format:
- Recipe pattern inspired by [Photo competition "Chimney Perspectives"](https://gemeinsam.eins.de/projects/fotowettbewerb) (Eins Energie, DE — 5/5/5/5). Same Devolved archetype, similar iterative ideation → voting → closing info.
- Tone inspired by [Library wall: Dirk Bracke sentence](https://samen.stekene.be/projects/welke-zin-van-dirk-bracke-siert-straks-de-muren-van-de-nieuwe-bib) (Stekene, BE). Light, community-celebratory.
- Form question style adapted from [Allen 2045: Comprehensive Plan](https://engage.cityofallen.org/projects/2024-comprehensive-plan-update) (City of Allen, US).

## After you build it

- You create the project as a **draft** (`publication_status: draft`) and hand it to the GSM with the decision report.
- The GSM reviews in-product, adjusts anything, and **publishes** when ready — publishing is never the skill's action.
- If the GSM asks for changes, re-run to revise the draft (a re-draft replaces the generated phases and page content); never publish on their behalf.

---

# §8 — Exemplars (high scorers to learn from, low scorers to avoid)

Use this when generating the "Reference projects" section of the GSM report (§7 #6). Pick 2–3 exemplars whose archetype + topic + market are closest to the project being drafted.

## High scorers (study these as few-shot examples)

| Project | Tenant | Market | P/Pr/I/F | Total | Recipe | Archetype |
|---|---|---|---|---|---|---|
| [Photo competition "Chimney Perspectives"](https://gemeinsam.eins.de/projects/fotowettbewerb) | Eins Energie | DE | **5/5/5/5** | 5.0 | ideation → info → voting → ideation → info | Devolved |
| [Street name for 't Veen](https://samenhattem.nl/projects/denk-mee-nieuwe-straatnaam-voor-t-veen) | Gemeente Hattem | NL | **5/5/5/5** | 5.0 | ideation → ideation → voting → info → voting → info | Devolved |
| [The Citizen's Budget](https://kortrijkspreekt.be/projects/het-burgerbudget) | Stad Kortrijk | BE | 5/5/5/4 | 4.8 | ideation → ideation → info → voting → info → info (1,978 participants) | Devolved |
| [People Powered Custom House & Canning Town](https://newhamco-create.co.uk/projects/people-powered-custom-house-canning-town) | London Borough of Newham | GB | 5/4/5/5 | 4.8 | info → ideation ×7 → info (10 phases, 1,562 participants) | Co-creation |
| [Participatory budget 2023](https://jeparticipe.rungis.fr/projects/budget-participatif-2023) | Rungis | FR | 5/5/5/4 | 4.8 | ideation → ideation → ideation → info | Co-creation |
| [Allen 2045: Comprehensive Plan Update](https://engage.cityofallen.org/projects/2024-comprehensive-plan-update) | City of Allen | US | 5/4/4/5 | 4.7 | ideation → native_survey ×3 → ideation → info → ideation | Co-creation (mixed) |
| [Heat action plan](https://mitgestalten.innsbruck.gv.at/projects/hitzeaktionsplan) | Stadt Innsbruck | AT | 5/5/4/4 | 4.7 | info → ideation → info → ideation → ideation → info | Co-creation |
| [Name That Sweeper](https://hello.saanich.ca/projects/name-that-sweeper) | District of Saanich | CA | 5/5/4/4 | 4.7 | native_survey → native_survey | Statutory (survey-led) |
| [New posters for the market square](https://omalahti.fi/projects/julisteaanestys2025) | City of Lahti | FI | 5/4/5/4 | 4.7 | voting → ideation | Devolved |
| [Library wall: Dirk Bracke sentence](https://samen.stekene.be/projects/welke-zin-van-dirk-bracke-siert-straks-de-muren-van-de-nieuwe-bib) | Stekene | BE | 5/4/5/4 | 4.7 | poll → information | Community engagement |

**Patterns:**
- Three projects score 5/5/5/5 — all Devolved with light-stakes voting (logos, street names, photo contests) bookended by strong info phases.
- Top scorers span 9 countries and 5 archetypes → canonical recipes are not country-specific.
- Project sizes range from 112 to ~2,000 participants → high scoring is achievable at any scale if the recipe shape is right.
- Newham's *People Powered Places* programme is the flagship pattern for large-scale co-creation (10-phase iterative recipes, 1,500–2,250+ participants per neighborhood).

## Low scorers (study these as anti-patterns)

| Project | Tenant | Market | P/Pr/I/F | Total | Recipe | Why it failed |
|---|---|---|---|---|---|---|
| [Selection 1: Sigmund Wann & tin production](https://mach-mit.freiraum-fichtelgebirge.de/projects/auswahl-1) | Wunsiedel | DE | 2/2/1/1 | 1.7 | voting | Voting alone — no context, no closing |
| [Theme: Salary and free choice](https://ok26.hk.dk/projects/lon-og-frit-valg) | HK Kommunal | DK | 1/1/3/2 | 1.5 | ideation | Ideation alone — 108 people engaged, then silence |
| [SURVEY: Assessing the Problem](https://engage.alleghenycounty.us/projects/opioidfunds-activity1) | Allegheny County | US | 1/3/3/1 | 1.7 | native_survey | Survey alone — asked once, never followed up |
| [Warm Homes: Local Grant](https://ask.bexley.gov.uk/projects/warm-homes-local-grant) | London Borough of Bexley | GB | 2/3/1/1 | 1.8 | native_survey | Inform-framed but uses native_survey alone |
| [Vahl neighborhood school survey](https://medvirkning.oslo.kommune.no/projects/sporreundersokelse-vahl-naermiljoskole) | Oslo Kommune | NO | 2/4/3/2 | 2.5 | native_survey × 3 | Three surveys, zero info phases — no context, no closing |
| [Annual Resident Impact Survey](https://reading.govocal.com/projects/impact-survey-1) | Reading Borough Council | GB | 3/3/1/3 | 2.7 | native_survey → info | Multi-phase but inform-framed (Influence collapses to 1) |
| [PB 2025 results](https://monprojet.villers-saint-paul.fr/projects/budget-participatif-2025-resultats) | Villers Saint Paul | FR | 2/3/4/3 | 2.7 | ideation → info → voting → ideation | PB recipe missing closing info — participation tanked |
| [New ideas](https://deltag.hvidovre.dk/projects/ovrige-forslag) | Hvidovre Kommune | DK | 3/2/3/2 | 2.7 | ideation → ideation | Iterative ideation but no closing info — the exact missing piece vs the canonical 4.22 recipe |

**Anti-pattern lessons:**
- Method-alone (voting / ideation / native_survey with no other phase) is the dominant failure mode across the library.
- Recipe shape almost right but missing the closing info phase → Feedback collapses, Participation often drops with it.
- Inform-framed projects using engagement methods → Influence score collapses to 1 because text and method don't match. Either use Information & transparency archetype properly, or commit to a real influence level.

## How to pick exemplars for the GSM report

1. Match archetype first.
2. Then market (or neighboring market — same language family / regulatory family).
3. Then scale (audience size in the same order of magnitude).
4. Pick 2–3 distinct angles — one for recipe shape, one for tone, one for form question style. Don't pick 3 exemplars illustrating the same thing.

---

## Changelog

**0.13.0**
- **I/O flipped from the old Notion draft-review flow to in-product platform push.** The skill is now run by an LLM that holds the Go Vocal MCP tools and **builds the project directly on the tenant as a draft** (`publication_status: draft`), instead of writing a row to a Notion Drafts DB for a separate publish step. Updated: the description, "What this skill does", Inputs (captured intake in — no Notion intake-row fetch or status gate), "Where the result goes" (the `create_phase → update_project_layout → replace_form_fields → create_event → update_project → update_phase_permission` tool sequence, with core-vs-best-effort failure handling), orchestration Steps 6–8 (prepare report → build on platform → recap), operating principle #3 (**build as draft, never publish — publishing stays the GSM's call**), "What you do NOT do", and §7 (draft attributes + "GSM decision report returned with the draft" + "After you build it" replacing the Notion status transitions). **No drafting logic changed** — archetypes, recipes, survey/ideation/voting/proposals/common-ground design, scoring rubric, and exemplars are untouched; "GSM decision report" is kept as the reviewer-facing briefing's name.

**0.12.0**
- **Offline participation — two concrete routes, suggested at the output.** Expanded the FormSync capability (§2b) and Process Design rule 9 (§6) so the draft doesn't just add the resident-facing nudge but **suggests a concrete offline route to the GSM**: either print the phase's downloadable **PDF form**, or gather responses on **improvised paper** (post-its, postcards, comment cards, workshop sheets) — both import into the same phase via FormSync. Previously only the official-PDF route was described. `references/survey-design.md` FormSync section notes both gathering routes.
- **Spotlight (parallel / standalone) surveys.** New section in `references/survey-design.md`: a `native_survey` can run **standalone, in parallel** with the timeline (the builder's "Spotlight surveys") for concurrent stakeholder-split surveys or an either/or participation choice. Captures the two rules that make it work — create the phase with **`placement_type: "standalone"`** (immutable; defaults to `on_timeline`, which collides when phases overlap; only `native_survey` supports it), and surface each one with a **Spotlight-surveys page widget** (`ExtraSurveysWidget`, props `surveyPhaseId` / `buttonFormat` / `buttonStyle` / `buttonText`) or it shows nowhere. Pointers added to the reference index and the §2b `native_survey` line. Verified from `Phase::PLACEMENT_TYPES` / `supports_standalone_placement?`, the `create_phase` MCP schema, and the project-page builder widget + MCP `layout_widgets` catalogue.

**0.11.0**
- **No redundant leading information phase by default.** Reworked cross-cutting finding #4 (§2): the project description already carries the why / what's-open / how-input-is-used framing, so drafts now **start directly with the engagement phase** (`ideation` / `native_survey`) instead of prepending a standalone leading info phase. If extra context is needed, prefer a blurb in the engagement phase's description or an **intro page** at the top of the input form. The **closing** info phase is unchanged — keep it always (finding #1), since that's the source of the Feedback uplift. Lead with info only when the intake calls for staging substantial material first (e.g. a statutory document, a complex plan).
- **Light emoji on answer options.** Extended Process Design rule 8 (§6) and added an "Light emoji on answer options" section to `references/survey-design.md`: a single leading emoji on concrete, iconic options (🌳 greenery, 🚲 cycling, 🚶 walking, 🚚 deliveries, 🗑️ waste…) to aid scannability. One per option, consistent across the question, skip non-iconic options and "Other"/opt-outs, skip scale labels and open-text, and skip entirely for formal/institutional-tone projects.

**0.10.3**
- Added a **"Reference files (read on demand)" index** near the top of the skill — a single table listing all seven references and the condition under which each is read. Makes the reference set discoverable now that it has grown from 1 to 7.

**0.10.2**
- Added **reactions & commenting** phase toggles to `references/ideation-views.md` (confirmed from `phase.rb`): `commenting_enabled`, `reacting_enabled`, `reacting_like_method` (`unlimited`/`limited`) + `reacting_like_limited_max`, `reacting_dislike_enabled` + dislike method/max. Defaults: commenting on, likes unlimited, **dislikes off**. Recommendations: limited likes to force prioritisation; keep down-votes off unless surfacing disagreement is the explicit goal (then prefer `common_ground`). Drew the line between this **phase toggle** and the **permission** layer (who's allowed) in `project-config.md`. Wired into Step 5 and a §7 payload note; proposals inherits these (up-votes only).

**0.10.1**
- For `native_survey` phases, demographics are now handled the right way: **attach the platform demographic user-fields as the survey's last page** via the survey permission's `user_fields_in_form: true` — *not* hand-authored as survey questions. Set across `references/project-config.md` (demographics default for surveys), `references/survey-design.md` (rule 5), and the Step 5 survey hook.

**0.10.0**
- Added **`references/project-config.md`** — non-method, **project-level** configuration, verified from `Permission` and `Project` (master). Four buckets: **access rights** (`permitted_by` = everyone / everyone_confirmed_email / users / admins_moderators / verified, set per method-specific action; plus groups, verification, denied-message); **demographic user-fields** (`permissions_custom_fields`, `global_custom_fields`, `user_fields_in_form`, `user_data_collection` = all_data/demographics_only/anonymous); **visibility/listing** (`visible_to` = public/groups/admins, `listed`, draft/published, preview token); and **content/metadata** (header + alt text, description preview, images, areas, global vs input topics, folder, default assignee, live auto-tagging).
- Defaults encoded: `permitted_by: users`, `visible_to: public`, minimal required demographics; `verified`/`groups` only for binding/statutory or restricted audiences. Inline: Step 5 project-level fields hook, a §7 `project_config` payload note, and a §7 #4 access/visibility/demographics review line.

**0.9.1**
- Survey reference: added a **"Per-question configuration"** section making two settings mandatory on every question — `required` (default optional; mark required only essential questions; demographics/open-text always optional) and **option order randomised by default** (`random_option_ordering: true`) with explicit exceptions where a fixed order aids legibility (ordinal scales, sequential, long alphabetical; "Other"/opt-out pinned last). Payload defaults and the Step 5 hook updated to match.

**0.9.0**
- Added **`references/common-ground.md`** — the consensus method. Verified from source (`ParticipationMethod::CommonGround < Base`) + the Finding Common Ground support article: residents react **agree (`up`) / unsure (`neutral`) / disagree (`down`)** to short **trade-off statements** (reactions are votes); statements are **title-only, 3–120 chars, no body/image**; default `input_term` `contribution`; live public results that can't be hidden; ~80% completion (very sticky).
- Encoded the **sequencing recommendation** (place `common_ground` *after* an ideation/survey phase to converge the community) and the **statement-authoring reality**: like voting options, statements are added by the admin after the phase exists — usually **AI-generated from the upstream phase via Sensemaking** (~25 statements, the support article's prompt included) — so the draft sets config only and flags it.
- Fixed the method string from `commonground` → **`common_ground`** (the real `method_str`) in §2b and the §7 payload enum. Inline: §2b line expanded + pointer; Step 5 + §7 notes added.

**0.8.0**
- Added **`references/proposals.md`** — the petition-style method. Verified directly from source (`ParticipationMethod::Proposals` in `back/lib/participation_method/proposals.rb`, `class Proposals < Ideation`, + `phase.rb`): proposals is **ideation + a vote threshold**, up-votes only, with `reacting_threshold` (votes per proposal, default 300) and `expire_days_limit` (default 90) both required, configurable `input_term` (`proposal` / `petition` / `initiative`), co-sponsors, optional `prescreening_mode`, no budget, continual (non-transitive).
- **Threshold-by-population heuristic** (per GSM guidance): under 500 for a small municipality, ~500–1,200 mid-size, 1,200–2,500 for a large (Copenhagen-size) city; base on tenant population, look up or flag if unknown.
- Inline: §2b `proposals` line expanded + pointer; §2 Issue-identification recipe notes petitions/threshold; Step 5 configures threshold/expiry/input_term; §7 gains a proposals payload note. Proposals reuses the **minimal ideation input form**.

**0.7.3**
- Clarified the **ideation input-form default = minimal**: Title + Description + (optional) Image only. The skill must **not** add other fields unless the intake nudges for it (spatial ask → location field; "categorise the ideas" → a select; a specific structured attribute → that one field). This is deliberately the **opposite** of the survey default (which encourages question-type diversity) — ideation lowers the barrier to submitting, surveys capture structure. Added an "Input form — default to minimal" section to `references/ideation-views.md`, reframed the §2b ideation-form list around it, and noted in §7 that the spatial payload example is not the default.

**0.7.2**
- Survey reference: added an explicit **"use spatial questions when the ask is clearly spatial"** rule (`point` drop-pin, `line` draw, `polygon` area) and a **"don't under-use the rich types"** steer — be confident reaching for matrix, sentiment, and image-choice where they fit, not just text/single-choice. Step 5 updated to match.
- **Image-choice images:** if the skill can't generate/source the images for a `select_image` / `multiselect_image` question, it must **keep the question and flag it in the GSM report** (with suggested sources) rather than silently dropping it. Added the rule to the survey reference and a dedicated "Things to review" line in §7 #4.

**0.7.1**
- Verified the survey question types **directly against source** (`CustomField::INPUT_TYPES` in `back/app/models/custom_field.rb`, master, read via the browser). Replaced all best-effort (≈) `input_type` keys with the confirmed enum and added types that were missing: `checkbox` (Yes/No), `date`, `select_image` (single image choice), `image_files` (image upload), `html_multiloc` (content/description block), plus `files`. Confirmed `multiline_text`, `multiselect_image`, `matrix_linear_scale`, `shapefile_upload`, `point`/`line`/`polygon`, `page`.
- Corrected config details to real schema fields: linear-scale/rating `maximum` range is **2–11** (not 1–5/≤10), per-point `linear_scale_label_N_multiloc`, `select_count_enabled` + `minimum/maximum_select_count`, `random_option_ordering`, `dropdown_layout`, `ask_follow_up`, `min/max_characters`, `page_layout: default|map` (map pages), and per-question `include_in_printed_form` (FormSync). Payload shape updated to match.

**0.7.0**
- Added **`references/survey-design.md`** — read for every `native_survey` phase to stop the skill defaulting to short-answer / single-choice. Grounded in the support article "What are the different question types?" and the FormSync FAQ: full catalogue (short/long answer, single/multiple/image choice, linear scale, rating, sentiment scale, matrix, ranking, number, file upload, mapping point/line/polygon/shapefile, page breaks) with an **insight→question-type selection table**, UX/mobile/paging rules, FormSync offline compatibility, and a payload shape with per-type config.
- Inline: §2b survey section expanded with the wider palette + a "don't default to simple types" steer and pointer; Step 5 instructs deliberate question-type diversification; §7 gains a survey-questions payload note.
- Confirmed `input_type` keys where grounded (`linear_scale`, `sentiment_linear_scale`, `polygon`, `page`); others marked ≈ for verification against current code.

**0.6.1**
- Clarified in `references/voting-methods.md` that **voting options ARE ideas/inputs** assigned to the voting phase (via `idea_phases`), so a brand-new project has **no options at draft time**. For a `voting` phase the skill now drafts only the phase title, description, and voting-method config; options are added later by the PM/admin after the upstream ideation/survey phase (move ideation ideas in, or submit ideas built from survey responses/themes via the back office). Payload uses `options_status` + a normally-empty `options` list (proposals only when the intake enumerates fixed options).

**0.6.0**
- Added **voting methods** (Approval / Cumulative / Budget allocation) as a new sub-reference **`references/voting-methods.md`**, read whenever a recipe contains a `voting` phase. Inline: §2b `voting` line names the three methods; Step 5 infers the method from the intake and populates `voting_config`.
- Inference rule: Approval (`single_voting`) for a clear winner, Cumulative (`multiple_voting`) for strength of preference, Budgeting (`budgeting`) for costed options + a fixed pot. Defaults to Approval when unclear.
- Grounded the phase config fields against the internal `IVotingPhaseAttributes` type (TAN-4925) and the public API: `voting_method`, `voting_min_total`, `voting_max_total`, `voting_max_votes_per_idea`, `voting_term_singular_multiloc`/`_plural_multiloc`, `manual_voters_amount`, per-option `budget`. Only the `voting_method` enum strings remain to verify.
- Captured two drafting realities: voting **options are pre-defined** at phase start (an ideation shortlist must be curated/costed by an admin — flagged to GSM), and **budget figures must never be invented** (placeholder + GSM confirm). §7 gains a voting-phase payload note.

**0.5.1**
- Sharpened the ideation-view decision rule per GSM feedback: **List** = smaller consultations; **Map** = spatial "drop-a-pin, tell us where" asks; **Perspectives** = larger-scale consultations where **>50 inputs are expected** (was a vaguer "high volume / citywide"). The ~50-input threshold is now the explicit trigger.
- Added a hard **don't-override** rule for Map: if a default lat/long is already set on the platform's map config, keep it (`source: "tenant_default"`) — the web coordinate lookup runs **only** when no default exists at all.

**0.5.0**
- Added **ideation input views** (List / Map / Perspectives). Inline: §2b `ideation` line now names the three views, plus a compact view-decision table (signal → view → extra config); Step 5 selects the view and populates `view_config`. Heavy config moved to new **`references/ideation-views.md`** (read only when Map or Perspectives is chosen) — mirrors the statutory inline-detection / reference-handling split.
- **Map view:** requires a form location field; project-level `map_config` (centre/zoom/layers — shared across phases per the platform). New **coordinate-lookup rule**: if no default lat/long exists, look the tenant municipality's coordinates up online (one web search, Local-grounding-pass guardrails: provenance-tagged, GSM verifies).
- **Perspectives view:** for high-volume processes; AI clusters inputs into topics/subtopics. Encodes the auto-tagging end-state in `perspectives_config` (clear default tags, enable auto-tagging, no Tags question on the form) and surfaces the 3 back-office steps as a GSM pre-publish checklist (MCP can't do them yet).
- §7 payload: added project-level `map_config` and per-phase `view_config`; added Map/Perspectives lines to "Things to review" (§7 #4).

**0.4.0**
- Added **Events** as a first-class **project-level module** (not a method/phase). New "Project-level modules" subsection in §2b distinguishes module vs. method; new Events subsection in §4 (sits beside imagery) covers detection signals, the module-not-phase rule, the never-invent-dates/venues placeholder rule, and `feeds_phase` linkage. Wired into orchestration Step 5.
- §7: added an `events` array to the project payload (parallel to `imagery`/`settings`, never inside `phases`), an `Events attached` count on the Drafts DB schema, an events decision line (§7 #3), and an event date/location/registration confirmation line in "Things to review" (§7 #4).
- Detection currently reads free-text intake fields (`Driver`, `In and out of scope`, `Process success`); recommend adding an explicit events field to the upstream `govocal-project-intake` skill so the signal is structured rather than inferred.

**0.3.2**
- Added **offline participation (FormSync)** as a first-class capability (§2b): any `ideation` or `native_survey` form can be done on paper — admin downloads the form/survey PDF, distributes in person, handwritten responses auto-import via the Form parser. Encouraged by default to widen reach.
- New Process Design rule 9 (§6): every `ideation` / `native_survey` phase description gets a short, in-tone nudge inviting in-person paper participation, with a `[location — to confirm]` placeholder (never invent a venue). Wired into Step 5.
- GSM report "Things to review" (§7 #4) now flags the paper-form location for confirmation, one line per ideation/survey phase, whenever such a phase exists.

**0.3.1**
- Moved the statutory **handling** detail (fields to capture, recipe lookup, overlay, worked examples, influence ceiling, naming note) out of §3 into `references/statutory.md`, read only when `statutory: true`. Detection criteria stay inline so the true/false call needs no extra read. Steps 2 and 3 updated to point at the reference. Trims the always-loaded body for the common (non-statutory) path.

**0.3.0**
- Added a **Local grounding pass** (§6) — optional, guardrailed web search to confirm proper nouns and public facts so descriptions read like a local wrote them. Texture only: two hard stops (never fabricate resident sentiment, never add substance), mandatory provenance tagging, client-probing preferred over web when intake is thin.
- Reworked Operating principle #6 from "never invent intake facts" to "never invent facts about the consultation or residents' views" — verifiable public context about named places/plans/budgets is now permitted via the grounding pass, provenance-tagged for GSM review.
- Step 5 now references the grounding pass before description writing.
- GSM report "Things to review" (§7 #4) now logs web-sourced details with source links + "verify before publish."

**0.2.0**
- Added §2b — Platform capabilities, grounding drafts in real methods, ideation form fields (incl. location field), and survey spatial question types; references the `govocal-api` skill.
- Added a spatial-ask rule to method selection (location field required for place-based asks).
- Added a Spatial-ask variant trigger + spatial contrast axis (ideation+location vs. map-survey), with an exception to the ≥2-trigger rule.
- Hardened imagery into a required, non-skippable output: payload `imagery` block + mandatory imagery line in the GSM report + self-eval check.
- Added description formatting + light-emoji rules (§6 rules 7–8) and a tenant-locale reminder for `languages`.

**0.1.0** — initial skill.

## Source

Full reasoning, empirical analysis, raw recipes: [Project setup good practice skill (wip) — Go Vocal MCP](https://www.notion.so/35e9663b7b26810582a1fdb05d970cad)
Statutory-as-dimension rework: [Archetype rework — statutory as a dimension (private)](https://www.notion.so/3729663b7b268143a0e8f25d090983a2)
Upstream intake skill: `govocal-project-intake`
