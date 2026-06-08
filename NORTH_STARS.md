# Parallel Participation — North Star (Target Model)

_Status: an opinionated **target model** — the ideal end-state we want to steer toward as we ship incremental solutions. It is a direction, not a committed build plan, and not a near-term scope. Refined together with the team's technical discussions. June 2026._

## Multiple timelines

_Several parallel sequential tracks; the top one drives the clock._

### How it works

A project holds **several ordered timelines** instead of one. Each timeline is an ordinary sequence of phases — exactly today's model, unchanged _within_ a track. The **top timeline** drives `current_phase` (and everything keyed on it); the ones below run in parallel and are progressively more in the background. "Parallel participation" is then just a second track: a survey track running alongside the main ideation track over the same calendar period. The data set lives at the track level — phases that share a form belong to one track, so ideation→voting within a track share one form, as they do today.

_Example: a "Wemmel park" project keeps its main timeline (Inform → Collect ideas → Decide) and adds a parallel "Resident survey" timeline whose single phase spans the same weeks._

### Data model

- **Relationships.** A **Timeline** groups **Phases**; a **Phase** keeps everything it has today (its `participation_method` string + method config). The **Form** stays where it is now (project-level for ideation, phase-level for the others) but is _scoped to a track_; there is **no Process / data-set entity** — the track is the implicit data-set grain. **Method** stays a string on the phase. **Input** and **Permission** are unchanged.
- **Entities.** New: **`Timeline`** (`phase_timelines`) — `belongs_to :project`, an **`ordering`** position (the top one is primary and drives the clock), title. Changed: **`Phase`** gains `timeline_id` (it was attached directly to the project). Everything else is untouched.
- **ER sketch.** `Project 1—* Timeline (ordered; top drives the clock) · Timeline 1—* Phase (sequential) · Phase —has→ participation_method + config · Idea —creation_phase→ Phase · Permission → Phase · current_phase: one per Timeline (top = the legacy value)`
- **Resolving an input.** Unchanged from today: `Input → creation_phase → method + form`. Within a single track a phase is unambiguous (one method, one form), so nothing new is needed — and because data sets never span tracks, the "are the forms compatible to transition?" question never arises (within a track, ideation and voting share the track's form by construction).
- **A note on recycling `Phase`.** With no process entity, the `Phase` does double duty — a narrative time-chapter _and_ the data-set carrier. A phase is a labelled chapter (title + description); a process wouldn't carry those. So a one-phase survey track wears phase chrome (title/description/dates) that really just labels the survey and can duplicate its own title. A mild leaky-abstraction cost — the same overload behind the near-term "extras = a phase + a boolean" — not a blocker.

### Immediate requests

- **Extra surveys.** A parallel survey is modelled as a **lower-ordered timeline** — typically a single survey phase running alongside the main timeline; the "Extras" list is just the project's non-top timelines. Backward-compatible (phases are unchanged), but heavier than a flag: each extra survey is a whole timeline, and submission still needs `current_phase` / permissions to resolve for a non-top track (tractable for self-contained surveys; the known obstacle for anything transitive).
- **Parallel ideation, different forms.** Run as a **second ideation timeline**, each track owning its own form. Two ideations can't be _peers inside one_ timeline (a single timeline's phases are sequential and share one form), but ordering lets you push the second track **into the background** — surfaced like an extra rather than as a competing timeline. Worth being clear that this is a workaround: the second ideation is structurally a separate track, with its own data set and its own current-phase.

### The long-term bet

- **Unification: L0–L1.** Method stays a typed string on the phase, the form is per phase/track, and there is no process to unify around — so reconfiguring an ideation into a survey or proposal, mixing public and private fields in one form, and per-submission visibility are genuinely _out of model_ (structural absences, not UX gaps). It is the least unified candidate.
- **Upside.** Lowest blast radius and most backward-compatible — the top timeline preserves the ~316 `current_phase` call sites, and within-track behaviour is identical to today; it _multiplies_ the timeline rather than eroding it (protecting the differentiator); and it is the only candidate with a worked effort estimate (James, ~20–45 days). It ships parallelism without a remodel.
- **Cost.** It forfeits the unification prize — mixed-visibility inputs, per-submission publishing, morphing one method into another, and **native cross-method reporting** stay out of reach (a survey and an ideation remain different shapes). Parallel ideation lives in separate (orderable, hideable) tracks rather than one shared grid; timelines can proliferate; and it is a parallelism _mechanism_, not a remodelling — so "reconcile to one model later" means collapsing N timelines, which only gets harder over time.
- **Verdict:** the cheapest, lowest-risk way to ship parallelism — a strong near-term tactic, and an acceptable _destination_ only if input-unification isn't a long-term goal; its L0–L1 ceiling keeps the unification prize permanently out of reach.

## Method components

_Persist `ParticipationMethod` as a component you attach to phases or the project; voting stays a method by reference._

### How it works

Promote `ParticipationMethod` from today's transient string-object into a **persisted record** you can **attach to a phase _or_ the project**, **several at a time**. Each component carries its kind and config, owns its permission, and — when its method is self-contained — its form. **Phase-attached** components inherit the phase's window; **project-attached** ones are off-timeline "extras" with **their own dates**. Phases stay **sequential**, so the timeline remains the spine. **Voting stays its own method**, acting on an ideation component's ideas **by reference**. The defining choice: this makes the **method** first-class — not the data set.

_Example: a "Wemmel park" project keeps its main timeline with an ideation component on "Collect ideas" and a voting component on "Decide" (voting references the ideas), plus an off-timeline "Resident survey" component attached to the project with its own dates._

### Data model

