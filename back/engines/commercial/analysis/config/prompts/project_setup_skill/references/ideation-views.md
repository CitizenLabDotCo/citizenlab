# Ideation input views — configuration reference

**Read this when a drafted phase uses the `ideation` method and you've selected its input view.** The view *decision rule* lives inline in SKILL.md §2b — **List view needs no extra configuration**, so you only need this file when you've chosen **Map** or **Perspectives**, which carry extra payload and setup.

## What a "view" is

An `ideation` phase collects inputs (ideas) through the submission form. The **view** is how those inputs are displayed to residents in the front office. On the platform the views are independent toggles (List is the default); a phase can have more than one enabled. The skill always keeps **List** available and adds **Map** and/or **Perspectives** when the ask calls for it.

---

## Input form — default to minimal

An ideation submission form *can* use many of the same custom field types as a survey (`references/survey-design.md`). **For project creation, don't.** The barrier to submitting an idea should be as low as possible — a long ideation form suppresses submissions. So the skill's default ideation form is just:

1. **Title** (`title_multiloc`) — required
2. **Description / body** (`body_multiloc`) — required
3. **Image upload** (`image_files`) — optional; include **only when a photo genuinely helps** (ideas about physical places, objects, spaces)

**Do not add any other fields to an ideation form by default** — no extra selects, numbers, ratings, dates, etc. This is the opposite of the survey default (where diversity of question types is encouraged). Surveys are for structured data; ideation is for lowering the bar to contributing an idea.

**Add a field beyond these three only when the intake explicitly nudges for it**, e.g.:

- The ask is **spatial** (a place / route / site) → add a **location field** (`point`). This is the *same* signal that selects **Map** view (below) — location field and Map view go together.
- The intake wants ideas **categorised / filterable** → add a single- or multi-select (`select` / `multiselect`) topic field.
- The intake explicitly needs one structured attribute per idea (a ward, a rough budget, etc.) → add that single field.

