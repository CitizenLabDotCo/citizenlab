---
name: create-test-data
description: Create a realistic local test project for a given participation method, directly via `docker compose run --rm -T web bin/rails runner`. No rake task artifact is produced. Invoke as `/create-test-data <method> [project_name] [phase_name]`.
---

# Create test data for a participation method

Invoked as `/create-test-data <method> [project_name] [phase_name]` where `<method>` is one of the 11 participation methods below. Generates a realistic published project + phase with domain-specific data on the local `localhost` tenant.

**Optional arguments:**

- `project_name` — custom title for the project. If omitted, defaults to `"<Method> Test Project"`.
- `phase_name` — custom title for the phase. If omitted, defaults to a method-appropriate phrase (e.g. `"Share your ideas"` for ideation, `"Quick community poll"` for poll).

Both default names are fine — don't prompt the user unnecessarily. Only use the custom names if the user included them when invoking the skill.

## Valid methods

`common_ground`, `community_monitor_survey`, `document_annotation`, `ideation`, `information`, `native_survey`, `poll`, `proposals`, `survey`, `volunteering`, `voting`

If the user passed no argument or an unrecognised method, list the valid methods and stop.

## How the skill executes

This skill does NOT write a rake task to disk. For each invocation:

1. Build a Ruby script for the requested method, based on the template below + the method-specific block further down.
2. Execute it via:
   ```bash
   docker compose run --rm -T web bin/rails runner - <<'RUBY'
   <script body>
   RUBY
   ```
   `-T` keeps stdin clean for the heredoc. `rails runner -` reads the script from stdin.
3. The script wraps everything in `Tenant.find_by(host: 'localhost').switch do ... end` and prints the admin URL / phase ID / record counts on success.
4. After the runner exits 0, print the admin URL back to the user so they can open it.

## Preconditions to verify before running

- Docker services up: `docker compose ps` → `cl-back-web` running.
- Backend reachable: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/web_api/v1/app_configuration` returns `200`.
- If either fails, tell the user to start the backend first; do not run the script.

## Multiloc & tenant locales

The localhost tenant has an arbitrary number of configured locales (typically 4: `en`, `fr-BE`, `nl-BE`, `nl-NL`, but it can be more or fewer). **Always read them dynamically from `AppConfiguration`.** Never hardcode a locale list — the skill must work for any tenant configuration.

`title_multiloc` / `description_multiloc` validations only require one locale to be present, so English-only would technically work for creation, but populating all configured locales gives realistic data for UI language-switching tests.

At the top of every script, resolve locales once and define a helper:

```ruby
locales = AppConfiguration.instance.settings.dig('core', 'locales') || ['en']
ml = ->(text) { locales.to_h { |l| [l, text] } }   # same text in every configured locale
```

Use `ml.call('Hello')` anywhere the template below shows `{ 'en' => 'Hello' }`. If you need genuinely different copy per locale, pass a hash instead: `locales.to_h { |l| [l, "Hello (#{l})"] }`.

## Common template (all methods share this shell)

```ruby
# Arguments passed in from the skill invocation:
# PROJECT_NAME — string or nil (falls back to "<Method> Test Project")
# PHASE_NAME   — string or nil (falls back to method-specific default below)

