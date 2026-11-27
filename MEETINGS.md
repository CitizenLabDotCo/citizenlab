# Parallel Participation — Meeting Synthesis & Solutioning

A running synthesis of what the team has **discussed and decided** across the parallel-participation meetings.

_Last updated: June 2026 · branch `exploration-parallel-participation`._

---

## 1. Meeting timeline (what was discussed)

### Background — Opportunity / Feature Passport (2025)

Framed the problem and the option space:

- **Problems by priority:** (1) only a single participation method per phase (~80% of feedback); (2) phases cannot overlap (~20%); (3) single ideation form per project (form lives on the project, not the phase); (4) no folder-level timeline or unified reporting.
- **The reporting wall** is the real long-term lock-in — folder-of-projects workarounds break unified analysis.
- **Technical solutions sketched:** **A.** in-project decoupled timeline (methods float with own dates); **B.** in-project coupled timeline (multiple methods per phase, snapping to phase boundaries); **C.** upgraded folders; **D.** a persisted `ParticipationMethod` model attachable to a phase _and_ a project.
- **James's preferred path:** expand the content builder to embed methods as widgets + add a `phase_timelines` table (one `primary` timeline drives `current_phase`, preserving the ~316 call sites). Effort ~20–45 days.

### Sept 10, 2025 — product meeting

- Wietse: the timeline is a core strength — don't take it for granted; **effort matters**, don't redesign from a blank page.
- Leaning toward **option B** (multiple methods per phase) as the pragmatic core.
- James: take small steps — multi-method-per-phase first, more timing flexibility later.
- Rob: more project-page flexibility (like the homepage redesign) could also reduce the need for folders.

### May 19, 2026 — Tandem kickoff

- **ALIGNED: initial scope restricted to surveys.**
- Rob presents a sidebar prototype separating a static **timeline (phases)** from a drag-and-drop **activities** concept.
- Edwin: don't overload the word "timeline"; distinguish _project phases_ from _engagement timeline_.
- Koen/Edwin: beware leaky abstractions — design user-first, then bridge to system constraints.

### May 20, 2026 — Initial technical discussion

- **ALIGNED: adopt a "Process" abstraction layer**, mapping existing projects onto it (backward-compatible). **Public survey workflow out of scope** for now, but the model should stay flexible for it.
- **Activities modeled as phases that sit "outside" the main timeline** — a boolean flag for on-/off-timeline — to avoid renaming the model everywhere.
- `current_phase` is deeply embedded (1:1 with participation method) → full decoupling would mean a rewrite; **avoid the rewrite**.
- Forms may need to live at the **process** level rather than project/phase.
- Koen introduces the **process** concept (a middle layer grouping methods around a shared data set). _Action: Koen to share model diagrams._

### May 21, 2026 — Technical deep dive ← Koen's diagrams belong here

**ALIGNED decisions:**

- **Every phase is explicitly associated with a custom form** (replacing reliance on `creation_phase_id` to define logic).
- **Phases that share the same custom form cannot overlap.**
- **Phased implementation:** do the phase-to-form associations first; **defer the "timeline-chunk" layer**.
- **360 files input stays at the project level.**
- **Ideation and voting phases in the same project must share the same custom form — no differing forms per ideation phase** (for now).

**Discussion (not locked):**

- **Participation methods stay on the phase** — there's method-specific logic (voting vs ideation) that the form alone can't carry.
- **Statuses** should move to the process / data-set level.
- Naming debate: **"process" vs "input group" vs "data set"**.
- **Timeline as a presentational layer** → enables vague/approximate dates.
- **"Timeline chunks"** = renaming phases to pure time segments (Edwin prototype).
- Attribute audit — these tend to belong to the process/data-set: `similarity_threshold`, `input_term`, input manager, `available_input_tags`, `statuses`.
- **Events as activities** = a future consideration, not now.
- Incremental, **bottom-up**; a **boolean flag** for on-/off-timeline as the first step.

### Koen's structural diagrams (the shared image)

Linked to the **May 21 deep dive** (concepts seeded May 20). The board sketches the option space:

- **Today** — one `form` on the Project (shared by ideation), each Phase carrying its method (`m`).
- **Rob's proposal A / B / C** — A: activities float below the timeline with their own dates; B: activities snap to phase boundaries; C: overlapping phases.
- **Process** / **Process + phase-grid** — a `Process` (yellow) spanning phases, owning `form + data`; the phase-grid variant aligns processes to phase gridlines.
- **"Hidden" processes** — "we do processes, but we don't show them" (model cleanup under the hood, no new UI concept).
- **"gantt timeline"** — `form` + Process 1/2/3, phases laid out (and overlapping) on a time axis.
- **"The form is the process"** — `CustomForm (process)` owns `similarity_threshold`, `input_term`, input manager, `available_input_tags`, `statuses`; `Idea` links via `creation_phase` and `input_group`; `TimelineChunk` above the phases; `Event?` flagged "likely not now."

