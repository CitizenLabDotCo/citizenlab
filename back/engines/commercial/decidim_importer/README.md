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
| per-process user roles (`NN---users.csv`)              | project moderators (Decidim `admin`/`collaborator`/`moderator` → `project_moderator`; `private_user` ignored) |
| participatory processes                                | projects (Consultations folder)                                                  |
| assemblies                                             | projects (Assemblies folder)                                                     |
| participatory process groups                           | folders                                                                          |
| `proposals` components                                 | ideation phases + ideas (+ comments, comment votes, endorsements, followers, proposal notes → internal comments); a component whose proposals were voted on becomes a single-voting phase instead, its votes → baskets |
| `surveys` components                                   | native-survey phases (standalone/parallel — off the timeline) + responses        |
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

#### `create_template[path, primary_locale, production]`

`production=true` is the final import to the live tenant: real user names/emails are kept and the
import-source links are omitted. Otherwise (the default, for test/verify runs) users are anonymised and
each project description links back to its original Decidim URL, so you can cross-check the migration
against the source.

**Export → artifacts; touches no tenant.** Reads the export (`from_zip` / `from_directory`), runs the
extractors in dependency order so cross-record refs resolve (users → scopes → folders → projects →
categories → phases → proposals → … → description layouts), absolutizes root-relative `<img>` srcs onto
the source domain, then writes these artifacts beside the export (plus a `.create.log` of per-model
counts and every skipped record):

- **`<base>.template.yml`** — the record graph, the main artifact.
- **`<base>.app_config.json`** — the small `AppConfiguration` patch the import applies: just the export's
  locales (from `01--organization.csv`) plus the feature flags the import turns on
  (`project_static_pages`, `parallel_participation`). Nothing else from the org row is mapped.
- **`<base>.url_mapping.csv`** — old-Decidim-URL → new-target map for links embedded in descriptions,
  applied post-import.
- **`<base>.moderators.csv`** — project-moderator assignments (user `unique_code` → project `slug`),
  applied post-import. Skipped when the export defines no process admins.

Finally it bundles the above into a single **`<base>.template.zip`** — the one file `import` consumes
(it unpacks the bundle to a tempdir), so the whole import is one artifact to move around. The loose files
stay beside it for `verify`, which still takes the plain `.template.yml`.

#### `import[file, host, import_uploads]`