Tenant.find_by(host: 'localhost').switch do
  locales = AppConfiguration.instance.settings.dig('core', 'locales') || ['en']
  ml = ->(text) { locales.to_h { |l| [l, text] } }

  project_title = PROJECT_NAME || '<METHOD_HUMAN_TITLE> Test Project'
  phase_title   = PHASE_NAME   || '<METHOD_DEFAULT_PHASE_NAME>'

  timestamp = Time.now.to_i
  admin = User.find_by(email: 'admin@govocal.com')
  raise 'admin@govocal.com not found — seed data missing?' if admin.nil?

  # 1. Enable feature flag (skip if method has no flag — see table below)
  # <feature_flag_block>

  # 2. Create 15–30 participant users (idempotent via find_or_create_by!)
  first_names = %w[Emma Liam Sofia Noah Olivia James Ava Lucas Mia Ethan
                   Isabella Mason Charlotte Logan Amelia Alexander Harper
                   Benjamin Ella Jacob Aria Daniel Grace Matthew Chloe
                   Henry Victoria Samuel Penelope Owen Layla]
  last_names  = %w[Johnson Williams Martinez Anderson Taylor Thomas Garcia
                   Robinson Clark Lewis Walker Hall Allen Young King Wright
                   Scott Torres Nguyen Hill Flores Green Adams Nelson Baker
                   Rivera Campbell Mitchell Carter Roberts]
  users = 30.times.map do |i|
    fn, ln = first_names[i], last_names[i]
    User.find_or_create_by!(email: "#{fn.downcase}.#{ln.downcase}_<METHOD>_#{timestamp}@community.org") do |u|
      u.first_name = fn
      u.last_name  = ln
      u.password   = 'democracy2.0'
      u.locale     = 'en'
      u.roles      = []
      u.registration_completed_at = Time.now
      u.invite_status = 'accepted'
    end
  end

  # 3. Create the project (slug includes timestamp for idempotency)
  project = Project.create!(
    title_multiloc: ml.call(project_title),
    description_multiloc: ml.call("<p>Generated test project for <METHOD>.</p>"),
    description_preview_multiloc: ml.call('Generated test project.'),
    slug: "test-<METHOD_HYPHENATED>-#{timestamp}",   # NB: slug regex rejects underscores — e.g. common_ground → common-ground, native_survey → native-survey, document_annotation → document-annotation
    visible_to: 'public',
    admin_publication_attributes: { publication_status: 'published' }
  )

  # 4. Create the phase (method-specific fields — see per-method block)
  phase = project.phases.create!(
    title_multiloc: ml.call(phase_title),
    description_multiloc: ml.call('<p>Test phase.</p>'),
    participation_method: '<METHOD>',
    start_at: Date.new(2024, 9, 1),
    end_at:   Date.new(2025, 10, 15)
    # <phase_extra_fields>
  )

  # 5. Set up permissions
  Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)

  # 6. Method-specific domain data — see per-method block below
  # <method_specific_data>

  puts '=' * 60
  puts "Test project for <METHOD> created"
  puts "Project ID: #{project.id}"
  puts "Phase ID:   #{phase.id}"
  puts "Admin URL:  http://localhost:3000/en/admin/projects/#{project.id}"
  puts "Public URL: http://localhost:3000/en/projects/#{project.slug}"
  puts '=' * 60
end
```

Substitute `<METHOD>`, `<METHOD_HUMAN_TITLE>`, `<feature_flag_block>`, `<phase_extra_fields>`, `<method_specific_data>` per the table below.

## Feature flags

Most methods **do not need** a feature flag (either there isn't one, or it's on by default in the localhost seed). Only enable explicitly for methods marked below.

| Method                   | Feature flag key                                        | Needs enabling?                |
| ------------------------ | ------------------------------------------------------- | ------------------------------ |
| common_ground            | `common_ground`                                         | Yes — enable + allow           |
| community_monitor_survey | `community_monitor`                                     | Yes — enable + allow           |
| poll                     | `polls`                                                 | Usually on; enable defensively |
| survey                   | `surveys` + `typeform_surveys` / `google_forms_surveys` | Usually on                     |
| document_annotation      | —                                                       | No                             |
| ideation                 | —                                                       | No                             |
| information              | —                                                       | No                             |
| native_survey            | —                                                       | No                             |
| proposals                | —                                                       | No                             |
| volunteering             | —                                                       | No                             |
| voting                   | —                                                       | No                             |

**Feature flag block template (only when needed):**

```ruby
config = AppConfiguration.instance
cfg    = config.settings['<FLAG>'] || {}
unless cfg['enabled'] && cfg['allowed']
  settings = config.settings
  settings['<FLAG>'] = { 'enabled' => true, 'allowed' => true }
  config.update!(settings: settings)
