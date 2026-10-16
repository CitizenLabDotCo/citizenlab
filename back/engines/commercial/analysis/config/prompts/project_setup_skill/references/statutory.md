# Statutory modifier — handling reference

**Read this file only when `statutory: true`** (detection criteria live inline in SKILL.md §3). It holds the fields to capture, the statutory recipe overlay, worked examples, and the influence ceiling needed to apply the modifier in Step 3.

Statutory consultation is a legal regime under which a project runs, not a purpose. A project under statutory rules still has one of the 5 archetypes. The statutory dimension modifies *how* the recipe runs — not *what* the project is for.

## Fields to capture when `statutory: true`

| Field | Source | Example values |
|---|---|---|
| `jurisdiction` | `Tenant URL` country + intake | `BE-Flanders`, `BE-Wallonia`, `UK-England`, `DE-Bavaria`, `FR-national`, `NL-municipal` |
| `instrument` | `Compliance requirements` | `openbaar onderzoek`, `enquête publique`, `formal consultation`, `Bürgerbeteiligung` |
| `minimum_duration_days` | jurisdiction lookup or intake | `30`, `42`, `60` |
| `response_document_required` | jurisdiction default unless intake says otherwise | true/false |
| `evidence_of_consideration_required` | jurisdiction default | true/false |
| `notice_requirements` | jurisdiction default | `["gazette", "posters", "register"]` |

If the intake doesn't specify the instrument or jurisdiction and you can't infer them safely, flag in "Things missing" and use conservative defaults (60-day minimum, response doc required).

## Statutory recipe lookup (the pinned formal-input channel)

| Recipe | n | Part | Process | Infl | Feed | Avg participants |
|---|---|---|---|---|---|---|
| **`native_survey → information → information`** ✅ standard statutory | 449 | **4.18** | 3.92 | 3.03 | 3.33 | 277 |
| `native_survey → information → information → information` | 90 | 4.29 | 4.13 | 3.14 | 3.59 | 218 |
| `information → native_survey → information` (big-audience hack) | 64 | 4.21 | 4.07 | 3.15 | 3.39 | **509** |
| `native_survey → information` | 439 | 3.98 | 3.62 | 2.97 | 2.99 | 295 |
| `native_survey` (alone) ❌ anti-pattern | **1,877** | 2.96 | 3.30 | 2.85 | **2.01** | 167 |

**Reads:**
- Caps at Influence ~3.0 — set GSM expectations.
- Lead with information phase for the biggest crowds (avg 509).

## Recipe overlay (what the modifier does)

When `statutory: true`, take the archetype's canonical recipe and apply this overlay:

1. **Pin a formal-input phase.** Add one `native_survey` or structured `information` phase running for the full `minimum_duration_days` — the legally defensible channel.
2. **Add a closing information phase publishing the response document.** Separate from any closing info phase the archetype already has; combine if duration constraints force it.
3. **Lock publication and notice settings** to match `notice_requirements`.
4. **Set a pre-launch checkpoint** in the GSM report: "Confirm procedural floor for `{jurisdiction}` before publishing."

Non-statutory archetype phases (ideation workshops for co-creation, voting for devolved) run **alongside** the pinned formal-input phase, not instead of it.

## Worked examples

### Co-creation × statutory
- Archetype recipe: `ideation → ideation → information`
- Overlay: + pinned `native_survey` (60 days) + closing `information` (response doc)
- Resulting phases: `information → ideation → ideation → native_survey (60d) → information (response doc)`

### Information × statutory (the honest case)
- Archetype: Information & transparency
- Overlay: pinned `native_survey` (legal floor) + closing `information` with response doc
- Tell the GSM: "Nothing is substantively up for influence here. Statutory floor is met, but running this as a consultation creates expectations you won't meet."

### Devolved × statutory (rare)
- Archetype recipe: `ideation → voting → information`
- Overlay: confirm voting mechanics meet legal binding-vote requirements; add publication step.

## Influence ceiling under statutory
Statutory channels alone cap at Influence ~3.0. To exceed, add real co-design phases alongside the statutory channel and document them in the project description. Set the expectation in the GSM report.

## Naming note
"Statutory" implies common-law framing. Continental European instruments are equivalent but named differently. For v1, keep `statutory: true/false` as the flag and rely on `jurisdiction` + `instrument` to disambiguate.
