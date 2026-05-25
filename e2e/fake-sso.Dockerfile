## Builds the fake_sso OIDC provider image used by the e2e CI job.
##
## The build context is expected to be a checkout of
## https://github.com/CitizenLabDotCo/fake_sso (the source isn't kept in this
## repo). See .circleci/config.yml::e2e-setup-db for the clone + build steps.
FROM node:22-alpine

WORKDIR /app

# Install deps first so the layer caches well across changes to the source.
COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ENV PORT=8081
EXPOSE 8081

# Lets `docker compose up --wait` block until the server is actually answering.
HEALTHCHECK --interval=2s --timeout=2s --start-period=15s --retries=30 \
  CMD wget -q --spider http://localhost:8081/ || exit 1

CMD ["npm", "start"]
