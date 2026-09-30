import Fastify from "fastify";

import { build } from "./build.ts";
import { sdkTypes } from "./typecheck.ts";
import type { BuildRequest } from "./types.ts";

const PORT = Number(process.env.PORT ?? 3100);
const HOST = process.env.HOST ?? "0.0.0.0";
const SECRET = process.env.CHECK_SERVICE_SECRET;
const SECRET_HEADER = "x-check-secret";

// A generated block can be large, and so can its message catalogues.
const MAX_BODY_BYTES = 4 * 1024 * 1024;

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

const start = async () => {
  try {
    // Fail at boot rather than on the first build if the SDK declarations are
    // not where we expect them.
    sdkTypes();
  } catch (error) {
    server.log.error({ err: error }, "Cannot read the SDK type definitions.");
    process.exit(1);
  }

  try {
    await server.listen({ port: PORT, host: HOST });
  } catch (error) {
    server.log.error({ err: error }, "Failed to start.");
    process.exit(1);
  }
};

const shutdown = () => {
  server.close().then(
    () => process.exit(0),
    () => process.exit(1)
  );
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
