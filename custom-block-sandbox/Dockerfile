# The sandbox runs model-generated JavaScript, which is why it is its own
# container rather than a library inside Rails.
#
# Build context is the repository root, because the image needs the SDK type
# definitions out of the front-end tree — they are the single source the type
# checker and the model's prompt both read.
FROM node:22-slim AS build

WORKDIR /app

COPY custom-block-sandbox/package.json custom-block-sandbox/package-lock.json ./
RUN npm ci

COPY custom-block-sandbox/tsconfig.json ./
COPY custom-block-sandbox/src ./src
RUN npm run build


# Chromium and its system libraries come from Playwright's image. Its tag must
# match the playwright version in package.json, or the browser it ships will not
# be the one the library drives.
FROM mcr.microsoft.com/playwright:v1.56.0-noble AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY custom-block-sandbox/package.json custom-block-sandbox/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY front/app/components/admin/ContentBuilder/CustomBlocks/sdk/v1/gv-sdk.d.ts ./sdk/gv-sdk.d.ts

# Nothing here needs root, and this container is the one running generated code.
# The Playwright image ships this user with the browser already installed for it.
USER pwuser

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3100) + '/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

CMD ["node", "dist/server.js"]