end
```

**Important:** only call `config.update!` when the flag is not already enabled. A `full` update may trip a schema-drift validation on unrelated stale settings keys (e.g. `input_form_custom_fields`) on existing localhost tenants. The guard above avoids the update entirely when it's a no-op.

## Per-method blocks

### ideation

- Feature flag: none.
- `phase_extra_fields`: `reacting_enabled: true, reacting_dislike_enabled: true`
- Domain data: Ideas + Comments + Reactions (up/down).
- `Idea` requires `idea_status: IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation')`, `project:`, `phases: [phase]`, `author:`, `title_multiloc`, `body_multiloc`. **Do NOT set `creation_phase:`** — ideation is transitive and the model validates against it.
- Create ~15 ideas with realistic titles, 3–8 comments per idea, 10–25 reactions per idea (70% up, 30% down).

### Transitive vs non-transitive Idea creation

Some participation methods are **transitive** (`ParticipationMethod#transitive? => true`). For those, omit `creation_phase:` when creating `Idea` records. For non-transitive methods, set `creation_phase: phase`.

| Method                   | Transitive?             | Pass `creation_phase:`? |
| ------------------------ | ----------------------- | ----------------------- |
| ideation                 | yes                     | no                      |
| voting                   | yes (inherits Ideation) | no                      |
| proposals                | no                      | yes                     |
| common_ground            | no                      | yes                     |
| native_survey            | no                      | yes                     |
| community_monitor_survey | no                      | yes                     |

Poll, volunteering, survey, information, document_annotation don't create Ideas directly.

### proposals

- Feature flag: none.
- `phase_extra_fields`: `reacting_enabled: true, reacting_dislike_enabled: false, expire_days_limit: 90, reacting_threshold: 300, prescreening_mode: nil`
- Domain data: Ideas (proposals) + Reactions (up only, no down).
- `idea_status`: use `IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation')`.
- Create ~10 proposals, each with 50–250 up-reactions to show progress toward the reacting_threshold.
- Optionally wire 2–4 cosponsors per proposal via `Cosponsorship.create!(idea: idea, user: users.sample)` if that model is present.

### voting

- Feature flag: none.
- `phase_extra_fields`: `voting_method: 'budgeting', voting_max_total: 10_000, voting_min_total: 1_000, vote_term: 'vote', ideas_order: 'random'`
- For `single_voting`: use `voting_method: 'single_voting', voting_max_votes_per_idea: 1`. For `multiple_voting`: use `voting_method: 'multiple_voting', voting_max_votes_per_idea: 3, voting_max_total: 5`.
- Domain data: Ideas (with `budget:` set) + Baskets + BasketsIdeas.
- For each idea: `budget: rand(500..3000)` for budgeting; irrelevant for single/multiple.
- Create ~12 ideas, then for ~20 users create a Basket and add 2–5 `BasketsIdeas` (Basket needs `phase:`, `user:`, `submitted_at: Time.now`).
- `IdeaStatus`: use the `ideation` status (`idea_status_method: 'ideation'`).

### poll

- Feature flag: `polls` (defensive enable).
- `phase_extra_fields`: none special.
- Domain data: `Polls::Question` + `Polls::Option` + `Polls::Response` + `Polls::ResponseOption`.
- Create 3 questions (mix of `single_option` and `multiple_options` with `max_options: 3`), each with 3–5 options. Then for ~25 users create a `Polls::Response` with 1+ `Polls::ResponseOption` rows respecting the question type.
- Response uniqueness: `Polls::Response` has unique `user_id` per phase — use 1 response per user per phase max.

### native_survey

- Feature flag: none.
- `phase_extra_fields`: `native_survey_title_multiloc: { 'en' => 'Test Survey' }, native_survey_button_multiloc: { 'en' => 'Take the survey' }`
- Domain data: use `ParticipationMethod::NativeSurvey.new(phase).create_default_form!` to create a default form, then add 3–5 more `CustomField` rows (input_types: `linear_scale`, `select`, `multiline_text`, `multiselect`) with 3–4 `CustomFieldOption` rows for select/multiselect.
- Create ~20 survey responses as `Idea` rows (`publication_status: 'published'`, `idea_status: IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation')`, `creation_phase: phase`). Each response fills custom_field_values with random valid data for the fields.

### community_monitor_survey

**Singleton — only one `community_monitor` project per tenant.** Don't create a new one; find the existing and add responses to its phase.

```ruby
existing = Project.find_by(internal_role: 'community_monitor')
raise 'No community_monitor project — enable the feature + seed first' unless existing
phase = existing.phases.first
```

