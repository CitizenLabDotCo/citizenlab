# The check service runs model-generated JavaScript, which is why it is its own
# container rather than a library inside Rails.
#
# Build context is the repository root, because the image needs the SDK type
# definitions out of the front-end tree — they are the single source the type
# checker and the model's prompt both read.
FROM node:22-slim AS build

WORKDIR /app

COPY check-service/package.json check-service/package-lock.json ./
RUN npm ci

COPY check-service/tsconfig.json ./
COPY check-service/src ./src
RUN npm run build


FROM node:22-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY check-service/package.json check-service/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY front/app/components/admin/ContentBuilder/CustomBlocks/sdk/v1/gv-sdk.d.ts ./sdk/gv-sdk.d.ts

# Nothing here needs root, and this container is the one running generated code.
USER node

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3100) + '/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

CMD ["node", "dist/server.js"]
