# FormLogic: one engine for survey logic

Not wired into the app yet: nothing outside this folder and its specs calls it.

## Shape

```
stored logic (custom_fields.logic, v1)
        │
        ▼
 LegacyNormalizer ── v1 → engine logic, reproducing today's respondent paths, plus a report
        │
        ▼
 engine logic (field ids, option ids)  ◀── Validator        builder save: one error per condition
        │                               ◀── ReferenceWalker  copies, temp ids, deleted options/fields/pages
        │                               ◀── Describer        targets, unreachable pages, jumps using a question
        ▼
    Compiler ── option ids → answer keys; "end" → user fields page or end page; disabled fields out
        │
        ▼
 program (field ids) ─────────────────── to be serialized with the public custom fields
        │                                            │
        ▼                                            ▼
 SurveyWalker (Ruby)                        walkSurvey.ts (TS)
  SubmissionGuard, results, exports,        next page, submit label, show/hide,
  import                                    clearing skipped answers
        └──── same fixtures: spec/fixtures/form_logic/walker/*.json ────┘
```

`InputTypeStrategy#logic_operators` says which operators each input type supports as a
condition source. The Validator uses it; it is meant to replace the hard-coded type lists.

## Engine logic (in memory; how it is stored is not decided yet)

```jsonc
// page
{ "jumps": [{ "when": Cond, "goto": "<page id>" | "end" }], "next": "<page id>" | "end" }
// question
{ "display": Cond, "required_if": Cond }
// Cond
{ "all": [Cond] } | { "any": [Cond] } | { "not": Cond }
| { "field": "<question id>", "op": "<operator>", "value": [<option ids>] | <number> }
```

The program has the same shape, but with option answer keys instead of option ids, and with
every page and question in order (see `survey_walker.rb`).

## Files

| File | Role |
|---|---|
| `form_logic.rb` | `FormLogic.normalize`, `.compile`, `.walk`; take records or `Field`s |
| `field.rb` | The attributes of a custom field the engine needs (`Field.from_custom_field`, `.from_h`) |
| `conditions.rb` | 11 operators + `all`/`any`/`not`; wrong types give false, never an error |
| `survey_walker.rb` | Walks a program for one set of answers: path, visible, required, kept answers |
| `legacy_normalizer.rb` | v1 → engine logic, with a report of what it dropped or found wrong |
| `compiler.rb` | Engine logic → program |
| `validator.rb` | In-memory validation, errors with a path into the logic |
| `reference_walker.rb` | `references`, `remap`, `drop_option`, `drop_field` |
| `describer.rb` | `static_targets`, `unreachable_page_ids`, `jumps_using` |
| `submission_guard.rb` | Drops unseen answers, finds missing required ones; `:shadow` (default) or `:enforce` |
| `front/app/utils/formLogic/{types,walkSurvey}.ts` | The TS walker |

## Which part replaces which existing place

| Place | Today | Replaced by |
|---|---|---|
| E1 Logic-tab gate | `FormBuilderSettings/index.tsx` | `logic_operators` serialized per field |
| E2 Rule editor | `LogicSettings/*` | Stays as UI, writes engine logic |
| E3 Yup target-after-source | `utils/yup/validateLogic.ts` | `Validator` |
| E4 Conflict detection | `edit/utils.ts` | Deleted: ordered first-match jumps cannot conflict; `Describer` for warnings |
| E5 BE whitelist + silent clear | `supports_logic?`, `custom_field.rb` | `logic_operators` + `Validator` error |
| E6 Structure validation, temp ids | `form_logic_service.rb` | `Validator` + `ReferenceWalker.remap` |
| E7 Respondent runtime | `SurveyForm/logic.ts` | `walkSurvey.ts` (keep `determinePreviousPageNumber`) |
| E8 Results re-implementation | `surveys/results_generator.rb` | `SurveyWalker#walk(...).visible_ids` per input |
| E9 Results overlay + filter | `results_with_logic_generator.rb` | `Describer` |
| E10 PDF routing text | `logic_instruction_generator.rb` | `Describer` |
| E11 Import required-skip | `idea_custom_fields_service.rb` | `SubmissionGuard` per row |
| C1 Copy form | `idea_custom_fields_service.rb` | `ReferenceWalker.remap` |
| C2 Super-admin paste | `SuperAdmin/utils.ts` | `ReferenceWalker.remap` |
| C3 Project copy / templates | `project_copy_service.rb`, template serializer | Copy logic + `ReferenceWalker.remap` |
| C4 User fields page | `user_fields_in_form_service.rb` | Deleted: the Compiler resolves "end" to that page |
| C5 Option deletion | `form_logic_service.rb` | `ReferenceWalker.drop_option` |
| New | idea create/update | `SubmissionGuard` (shadow mode first) |

## Tests

- `spec/fixtures/form_logic/walker/*.json`: program + answers → path, visible, required, kept
  answers. Run by `spec/lib/form_logic/survey_walker_spec.rb` and
  `front/app/utils/formLogic/walkSurvey.test.ts`. A file can name programs once under
  `programs` and refer to them from its cases. `generated.json` is written by
  `spec/fixtures/form_logic/generate_walker_parity.rb`; regenerate it, don't edit it.
- `spec/fixtures/form_logic/legacy/*.json`: stored fields + answers → page path. Run against
  today's `logic.ts` (`logic.characterization.test.ts`) and against the engine
  (`spec/lib/form_logic/legacy_spec.rb`). Where the engine deliberately differs, the case has
  `divergent: { runtime, engine }`.
- One spec per class in `spec/lib/form_logic/`, plus `spec/lib/form_logic_spec.rb` on real
  records and `spec/lib/input_type_strategy/logic_operators_spec.rb`.