The throughline: **separate the timeline (time) from the process (a shared form + data set that several phases/activities act on).**

### May 22, 2026 — Design deep dive (Rob's prototype)

- Prototype: a static **timeline** + drag-and-drop **activities** + a Notion-style content editor for the project page.
- Tensions raised:
  - **Auto-show vs manual placement** of an active activity.
  - James: **"a phase _is_ an activity"** — equalize the language (timeline-activities vs other activities).
  - Koen: the activities/timeline split is **confusing** to users ("I'm running a survey, why isn't it in my activities?"); wants phases to read as activities and parallel activities to be a **power add-on**, not the default invitation.
  - **Expose the process/form concept in the UI, or keep it under the hood?** (Koen leans toward exposing eventually; James floats a simple "new process vs continuation" checkbox on new ideation phases.)
  - **Same input in multiple processes at once** (Rob's assembly + mini-public idea) → James: that's an _improvement on existing methods_ (e.g. ranking on ideation), not a new method; don't let one idea be acted on by multiple processes simultaneously.
- **Compromise:** keep the timeline unchanged for now; surveys-only; descope deep content-builder navigation; keep exploring the process/form model. **No firm build decisions locked.**

### Week of June 1, 2026 — weekly

- Sébastien raises the **date-reconciliation concern**: giving activities their own arbitrary dates creates **two ways to model time** that are hard to unify later (and would complicate parallel ideation / ideation + voting migrations).
- James/Rob: activities should have **independent start + optional end dates**, _not_ linked to the timeline. (Rob: if an admin later wants one on the timeline, it's on them to adjust dates to fit.)
- **Design pivot:** drop the generic **"activities"** concept → an **"Extras"** section for surveys that run outside the timeline. No new concept introduced.
- **Leaning decided:** a **simplified survey-only creation form** (rather than the full phase form greyed-out).
- **Open — auto-show vs manual:** Edwin (default-show, admins forget) vs Rob (don't — surveys are drafts when created; some are intentionally offline-only) vs Koen (a **self-hiding "omnibox" widget** showing all active surveys) vs James (**detect-not-shown-and-warn**). → Rob to mock both omnibox and per-survey widgets.
- Content builder: **must-have** = a module to place extra surveys + handle competing CTAs; **nice-to-have** = editing title/hero/timeline as movable sections.
- **Code stays generic** even though the UI says "surveys."
- Rob: project active/draft status is no longer driven solely by the timeline — **"the timeline is no longer the spine of the project."**
- **Short-term backend:** a **boolean on the phase** (on-/off-timeline) is the likely first step; **residents submitting** to parallel surveys is deferred (the `current_phase` / permissions obstacle).
- **Koen's ask:** Sébastien + Edwin produce **2–3 costed implementation directions** (with effort, pros/cons) to force an active decision. **Wietse meeting (Wednesday)** is the gate. Rob away ~3 weeks; Sébastien + Edwin to run dailies.
- "Reconcile later" was likely **misunderstood**: Sébastien meant _unifying the two time models_ into one, **not** collapsing parallelism back into a sequence. Key reframe: **parallel ≠ independently-dated.** Full parallelism and overlap are achievable with activities **anchored to phases or always-on** — the only thing lost is letting an activity start/end on a date that matches no phase boundary.

---

## 2. Terminology we've been using

Naming is still unsettled in places (flagged below). Working vocabulary:

| Term                              | Meaning in the discussions                                                                                                                                                                                        | Notes / ambiguity                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Project**                       | The top-level container.                                                                                                                                                                                          | Stable.                                                                                              |
| **Phase**                         | A time segment on the timeline; today also carries the method + (for non-ideation) the form.                                                                                                                      | The fused object we're trying to relieve.                                                            |
| **Timeline**                      | The ordered sequence of phases. Valued; to become more **presentational**.                                                                                                                                        | "Don't overload the word" (Edwin).                                                                   |
| **TimelineChunk**                 | Proposed rename of a phase to a _pure_ time segment, decoupled from participation.                                                                                                                                | May 21 / Edwin prototype; deferred.                                                                  |
| **Activity**                      | A participation unit. In Rob's June pivot, dropped in favour of "survey outside the timeline."                                                                                                                    | Conceptually "a phase off the timeline." James: "a phase _is_ an activity."                          |
| **Extras**                        | The front-office section for surveys running outside the timeline (Rob, June).                                                                                                                                    | Survey-specific copy; will need renaming if more methods are added.                                  |
| **Method / Participation method** | The kind of participation (ideation, survey, voting…). Stays on the phase.                                                                                                                                        | Team keeps the method on the phase for now.                                                          |
| **Process**                       | Proposed middle layer: a group of phases/activities sharing **one form** and **one data set** of inputs. Owns `statuses`, `input_term`, input manager, `available_input_tags`, `similarity_threshold`, reporting. | Naming unsettled: **"process" vs "input group" vs "data set" vs "form."** Expose in UI? — undecided. |
| **Form / CustomForm**             | The field definition. Moving from project-level (ideation) to **phase-level association**; the shared form is what ties phases into one process.                                                                  | "The form is the process" (Koen).                                                                    |
| **Input / Idea**                  | The artifact a resident produces. Today linked via `creation_phase` + `ideas_phases`; proposed `input_group` link to the process.                                                                                 |                                                                                                      |
| **Event**                         | Currently attached to the project.                                                                                                                                                                                | Future: could become an activity; "likely not now."                                                  |
| **form + data**                   | The process payload — the shared form plus its data set of ideas.                                                                                                                                                 |                                                                                                      |

---

## 3. Where the team's direction agrees with the north star & immediate solutions

Strong, largely independent convergence with `RESEARCH.md`:

- **Decouple the timeline from the participation unit** — the team's "off-timeline activity / process" = the north star's split of Phase into time-segment + Activity.
- **Surveys-first, reuse the phase table, generic flag, backward-compatible, incremental** — almost exactly **Immediate Solution #4** (parallel off-timeline surveys), including the "keep the flag generic" discipline.
- **Timeline becomes presentational → vague/approximate dates** — matches **Immediate Solution #2** and the north-star "timeline narrates, doesn't gate."
- **Forms move to the phase/process level** — matches the north star's "Form owned by the Activity."
- **A process / data-set grain owning statuses, tags, input term, input manager, reporting** — maps to the north star's **Input** cluster + reporting-at-activity-grain (**Cluster 6**, "the real prize") + status-workflow-on-activity.
- **Voting is awkward as a separate method acting on past ideas; better as something explicit on a curated data set** (Koen) — matches the north star's "voting is a capability/setting, not a method."
- **Avoid the total rewrite because `current_phase` is load-bearing** — matches the code-audit blast-radius finding.
- **Events as activities (future)** — matches the north star's flag.
- **"A phase is an activity"** (James) — matches the Concept model's "everything is an activity; some are placed on the timeline."

The team has also **added** something the north star under-specified: an explicit **process / data-set layer**. This is a genuine improvement for the shared-inputs + statuses + reporting problem.

---

## 4. Differences / open forks

1. **Two grouping concepts vs one.** The team is shaping _both_ an "off-timeline activity" _and_ a "process/data-set." In the north star these are **one** thing: an Activity _owns_ its form/data-set and _may or may not_ be placed on the timeline. Unifying "process ≈ activity" would remove a likely leaky abstraction.
2. **The date-model fork (the live one).** Team leaning: activities get **independent arbitrary dates** (two time concepts). North-star / Sébastien: **anchor to phases or always-on** (one time concept). Independent dates buy only "start/end off a phase boundary" (rare for surveys) at the cost of two permanent time models + migration debt + a harder per-phase-config future.
3. **Methods stay on the phase (team) vs dissolve into primitives + capabilities + templates (north star).** Shared _diagnosis_ ("methods have diverged, should be generalized"), but the team is consciously not doing the radical version now.
4. **One activity configured per phase (north star) vs multiple phases sharing a form/process (team).** Two ways to express "shared inputs across a sequence with changing behaviour"; the team's is more incremental.
5. **Per-ideation-phase forms.** Team **explicitly deferred** (ideation/voting share one form) — which matches the north star's assessment that **Immediate Solution #5** (non-transitive ideation phases) is _large / beyond a quarter_. Agreement on the difficulty; the team made the call to defer.
6. **Front office.** The team is actively designing it (Extras, content builder, CTAs); the north star deliberately deferred FO navigation. **Complementary**, not conflicting.
7. **"Activities" naming.** The team dropped "activities" for "Extras" (June) — a step away from the north star's (and James's earlier) "everything is an activity" framing. A shipping convenience, but the concept question it sidesteps will resurface with the second method.

Two `RESEARCH.md` immediate solutions **not yet centered** by the team (no conflict, just not discussed): **#1 private/admin-only form fields** and **#3 demographics as reusable user fields**.

---
