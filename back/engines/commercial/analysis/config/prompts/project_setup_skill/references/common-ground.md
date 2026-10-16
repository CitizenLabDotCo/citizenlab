# Common ground — consensus method reference

**Read this when a recipe uses the `common_ground` method.** Common ground distils a large conversation into short **trade-off statements** that participants react to — **agree / unsure / disagree** — producing a live map of **where the community aligns and where it diverges**. It's not a poll; it's a structured convergence step that bridges open ideation and deeper deliberation.

> **Provenance — confirmed from source + support.** `ParticipationMethod::CommonGround` in [`back/lib/participation_method/common_ground.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/lib/participation_method/common_ground.rb) (`master`), and the [Finding Common Ground support article](https://support.govocal.com/en/articles/609603-finding-common-ground).

## How it works (like voting, but on statements)

Like voting and proposals, **reactions are the votes** (`use_reactions_as_votes? = true`) — but here residents react to **statements**, not options or ideas. The three reactions (code `SUPPORTED_REACTION_MODES = ["up","down","neutral"]`) map to:

| Resident sees | Code reaction |
|---|---|
| **Agree** | `up` |
| **Unsure** | `neutral` |
| **Disagree** | `down` |

(`reacting_dislike_enabled = true` so the "disagree" / down reaction is available.) Results are **live and public** — every participant sees the emerging consensus in real time, which builds trust. It's a **very sticky** method (~80% completion) because reacting to a statement is low-effort and immediately rewarding.

## What a "statement" is

Statements are the inputs of a common-ground phase. From the code (`default_fields`) and the support article:

- A statement is a **title only** — `text_multiloc`, **required, 3–120 characters**. There is **no body field** and **no image** (intentional: "inputs are essentially short statements").
- Frame them as **trade-off statements** — a position someone could reasonably agree *or* disagree with (not neutral facts). That's what surfaces consensus vs. division.
- **~25 statements** is the recommended amount.
- Default `input_term` is `contribution`.

## Where statements come from (set by the admin — like voting options)

Statements are added **after the phase exists**, by the admin, via the phase's **input manager**:
1. **AI-generated from the preceding phase (recommended)** — run **Sensemaking → Ask AI** over the ideation/survey output to summarise it into position statements. The support article's prompt:
   > *"Generate up to 25 trade-off questions (max 120 chars) from key ideation topics for agree / unsure / disagree responses."*
2. **Imported** from a previous project (imports all its inputs — prune after).
3. **Manually added** by an admin/PM.
4. **User-submitted** — if Phase Access settings allow it, residents can add their own statements (a live, evolving set).

**Consequence for a new project draft:** like voting options, the skill **does not author the final statements** in the draft. It sets the phase config, recommends the count/framing, and surfaces the Sensemaking prompt for the admin. Only propose seed statements (clearly flagged) if the intake hands you genuinely substantive trade-offs.

## Sequencing — put it after divergent input

Common ground is a **convergence / deliberation** step, so it works best **preceded by an ideation or survey phase**: gather divergent input first, then use common ground to find where the community actually agrees. Typical shapes:

- `ideation → common_ground → information`
- `native_survey → common_ground → information`
- as a **post-deliberation** follow-up to resolve remaining disagreement/uncertainty.

Close with an information phase as usual (§2 cross-cutting rule). Don't run common ground cold with no upstream input unless the statements are already well-defined by the client.

## Config fields (confirmed)

| Field | Notes |
|---|---|
| `participation_method` | `"common_ground"` |
| reactions | agree (`up`) / unsure (`neutral`) / disagree (`down`); `reacting_dislike_enabled = true` |
| `input_term` | default `contribution` |
| statement form | title only (`text_multiloc`), **required, 3–120 chars**; no body, no image |
| statement submission | via Phase Access settings — admins/PMs only, or residents too |
| results | live, **visible to all, cannot be hidden**; export PDF/Word from the Insights tab |
| submission rules | votes are **final** (can't be edited); author names not shown publicly (admins can see them) |

## Payload shape

```json
{
  "method": "common_ground",
  "title": "...",
  "description": "...",
  "input_term": "contribution",
  "common_ground_config": {
    "reactions": ["agree", "unsure", "disagree"],
    "statement_source": "ai_from_previous_phase | admin_added | imported | user_submitted",
    "recommended_statement_count": 25,
    "statement_max_chars": 120
  },
  "proposed_statements": []
}
```
- Leave `proposed_statements` empty unless the intake supplies real trade-offs; the admin generates the final set (usually via Sensemaking).

## GSM report hooks
- **Decisions (§7 #3):** note that common ground was placed **after** the ideation/survey phase to converge the community, and the intended statement source.
- **Things to review (§7 #4):**
  - **Statements to generate/curate** — the admin must add ~25 trade-off statements (≤120 chars) via the input manager, ideally AI-generated from the upstream phase with Sensemaking. Include the prompt above. The draft can't author these.
  - **Public results** — results are visible to everyone and **can't be hidden**; make sure the client is comfortable with live, transparent results.
  - **No images on statements** — note the limitation if the topic seemed to want visuals.

## Source
- `ParticipationMethod::CommonGround` (reactions, defaults, title-only 3–120-char statement form): [`back/lib/participation_method/common_ground.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/lib/participation_method/common_ground.rb) (`master`).
- Method framing, setup, results, access rights, AI-statement prompt: [Finding Common Ground](https://support.govocal.com/en/articles/609603-finding-common-ground) (Go Vocal support).
