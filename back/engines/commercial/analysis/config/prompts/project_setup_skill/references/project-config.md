# Project-level configuration reference (non-method)

**Read this for every project draft.** Beyond the phase/method config, a project has settings that live at the **project level** — who's allowed to participate, what demographic data is collected, who can see the project, and the project's content/metadata. These exist regardless of which method(s) the recipe uses.

> **Provenance — confirmed from source.** `Permission` ([`back/app/models/permission.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/app/models/permission.rb)) and `Project` ([`back/app/models/project.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/app/models/project.rb)), `master`.

---

## 1. Access rights (permissions)

Permissions are configured **per action**, each gated by a **`permitted_by`** level. Most actions are scoped to a **phase** (so access can differ per phase); `visiting` / `following` are project-level.

**`permitted_by` (confirmed enum):**

| Value | Who can act | Use for |
|---|---|---|
| `everyone` | Anyone, **no login** (anonymous) | Lowest barrier — broad, low-stakes input; risks spam/duplicate |
| `everyone_confirmed_email` | Anyone with a confirmed email | Light gate; some accountability without full registration |
| `users` | Registered, signed-in users | **Platform default**; standard public consultation |
| `admins_moderators` | Staff (admins / project managers) only | Internal or admin-curated input |
| `verified` | Identity-**verified** users | High-stakes / binding votes / statutory / one-person-one-vote |

**Actions are method-specific** (`ACTIONS`). Configure `permitted_by` for each relevant action:

| Method | Gated actions |
|---|---|
| (project-level) | `visiting`, `following` |
| information | `attending_event` |
| ideation / proposals | `posting_idea`, `commenting_idea`, `reacting_idea`, `attending_event` |
| native_survey | `posting_idea` (= submitting a response), `attending_event` |
| survey (external) | `taking_survey` |
| poll | `taking_poll` |
| voting | `voting`, `commenting_idea` |
| volunteering | `volunteering` |
| document_annotation | `annotating_document` |
| common_ground | `posting_idea`, `reacting_idea` |

Each permission can also carry: **`groups`** (restrict the action to specific user groups), `verification_expiry` (re-verify after N days, `verified` only), **`access_denied_explanation_multiloc`** (a custom "why you can't take part" message), and `everyone_tracking_enabled`.

**Defaults / how to choose:**
- Default to the platform default **`users`** for participation actions, and keep `visiting` / `following` open (`everyone` / `everyone_confirmed_email`).
- Go **more open** (`everyone` / `everyone_confirmed_email`) when the intake stresses *reach / low barrier / lots of voices* — and flag the spam/duplicate trade-off.
- Go **more restrictive** (`verified`, or `groups`) when the intake implies **binding decisions, statutory process, one-person-one-vote, or a defined audience** (cross-ref `references/voting-methods.md` and statutory). Verified voting is the classic case.
- Cite the intake `Target audience` / `Real influence level` / `Anonymity level` for the choice in the GSM report.

---

## 2. Demographic questions (user fields)

Demographics are **not** a survey question type — they're **User custom fields** (registration fields like gender, birthyear, domicile) attached to a **permission**. On each permission:

- **`permissions_custom_fields`** — the ordered demographic questions asked for that action.
- **`global_custom_fields`** (bool) — use the platform's **default registration fields** (`true`) vs. a **custom subset** for this action (`false`). Allowed only when `permitted_by` is `users` or `verified`.
- **`user_fields_in_form`** (bool) — ask the demographics **inline in the participation form** (`true`) vs. at **registration** (`false`).
- **`user_data_collection`** = `all_data | demographics_only | anonymous` — how much identifying data to keep (anonymous = demographics without linking identity).

**Defaults / how to choose:**
- **Minimise required demographics** — every extra field depresses participation. Ask only what the intake's analysis actually needs (e.g. age band, neighbourhood).
- For **sensitive topics**, prefer `demographics_only` or `anonymous` (`user_data_collection`) and align with the intake `Anonymity level`.
- Asking **in-form** (`user_fields_in_form: true`) suits one-off participation; **at registration** suits platforms with returning users.
- **For `native_survey` phases, default to `user_fields_in_form: true`** — this attaches the demographic user-fields as the **last page of the survey** (the platform renders them after the substantive questions, optional). Don't hand-author demographic questions as survey custom fields; attach the platform user-fields instead.
- Flag the demographic set in the GSM report so the GSM can confirm it's proportionate.

---

## 3. Visibility & listing

From `Project`:

- **`visible_to`** = `public | groups | admins` — everyone / only specific user `groups` / staff only. **Default `public`.**
- **`listed`** (bool, default `true`) — show in project lists vs. **unlisted** (reachable only by direct link).
- **`hidden`** (bool) — hide the project entirely.
- **Draft vs. published** — via `admin_publication`; a **`preview_token`** lets you share an unpublished draft for review.

