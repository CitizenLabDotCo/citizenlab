import Fastify from "fastify";

import { build } from "./build.ts";
import { RenderPool } from "./pool.ts";
import { render } from "./render.ts";
import { sdkTypes } from "./typecheck.ts";
import type { BuildRequest, RenderRequest } from "./types.ts";

const PORT = Number(process.env.PORT ?? 3100);
const HOST = process.env.HOST ?? "0.0.0.0";
const SECRET = process.env.CHECK_SERVICE_SECRET;
const SECRET_HEADER = "x-check-secret";

// A generated block can be large, and so can its message catalogues.
const MAX_BODY_BYTES = 4 * 1024 * 1024;

// A render holds a page for as long as it takes the block's data to load, so the
// queue is capped rather than allowed to grow: Rails can act on "busy", not on a
// request that never returns.
const MAX_QUEUED_RENDERS = Number(process.env.MAX_QUEUED_RENDERS ?? 12);

const pool = new RenderPool();
let queuedRenders = 0;

const server = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? "info" },
  bodyLimit: MAX_BODY_BYTES,
});

// Rails is the only caller, over the internal network. The header is what stops
// anything else that reaches the port from compiling arbitrary TypeScript here.
server.addHook("onRequest", async (request, reply) => {
  if (request.url === "/health") return;

  if (!SECRET) {
    request.log.error(
      "CHECK_SERVICE_SECRET is not set; refusing every request."
    );
    return reply.code(503).send({ error: "not_configured" });
  }

  if (request.headers[SECRET_HEADER] !== SECRET) {
    return reply.code(401).send({ error: "unauthorized" });
  }
});

server.get("/health", async () => ({ status: "ok" }));

server.post<{ Body: BuildRequest }>("/build", async (request, reply) => {
  const body = request.body;

  if (typeof body?.source !== "string" || body.source.trim().length === 0) {
    return reply.code(422).send({ error: "source_required" });
  }

  return build({
    source: body.source,
    manifest: body.manifest ?? {},
    messages: body.messages ?? {},
    locales: body.locales ?? [],
  });
});

server.post<{ Body: RenderRequest }>("/render", async (request, reply) => {
  const body = request.body;

  if (!body?.target || !body.appOrigin || !body.layoutId) {
    return reply
      .code(422)
      .send({ error: "target_app_origin_and_layout_id_required" });
  }

  if (!pool.ready) {
    return reply.code(503).send({ error: "renderer_unavailable" });
  }

  if (queuedRenders >= MAX_QUEUED_RENDERS) {
    return reply.code(503).send({ error: "renderer_busy" });
  }

  queuedRenders += 1;
  try {
    return await render(pool, body);
  } finally {
    queuedRenders -= 1;
  }
});

const start = async () => {
  try {
    // Fail at boot rather than on the first build if the SDK declarations are
    // not where we expect them.
    sdkTypes();
  } catch (error) {
    server.log.error({ err: error }, "Cannot read the SDK type definitions.");
    process.exit(1);
  }

  // Rendering is optional: a service that cannot start Chromium can still build,
  // and /render answers 503 so Rails can tell the model the check is unavailable
  // rather than that its block is broken.
  try {
    await pool.start();
  } catch (error) {
    server.log.error({ err: error }, "Chromium did not start; /render is off.");
  }

  try {
    await server.listen({ port: PORT, host: HOST });
  } catch (error) {
    server.log.error({ err: error }, "Failed to start.");
    process.exit(1);
  }
};

const shutdown = () => {
  Promise.allSettled([server.close(), pool.stop()]).then(
    () => process.exit(0),
    () => process.exit(1)
  );
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
