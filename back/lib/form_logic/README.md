# FormLogic: one engine for survey logic

## Shape

```
stored logic (custom_fields.logic, v1 or v2, ids)
        │
        ▼
 LegacyNormalizer ── v1 → v2 in memory (deleted after the data rake)
        │
        ▼
   v2 (ids)  ◀── Validator        builder save: refs, forward-only, ops per type
        │    ◀── ReferenceWalker  temp ids, copies, templates, option deletion
        │    ◀── Describer        PDF routing text, results overlay, builder overview
        ▼
    Compiler ── ids → keys, the only place that knows option id vs key and input types
        │
        ▼
 program (keys) ──────────────── serialized with the public custom fields
        │                                   │
        ▼                                   ▼
 Evaluator (Ruby)                  interpret.ts (TS, ~150 lines)
  SubmissionGuard, results,         next page, submit label,
  exports, import                   skipped-page clearing, show/hide
        └──────── same fixtures: spec/fixtures/form_logic/programs.json ────────┘
```

The registry is `InputTypeStrategy#logic_operators`: which operators a field type supports
as a condition source. It replaces every hard-coded "which types support logic" list.

## Files

| File | State | Role |
|---|---|---|
| `form_logic.rb` | done | Facade: `FormLogic.compile(fields)`, `FormLogic.evaluate(fields, answers)` |
| `conditions.rb` | done | 11 operators + `all`/`any`/`not` |
| `evaluator.rb` | done | Walks a program: path, visible keys, required keys, kept answers |
| `schema.rb` | stub | JSON schema of stored v2 |
| `legacy_normalizer.rb` | stub | v1 → v2, encodes today's semantics |
| `compiler.rb` | stub | v2 → program |
| `validator.rb` | stub | In-memory validation before saving |
| `reference_walker.rb` | stub | All id rewrites |
| `describer.rb` | stub | Logic as text / static targets |
| `submission_guard.rb` | stub | Server-side filtering and required check |
| `input_type_strategy/{base,select,linear_scale}.rb` | started | `logic_operators` |
| `front/app/utils/formLogic/{types,interpret}.ts` | done | FE interpreter of the program |

## Which part replaces which existing place

| Place | Today | Replaced by |
|---|---|---|
| E1 Logic-tab gate | `FormBuilderSettings/index.tsx:55-73` | `logic_operators` serialized per field |
| E2 Rule editor | `LogicSettings/*` | Stays as UI, writes v2 |
| E3 Yup target-after-source | `utils/yup/validateLogic.ts` | `Validator` (422 errors per field index) |
| E4 Conflict detection | `edit/utils.ts:176-264` | Deleted: ordered first-match jumps cannot conflict |
| E5 BE whitelist + silent clear | `supports_logic?`, `custom_field.rb:465-467` | `logic_operators` + `Validator` error |
| E6 Structure validation, temp ids | `form_logic_service.rb` | `Validator` + `ReferenceWalker.remap` |
| E7 Respondent runtime | `SurveyForm/logic.ts` | `interpret.ts` (keep `determinePreviousPageNumber`) |
| E8 Results re-implementation | `results_generator.rb:153-245` | `Evaluator#evaluate(...).visible_keys` per input |
| E9 Results overlay + filter | `results_with_logic_generator.rb` | `Describer#static_targets` |
| E10 PDF routing text | `logic_instruction_generator.rb` | `Describer#instructions_for` |
| E11 Import required-skip | `idea_custom_fields_service.rb:57-62` | `SubmissionGuard` per row |
| C1 Copy form | `idea_custom_fields_service.rb:148-167` | `ReferenceWalker.remap` |
| C2 Super-admin paste | `SuperAdmin/utils.ts:59-80` | `ReferenceWalker.remap` (BE) or typed-slot walk (FE) |
| C3 Project copy / templates | `project_copy_service.rb`, template serializer | Copy `logic` + `ReferenceWalker.remap` |
| C4 Demographics page | `user_fields_in_form_service.rb:141-151` | Deleted: `end` is symbolic, user page is a fixed pre-end page |
| C5 Option deletion | `form_logic_service.rb:35-43` | `ReferenceWalker.drop_option` |
| New | idea create/update | `SubmissionGuard` (shadow mode first) |

## Tests

Two fixture files, each run by Ruby and TS:

- `spec/fixtures/form_logic/legacy_paths.json`: legacy fields + answers → path. Runs
  today against `logic.ts` (`logic.characterization.test.ts`) and should also run against
  the results generator. Known differences are recorded under `divergent` with both
  outcomes. The `results` values come from reading the code and are not verified yet. Once the
  engine exists, `LegacyNormalizer` + `Compiler` + `Evaluator` must reproduce `expected` and
  the chosen side of each `divergent`. That is the safety net for the swap.
- `spec/fixtures/form_logic/programs.json`: program + answers → path, visible, required,
  kept answers. Runs against `Evaluator` (`spec/lib/form_logic/evaluator_spec.rb`) and
  `interpret.ts` (`interpret.test.ts`). This keeps the two interpreters in sync.