If none exists (rare, only if feature was just enabled), use `CommunityMonitorService.new.create_and_set_project(current_user: admin)` — it creates the hidden project, single phase, and sets `AppConfiguration.settings['community_monitor']['project_id']` for you.

- Feature flag: `community_monitor` (enable + allow, guarded).
- Project constraints: `hidden: true`, `internal_role: 'community_monitor'`, single phase, phase has `end_at: nil`.
- Domain data: the default form with 15+ `sentiment_linear_scale` fields is created automatically. Add ~20 Idea responses with `custom_field_values` mapping each sentiment field's `key` to a random integer 1..5:
  ```ruby
  sentiment_fields = phase.custom_form.custom_fields.where(input_type: 'sentiment_linear_scale')
  values = sentiment_fields.to_h { |f| [f.key, rand(1..5)] }
  Idea.create!(project: existing, phases: [phase], creation_phase: phase,
               author: user, publication_status: 'published',
               idea_status: IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation'),
               title_multiloc: {}, body_multiloc: {}, custom_field_values: values)
  ```
- Verify via admin page at `http://localhost:3000/en/admin/community-monitor`.

### common_ground

- Feature flag: `common_ground` (enable + allow).
- `phase_extra_fields`: `reacting_enabled: true, reacting_dislike_enabled: true, input_term: 'contribution'`
- Domain data: Ideas (statements, title only, empty body_multiloc) + Reactions (up/down/neutral weighted 55/25/20).
- This is the reference implementation — mirror [back/lib/tasks/](back/lib/tasks/)'s `test_data:create_common_ground_project` exactly.

### volunteering

- Feature flag: none.
- `phase_extra_fields`: none.
- Domain data: `Volunteering::Cause` (5–8 causes with `title_multiloc`, `description_multiloc`, `ordering: i`) + `Volunteering::Volunteer` (each user volunteers for 1–3 causes). `Volunteer` has unique `(cause_id, user_id)`.

### document_annotation

- Feature flag: none.
- `phase_extra_fields`: `document_annotation_embed_url: 'https://citizenlab.konveio.com/document-title'`. **The URL is validated** — it must match a Konveio domain. `https://*.konveio.com/<path>` works; other hosts are rejected.
- Domain data: none beyond the phase itself.

### information

- Feature flag: none.
- `phase_extra_fields`: none; put useful HTML content in the `description_multiloc`.
- Domain data: none. The phase renders its description only.

### survey (external)

- Feature flag: `surveys` + at least one of `typeform_surveys` / `google_forms_surveys`.
- `phase_extra_fields`: `survey_service: 'typeform', survey_embed_url: 'https://form.typeform.com/to/abc123'`
- Domain data: none. The phase embeds the external form.

## Idempotency

- Project `slug` includes `timestamp` → each run produces a fresh project, no collisions.
- Users use `find_or_create_by!` keyed on a per-method, per-timestamped email → safe to re-run.

## After execution

1. Parse the "Admin URL" line from stdout.
2. Tell the user: `Created. Admin URL: <url> — log in as admin@govocal.com / democracy2.0 if not already signed in.`
3. Do NOT open a browser automatically; that's the user's choice.

## Error handling

- If the runner exits non-zero: report stderr verbatim to the user and stop. Do not retry blindly — the script is long and partial failures may leave dangling records.
- If the script succeeds but the Project page 404s, the user likely needs to refresh (React Query cache) — mention this once.

## References

- Template origin: existing `test_data:create_common_ground_project` rake task
- Participation method classes: [back/lib/participation_method/](back/lib/participation_method/)
- Voting methods: [back/lib/voting_method/](back/lib/voting_method/)
- `PARTICIPATION_METHODS` constant: [back/app/models/phase.rb:72](back/app/models/phase.rb#L72)
- Permissions update: [back/app/services/permissions/permissions_update_service.rb](back/app/services/permissions/)
- Poll models: [back/engines/free/polls/app/models/polls/](back/engines/free/polls/app/models/polls/)
- Volunteering models: [back/engines/free/volunteering/app/models/volunteering/](back/engines/free/volunteering/app/models/volunteering/)
