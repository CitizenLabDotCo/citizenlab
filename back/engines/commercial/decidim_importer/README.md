# DecidimImporter

Imports a Decidim ("OSP") platform into Go Vocal from **flat XLSX exports**, one file per model
type (users, process groups, participatory processes, steps, …).

Rather than creating records directly, the engine transforms the XLSX rows into a **tenant-template**
graph (`{ "models" => { … } }`) and hands it to
`MultiTenancy::Templates::TenantDeserializer`. This reuses the template pipeline's model coverage,
`*_ref` anchor resolution, `*_multiloc` handling and `remote_*_url` image fetching.

## Pipeline

```
xlsx files ──▶ Extractors ──▶ RefMap ──▶ TemplateBuilder ──▶ YAML/template hash ──▶ TenantDeserializer
                                                                                 └▶ RoleAssigner (post-apply)
```

- **RefMap** — registry of intermediate records keyed by the Decidim `"<table>-<id>"` string
  (the unique join key agreed in migration planning). Cross-record links are made by sharing the
  *same* attributes hash object, which becomes a YAML anchor/alias and resolves via the
  deserializer's identity-based ref lookup.
- **Extractors** — one per model type; each reads parsed rows and registers records in the RefMap.
- **TemplateBuilder** — groups records by model in dependency order and emits the template hash /
  YAML artifact.
- **RoleAssigner** — assigns project/folder-scoped moderator roles *after* deserialization, because
  those live in a JSONB `roles` array that can't carry template refs.

## Iteration 1 scope

Base scaffold only: **users, folders (process groups), projects (participatory processes), phases
(steps, imported as `information` phases)**. Participation methods, ideas, votes, surveys, events,
etc. land in later iterations.

> The expected XLSX column headers (see `Extractors::*`) are **assumptions** pending real Decidim
> exports. Override them via each extractor's `COLUMNS` mapping when the real headers are known.
