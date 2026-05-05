# Go Vocal (CitizenLab) - Root Repository

## Project Overview

Go Vocal is a **digital democracy platform** that facilitates community participation and co-creation, aimed at (mostly local) governments. It enables communities to post ideas, contribute to discussions, vote, and prioritize community projects through various participation methods including polls, participatory budgets, idea collection, and surveys. Admins and moderators (called "managers" in UI copy) manage and process the results.

## Repository Structure

Monorepo:

- **`front/`** — React/TypeScript SPA (citizen-facing front-office + admin back-office). See [`front/CLAUDE.md`](./front/CLAUDE.md) for FE-specific guidance.
- **`back/`** — Rails REST API (multi-tenant, engine-based). See [`back/CLAUDE.md`](./back/CLAUDE.md) for BE-specific guidance.
- **`e2e/`** — Cypress end-to-end tests.
- **`.circleci/`** — CI/CD configuration.
- **`env_files/`** — per-area environment files for local development.

## Getting Started

### Prerequisites

- Docker & Docker Compose (latest)
- Node.js

### Quick Start

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd citizenlab
   ```

2. From the repo root, build and seed the backend:

   ```bash
   make reset-dev-env
   ```

3. In another terminal, install and start the frontend:

   ```bash
   cd front
   npm install
   npm start
   ```

## Make Commands

The root `Makefile` defines convenience targets. Most are backend-oriented but **all `make` commands must be run from the repo root**, even when the underlying command operates inside `back/`.

Notable targets:

- `make reset-dev-env` — rebuild backend images + reseed the database.
- `make e2e-setup` — prepare the backend for a Cypress run; then `npm run cypress:open` from `front/`.

## CI/CD

CircleCI runs on every PR and on master. Config: `.circleci/config.yml`. Pipeline includes backend specs, frontend unit tests, E2E tests, and linting.

## Additional Resources

- [README.md](./README.md)
- https://www.govocal.com