**Bundle → tenant, in one tenant switch.** `file` is the `<base>.template.zip` bundle from
`create_template`; `import` unpacks it to a tempdir and reads the template + its sibling artifacts from
there (its own `.import.log`/`.broken_links.csv` are written beside the zip). First applies the
`<base>.app_config.json` patch: unions the export's locales into the tenant's `core.locales` (additive —
never dropping the tenant's own, so the template's multilocs have every locale they reference) and
allows+enables the import's feature flags (`project_static_pages`, `parallel_participation`), leaving the
rest of the tenant's app config untouched. Then deserializes the template — resolving idea statuses and area orderings,
letting **TemplateCleaner** drop uploads it can't fetch (and the file/image/craftjs nodes they'd
orphan), then bulk-inserting under `no_touching` so source dates survive — and backfills
what the deserializer bypasses (voting counts, permissions, each project's `project_page` layout). It
then runs the **post-import pass**: rewrite embedded Decidim links from `<base>.url_mapping.csv`
(unresolved ones → `<base>.broken_links.csv`), then build the folder/nav structure — a **Consultations**
folder gathering ungrouped projects, standard folder layouts + homepage previews, and a nav bar trimmed
to Home + Consultations + Assemblies — and finally grant **project-moderator** roles from
`<base>.moderators.csv` (matching users by `unique_code` and projects by `slug`, since the role can't
travel in the template). The post-import pass is idempotent; the deserialize is **not**
transactional, so a mid-run failure leaves partial data — always import into a fresh tenant. Logs
created counts to `<base>.import.log`.

#### `verify[file, locales, import_uploads]`

Smoke-test: creates a throwaway `decidim-verify-<hex>.localhost` tenant (seeded with idea statuses),
applies the template (uploads skipped unless `import_uploads=true`), then destroys it — even on failure.

## Running it locally

```bash
# 1. (optional) clean local tenant - always works best on an empty tenant
docker compose run --rm web "bin/rails db:reset"

# 2. Build the artifacts from the export — the loose files (.template.yml, .app_config.json,
#    .url_mapping.csv, .moderators.csv) plus the .template.zip bundle that `import` consumes — and .create.log.
#    Args: path, primary_locale=fr-FR, production=false. production=false anonymises users and shows the
#    original Decidim link in the project page; production=true keeps real users and omits those links.
docker compose run --rm web "bin/rails decidim_importer:create_template[tmp/import_files/example.com.zip,fr-FR,false]"

# 3. (optional) Verify the template without touching a real tenant (creates a throwaway tenant, applies, then destroys it).
#    Args: path (the loose .template.yml, not the bundle)
docker compose run --rm web "bin/rails decidim_importer:verify[tmp/import_files/example.com.template.yml]"

# 4. Deserialize the bundle into the tenant matching the host (applying the app-config patch: locales +
#    feature flags), then run the post-import finalisation steps (link correction etc)
#    Args: path (the .template.zip bundle), host=localhost, import_uploads=true (fetch images/files - dev setting only)
docker compose run --rm web "bin/rails decidim_importer:import[tmp/import_files/example.com.template.zip,localhost]"
```

`create_template` never touches a tenant — it only reads the export and writes files. `import` operates on
the tenant named by `host` (default `localhost`) and finishes with the post-import steps in the same run.

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
- **Run it on the swarm leader.** That's the only box carrying the deployment env files
  (`cl2-deployment/<env_file>`) the container needs, so the import has to run there — the same place prod
  migrations run. It won't disturb orchestration: the task is light on CPU and modest on memory
  (I/O-bound, ~0.75 GB steady), so it sits comfortably beside the running stack.
- **Best on its own container (`docker run`), instead of `docker exec` into a live Puma worker.** Not for memory
  (~0.75 GB is easily absorbed) but because the run is **long** — you don't want a multi-hour task tied to
  the lifecycle of a web worker that may be restarted or redeployed under it.
- **Freeze deploys and migrations for the window.** The standalone container survives an app redeploy (it
  isn't part of the service) and new *code* alone is harmless — but a **migration** running mid-import may cause issues.

### Step by step

Only the `import` step needs to run on production, and it needs just the one `<base>.template.zip` bundle — not
the source Decidim export. The procedure below runs it as a standalone `docker run` on the **swarm leader**
(the box that holds the deployment env files), the same way prod migrations run.

**1. Build the bundle off-production.** `create_template` reads the source export but never touches a
tenant, so it can be run locally / on staging. It produces the loose artifacts and bundles them into a
single `<base>.template.zip` — the only file `import` needs. Inside the bundle:

- `<base>.template.yml` — the graph to deserialize
- `<base>.app_config.json` — app-config patch `import` applies first: the export's locales (unioned in) + the feature flags it enables (`project_static_pages`, `parallel_participation`)
- `<base>.url_mapping.csv` — post-import link correction
- `<base>.moderators.csv` — post-import project-moderator assignment (present only when the export has process admins)

**2. Copy the bundle onto the swarm leader** (one file):

```bash
scp <base>.template.zip <swarm-leader>:/home/ubuntu/import/
```

**3. Find the deployed image tag.** Use the *same* image the running app is on, so the import matches
the code and DB schema (it should be `master` or `production` depending on the cluster):

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep back-ee   # take the tag after `back-ee:`
```

**4. Run the import on the swarm leader** as its own container, mounting the import dir (writable — the
task unpacks the bundle to a tempdir and writes its `.import.log`/`.broken_links.csv` back beside the
zip). The `--env-file` lives on the leader, which is why the import runs there:

```bash
docker run \
  --env-file cl2-deployment/.env-web \
  -v /home/ubuntu/import:/data \
  citizenlabdotco/back-ee:<tag> \
  bin/rake "decidim_importer:import[/data/<base>.template.zip,<host>]"
```

**5. Afterwards:** copy the logs and broken links CSV from the box:

```bash
scp <swarm-leader>:/home/ubuntu/import/<base>.import.log .
scp <swarm-leader>:/home/ubuntu/import/<base>.broken_links.csv .
```

**6. Delete the artifacts from the box** (`rm /home/ubuntu/import/<base>.*`) — they can carry tenant real user PII
if `create_template` ran with `production=true`.