When you add anything beyond the default three, **cite the intake signal that justified it** in the GSM report (§7 #3), and keep it to the minimum that signal requires. When in doubt, leave it out.

---

## Reactions & commenting (phase toggles)

An ideation phase has phase-level toggles for how residents engage with *each other's* ideas. These are **phase config** — distinct from *who is allowed* to comment/react, which is the permission layer (`commenting_idea` / `reacting_idea` `permitted_by`) in `references/project-config.md`. Both layers exist; don't confuse them.

| Field | Default | Controls |
|---|---|---|
| `commenting_enabled` | `true` | whether residents can comment on ideas |
| `reacting_enabled` | `true` | whether residents can react (vote) on ideas at all |
| `reacting_like_method` | `unlimited` | `unlimited` = like as many as you want; `limited` = each resident gets `reacting_like_limited_max` likes |
| `reacting_like_limited_max` | `10` | the like budget when `limited` |
| `reacting_dislike_enabled` | **`false`** | whether **down-votes / disagree** are allowed |
| `reacting_dislike_method` / `reacting_dislike_limited_max` | `unlimited` / `10` | same mechanics for dislikes (only relevant when dislikes are enabled) |

**Recommendations:**
- **Commenting on** by default — ideation is deliberative and comments add context. Turn it off only for a deliberately lightweight "just collect ideas" ask.
- **Likes `unlimited` by default.** Switch to **`limited`** when you want residents to **prioritise** — a like budget produces a clearer signal of what matters most (useful when you'll act on a shortlist).
- **Down-votes OFF (the platform default).** Dislikes can chill participation and enable pile-ons on minority ideas. Enable them only when **surfacing disagreement is an explicit goal** — and even then **consider `common_ground` instead** (`references/common-ground.md`), which is purpose-built for agree/disagree and doesn't punish individual residents' ideas.
- Cite the intake signal in the GSM report whenever you deviate from these defaults (especially enabling dislikes).

**Payload** (phase level):
```json
"reactions": {
  "commenting_enabled": true,
  "reacting_enabled": true,
  "reacting_like_method": "unlimited | limited",
  "reacting_like_limited_max": 10,
  "reacting_dislike_enabled": false,
  "reacting_dislike_method": "unlimited | limited",
  "reacting_dislike_limited_max": 10
}
```
Include `*_limited_max` only when the matching method is `limited`; include the dislike fields only when `reacting_dislike_enabled: true`. (Proposals inherits these but forces up-votes only / dislikes off — see `references/proposals.md`.)

---

## The three views

### 1. List view (default)
- Inputs shown as a scrollable feed, sortable by trending, reactions, comments, date, or activity.
- **Best for:** **smaller** ideation consultations and non-spatial asks (expect fewer than ~50 inputs).
- **Config:** none beyond the input form — just draft the form questions (SKILL.md §6 form-design rules + bias checklist).
- **Payload:** `view_config.views: ["list"]`, `primary_view: "list"`.

### 2. Map view
- Inputs shown as **pins on a map**. **Best for:** **spatial asks** where the input *is* a place — residents drop a pin to show *where* (e.g. "drop a pin where you'd like to see more greenery / a bench / a safer crossing"). Typical for urban planning, infrastructure, and place-based feedback.
- **Hard requirement:** the input form MUST include a **location field** (SKILL.md §2b). Without it, inputs have no coordinates and can't be pinned. If you select Map, set `ideation_form.location_field: true` on the phase.
- **Map configuration is project-level, not per-phase.** The platform currently shares one map config across all phases (you can't set different map configs per phase). So populate **`project.map_config` once**, not inside each phase. It holds: default centre (latitude / longitude), zoom level, and optional imported layers (Esri Feature Layer / Esri Web Map / GeoJSON).
- **Default centre & zoom — coordinate lookup rule:**
  1. **If a default lat/long is already set on the platform's map config, keep it — never override it.** An existing centre was set deliberately (often hand-positioned by the tenant); record it with `source: "tenant_default"` and move on. Same if the intake supplies one (`source: "intake"`).
  2. **Only if there is no default lat/long at all, look it up.** Derive the municipality name from the `Tenant URL`, then do **one web lookup** for that municipality's coordinates. This is a safe, verifiable public fact — apply the same guardrails as the Local grounding pass (SKILL.md §6): provenance-tagged, GSM verifies before publish. Set `source: "web_lookup"`.
  3. **Zoom default:** `11–12` for a municipality-wide view (city/town extent). Tighten to `13–14` for a single neighbourhood/site; widen to `9–10` for a region.
- **GSM report:** when `source: "web_lookup"`, flag the chosen centre/zoom in "Things to review" with the source link and a "verify before publish" note.
- **Payload:** phase gets `view_config.views: ["list","map"]`, `primary_view: "map"`; project gets the `map_config` block.

Example `project.map_config`:
```json
"map_config": {
  "default_latitude": 50.8503,
  "default_longitude": 4.3517,
  "zoom_level": 11,
  "source": "web_lookup",
  "layers": []
}
```

### 3. Perspectives view
- Inputs are clustered by AI into **topics and subtopics**, so residents navigate emerging themes, find common ground, and avoid echo chambers.
- **Best for: larger-scale consultations where >50 inputs are expected.** Above ~50 ideas a flat List becomes hard to navigate, and the AI topic/subtopic clustering earns its keep. Gauge expected volume from intake `Output success` and audience size; when in real doubt, default to List.
- **Theme creation — Automatic AI theme creation (recommended default):** let the AI generate input tags. Three setup actions:
  1. **Clear the existing default input tags** — the AI creates accurate tags automatically; stale defaults pollute the clustering. (`default_tags_cleared: true`)
  2. **Enable Auto-tagging** (toggle on). (`auto_tagging: true`)
  3. **Remove the Tags question from the input form** — Timeline tab → click the phase → Input Form tab → Edit Input Form → delete the Tags question. Never add a Tags question to an auto-tagged Perspectives form. (`tags_question_in_form: false`)
- **These three are back-office UI actions the MCP can't perform yet.** Encode the end-state in the payload (`perspectives_config`) **and** list the three steps as a pre-publish checklist in the GSM report "Things to review" so the GSM completes them.
- **Payload:** phase gets `view_config.views: ["list","perspectives"]`, `primary_view: "perspectives"`, plus the `perspectives_config` block.

Example phase `perspectives_config`:
```json
"perspectives_config": {
  "auto_tagging": true,
  "default_tags_cleared": true,
  "tags_question_in_form": false
}
```

---

## Choosing the view (decision rule — also summarised inline in §2b)

| Signal in the intake | View |
|---|---|
| Smaller ideation consultation; non-spatial (fewer than ~50 inputs) | **List** |
| Spatial ask — residents drop a pin to show *where* | **Map** (+ location field on the form) |
| Larger-scale consultation — **>50 inputs expected** | **Perspectives** (+ auto-tagging) |

- A spatial ask that also expects >50 inputs can enable **both** Map and Perspectives (keep List on too). Pick `primary_view` by the dominant need.
- If you're unsure about volume, default to **List** and flag it for the GSM rather than over-configuring Perspectives.
- Map view and a `location_field` go together: enabling one without the other is a defect — flag it.

---

## Payload shape

**Project level** (shared across all phases — populate once if any ideation phase uses Map view):
```json
"map_config": {
  "default_latitude": 0.0,
  "default_longitude": 0.0,
  "zoom_level": 11,
  "source": "intake | web_lookup | tenant_default",
  "layers": []
}
```

**Ideation phase level** (add to each ideation phase object):
```json
"view_config": {
  "views": ["list"],
  "primary_view": "list",
  "perspectives_config": {
    "auto_tagging": true,
    "default_tags_cleared": true,
    "tags_question_in_form": false
  }
}
```
- Include `perspectives_config` only when `"perspectives"` is in `views`.
- Include the project-level `map_config` only when at least one ideation phase has `"map"` in `views`.

---

## GSM report hooks (§7 #3 and #4)

- **Decisions (§7 #3):** name the view(s) chosen and the intake signal that drove it — e.g. *"Perspectives view — intake `Output success` targets 800+ residents citywide; a flat list wouldn't scale."*
- **Things to review (§7 #4):**
  - **Map + `source: "web_lookup"`** → one line: map centre/zoom came from a web lookup of `{municipality}`, with source link + "verify before publish."
  - **Perspectives** → the 3-step auto-tagging checklist (clear default tags, enable auto-tagging, delete the Tags question from the input form) as a pre-publish action list for the GSM, since the MCP can't do these yet.
