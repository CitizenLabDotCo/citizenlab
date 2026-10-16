# Voting methods — configuration reference

**Read this when a drafted recipe contains a `voting` phase.** Voting offers three methods with different pre-configurations. Pick the one the intake implies, then configure the phase fields below.

> **Field-name provenance.** The voting phase field names below are **confirmed** from the internal front-end type definition `IVotingPhaseAttributes` (Notion ticket TAN-4925 "Splitting phase types", copied from the codebase) and the public API (`govocal-api` skill, `references/endpoints.md`). Confirmed fields: `participation_method: 'voting'`, `voting_method`, `voting_term_singular_multiloc`, `voting_term_plural_multiloc`, `voting_min_total`, `voting_max_total`, `voting_max_votes_per_idea`, `manual_voters_amount`; inputs carry `budget`; votes tally via `baskets` / `basket_ideas`. The platform supports three voting types — Approval, Cumulative, Participatory Budgeting (support article "Voting and Prioritization Methods"). **The one thing still to verify against the current code is the exact `voting_method` enum string values** (`single_voting` / `multiple_voting` / `budgeting` are strongly implied by internal docs but were not seen verbatim in source here).

---

## The three methods

### 1. One vote per option — **Approval voting**
- Residents approve any options they support (one vote max per option; they can back several).
- **Use when:** you want a **clear, simple winner / shortlist prioritisation** — "which of these should we do?" Low cognitive load, high accessibility.
- **Key config:** `voting_max_total` = how many options a resident may approve (cap, or leave at the option count for "approve as many as you like"). No per-option budget.
- `voting_method`: **`single_voting`** ⚠ verify in code.

### 2. Multiple votes per option — **Cumulative voting**
- Residents get a pool of tokens to distribute, and may **pile several tokens on one option** to show intensity of preference.
- **Use when:** you want residents to express **strength of preference**, not just a binary pick — concentrate support or spread it.
- **Key config:** `voting_max_total` = tokens each resident gets (e.g. 3); `voting_max_votes_per_idea` caps how many tokens may land on a single option (omit for "no cap").
- `voting_method`: **`multiple_voting`** ⚠ verify in code.

### 3. Budget allocation — **Participatory Budgeting**
- Each idea/input has a **cost**, and the resident is given a **total budget to spend across ideas** — their basket is valid while the total cost stays within the pot.
- **Use when:** there is a **real, fixed budget** and options have realistic costs — classic PB ("spend €X across these costed projects"). Forces trade-offs / financial responsibility.
- **Key config:** every voting option (idea) needs a `budget` (cost) **✓ public API**; `voting_max_total` = the resident's total budget (the pot); `voting_min_total` = optional minimum they must allocate.
- `voting_method`: **`budgeting`** ⚠ verify in code.

---

## Inferring the method from the intake

| Signal in the intake | Method |
|---|---|
| Want a clear winner / simple shortlist prioritisation; options are comparable and uncosted | **Approval** (`single_voting`) |
| Want to capture **how strongly** residents prefer options; let them concentrate support | **Cumulative** (`multiple_voting`) |
| There is a **fixed budget** and options carry **costs**; residents allocate money | **Budgeting** (`budgeting`) |

Read these intake fields:
- `Driver - what & why now` — mentions of a budget/pot, "spend €…", per-project costs, "participatory budget" → **Budgeting**. Mentions of "show how strongly / prioritise with weight" → **Cumulative**. "Pick the ones we should do / clear winner" → **Approval**.
- `Real influence level` — Empower + a funded pot is the classic PB (**Budgeting**) signal.
- `Output success` — a named funding amount points to **Budgeting**; "a ranked sense of priorities" points to **Cumulative**; "a decision on which to back" points to **Approval**.

When the intake doesn't clearly imply one, **default to Approval** (simplest, most accessible) and flag the choice for the GSM.

---

## Where the voting options come from (important — bounds what the skill can draft)

**Voting options ARE ideas/inputs** — the same `idea` entity, assigned to the voting phase (linked via `idea_phases`). A voting phase does not have its own separate "options"; it votes on ideas that have been placed in it.

**Consequence for a brand-new project: at draft time there are no options yet.** You're setting up the project before any ideas exist, so you **cannot** populate voting options. For a `voting` phase the skill can only draft the **general configuration**:

- **Phase title**
- **Phase description**
- **Voting method configuration** (`voting_config` — method, totals, caps, terms)

**The options are added later, by the project manager / admin**, once they know what the options should be — which is typically **after the preceding ideation or survey phase closes**. Two routes the admin uses:

1. **From a preceding `ideation` phase** — select/move some of the submitted ideas into the voting phase so they appear as options (and, for Budgeting, attach a cost to each).
2. **From a preceding `native_survey` phase (or themes)** — survey responses aren't ideas, so the admin **turns them into ideas by submitting ideas themselves via the back office**, then those become the voting options.

Either way, **creating the options is a human admin step the skill does not perform.** The skill's job is to draft a clear phase + correct voting config, and to tell the GSM/admin that options must be added after the upstream phase.

