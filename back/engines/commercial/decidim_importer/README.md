# DecidimImporter

Imports a Decidim platform into Go Vocal from a **Decidim export** — a zip (or unzipped directory)
of flat CSV files, one per model type and one per component (users, participatory processes,
assemblies, proposals, surveys, budgets, …).

Rather than creating records directly, the engine transforms the CSV rows into Tenant templates and
mainly reuses `MultiTenancy::Templates::TenantDeserializer`. Around the template import, some additional
functionality is needed to backfill what the deserializer bypasses (voting counts, permissions, fixing links etc).
It also updates the nav bar to look similar to the Decidim source ("Consultations" & "Assemblies" folders).

## How it works

Three top-level services, one per stage — **TemplateCreator** dumps the export into artifacts,
**Importer** applies a dumped template to a tenant, and **TemplateCleaner** prunes uploads the import
can't fetch (and the nodes they'd leave dangling) just before deserialize. Each rake task
(`lib/tasks/decidim_importer_tasks.rake`) drives one stage; the four are described below.

Building blocks used along the way:

- **ExportReader** — walks the export tree, returning parsed rows keyed by model (`:users`,
  `:projects`, `:components`, …). Assemblies fold in alongside participatory processes under a synthetic
  "Assemblies" folder.
- **Extractors** (`extractors/`) — one per model type; each turns its rows into intermediate `Record`s
  in the `RefMap`.
- **RefMap** — registry of `Record`s keyed by the Decidim `"<table>--<id>"` uid. Cross-record links
  share the *same* attributes-hash object, which becomes a YAML anchor/alias the deserializer resolves
  by identity (`*_ref`).
- **TemplateBuilder** — orders records by `MODEL_ORDER` and emits the template YAML.

### What gets imported

| Decidim source                                         | Go Vocal target                                                                  |
|--------------------------------------------------------|----------------------------------------------------------------------------------|
| organization / users / followers / scopes / categories | app config, users, followers, topics                                             |
| participatory processes                                | projects (Consultations folder)                                                  |
| assemblies                                             | projects (Assemblies folder)                                                     |
| participatory process groups                           | folders                                                                          |
| `proposals` components                                 | ideation phases + ideas (+ comments, comment votes, endorsements, followers, proposal notes → internal comments) |
| `surveys` components                                   | native-survey phases + responses                                                 |
| `accountability` components                            | results → ideas                                                                  |
| `debates` components                                   | ideation phases + ideas (+ comments, followers)                                  |
| `budgets` components                                   | voting (budgeting) phases + baskets                                              |
| `pages` components                                     | project-level static pages                                                       |
| `blogs` components                                     | project-level static pages, linked in a "Blog" section of the description layout |
| `meetings` components                                  | project events (with map pin + attachments)                                      |
| attachments (space + proposal + meeting)               | files                                                                            |

`awesome_iframe` (fullscreen-iframe / awesome-map) components have no extractor and are currently
ignored. A debate's `instructions`/`information_updates`/`conclusions` are folded into the idea body;
its scheduled window, closed state and endorsements have no equivalent and are dropped. Meeting comments,
registration form answers and poll answers have no Go Vocal event equivalent and are not imported.

### The rake tasks

#### `create_template[path, primary_locale, production, include_source_url]`

**Export → artifacts; touches no tenant.** Reads the export (`from_zip` / `from_directory`), runs the
extractors in dependency order so cross-record refs resolve (users → scopes → folders → projects →
categories → phases → proposals → … → description layouts), absolutizes root-relative `<img>` srcs onto
the source domain, then writes three artifacts beside the export (plus a `.create.log` of per-model
counts and every skipped record):

- **`<base>.template.yml`** — the record graph, the main artifact.
- **`<base>.app_config.json`** — the `AppConfiguration` patch (locales, branding, reply-to) derived from
  `01--organization.csv`; skipped when the export has no organization file.
- **`<base>.url_mapping.csv`** — old-Decidim-URL → new-target map for links embedded in descriptions,
  applied post-import.

#### `update_app_config[file, host, import_uploads]`

Applies the **full** `<base>.app_config.json` to the tenant, deep-merging its settings: the locale set
is **replaced** (a user on a dropped locale migrates to the first new one), branding is set, and the
org's SMTP email becomes the tenant's **reply-to** (not `from` — that needs DNS work first). Optional
and separate from `import`; run it when you want the tenant to match the export. Logs to
`<base>.app_config.log`.

#### `import[file, host, import_uploads]`

