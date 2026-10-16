# Proposals (petitions) — method reference

**Read this when a recipe uses the `proposals` method.** Proposals is the **petition-style** method: residents submit proposals and others **back them with votes**; a proposal that reaches a **vote threshold** within a time window advances. Use it when the intake talks about **petitions, citizen initiatives, "residents propose and others support it", or a continual "submit your idea and gather backing" mechanism** — not a one-off, time-boxed consultation.

> **Provenance — confirmed from source.** Read directly from the repo: `ParticipationMethod::Proposals` in [`back/lib/participation_method/proposals.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/lib/participation_method/proposals.rb) and the phase schema/validations in [`back/app/models/phase.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/app/models/phase.rb).

## It's ideation + a threshold

In the code, `class Proposals < Ideation` — proposals **inherits ideation**. So everything in `references/ideation-views.md` applies: the **minimal input form default** (Title + Description + optional Image; add fields only on an intake nudge), the views, commenting, reacting. The differences are:

| Aspect | Proposals behaviour (from code) |
|---|---|
| **Votes** | Reactions **are** the votes (`use_reactions_as_votes? = true`), and **up-votes only** (`SUPPORTED_REACTION_MODES = ["up"]`; `reacting_dislike_enabled = false`). |
| **Threshold** | Each proposal must reach `reacting_threshold` votes (required, integer > 1). **Default 300.** |
| **Expiry** | Each proposal has `expire_days_limit` days to reach the threshold before it expires (required, integer > 0). **Default 90.** |
| **Automated statuses** | `supports_automated_statuses? = true` — proposals change status automatically (e.g. threshold reached / expired). This is why threshold + expiry are required. |
| **Input term** | `default_input_term = 'proposal'`; can be set to **`petition`** or **`initiative`** (or others) to match the intake's language. |
| **Co-sponsors** | Supported (`cosponsors_in_form? = true`) — proposers can invite co-sponsors; cosponsor email campaigns exist. |
| **Budget** | None (`budget_in_form? = false`). |
| **Continual, not transitive** | `transitive? = false` — a proposals phase is a standalone, ongoing agenda-setting mechanism; inputs don't flow into a next phase the way ideation does. |
| **Moderation** | `prescreening_mode` optional (`nil` default; `flagged_only` / `all`) — pre-publication moderation, if the `prescreening` feature is on. |

This maps to the **Issue identification & agenda-setting** archetype (§1), which already names `proposals` for continual/ongoing input.

## Configuring the vote threshold (the key decision)

The threshold is **per proposal** — how many votes one proposal needs to advance. Set it to the **municipality's size**: high enough to signal real support, low enough to be achievable for that population.

| Tenant size | `reacting_threshold` |
|---|---|
| **Small municipality** (small population) | **under 500** (the platform default of 300 is a sensible starting point) |
| Mid-size city | ~500–1,200 |
| **Large city** (Copenhagen-size, ~600k+) | **1,200–2,500** |

- Base this on the **tenant's population**. If the intake doesn't give it, look the municipality's population up (one web search, same grounding-pass guardrails as the map coordinate lookup in `references/ideation-views.md` — provenance-tagged, GSM verifies), or flag it for the GSM.
- A threshold that's too high for the population kills the mechanism (nothing ever passes); too low makes it meaningless. When unsure, lean **lower** within the band so proposals can realistically succeed, and flag for the GSM.

## Configuring expiry

`expire_days_limit` is the window each proposal has to reach the threshold. **Default 90 days.** Keep it generous enough that a proposal can realistically gather the required votes; align with any campaign window in the intake (`Hard deadline`). Shorter windows + high thresholds is a common failure combination — avoid it.

## Input term

Match `input_term` to the intake's language: a petition campaign → `petition`; a citizen-initiative programme → `initiative`; otherwise the default `proposal`. This changes the resident-facing wording throughout the phase.

## Config fields (confirmed)

| Field | Type | Notes |
|---|---|---|
| `participation_method` | string | `"proposals"` |
| `input_term` | enum | `proposal` (default) / `petition` / `initiative` / … |
| `reacting_threshold` | integer > 1 | votes (up-reactions) needed per proposal. Default 300 |
| `expire_days_limit` | integer > 0 | days to reach threshold. Default 90 |
| `reacting_dislike_enabled` | boolean | forced **false** (up-votes only) |
| `prescreening_mode` | enum/null | `null` (default) / `flagged_only` / `all` — optional moderation |
| `commenting_enabled`, `reacting_enabled` | boolean | inherited from ideation (default on) |
| input form | — | inherited ideation form — **minimal by default** (see `references/ideation-views.md`) |

## Payload shape

Add a `proposals_config` to the `proposals` phase, and reuse the (minimal) ideation form:
```json
{
  "method": "proposals",
  "title": "...",
  "description": "...",
  "input_term": "proposal | petition | initiative",
  "proposals_config": {
    "reacting_threshold": 300,
    "expire_days_limit": 90,
    "reacting_dislike_enabled": false,
    "prescreening_mode": null
  },
  "ideation_form": { "fields": [ { "key": "title", "type": "short_text", "required": true }, { "key": "body", "type": "long_text", "required": true } ], "image_upload": false }
}
```

## GSM report hooks
- **Decisions (§7 #3):** name the `input_term`, the `reacting_threshold` and the **population basis** for it, and the `expire_days_limit` — e.g. *"Petition method, threshold 1,800 votes / 90 days — Copenhagen-size tenant (~650k); input term 'petition' per the intake."*
- **Things to review (§7 #4):**
  - **Threshold vs. realistic reach** — confirm the threshold against the *engaged* population, not just headcount; flag if the tenant's typical participation makes it unreachable.
  - **Population source** — if the population was web-looked-up, link it with a "verify before publish" note.
  - **Moderation** — ask whether `prescreening_mode` should be on (petitions can attract off-topic or inappropriate submissions).

## Source
- `ParticipationMethod::Proposals`: [`back/lib/participation_method/proposals.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/lib/participation_method/proposals.rb) (`master`).
- Phase fields/validations (`reacting_threshold`, `expire_days_limit`, `input_term` enum incl. `petition`/`initiative`): [`back/app/models/phase.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/app/models/phase.rb) (`master`).