- **Relationships.** A **`ParticipationMethod`** is a persisted record attached (polymorphic `context`) to a **Phase** or the **Project**; many non-conflicting components per phase. It owns its **Permission**, and its **Form** _when the method is self-contained_ (a survey). **Input** belongs to the component that collected it; a **voting** component **references** an ideation component's inputs. Phases stay sequential.
- **Entities.** New: persisted **`ParticipationMethod`** (kind, config, polymorphic `context` = Phase | Project, own `start_at`/`end_at` for project-attached, own permission, own form). Changed: the phase's `participation_method` string + method config move **onto the component**; **`CustomForm`** context → the component (for self-contained methods); **`Permission`** scope → component; **`Input`** gains a component link. Phases keep their dates and sequence.
- **ER sketch.** `Project 1—* ParticipationMethod (context: Phase | Project) · Phase 0..* ParticipationMethod · ParticipationMethod 1—1 Form (self-contained methods) · ParticipationMethod —references→ ParticipationMethod (voting → ideas) · Input *—1 ParticipationMethod · current_phase: still single (timeline); off-timeline components sit outside it`
- **Ideation → voting & the form crux.** ideation→voting is **two components joined by reference** (the "voting on past ideas" pattern). A component owns its form cleanly **only when method ≡ data set** (surveys). For **transitive** ideation/voting the form belongs to the **shared data set**, which this model has **no entity for** — so it **stays on the project** (as today). _The fix is to make the shared form the (implicit) process — see the long-term bet._
- **Time & transitions.** **Hybrid clocks.** Phase-attached components ride the **one timeline clock** (gated by `current_phase`); project-attached components run on **their own dates** (a **second clock**, gated by their own dates + permission, _not_ `current_phase` — which is why resident submission to them works without the obstacle). Don't allow "phase-attached **and** own dates" (the clamp/overflow mess). One real interaction: the project's **active/draft status** becomes the **union** of the timeline phases **and** every off-timeline component's window (Rob's "the timeline is no longer the spine"). Off-timeline components need their own "started" poller.
- **Resolving an input.** `Input → its component → {form, permission, kind}` — but an input's **full config can split across the components that reference it** (the ideas on the ideation component, the votes on the voting component), the **messiest resolution of the five**.

### Immediate requests

- **Extra surveys.** Native-ish: a survey component attached to the **project**, with its own dates ("Extras"); many allowed. A survey is self-contained, so it owns its form cleanly, and submission resolves per-component — so the `current_phase` obstacle dissolves.
- **Parallel ideation, different forms.** Achievable **in one timeline** — two ideation components on a phase, each its own form — but it forces the form-ownership fork: **per-component forms** make this work _yet keep voting separate_ (a **fork** from the Grid); the **shared-form** variant (below) instead forces the different-form ideation **off-timeline**. So you can have different forms _or_ a clean on-ramp, not both — which is precisely what the unified Grid resolves.

### The long-term bet

- **Unification: L1–L2.** A persisted unit owning its form lifts it above Multiple timelines' recycled phases — but method-stays-a-type, voting-by-reference, and config-split-across-components keep it low. Morphing, mixed-visibility, and per-submission visibility are not native.
- **Upside.** The **smallest leap of the real remodels** — the method object already exists, so you persist it and move the phase's method attributes onto it; phases stay sequential, so `current_phase` mostly survives; it keeps the familiar "methods on phases / voting on past ideas" model (least retraining); it ships **extra surveys _and_ parallel ideation in one timeline**; the submission obstacle dissolves for off-timeline components; and it is **Decidim-proven** (components dropped on a phase).
- **The fork that decides its long-term value.** Method components makes the **method** first-class; the north star needs the **data set** first-class. So **as-is** (per-component forms, voting separate) it is a **fork** from the Grid — evolving toward the Process means **unwinding** separate-voting (→ a config) and introducing the data-set owner you skipped. **With "shared form is the process"** (the May 21 path — on-timeline transitive components recycle one form; detached ones get a new form) the shared-form group becomes the **implicit process**, and it turns into an **on-ramp**: later you formalise that group into one `Process`. Even then, two _different_ ideation forms can't both sit on the timeline (the different one must detach), so full parallel-ideation-in-one-timeline still needs the Grid's **multiple explicit processes**.
- **Cost.** Config splits across referencing components (messiest resolution); it keeps the "voting acts on past ideas" clumsiness; two clocks for the off-timeline subset (plus a second "started" poller); and the project's active status leaks off the timeline.
- **Verdict:** the most incremental real remodel and the cheapest way to ship both immediate asks — but on the **method axis**, so it is a **fork** from the unified Process unless you deliberately adopt **shared-form-as-process** (the May 21 path), which makes it an **on-ramp**. A fine next step; a destination only if a Decidim-style component model is the goal.

### Neighbours

The **bridge** between Multiple timelines (L0–L1, recycled phases) and the Process trio (L3–L4, an explicit data-set owner): it persists the unit but keeps method-as-a-type. The hinge is the form — **without shared-form-as-process it is a fork from the Grid; with it (the May 21 "form is the process" path) it is an on-ramp** — though even then it cannot put two different ideation forms on one timeline. Real-world analogue: **Decidim's components**.

## Grid

_One timeline; processes configured per phase._

### Introduction

This document describes the **ideal way to model participation** in Go Vocal — the shape we would build with no time or migration constraints. Its job is to act as a **north star**: every near-term, shippable step should move _toward_ it rather than away from it.

**The core move.** Today a `Phase` fuses four responsibilities into one record: it is a segment of time, _and_ a participation activity, _and_ exactly one method, _and_ one entry on the timeline. Almost every limitation behind "parallel participation" traces back to that fusion. The target model **separates the two things that genuinely differ** and keeps everything else derived from them:

- **Time** — a single, sequential **timeline of phases**. A phase is _only_ a labelled stretch of time. This is the one and only way the model represents time.
- **Participation** — lives in **processes**. A process owns a form, a data set of inputs, the interactions it supports, and a status workflow. It is what "participation method" becomes once it is a real, persisted thing rather than a string on a phase.

**Phases configure processes over time.** A process is not "inside" a phase. It exists on the project, and each phase says — for its own window — which processes are _active_ and how they _behave_ (which interactions are open, which fields are shown, etc.). The same process can behave differently from one phase to the next: submission open in one phase, voting open in the next, on the _same_ set of inputs.

**Three consequences shape everything below:**

