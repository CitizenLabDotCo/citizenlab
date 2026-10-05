# custom-block-sandbox

Answers two questions about a generated custom block with facts a model can act on:

- **does it build** — `POST /build`: compile, typecheck, lint, extract the SQL it runs.
- **does it render** — `POST /render`: mount the block in headless Chromium against the
  SPA's block-harness route, and report what the page did.

Rails is the only caller, and authenticates with the `X-Sandbox-Secret` header. The
service is stateless, holds no credentials of its own, and never reaches the database.
It exists as its own container because it runs generated JavaScript, which must not run
inside the Rails process.

## Local development

It comes up with the rest of the stack (`docker compose up
custom_block_sandbox`). Outside Docker:

```sh
npm install
CUSTOM_BLOCK_SANDBOX_SECRET=dev npm run dev
```

## The SDK type definitions

Typechecking needs `gv-sdk.d.ts`, whose single source is
`front/app/components/admin/ContentBuilder/CustomBlocks/sdk/v1/gv-sdk.d.ts`. The image
copies it in; docker-compose bind-mounts it. `SDK_TYPES_PATH` overrides the location.
`GET /sdk/v1.d.ts` serves the same copy, so the model is told about the module the
typechecker holds it to.

## Deployment

CI builds and pushes `citizenlabdotco/custom-block-sandbox:amd64-<sha>` on every
pipeline, the same per-commit tag the back-end image uses. An environment can pin
both to one commit.
amd64 only: a preview pulls that tag directly, so the multi-arch manifest the back end
builds for staging and production has no counterpart here yet.

A deployed instance needs:

- `CUSTOM_BLOCK_SANDBOX_SECRET`, the same value as on the Rails side. Without it
  the service refuses every request with a 503.
- `CUSTOM_BLOCK_SANDBOX_URL` on the Rails side, pointing here. It defaults to
  `http://custom_block_sandbox:3100`.
- Outbound HTTPS to the tenant's own front end and API. A render opens
  `<base_frontend_uri>/<locale>/block-harness`, and the page then reads its data from the
  API. Those two origins are the only private hosts the page may reach; see
  `src/egress.ts`.
- Memory for Chromium: `RENDER_POOL_SIZE` warm contexts, 3 by default, at 794x1123 @2x.

Two compose settings are local only. The `gv-sdk.d.ts` bind-mount is a convenience for
editing the contract — the image already has the file. `RENDER_HOST_RESOLVER_RULES`
exists because the development tenant is `localhost`, which inside the container is the
container itself.