**Template → tenant, in one tenant switch.** First unions the export's locales into the tenant's
`core.locales` (additive — never dropping the tenant's own) so the template's multilocs always have the
locales they reference. Then deserializes the template — resolving idea statuses and area orderings,
letting **TemplateCleaner** drop uploads it can't fetch (and the file/image/craftjs nodes they'd
orphan), then bulk-inserting under `no_touching` so source dates survive — and backfills
what the deserializer bypasses (voting counts, permissions, each project's `project_page` layout). It
then runs the **post-import pass**: rewrite embedded Decidim links from `<base>.url_mapping.csv`
(unresolved ones → `<base>.broken_links.csv`), then build the folder/nav structure — a **Consultations**
folder gathering ungrouped projects, standard folder layouts + homepage previews, and a nav bar trimmed
to Home + Consultations + Assemblies. The post-import pass is idempotent; the deserialize is **not**
transactional, so a mid-run failure leaves partial data — always import into a fresh tenant. Logs
created counts to `<base>.import.log`.

#### `verify[file, locales, import_uploads]`

Smoke-test: creates a throwaway `decidim-verify-<hex>.localhost` tenant (seeded with idea statuses),
applies the template (uploads skipped unless `import_uploads=true`), then destroys it — even on failure.

## Running it locally

```bash
# 1. (optional) clean local tenant - always works best on an empty tenant
docker compose run --rm web "bin/rails db:reset"

# 2. Build the template artifacts from the export (.template.yml, .app_config.json, .url_mapping.csv) + .create.log,
#    Args: path, primary_locale=fr-FR, production=false (anonymise users), include_source_url=false (show original Decidim link in project page)
docker compose run --rm web "bin/rails decidim_importer:create_template[tmp/import_files/example.com.zip,fr-FR,false,true]"

# 3. (optional) Verify the template without touching a real tenant (creates a throwaway tenant, applies, then destroys it).
#    Args: path
docker compose run --rm web "bin/rails decidim_importer:verify[tmp/import_files/example.com.template.yml]"

# 4. (optional) Apply the full app config (replaces locales, sets branding + reply-to). `import` already
#    unions in the locales it needs, so this is only for matching the tenant's branding/config to the export.
#    Args: path, host=localhost
docker compose run --rm web "bin/rails decidim_importer:update_app_config[tmp/import_files/example.com.template.yml,localhost]"

# 5. Deserialize the template into the tenant matching the host, then run the post-import finalisation steps (link correction etc)
#    Args: path, host=localhost, import_uploads=true (fetch images/files - dev setting only)
docker compose run --rm web "bin/rails decidim_importer:import[tmp/import_files/example.com.template.yml,localhost]"
```

`create_template` never touches a tenant — it only reads the export and writes files. `update_app_config`
and `import` operate on the tenant named by `host` (default `localhost`); `import` finishes with the
post-import steps in the same run.

### Safety gate

`import` **refuses to run unless the `decidim_importer` feature is enabled for the target host**, so a
large import can't be applied to the wrong tenant by accident. The feature is off on every tenant by
default — enable it for the target host **in admin HQ** before importing.

## Production import

### Running a large import

A big tenant produces a big template — a large export can be a **36 MB** `.template.yml` holding
**~126k records** and can take about an hour. Two things to plan for, measured on a real run of one:

- **Memory is modest** — the whole `import` process holds steady at **~0.75 GB RSS** (parsing the
  anchor-heavy YAML accounts for ~0.4 GB of that; the deserialize adds little on top). It should fit a 4 GB
  node comfortably, even beside a running app stack. 
- **Time is the real cost** — with upload fetching on (default), the run is **I/O-bound**,
  downloading every image and file attachment serially (low CPU, long runtime — tens of minutes to hours
  for an upload-heavy tenant). 
- **Don't run on the swarm leader** - best on one of the other nodes.

### Step by step

Only the `import` step runs on production, and it needs just the template artifacts — not the zip. The
procedure below runs it as a standalone `docker run` on a host (the same way prod migrations run).

**1. Build the artifacts off-production.** `create_template` reads the zip but never touches a tenant, so
it can be run locally / on staging. It writes three files that `import` consumes — all sharing one base name:

- `<base>.template.yml` — the graph to deserialize
- `<base>.app_config.json` — optional app-config patch (locales/branding/reply-to); apply via `update_app_config` (and `import` uses it only to union locales)
- `<base>.url_mapping.csv` — post-import link correction

**2. Copy the three artifacts onto the Docker host.** They must land in one directory, keeping their shared
base name:

```bash
# scp (simplest if you have SSH to the host) …
scp <base>.template.yml \
    <base>.app_config.json \
    <base>.url_mapping.csv \
    <docker-host>:/home/ubuntu/import/
```

**3. Find the deployed image tag.** Use the *same* image the running app is on, so the import matches
the code and DB schema (it should be `master` or `production` depending on the cluster):

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep back-ee   # take the tag after `back-ee:`
```

**4. Run the import** as its own container, mounting the artifacts dir (writable — the task writes
logs back into it). 

```bash
docker run \
  --env-file cl2-deployment/<env_file> \
  -v /home/ubuntu/import:/home/ubuntu/import \
  citizenlabdotco/back-ee:<tag> \
  bin/rake "decidim_importer:import[/home/ubuntu/import/<base>.template.yml,<host>]"
```

**5. Afterwards:** copy the logs and delete the artifacts from the box (`rm /home/ubuntu/import/<base>.*`) — they can carry tenant real user PII
if `create_template` ran with `production=true`.

Things to keep in mind:

- **Its own container (`docker run`), never `docker exec` into a live Puma worker.** Not for memory
  (~0.75 GB is easily absorbed) but because the run is **long** — you don't want a multi-hour task tied to
  the lifecycle of a web worker that may be restarted or redeployed under it.
- **No tight `--memory` cap.** ~0.75 GB is the steady state, but a 512 MB limit would OOM during the
  parse. Leave it uncapped (the node's RAM is the ceiling); a 4 GB node is plenty.
- **Import into a fresh/empty tenant.** The deserialize is **not** wrapped in a DB transaction, so a
  failure mid-run leaves partial data that must be cleared before retrying.
- **Freeze deploys and migrations for the window.** The standalone container survives an app redeploy (it
  isn't part of the service) and new *code* alone is harmless — but a **migration** running mid-import may cause issues.