1. **There is one time concept, not two.** Participation is anchored to phases (or made continuous via open-ended phases) — never given its own free-floating dates that drift off the timeline. This keeps `current_phase` single-valued and the model coherent (see [The time model](#the-time-model-the-startend-mid-phase-question)).
2. **All of today's methods dissolve** into a single process primitive plus a thin layer of templates. Ideation and voting become one process; surveys are private-field processes; proposals are a template; information is simply a phase with no process; and so on (see [How each method dissolves](#how-each-existing-method-dissolves)).
3. **Parallel, overlap, always-on, flexible dates, and a unified reporting grain all fall out of the same model** rather than each needing its own mechanism (see [How the model meets the needs](#how-the-model-meets-the-needs)).

The rest of this document defines the concepts precisely, works through the model and its hardest open question (the start/end-mid-phase issue) and the overlap friction it creates, shows how each existing method maps onto it, maps it to the needs we identified, and records where it agrees with — and diverges from — what the team has discussed.

### Glossary

The vocabulary here is deliberate: naming has been the most persistent source of confusion in the discussions, so each term is pinned down once and used consistently throughout.

- **Project** — The top-level container for a single engagement effort: identity (title, banner, slug), description/content, an owning team, and the participation it hosts. The unit residents land on.

- **Folder** — A grouping above projects, for organising related projects under one umbrella; nestable. Folder-level timelines and reporting are desirable but sit outside the core participation model described here.

- **Phase** — A labelled, time-bounded segment of a project's lifecycle ("Consultation", "Review", "Decision"). A phase is **pure time**: a start, an optional end, a title and a description — and _nothing_ about participation method. Phases are **sequential and non-overlapping**. The first phase may be open on the start side and the last open on the end side, which is how the model expresses continuous, dateless-feeling participation. **This is the single way the model represents time.**

- **Timeline** — The ordered sequence of a project's phases, shown to residents and admins. It is **presentational**: it narrates where the project is and may use exact dates, approximate ones (seasons, months), or none at all (manually advanced). By itself it does **not** define what participation is available — that is decided by which processes are active in the current phase.

- **Process** — The unit of participation, and what "participation method" becomes once it is a persisted, first-class thing. A process owns: (1) a **form** (its fields), (2) a **data set of inputs**, (3) the **interactions** it supports, and (4) a **status workflow** for its inputs. The defining invariant: **one process = one data set = one form.** A project can host several processes, in parallel or in sequence. Ideation-then-voting on the same ideas is **one** process, not two.

- **Method** — The _kind_ of a process — ideation-kind, survey-kind, voting-kind — i.e. its default form shape, default interactions, and default status workflow. Today "method" is a string on the phase backed by a transient object; in the target model it **converges with Process** (a persisted entity). We keep the word "method" only for the _kind_; the per-phase on/off toggles are **configuration**, not methods.

- **Per-phase configuration** — How a phase shapes the processes during its window: which processes are **active**, and for each active process, how it **behaves** — which interactions are open (submit / comment / vote / …), their settings, and which fields are shown / required / hidden. The same process can be configured differently per phase. This mechanism is what replaces today's "a phase has exactly one method."

- **Input** — An item in a process's data set: an idea, a survey response, a proposal, a map pin, a volunteering cause, a common-ground statement. Inputs may be **resident-authored** (ideation, survey) or **admin-authored** (poll options, volunteering causes) — authorship is just a setting on the process. An input carries its form answers, its metadata, and a status.

- **Interaction** — A participation event on inputs: submit, comment, react, vote, rank, cosponsor, sign-up. Interactions are intended to be **first-class** — a uniform record of (actor, type, target, process, time) — which is the substrate that makes cross-process reporting possible. (A comment is richer — a content-bearing input that targets another input — but it is enabled and configured like any other interaction.)

- **Field / Form** — A process's form is a set of **custom fields**; built-in fields such as title and body are simply special custom fields. Each field has a **visibility** — _public_ (shown on input cards: the "ideation" look) or _private_ (admin-only: the "survey" look) — and can be configured per phase (shown / required / hidden). **"Everything is custom fields" is a load-bearing assumption** of this model, and therefore a dependency on the custom-field architecture.

- **Status / status workflow** — The lifecycle a process defines for its inputs (e.g. proposed → under consideration → accepted). Statuses live at the **process / data-set** level, evolve on their own rhythm independent of phases, and can drive filtering — e.g. only `accepted` inputs are votable.

- **Template** — A named preset that scaffolds a process: a form template + default interactions + a status workflow + a recognisable label. Proposals and the Community Monitor are **templates, not primitives**. A template is a **creation-time scaffold** (plus a label for recognisability), not a separate persistent type the system keeps tracking.

### The model in detail

The model has few concepts but a few firm rules. This section states them precisely.

#### Time: phases and the timeline

- A project's time is a **single ordered list of phases**. Each phase is a stretch of time with a title and description.
- Phases are **sequential and non-overlapping**. Because there is one timeline, "where are we now?" always has exactly one answer.
- **Open boundaries:** the first phase may have no start (open-started) and the last may have no end (open-ended). This is how the model expresses **continuous / always-on** participation — a process active across a span that reaches an open boundary simply runs without a hard edge. No separate "always-on" mechanism is needed.
- **Manual vs automated:** a phase may carry exact dates (the active phase then follows the wall clock) or be labelled approximately (seasons, "Spring 2027") or advanced manually. The timeline is **presentational** — it communicates progression; it does not, on its own, open or close participation.
- A phase **need not host participation.** A phase with no active process is an information/content phase — its description and content are what residents see.

#### Process: the unit of participation

A process is fully described by six things:

1. **Form** — its custom fields (built-in title/body are just special fields), each with a **visibility** (public / private).
2. **Input authorship** — resident-authored (ideation, survey) or admin-authored (poll options, volunteering causes).
3. **Anchoring** — none / geographic (map) / document. (This is what lets mapping and document-annotation be ordinary processes.)
4. **Interactions** — which participation events it supports (submit, comment, react, vote, rank, cosponsor, sign-up).
5. **Status workflow** — the lifecycle of its inputs.
6. **Per-phase configuration** — see below.

The defining invariant: **one process = one data set = one form.** A different data set means a different process. A project may host many processes — in parallel or in sequence.

#### Per-phase configuration: the grid

Picture a grid: **rows are processes, columns are phases, and each cell is the process's configuration during that phase** (or "not active"). A cell says: is the process active here; which interactions are open and with what settings; which fields are shown / required / hidden.

The grid reads two ways:

- **Down a column** (one phase) → the several processes active at once → **parallel participation.**
- **Across a row** (one process) → the same process behaving differently over time → **sequential, evolving participation on a shared data set.**

The canonical example — ideation then voting — is one row across two cells:

> **One process** (the ideas and their form). In the "Consultation" phase: `{ submit: on, comment: on, vote: off }`. In the "Decision" phase: `{ submit: off, vote: on }`. The same inputs carry through. There is no separate voting process and no "transitive" flag.

The **curate-then-vote** variant (collect many ideas, vote on a shortlist) needs no second process either: voting applies only to inputs whose status is, say, `accepted` — a **status filter within the one process**.

#### Inputs, statuses, interactions

- **Input** — belongs to exactly one process; carries its form answers, metadata, and a status; resident- or admin-authored.
- **Status** — a per-input lifecycle defined by the process, running independently of phases, and able to gate interactions (e.g. only `accepted` inputs are votable).
- **Interaction** — modelled as a **first-class event** (actor, type, target, process, time). This is the substrate the reporting story rests on (see [Reporting](#reporting--the-open-frontier)). Comments are content-bearing inputs that target another input, but are enabled like any interaction.

#### Templates

A template scaffolds a process at creation — a form template + default interactions + a status workflow + a recognisable label. **Proposals** and the **Community Monitor** are templates of an ideas-process and a survey-process respectively. A template is a creation-time scaffold plus a label, not a persistent type the system keeps tracking.

#### `current_phase` stays single-valued (the key de-risk)

Because time is one sequential concept, **exactly one phase is current at any moment** — `current_phase` remains single-valued and well-defined. What changes is only what hangs off it: "what can I do now?" becomes **"the processes active in the current phase"** (possibly several) instead of "the current phase's one method."

In migration terms this is roughly `current_phase.participation_method → current_phase.active_processes`. The ~316 `current_phase` call sites largely survive. This is a far gentler change than making `current_phase` _multi-valued_ — which is exactly what free-floating activity dates would force, and exactly what the team wants to avoid. (See the next section.)

### The time model: the start/end-mid-phase question

This is the single most consequential — and most contested — modelling choice. It looks like a small UX detail (date pickers) but it decides whether the system has **one** notion of time or **two**.

**The question.** When a participation activity runs "in parallel" (e.g. a survey alongside the timeline), where do its start/end dates come from?

- **Option A — one time concept (this model).** The activity is a process; its active window is given by the **phases it is active in** (or by an open-ended phase, for continuous). It **cannot** start or end at a moment that does not correspond to a phase boundary.
- **Option B — two time concepts.** The activity gets its **own free-floating start/end dates**, independent of the timeline, and can start/end at any wall-clock moment.

**The crucial clarification: parallel ≠ independently-dated.** Concurrency does not require free dates. Everything the parallel/overlap needs are about is achievable under Option A:

- Two processes active in the **same phase** → parallel.
- A process active across phases 1–3 while another is active only in phase 2 → overlap.
- A process active across a span that reaches an open boundary → always-on / continuous.

The **only** thing Option A cannot express is an activity that starts or ends on a date matching **no** phase boundary. For the surveys this is initially about, the real needs are "during this phase" and "always-on" — both Option A. The genuine arbitrary-date case (start mid-phase-1, end mid-phase-2, on dates unrelated to the phases) is rare and weakly motivated.

**The complications Option B brings — stated as starkly as possible:**

1. **Two permanent notions of time.** The project now has _timeline-time_ (phases) and _activity-time_ (free dates) that need not align. "Where are we / what is active" no longer has a single coherent answer. (Rob's own observation in the weekly: "the timeline is no longer the spine of the project.")
2. **Per-phase configuration becomes ill-defined.** The entire power of the model is that a process is _configured per phase_. An activity that **straddles** a phase boundary has no well-defined per-phase configuration — which phase's settings apply in the overlap? This is the "complex, unsustainable logic" risk raised on May 20. In effect, Option B activities **fall outside the grid** and can never join the per-phase mechanism.
3. **`current_phase` can no longer stay single-valued.** Free-dated activities pull toward "many things active at arbitrary times," which is precisely the **multi-valued `current_phase` rewrite** (the ~316 call sites) the team has explicitly decided to avoid.
4. **Migration debt that compounds.** Arbitrary-dated activity data cannot be cleanly snapped onto a phase grid afterwards. Every day Option B runs, unifying back to one time model gets harder — and the very features that need the grid (**parallel ideation, ideation + voting on shared data, per-phase forms**) get a more painful migration.

**The resolution this model adopts: Option A.** Participation is anchored to phases, or made continuous via open-ended phases. The single sacrifice is the arbitrary off-boundary date — judged low-value against keeping one coherent time model, a working per-phase-configuration mechanism, a single-valued `current_phase`, and a clean migration path.

**The continuous / no-timeline case is preserved**, not lost: a "continuous survey with no real timeline" is modelled as a **single open-start + open-end phase, rendered without timeline chrome** — one process active across it. So we do not need (and do not support) a phaseless activity floating on arbitrary dates.

**On the team's current direction.** The June design leans toward Option B (off-timeline surveys with their own dates). Adopting that as the _default_ would place near-term work on the **opposite side of this fork** from the north star. That is why the choice should be made deliberately — ideally tested against real "must start/end off a phase boundary" cases, of which none compelling has surfaced. (It is also why the "reconcile later" point was worth clarifying: it meant _unifying the two time models into one_, **not** collapsing parallel participation back into a single sequence.)

### Handling overlap

Option A models time as a single partition, so "two activities overlap for a while" is expressed by **cutting a boundary** where the overlap starts and ends: posting-only → posting + voting → voting-only becomes three contiguous segments rather than two overlapping bars. This is correct, but it raises a real worry: admins think in **intervals** ("posting runs Jan–Mar, voting Feb–Apr"), not partitions, and a literal three-phase timeline both fragments the narrative and invites the question _"why did I have to create this middle phase?"_ The friction is genuine — but it lives in the **authoring and display layers, not the model.** Three things must be kept separate:

- **Model** — an atomic partition of time (the grid columns); one ordered, non-overlapping sequence.
- **Authoring** — how an admin _creates_ it.
- **Display** — what admins and residents _see_.

**Author by intervals, derive the boundaries.** The admin draws two bars with their own ranges; the system _computes_ the segment where they overlap and inserts the boundary itself. The admin never hand-creates the overlap phase, so the "why this extra phase?" confusion never arises — the partition is an artifact of the model, not a chore for the user.

**Two kinds of boundary.** Not every boundary is a narrative chapter. Distinguish:

- **Narrative boundaries** — named chapters ("Consultation", "Decision"); prominent in the timeline UI, anchor the `project_phase_started` email, set expectations.
- **Config-change boundaries** — silent gridlines where some toggle merely flips. The overlap edge is one of these: de-emphasised or invisible, never named, never authored by hand.

This is the formal version of "show _diverge_ and _converge_ as groups and make the _Discuss & Prioritise_ sliver less prominent": the sliver is a config-change boundary, not a chapter.

**Display can show overlap on top of a partition.** A Gantt-style view shows overlapping bars while time itself stays linear — which is exactly how [the grid](#per-phase-configuration-the-grid) already reads: rows are processes, columns are phases, and overlap is simply two rows active in the same column. Residents and admins see overlapping activity, not "three sequential phases."

**This stays one time model.** The _logical_ `current_phase` binds to the atomic segment and remains single-valued (so the ~316 call sites are safe); the _narrative_ groups are presentational and **may** visually overlap (a segment can belong to both "Diverge" and "Converge"). One timeline at two granularities of labelling — not two clocks that can disagree about "now." The discipline this requires: **logic binds to the atomic segment; only the display binds to the narrative group.** If any behaviour keys off the narrative group, multi-valuedness leaks back in.

**The honest residual cost.** Auto-inserted boundaries still touch everything keyed on phase transitions — phase-started emails, the analytics phase dimension, phase-scoped reports. Without the narrative-vs-config-change tag, every overlap edge would fire a spurious "new phase" notification and fragment reporting. _That_ — tagging boundaries and teaching the phase-transition machinery to ignore the silent ones — is the real work overlap hides; the modelling itself is cheap.

#### The tempting wrong turn: auto-merging configurations

A seductive alternative removes the overlap segment entirely: let the admin define two phases with their own dates and **automatically compute** the overlap's configuration by merging the two field-by-field (posting-on ∪ posting-off → on; group X ∪ group Y → both). It should be **considered and rejected**, for a precise reason rather than an aesthetic one.

First, the framing that settles it: **the explicit overlap segment has no merge problem at all — the admin simply _chooses_ its configuration.** The merge problem is entirely self-inflicted by trying to _derive_ the overlap. So auto-merge is strictly _worse_ than the thing it replaces.

Why it cannot be made general: a merge is only well-defined when a setting's values form a **lattice** — a natural "join". Two kinds qualify, and even they are ambiguous:

- **Booleans** — but OR (most permissive) vs AND (most restrictive) is **intent-dependent**. If phase 2 _deliberately closed_ posting, OR-ing it back on overrides the admin's intent.
- **Set-valued settings** (groups, topics) — union vs intersection, the same ambiguity.

For everything else there is **no join**: the two values are _alternatives_, not combinable.

| Setting                                        | Phase 1  | Phase 2         | A merged value?                                                                                              |
| ---------------------------------------------- | -------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Voting method**                              | budget   | multiple-choice | No such thing — it's one ballot; no merge exists.                                                            |
| **Any numeric** (max votes, budget, threshold) | 5        | 10              | min? max? sum? all arbitrary.                                                                                |
| **Field visibility**                           | public   | private         | Unresolvable **and a privacy hazard** — merging toward public leaks data marked private.                     |
| **Verification / access**                      | email    | ID              | A **security** decision; union-of-groups but intersection-of-verification is one of four defensible answers. |
| **Sort order, form field set / order**         | trending | random          | No meaningful combination; required-ness and ordering undefined.                                             |

Two further nails: the configuration space is **open-ended** — every future setting would need its own merge rule, and most won't have one; and auto-merge is **implicit and uneditable** — the admin can neither see nor directly control the overlap behaviour, which defeats the purpose of an admin tool. The explicit segment is visible and editable. So: **let the admin choose the overlap's configuration; never derive it.**

#### The one real limit

Option A's single genuine cost is a boundary that _must not_ become a phase — a config change that, for some reason, must stay invisible even to the model. That set is nearly empty: inserting a silent, config-change boundary is cheap once the narrative-vs-config-change tag exists. Naming this as the one true limit is more honest than claiming overlap is free.

### How each existing method dissolves

Every current participation method becomes either a **process** (often via a template) or plain **content**. The unifying axes are the six that define a process — most importantly form/field-visibility, input authorship, anchoring, and interactions.

| Today's method          | Becomes                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ideation**            | A **process**: resident-authored ideas; built-in title/body fields + extra public fields; `submit` / `comment` / `react` (and optionally `vote`) enabled per phase. |
| **Voting**              | **Not a method** — a _per-phase configuration_ of an ideas process (`vote` on, `submit` off), acting on the same data set, optionally filtered by status.           |
| **Proposals**           | A **template** of an ideas process: + cosponsor field, reaction threshold, expiry, a specific status workflow.                                                      |
| **Native survey**       | A **process**: resident-authored responses; fields **private** by default; no inter-input interactions.                                                             |
| **External survey**     | **Not a process** — embedded content (an iframe), living as project/phase content (like Information).                                                               |
| **Community Monitor**   | A **template** of a survey process: fixed sentiment categories + recurrence.                                                                                        |
| **Common ground**       | A **process**: "loose" custom fields (statements participants can add) with an agree / disagree / neutral interaction.                                              |
| **Document annotation** | A **process**: inputs (annotations) **anchored** to a document; the document itself is content/context.                                                             |
| **Poll**                | A **process** with **admin-authored** inputs (options) + a `vote` interaction.                                                                                      |
| **Volunteering**        | A **process** with **admin-authored** inputs (causes) + a `sign-up` interaction.                                                                                    |
| **Information**         | **Not a process** — a phase with no active process; its description/content is what residents see.                                                                  |

Only two map to **content rather than a process**: external survey and information. Everything else is a process, several of them via templates. Two further cleanups become natural (not required): **survey and common ground could merge** (both are forms of custom fields), and the long list of methods collapses to "process + a handful of templates."

### How the model meets the needs

Mapping the model back to the feedback clusters (`RESEARCH.md`). Most fall directly out of the model; the honest gaps are called out.

| Need (cluster)                            | How the model meets it                                                                                                                                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1 — Multiple methods at once**         | Several processes active in the **same phase** (a column of the grid).                                                                                                                                     |
| **C2 — Overlapping phases**               | Processes active across **overlapping phase-sets**; phases stay sequential, but participation overlaps freely (see [Handling overlap](#handling-overlap)).                                                 |
| **C3 — Always-on / continuous**           | A process active across a span reaching an **open-ended phase** boundary.                                                                                                                                  |
| **C4 — Flexible / approximate dates**     | The timeline is presentational; phases can be approximate or manual; participation is no longer gated by exact dates.                                                                                      |
| **C5 — Conditional / sequential flow**    | Per-phase configuration sequences behaviour; statuses gate interactions (`accepted` → votable). _Partial: "gating questions before participation" is a form-flow concern, not fully solved here._          |
| **C6 — Unified reporting**                | A **per-process** reporting grain, plus **cross-process roll-up** via first-class interactions — the open frontier (next section).                                                                         |
| **C7 — Timeline UX**                      | The timeline is decoupled from participation → free to reposition, relabel, make approximate; folder-level timelines are additive.                                                                         |
| **C8 — Per-phase / multiple input forms** | Different form = **different process**; two ideation processes (parallel or sequential), each with its own form. _(The team's "one shared ideation form" is a v1 simplification, not a north-star limit.)_ |
| **C9 — Audience-segmented participation** | Multiple processes (or process configurations) **targeted to groups** via permissions; demographics via user fields.                                                                                       |
| **C10 — Public vs private**               | **Per-field visibility** within one form; a single process can mix public and private fields.                                                                                                              |
| **C11 — Demographics as user attributes** | Collected as **user fields**, reused across processes — kept off the per-input data set. _(More a user-field concern than a process-model one, but the model keeps them separate.)_                        |
| **C12 — Live / synchronous**              | _Not addressed._ Real-time, session-bound participation is a different lifecycle — explicitly out of scope (a separate activity kind if ever pursued).                                                     |

Honest summary: **C1–C4, C7, C8, C10 fall out cleanly; C9 and C11 are supported via permissions/user-fields; C5 is partial; C6 is the frontier; C12 is out of scope.**

### Reporting — the open frontier

Reporting is where this model is strongest in _potential_ and least _settled_ in practice — and it is the need GSMs called "the real prize."

- **Per-process reporting is the floor, and largely free.** Because a process owns one data set with one form, reporting on that data set (responses, ideas, votes) is natural — and far cleaner than today's scattered, phase-locked reporting.
- **The prize is cross-process — and it needs a substrate.** "Combine a survey and an ideation," "report across a folder," "track one resident across everything" all require aggregating across **different** processes and data sets. The enabler is modelling **inputs and interactions as first-class, uniformly-shaped events** (actor, type, target, process, time). With that substrate, cross-process / cross-project / cross-folder aggregation becomes a query rather than a special case.
- **Two non-substitutes, stated honestly.** (1) _Merging similar methods_ (survey + common ground) helps only those specific pairs and is really a model cleanup — it does **not** deliver combined reporting across genuinely different methods (e.g. survey + ideation). (2) _Per-process reporting alone_ leaves cross-method combination unsolved.

So: **per-process reporting is the floor; first-class interactions + project/folder roll-up is the aspiration and the real prize.** This is the part of the north star that most needs dedicated design, and the part least settled today. It is named here as the frontier rather than smoothed over.

### Agreement with the meetings, and where they explored variations

This model did not emerge in isolation — much of it is where the team's technical discussions independently converged. This section is explicit about both the agreement and the genuine divergences, so neither is hidden.

**Where the model agrees with the team's convergence:**

- **Separate time from participation** — the team's "off-timeline activity" / "process" instinct is the same split the model makes between phases (time) and processes (participation).
- **A process / data-set layer** that owns the form, statuses, input manager, tags and reporting (Koen's "the form is the process").
- **Forms move from the project to the phase/process level.**
- **The timeline becomes presentational**, which unlocks vague/approximate dates.
- **Surveys-first, reuse the phase machinery, backward-compatible, incremental** — the model is designed to be reached in steps, not a big bang.
- **Avoid the rewrite; `current_phase` is load-bearing** — the model keeps it single-valued precisely for this reason.
- **Methods are over-specific and should generalise/dissolve** — a diagnosis the team shares.
- **Voting is awkward as a separate method acting on past ideas** (Koen) → the model makes voting a per-phase configuration of the ideas process.
- **Events are not now, and not as phases** — consistent with the model treating them as out of scope.
- **"A phase is an activity"** (James) — the model takes one cleaner step further: participation lives in _processes_; phases are _pure time_, not a second kind of activity.

**Where the meetings leaned toward, or explored, a different choice than this model makes:**

- **The time-model fork (the biggest live divergence).** The June design leans to **free-dated off-timeline activities** (two time concepts); this model takes **one time concept** (see [the time model](#the-time-model-the-startend-mid-phase-question)).
- **Keeping `participation_method` on the phase** as the near-term reality, vs the model's "method dissolves into process." A **shared diagnosis, different timing** — the model is the destination, not the next step.
- **"Extras" / dropping the word "activities"** (June design) vs the model's "everything is a process." A shipping-label choice; the underlying concept question it sidesteps will resurface with the second method.
- **"Ideation and voting phases must share one form, no per-ideation-phase forms"** (May 21 decision) vs the model's "different form = different process," which supports per-phase forms natively. A **v1 simplification**, not a north-star limit.
- **Whether to expose the process concept in the UI** — the team is undecided; this model assumes it eventually becomes a real, likely user-facing concept.
- **Two grouping concepts** in the team's sketches (an off-timeline "activity" _and_ a "process") vs the model's **single Process** that may or may not be placed on the timeline.

## Free-floating processes

_Processes that carry their own dates; the timeline narrates but doesn't gate._

### How it works

A project is a **set of processes**, each a self-contained data-set owner — it owns its form, its inputs, its interactions, its statuses and its permissions — and, in this candidate, **its own start and (optional) end dates**, independent of any timeline. A process is live whenever the clock is inside its window (or open-ended, for always-on); **availability is decided per process, not by a single project clock**. The **timeline survives only as narration** — a presentational strip of phases telling residents where the project is, without opening or closing anything. Parallelism is the default: several processes live at once is parallel, overlapping windows is overlap, no end date is always-on. "Method" (ideation, survey, proposals, voting) is a **template** of a process, not a type.

**On the name.** This is the **same `Process` primitive** as in the Grid and Self-contained processes — a data-set owner (form + inputs + interactions + statuses). The three differ _only in where a process gets its time_: the Grid's process is **configured per phase** (time from the project timeline); here it **carries its own free dates**; Self-contained processes' process **carries its own internal lifecycle** (dated steps). The team's June design calls this same free-dated unit an _activity_ (surfaced via _Extras_) — same thing, team vocabulary.

_Example: a "Wemmel park" project runs a "Share your ideas" process (Jun–Aug), a "Resident survey" process (Jun–Jul) and an always-on "Suggestion box" — each with its own dates, shown together on the project page; the phase timeline, if present, is just a narrative banner._

### Data model

- **Relationships.** A **Project** owns many **Processes**. A **Process** owns its **Form** (`CustomForm.participation_context = Process`), its **interactions**, a **status workflow**, its **Permissions** (`permission_scope = Process`) and **its own dates**. An **Input** belongs to **exactly one** Process; a **Form** is **1—1** with its Process. **Method** is a template-kind of the process (configuration). **Phases / the Timeline** survive only as presentational narrative — _not_ linked to processes, and not gating participation.
- **Entities.** New: **`Process`** — `belongs_to :project`, its own `title` / `description`, `start_at`, `end_at` (nullable), `kind`/template, interaction toggles, status-workflow ref, published flag. Changed: **`CustomForm`** context → Process; **`Permission`** scope → Process; **`Input`** gains `process_id`; **`creation_phase`** dropped (or kept as a narrative tag), **`ideas_phases`** likewise. **`ParticipationMethod`** dissolves into the process's template.
- **ER sketch.** `Project 1—* Process (each with own start/end) · Process 1—1 Form · Process 1—* Permission · Input *—1 Process · Process —references→ Process (e.g. voting → ideas) · Phases/Timeline: presentational, not linked to Processes`
- **Ideation → voting.** A process is flat (one config for its life), so ideation→voting on the same ideas is **two overlapping processes**: a "collect ideas" process owns the ideas; a "vote" process **references** that data set and records vote interactions against it — nothing is copied or re-owned, and no form-compatibility check arises (votes read the ideas as-is). _The Grid does this as **one** process whose config changes per phase (ideas + votes in one data set); Free-floating's flat processes need the reference instead._
- **Time & transitions.** The defining choice: **two notions of time** — each process's own dates _and_ the narrative timeline — which need not align. Phases **may still carry dates and "transition"** (the displayed _current chapter_ advances), but **narrative-only**: it doesn't open or close participation. So `current_phase` is **only a narrative pointer**; the participation signal moves to the process — a poller on **each process's** dates makes the real notification **"the survey is now open,"** not "the phase started" (a `project_phase_started`-style campaign can still fire for the chapter change, but it's cosmetic). To avoid maintaining process dates _and_ phase dates separately, a process may optionally **attach its window to a phase** — which _is_ the Grid's mechanism (attach all → one clock; it snaps dates only, not per-phase config).
- **Resolving an input.** Single, unambiguous owner: `Input → Process → {form, interactions, statuses, permission, kind}`; one form per process (evolvable), so a form-compatibility check never arises.

### Immediate requests

- **Extra surveys.** The native case — a parallel survey _is_ just a process with its own dates; no special "Extras" concept is needed, and the narrative timeline doesn't constrain it. Notably, because availability and permission are **per process**, resident **submission works with no `current_phase` obstacle** — the obstacle that blocks the boolean / multi-timeline approaches dissolves here. (That dissolution is the flip side of having paid the `current_phase` decoupling cost model-wide.)
- **Parallel ideation, different forms.** Also native: two ideation processes, each owning its own form and dates, both live at once and shown side by side on the project page — no "second timeline" workaround and no `current_phase` ambiguity, since each process carries its own permission and window. The request is met directly; "same timeline" simply isn't a constraint, because the timeline no longer gates.

### The long-term bet

- **Unification: L3–L4.** The Process is a genuine data-set owner — form per process, per-field _and_ per-submission visibility, interactions decoupled from kind, method-as-template, and novel unnamed combinations all expressible. It reaches the same tier as the Grid (only Self-contained processes goes higher), and unlike Multiple timelines it forfeits none of the unification prize.
- **Upside.** Free-floating dates are **native** (the team's stated hard requirement, met head-on); parallel / overlap / always-on are trivial; the submission obstacle dissolves; it matches the team's "activity"/"Extras" design and the competitor mental model directly (familiar to migrating clients, low admin learning curve); and the process legitimately carries its own title/description — **no Phase-overload**.
- **Cost.** Two permanent notions of time that can disagree, so "where are we / what's active" loses a single answer; the **~316-site `current_phase` rework** (the biggest blast radius short of Self-contained processes); the timeline stops driving anything — it can still narrate, but is **no longer the spine** (the differentiator GSMs prize); **ideation→voting is split across two processes** (a reporting join); migration debt compounds while two time models coexist; and curating many processes on the project page is a real UX burden (the "omnibox vs per-survey widget" question).
- **Verdict:** the highest-unification candidate that _also_ satisfies the free-date requirement — the genuine fork against the Grid. Choose it if date-freedom and competitor-familiarity outweigh keeping the timeline load-bearing and avoiding the `current_phase` rewrite.

### Neighbours

Grid ↔ Free-floating processes ↔ Self-contained processes are one spectrum on **where a process's time lives**: attach every process to a phase → the Grid (one clock); leave them free-dated → Free-floating; give a process its own scheduled, changing config → Self-contained.

## Self-contained processes

_Each process owns its multi-step lifecycle on its own schedule; a project is a portfolio of them._

### How it works

A project is a **portfolio of processes running in parallel**, and each process is a self-contained mini-project: it owns its form, its data set, its statuses and its permissions — and **its own internal lifecycle, a sequence of dated steps** (e.g. collect → shortlist → vote → results). A process changes behaviour as it advances its steps, **on its own schedule**, independent of the others. Time lives _inside_ each process. The project keeps a **narrative timeline on top** — authored chapters telling the project's story — but it is **cosmetic**: it does not gate participation; each process gates itself through its own steps.

**The power, in one line:** it is the only candidate with **both** a multi-step lifecycle on _one_ data set **and** an independent schedule per process:

|                    | multi-step on one data set?  | independently scheduled?            |
| ------------------ | ---------------------------- | ----------------------------------- |
| Grid               | ✅ (config per shared phase) | ❌ (all share the project timeline) |
| Free-floating      | ❌ (flat process)            | ✅                                  |
| **Self-contained** | **✅**                       | **✅**                              |

_Example: a "Wemmel park" participatory budget runs as **17 neighbourhood processes**, each with the same collect → shortlist → vote → results lifecycle but on **its own dates**, alongside an always-on "Suggestion box" — and you roll up reporting across all 17. No single shared timeline can express 17 differently-clocked lifecycles; this model can._

### Data model

- **Relationships.** A **Project** owns many **Processes** plus an **authored narrative timeline** (chapters, cosmetic). A **Process** is the data-set owner — its **Form** (`CustomForm.participation_context = Process`, 1—1), its **inputs**, **statuses**, **interactions** and **permissions** — and it owns a **lifecycle of `ProcessStep`s**. An **Input** belongs to exactly one Process. **Method** is a template (form + step sequence + statuses). The narrative timeline is **not** linked to processes and does not gate.
- **Entities.** New: **`Process`** (data-set owner) and **`ProcessStep`** — `belongs_to :process`, `ordering`, `start_at`/`end_at` (or duration; may be manual/approximate), per-step interaction toggles & field visibility. Changed: **`Input`** gains `process_id` and its "phase" becomes the **step** it was created in; **`Permission`** scope → Process (or step); the project **`Phase`** becomes a **narrative chapter** (no method, no gating); **`ParticipationMethod`** dissolves into the process template.
- **ER sketch.** `Project 1—* Process · Project 1—* NarrativeChapter (cosmetic) · Process 1—* ProcessStep (sequential, dated, per-step config) · Process 1—1 Form · Input *—1 Process · current step: per Process`
- **Ideation → voting (native — the cleanest of the five).** Simply **two steps of one process** on one data set: it advances `collect` → `vote`, the same inputs carry through — no second process, no reference, no shared-timeline cells. Proposals fit most naturally too (collect → threshold → decision _are_ the steps).
- **Time & transitions.** Time lives **inside each process**: a poller crosses **each process's step boundaries**, advancing that process on its own schedule, so "phase started" becomes **"process step started"** (per process). There is **no single project `current_phase`** — each process has its own current step (multi-valued at the project level). The narrative timeline can transition too (the displayed chapter advances), but **cosmetically** — it never opens or closes anything. So there are **two clocks** (narrative + per-process lifecycles), but because the narrative doesn't gate they can't _conflict_ — the cost is upkeep, not incoherence.
- **Resolving an input.** `Input → Process → current step → {interactions, field visibility}`, with `{form, statuses, permission}` from the Process. One form per process (evolvable), so no form-compatibility check, and ideation→voting needs no reference because it's one process.

### Immediate requests

- **Extra surveys.** Native: a survey is a process with a small lifecycle (draft → open → closed → results) on its own dates, parallel to everything else. No special "Extras" concept; submission is per-process, so the `current_phase` obstacle dissolves.
- **Parallel ideation, different forms.** Native: two ideation processes, each its own form and lifecycle, running in parallel and shown together under the project narrative. Met directly; "same timeline" isn't a constraint, since the narrative doesn't gate.

### The long-term bet

- **Unification: L4 (the highest).** Everything the Grid has — form per process, per-field/per-submission visibility, interactions decoupled, method-as-template — **plus** the lifecycle, which adds expressiveness (curate → publish → vote on one set) and makes ideation→voting and proposals native.
- **Upside.** The cleanest unified-inputs **and** reporting story (each process is one data set with a lifecycle → per-process reporting is "the real prize"); the **only** model for a **fleet of identically-structured, independently-scheduled processes with roll-up** (PB across neighbourhoods, staggered cohorts, rolling proposals); free dates and the submission obstacle both fall out; strongest templates (form + step sequence + statuses).
- **Cost.** The **hardest migration**, because it _inverts_ the timeline's role: today the timeline is the load-bearing spine (phases drive `current_phase`, permissions, emails, reporting); here it is demoted to a cosmetic narrative while per-process lifecycles take over — so today's mixed-method timeline **splits into separate processes + a narrative**, and `current_phase` goes per-process (the largest rework of the five). It is also the biggest **conceptual** shift for admins (think in per-process lifecycles, not one project timeline), and the narrative-on-top reintroduces a second (cosmetic) clock to maintain.
- **Verdict:** the highest ceiling of all five — but you **don't migrate to it directly**. It is the Grid's **continuation**: reach it via the Grid (which preserves the timeline), then let a process's config detach onto its own schedule **only** when a project genuinely needs the fleet-of-independent-lifecycles. So it is the **stretch destination**, not the next step.

### Neighbours

One spectrum on **where a process's time lives**: the **Grid** configures a process per _shared_ project phase (one clock; the migration-friendly step that _preserves_ today's timeline); **Self-contained** lets that config detach onto the process's _own_ private steps (timeline → narrative; `current_phase` → per-process). It is also **Multiple timelines upgraded** with a real data-set owner (L0–L1 → L4), and a **close cousin of Free-floating** (both = narrative + per-process time; a structured lifecycle here vs a flat window there).