**Defaults:** `public` + `listed` for an open consultation. Use `groups` / unlisted when the intake names a **restricted or targeted audience**; keep as a draft until the GSM reviews. Cite the intake audience for any restriction.

---

## 4. Content & metadata

| Setting | Notes |
|---|---|
| `header_bg` + **`header_bg_alt_text_multiloc`** | Project banner image **and its alt text** — always set alt text (accessibility). Imagery sourcing follows §4 Imagery. |
| `description_multiloc` + `description_preview_multiloc` | Full description **and** the short card/preview text — write both. |
| `project_images`, `project_files` | Gallery images and downloadable documents. |
| `slug` | Auto-generated from the title; only override if the client wants a specific URL. |
| `folder` | Place the project in a folder (admin_publication parent) if the tenant organises by folder. |
| `areas` (+ `include_all_areas`) | Geographic area(s) the project belongs to — set when the intake names a neighbourhood/district. |
| `global_topics` vs `input_topics` | `global_topics` categorise the **project**; `input_topics` categorise **ideas within** it (and tie to the Perspectives auto-tagging in `references/ideation-views.md`). |
| `default_assignee_id` | Default back-office assignee for incoming inputs (triage). |
| `live_auto_input_topics_enabled` | Auto-tag inputs into topics live (relates to Perspectives auto-tagging). |

**Defaults:** always write both description + preview and set header alt text; set `areas` / topics only when the intake supplies them; leave `slug`, `folder`, `default_assignee` to the GSM unless specified.

---

## Sensible-defaults summary

| Setting | Default | Override when… |
|---|---|---|
| Participation `permitted_by` | `users` | reach-first → more open; binding/statutory → `verified` / `groups` |
| `visiting` / `following` | open (`everyone` / `everyone_confirmed_email`) | rarely restricted |
| Required demographics | minimal (none–few) | analysis genuinely needs a field |
| `user_data_collection` | `all_data` | sensitive topic → `demographics_only` / `anonymous` |
| `visible_to` | `public` | restricted/targeted audience → `groups` / `admins` |
| `listed` | `true` | targeted/link-only → unlisted |
| Header alt text | always set | — |

---

## Payload shape

Add a project-level `project_config` block (sits beside `imagery` / `settings` / `events`):
```json
"project_config": {
  "visible_to": "public | groups | admins",
  "listed": true,
  "publication_status": "draft | published",
  "groups": [],
  "permissions": [
    {
      "action": "posting_idea | commenting_idea | reacting_idea | voting | taking_survey | taking_poll | volunteering | annotating_document | attending_event | visiting | following",
      "scope": "phase: <order/title> | project",
      "permitted_by": "everyone | everyone_confirmed_email | users | admins_moderators | verified",
      "groups": [],
      "verification_expiry_days": null,
      "access_denied_explanation": "...optional...",
      "demographics": {
        "global_custom_fields": true,
        "fields": [],
        "user_fields_in_form": false,
        "user_data_collection": "all_data | demographics_only | anonymous"
      }
    }
  ],
  "metadata": {
    "header_alt_text": "...",
    "description_preview": "...",
    "areas": [],
    "global_topics": [],
    "default_assignee_id": null
  }
}
```
- Include one `permissions` entry per relevant action (per phase). Leave `demographics.fields` empty to use the global registration fields.

## GSM report hooks
- **Decisions (§7 #3):** state the access level per participation action and the reason (`users` default / `everyone` for reach / `verified` for binding-statutory), the visibility (`public` unless restricted), and any required demographics — each citing the intake (`Target audience`, `Real influence level`, `Anonymity level`).
- **Things to review (§7 #4):**
  - **Access vs. barrier trade-off** — if set to `everyone` (spam risk) or `verified`/`groups` (excludes people), flag it.
  - **Required demographics** — list them so the GSM confirms they're proportionate and not deterring participation.
  - **Restricted visibility / groups** — confirm the audience restriction and that the right groups exist.
  - **Verification** — confirm a verification method is enabled if any action is `verified`.

## Source
- Access rights, demographics gating: [`back/app/models/permission.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/app/models/permission.rb) (`PERMITTED_BIES`, `ACTIONS`, `permissions_custom_fields`, `user_data_collection`).
- Visibility, content, metadata: [`back/app/models/project.rb`](https://github.com/CitizenLabDotCo/citizenlab/blob/master/back/app/models/project.rb) (`VISIBLE_TOS`, `listed`, `header_bg(_alt_text)`, topics/areas/folder).
