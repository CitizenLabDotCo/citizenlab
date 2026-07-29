# DecidimImporter

Imports a Decidim platform into Go Vocal from a **Decidim export** — a zip (or unzipped directory)
of flat CSV files, one per model type and one per component (users, participatory processes,
assemblies, proposals, surveys, budgets, …).

Rather than creating records directly, the engine transforms the CSV rows into a **tenant-template**
graph (`{ "models" => { … } }`) and hands it to `MultiTenancy::Templates::TenantDeserializer`. This
reuses the template pipeline's model coverage, `*_ref` anchor resolution, `*_multiloc` handling and
`remote_*_url` upload fetching.

## How it works

```
export (zip/dir) ──▶ ExportReader ──▶ Extractors ──▶ RefMap ──▶ TemplateBuilder ──▶ template.yml
                     └──────────── TemplateCreator ───────────┘                         │
                                                    app_config.json ◀── AppConfigMapper │
                                                    url_mapping.csv ◀── Links::Map       │
                                                                                        ▼
                                                          Importer (TemplateCleaner ▶ TenantDeserializer)
```

**TemplateCreator** orchestrates the dump (export → artifacts); **Importer** applies a dumped template
to a tenant; **TemplateCleaner** prunes the template's unfetchable images / dangling nodes just before
deserialize. The two sides never overlap except in `TemplateCreator#import` (build-and-apply in one shot).

- **ExportReader** — walks the export tree and returns parsed rows keyed by model
  (`:users`, `:projects`, `:proposals`, `:components`, …). Assemblies are folded in alongside
  participatory processes and stamped into a synthetic "Assemblies" folder group.
- **Extractors** (`app/services/decidim_importer/extractors/`) — one per model type; each reads its
  rows and registers intermediate `Record`s in the `RefMap`.
- **RefMap** — registry of `Record`s keyed by the Decidim `"<table>--<id>"` uid. Cross-record links
  are made by sharing the *same* attributes hash object, which becomes a YAML anchor/alias and
  resolves via the deserializer's identity-based `*_ref` lookup.
- **TemplateBuilder** — orders records by model (`MODEL_ORDER`) and emits the template hash / YAML.
- After deserialization, the `import` task's **post-import pass** (see below) runs in the applied
  tenant to correct embedded links and build the folder/nav-bar structure.

### What gets imported

| Decidim source | Go Vocal target |
|---|---|
| organization / users / scopes / categories | app config, users, topics |
| participatory processes | projects (Consultations folder) |
| assemblies | projects (Assemblies folder) |
| participatory process groups | folders |
| `proposals` components | ideation phases + ideas (+ comments, comment votes, endorsements, followers) |
| `surveys` components | native-survey phases + responses |
| `accountability` components | results → ideas |
| `budgets` components | voting (budgeting) phases + baskets |
| `pages` components | project-level static pages |
| `blogs` components | project-level static pages, linked in a "Blog" section of the description layout |
| `meetings` components | project events (with map pin + attachments) |
| attachments (space + proposal + meeting) | files |

`debates` and `awesome_iframe` (fullscreen-iframe / awesome-map) components have no extractor and are
ignored. Meeting comments, followers, registration form answers and poll answers have no Go Vocal
event equivalent and are not imported.

## Running it

