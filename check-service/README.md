# check-service

Answers two questions about a generated custom block with facts a model can act on:

- **does it build** — `POST /build`: compile, typecheck, lint, extract the SQL it runs.
- **does it render** — `POST /render`: not implemented yet; it will mount the block in
  headless Chromium against the SPA's block-harness route.

Rails is the only caller, and authenticates with the `X-Check-Secret` header. The
service is stateless, holds no credentials of its own, and never reaches the database.
It exists as its own container because it runs generated JavaScript, which must not run
inside the Rails process.

## Local development

It comes up with the rest of the stack (`docker compose up check_service`). Outside
Docker:

```sh
npm install
CHECK_SERVICE_SECRET=dev npm run dev
```

## The SDK type definitions

Typechecking needs `gv-sdk.d.ts`, whose single source is
`front/app/components/admin/ContentBuilder/CustomBlocks/sdk/v1/gv-sdk.d.ts`. The image
copies it in; docker-compose bind-mounts it. `SDK_TYPES_PATH` overrides the location.