**Edge case — options already known at draft time:** if the intake *explicitly enumerates* fixed options (e.g. five named, pre-decided projects with budgets), you may list them in the payload as **proposed ideas for the admin to submit** — clearly marked as proposals, not auto-created. Never invent options or costs the intake didn't give.

---

## Phase config fields (what to set)

**Common to every `voting` phase:**
- `participation_method: "voting"` ✓ public API
- `voting_method`: one of the three above ⚠ verify enum strings in code
- `voting_min_total`, `voting_max_total` (semantics differ by method — see each method)
- vote terminology labels, singular/plural (e.g. "vote"/"votes", "token"/"tokens", "€") — `voting_term_singular_multiloc` / `voting_term_plural_multiloc`
- options list (the ideas), each with `budget` set **only for Budgeting**
- `manual_voters_amount` (optional) — count of offline/manually-added voters, for when paper or in-person votes are added to the tally (pairs with offline voting / FormSync)
- platform handles automatically (no config needed, but worth stating in the description): three front-office stages (open → cast → results), options randomised to avoid bias, votes hidden until close, a reminder email 24h before close. Voting is anonymous by default.

**Method-specific:**

| Method | `voting_max_total` means | Per-option control | Option `budget` |
|---|---|---|---|
| Approval (`single_voting`) | max options a resident may approve | 1 vote per option (implicit) | not used |
| Cumulative (`multiple_voting`) | tokens per resident | `voting_max_votes_per_idea` cap | not used |
| Budgeting (`budgeting`) | the resident's total budget (pot) | — | **required** per option ✓ |

---

## Payload shape (voting phase)

Add a `voting_config` block to the `voting` phase object:
```json
"voting_config": {
  "voting_method": "single_voting | multiple_voting | budgeting",
  "voting_max_total": 3,
  "voting_min_total": 0,
  "voting_max_votes_per_idea": 3,
  "vote_term_singular": "vote",
  "vote_term_plural": "votes",
  "options_status": "added_by_admin_after_upstream_phase | proposed_from_intake",
  "options": []
}
```
- `options` is normally **empty at draft time** — options are ideas the admin adds after the upstream phase (see above). Use `options_status: "added_by_admin_after_upstream_phase"` for the usual case.
- Only when the intake enumerates fixed options, list them as proposals under `options` (e.g. `{ "title": "...", "budget": 0 }`) and set `options_status: "proposed_from_intake"`.
- Include `voting_max_votes_per_idea` only for `multiple_voting`.
- Set each proposed option's `budget` only for `budgeting` (the resident's pot is `voting_max_total`).
- Field names map to the confirmed `IVotingPhaseAttributes` fields (`voting_method`, `voting_min_total`, `voting_max_total`, `voting_max_votes_per_idea`, `voting_term_singular_multiloc` / `_plural_`). The publisher should map the payload's `vote_term_singular`/`vote_term_plural` to the `_multiloc` fields, and confirm the `voting_method` enum string values.

---

## GSM report hooks

- **Decisions (§7 #3):** name the voting method and the intake signal that drove it — e.g. *"Budget allocation (Participatory Budgeting) — intake `Driver` names a €250k pot and per-project costs."*
- **Things to review (§7 #4):**
  - **Voting options are added later by the admin** — always flag this for a voting phase: options are ideas the PM/admin adds *after* the upstream phase closes (move ideation ideas into the phase, or submit ideas built from survey responses/themes via the back office; for Budgeting, set each cost). The draft only sets the phase + voting config.
  - **Budget figures to confirm** — for Budgeting: confirm the total pot (`voting_max_total`) and each option's `budget` with the client; never invent monetary amounts (principle #6) — use `[budget — to confirm]` placeholders.
  - **Vote allowance to confirm** — for Approval/Cumulative: confirm the per-resident allowance (`voting_max_total`) and any per-option cap.
  - **Enum-mapping note** — remind the publisher to confirm the exact `voting_method` enum strings (`single_voting` / `multiple_voting` / `budgeting`) against the current platform code; the other field names are already confirmed.

## Source
- Confirmed phase field names: internal FE type `IVotingPhaseAttributes` in [Notion TAN-4925 "Splitting phase types"](https://app.notion.com/p/21f9663b7b26801cbb0ec2dd473b440b) (copied from the codebase) + `govocal-api` skill `references/endpoints.md` (Phases + Voting sections).
- Three methods + admin framing: [Notion — "What is the voting and prioritization method?"](https://app.notion.com/p/2429663b7b2680d19eb7c9bdc96c3c7b) and [Go Vocal blog — New voting possibilities](https://www.govocal.com/blog/new-voting-possibilities-more-nuanced-decision-making) (Approval = one vote per option; Cumulative = multiple votes per option; Participatory Budgeting = budget allocation).
- Still to verify: exact `voting_method` enum strings against [CitizenLabDotCo/citizenlab](https://github.com/CitizenLabDotCo/citizenlab).