Everything runs through Docker (`docker compose run --rm web …`). A full import is two rake tasks:
**create_template → import** (the `import` task does its own post-import finishing), with a `db:reset`
first when importing into a clean local tenant. The target host must have the `decidim_importer` feature
enabled first (see [Safety gate](#safety-gate) below).

```bash
# 1. (optional) clean local tenant
docker compose run --rm web "bin/rails db:reset"

# 2. Build the template artifacts from the export (writes .template.yml, .app_config.json, .url_mapping.csv,
#    and a .create.log run report).
#    Args: path, primary_locale=fr-FR, production=false (anonymise users), include_source_url=false
docker compose run --rm web "bin/rails decidim_importer:create_template[tmp/import_files/example.com.zip,fr-FR,false,true]"

# 3. Deserialize the template into the tenant matching the host, then run the post-import finishing
#    (link correction + folder/nav-bar structure).
docker compose run --rm web "bin/rails decidim_importer:import[tmp/import_files/example.com.template.yml,localhost]"
```

`create_template` never touches a tenant — it only reads the export and writes files. `import` operates
on the tenant named by `host` (default `localhost`) and finishes with the post-import steps in the same
run.

### Safety gate

`import` **refuses to run unless the `decidim_importer` feature is enabled for the target host**, so a
large import can't be applied to the wrong tenant by accident. The feature is off on every tenant by
default — enable it for the target host **in admin HQ** before importing (and turn it back off when
done).

To smoke-test a dumped template without touching a real tenant, use `verify` (creates a throwaway
tenant, applies, then destroys it):

```bash
docker compose run --rm web "bin/rails decidim_importer:verify[tmp/import_files/example.com.template.yml]"
```

### Common options

- **Skip upload fetching** — `import[<file>,<host>,false]`. Drops every `remote_*_url` before
  deserialize (images **and** file attachments — anything fetched), so no external HTTP happens. Use for
  exports whose upload URLs point at an unreachable host (e.g. the source Decidim's
  `http://localhost/rails/active_storage/…` redirects).
- **Keep real user PII** — `create_template[<path>,<locale>,true]` (`production=true`). Otherwise user
  names and emails are anonymised.
- **Link back to the source** — `create_template[<path>,<locale>,false,true]` (`include_source_url=true`)
  prepends a link to each project's original Decidim URL.

## Rake tasks, step by step

All tasks live in `lib/tasks/decidim_importer_tasks.rake`.

### `create_template[path, primary_locale, production, include_source_url]`

Reads the export and writes the template artifacts (via {TemplateCreator}). Touches no tenant.

1. **Pick the reader** — `from_zip` for a `.zip`, `from_directory` for an unzipped dir; `ExportReader`
   parses the CSV tree into rows-by-model.
2. **`build_template`** — runs the extractors in dependency order so cross-record refs resolve:
   users → scopes → folders → projects → categories → phases → proposals → results → budget projects
   → comments → comment votes → followers → endorsements → orders → proposal attachments → surveys →
   survey responses → static pages → blog posts → meetings → meeting attachments → files → description
   layouts. Each registers `Record`s in the `RefMap`.
3. **`absolutize_embedded_images!`** — rewrites root-relative `<img src="/…">` in rich-text and
   layout craftjs to absolute URLs on the source domain, so they can be fetched (or pruned) at import.
4. **`default_record_update_timestamps`** — mirrors `created_at` into `updated_at` where the source
   gave no update date, so imported content doesn't look edited-today.
5. **Write `<base>.template.yml`** — the `TemplateBuilder` YAML (the main artifact).
6. **Write `<base>.app_config.json`** — the `AppConfiguration` patch derived from
   `01--organization.csv` (locales, branding); skipped when the export has no organization file.
7. **Write `<base>.url_mapping.csv`** — the old-Decidim-URL → new-target map for links embedded in
   descriptions, consumed by the `import` task's post-import link correction.
8. **Log** — a per-model and per-project record summary, plus every skipped component / record with
   its reason, teed to `<base>.create.log` (and the Rails log).

### `import[file, host, import_uploads]`

Deserializes a dumped template into the tenant matching `host` (default `localhost`), then runs the
post-import finishing in the same tenant switch (steps 4–6 need the applied tenant's real ids).

1. **Switch into the tenant** (`Tenant.find_by!(host:)`).
2. **Apply the app-config sibling first** (`apply_app_config_file`) — deep-merges the
   `.app_config.json` settings over the tenant's (locale set is *replaced*, and any user on a dropped
   locale is migrated to the first new one), and sets the remote logo/favicon when images are on.
   Done first so the tenant's locales are in place for the records that use them.
3. **`apply_template_file`** — the deserialize pipeline:
   1. Load the YAML.
   2. `IdeaStatuses.resolve!` — wires idea `status_ref`s to the tenant's idea statuses.
   3. `resolve_area_orderings!` — offsets imported area orderings past existing ones (the ordering
      column is uniquely indexed).
   4. `prepare_uploads!` — with fetching on, keeps only reachable `remote_*_url`s (images and file
      attachments) whose content format matches the extension; with fetching off, drops them all.
   5. `prune_fileless_attachments!` / `prune_imageless_project_images!` — remove file/image records
      (and their dependent joins) whose upload couldn't be fetched.
   6. **Deserialize** via `TenantDeserializer`, wrapped in `no_touching` so bulk inserts don't bump
      `updated_at` to the import time.
   7. `recompute_voting_counts!` — recomputes basket/vote counters for the voting phases this import
      created (`Basket.update_counts`, submitted baskets only).
   8. `restore_update_timestamps` — resets each created record's `updated_at` to the date the
      template carries (counter-cache `update_all`s bypass `no_touching`).
   9. `reconcile_permissions!` — backfills the `Permission` records the deserializer bypassed (e.g. a
      native-survey phase's `posting_permission`), which the admin endpoints require.
   10. `provision_project_pages!` — backfills each project's `project_page` Content Builder layout
      (generated from its imported `project_description` layout). The project page renders from
      `project_page`; the SideFx that normally creates it is bypassed by the deserializer, so without
      this the page 404s.
4. **Correct embedded links** (`DecidimImporter::Links::Rewriter`) — when a `<base>.url_mapping.csv`
   was dumped, walks every `ContentBuilder::Layout` and `StaticPage`, rewriting mapped Decidim links
   (file links resolve to the imported file's real content URL). Unresolved links that *should* have
   been rewritten are collected. Skipped when there's no mapping file.
5. **Build the folder/nav structure** (`DecidimImporter::ConsultationsFolder`):
   1. Find-or-create the **Consultations** folder and move every top-level (ungrouped) project into it.
   2. Give **every** folder (Consultations, Assemblies, imported group folders) the standard folder
      description layout — title + description + a published-projects widget — and a homepage card
      preview description.
   3. Add a `Selection` widget to the Consultations folder linking out to every other folder **except
      Assemblies** (which has its own nav-bar item).
   4. Rebuild the nav bar down to **Home + Consultations + Assemblies**, dropping the default items.
6. **Write `<base>.broken_links.csv`** listing any unresolved links for manual review (skipped when
   there are none), and **log** the created count per model — teed to `<base>.import.log` (and the
   Rails log).

The post-import steps (4–5) are idempotent — re-running reuses the folder, moves any remaining
top-level projects, and leaves already-built layouts, previews and nav items in place. Link
correction (step 4) and the folder logic (step 5) live in services, so both are unit-testable
without the rake harness.

### `verify[file, locales, import_uploads]`

Smoke-tests a dumped template against a throwaway tenant.

1. **Create a throwaway tenant** (`decidim-verify-<hex>.localhost`) with the given `locales`
   (default `fr-FR,en`) from minimal settings.
2. **Seed ideation idea statuses** — a fresh minimal tenant carries none, but imported proposals
   need them.
3. **`apply_template_file`** into it (uploads skipped by default; pass `import_uploads=true` to exercise
   the fetch path) and log the created counts.
4. **Destroy the tenant** — always, even on failure.

## Running a large import

A big tenant produces a big template — a large export can be a **36 MB** `.template.yml` holding
**~126k records**. Two things to plan for, measured on a real run of one:

- **Memory is modest** — the whole `import` process holds steady at **~0.75 GB RSS** (parsing the
  anchor-heavy YAML accounts for ~0.4 GB of that; the deserialize adds little on top). It fits a 4 GB
  node comfortably, even beside a running app stack. It will **not** OOM unless boxed in by a tight
  container memory limit (see below).
- **Wall-clock is the real cost** — with upload fetching on (the default), the run is **I/O-bound**,
  downloading every image and file attachment serially (low CPU, long runtime — tens of minutes to hours
  for an upload-heavy tenant). Budget time, not RAM. `import_uploads=false` skips all fetching, but then
  imports **no images or file attachments at all** (content-less files are pruned entirely) — it's
  all-or-nothing, with no "files but not images" middle setting.

### Production import, step by step

Only the `import` step runs on production, and it needs just the template artifacts — not the zip. The
procedure below runs it as a standalone `docker run` on a host (the same way prod migrations run), with
the artifacts bind-mounted in. The prod DB is RDS (a normal endpoint over `DATABASE_URL`), so no Docker
network wiring is needed — the container just needs the app env and outbound access.

**1. Build the artifacts off-production.** `create_template` reads the zip but never touches a tenant, so
run it locally / on staging. It writes three files that `import` consumes — all sharing one base name:

- `<base>.template.yml` — the graph to deserialize
- `<base>.app_config.json` — applied first (locales/branding)
- `<base>.url_mapping.csv` — post-import link correction

**2. Get the three artifacts onto the Docker host.** They must land in one directory, keeping their shared
base name (`import` derives the sibling paths from the template filename). A bind mount's source is
resolved on the **Docker daemon's host**, so copy them to the box the container will actually run on:

```bash
# scp (simplest if you have SSH to the host) …
scp import_files/<base>.template.yml \
    import_files/<base>.app_config.json \
    import_files/<base>.url_mapping.csv \
    user@<docker-host>:/data/decidim/

# … or pull from a private S3 bucket on the host instead (the app image has AWS creds/SDK):
# aws s3 cp s3://<bucket>/decidim/ /data/decidim/ --recursive
```

**3. Find the deployed image tag.** Use the *same* image the running app is on, so the import matches
prod's code and DB schema (CI tags the image with the git branch, e.g. `production` — don't guess it):

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep back-ee   # take the tag after `back-ee:`
```

**4. Run the import** as its own container, mounting the artifacts dir (writable — the task writes
`<base>.import.log` and `<base>.broken_links.csv` back into it). Quote the `[...]` arg so the shell
doesn't glob it:

```bash
docker run \
  --env-file cl2-deployment/<env_file> \
  -v /data/decidim:/data/decidim \
  citizenlabdotco/back-ee:<tag> \
  bin/rake "decidim_importer:import[/data/decidim/<base>.template.yml,<host>]"
```

**5. Afterwards:** delete the artifacts from the box (`rm /data/decidim/<base>.*`) — they carry tenant
data (real user PII if `create_template` ran with `production=true`).

Things to keep in mind:

- **Its own container (`docker run`), never `docker exec` into a live Puma worker.** Not for memory
  (~0.75 GB is easily absorbed) but because the run is **long** — you don't want a multi-hour task tied to
  the lifecycle of a web worker that may be restarted or redeployed under it.
- **No tight `--memory` cap.** ~0.75 GB is the steady state, but a 512 MB limit would OOM during the
  parse. Leave it uncapped (the node's RAM is the ceiling); a 4 GB node is plenty.
- **Import into a fresh/empty tenant.** The deserialize is **not** wrapped in a DB transaction, so a
  failure mid-run leaves partial data that must be cleared before retrying.
- **Freeze deploys and migrations for the window.** The standalone container survives an app redeploy (it
  isn't part of the service) and new *code* alone is harmless — but a **migration** running mid-import is
  not. The process caches the DB schema at boot, so a concurrent column change (a new `NOT NULL` column, a
  rename/drop) makes its remaining inserts fail against a schema it can't see; because the deserialize
  isn't transactional, that leaves a partial, aborted import to clear and re-run. Pause CI's deploy/migrate
  job for the window (also keeping the long, steady DB load clear of a release); if a migration does land,
  treat the run as failed.
