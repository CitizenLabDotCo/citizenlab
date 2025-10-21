# Go Vocal (CitizenLab) - Root Repository

## Project Overview

Go Vocal is a **digital democracy platform** that facilitates community participation and co-creation, aimed at (mostly local) governments. It enables communities to post ideas, contribute to discussions, vote, and prioritize community projects through various participation methods including polls, participatory budgets, idea collection, and surveys. It allows admins to manage and process the results of these processes.

## Repository Structure

This is a monorepo containing:

- **`front/`** - React/TypeScript frontend application (Vite-based)
- **`back/`** - Ruby on Rails backend API (Rails 7.1+)
- **`e2e/`** - End-to-end tests
- **`.circleci/`** - CI/CD configuration

## Key Technologies

### Frontend (`front/`)

The front-end is a Single Page Application handling both the front-office (citizen-facing) as the back-office (government-facing) side of the platform.

- React 18.3 with TypeScript 5.3
- Vite for build tooling
- Styled Components for styling
- React Query for data fetching
- React Router for navigation
- Component library in `front/app/component-library/`

### Backend (`back/`)

The back-end is purely an API layer, and in general not rendering HTML.

- Ruby 3.3+ with Rails 7.1.5
- PostgreSQL with PostGIS (spatial data)
- Multi-tenant architecture (using ros-apartment gem)
- Engine-based architecture (`engines/free/` and `engines/commercial/`)
- Background jobs with Que
- RabbitMQ for event messaging
- Carrierwave + Fog for file uploads (S3)
- Pundit for policies

## Getting Started

### Prerequisites

- Docker & Docker Compose (latest)
- Node.js

### Quick Start

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd citizenlab
   ```

2. **Build and start the backend in docker compose**:

   ```bash
   make reset-dev-env
   ```

   This builds Docker images and populates the database with seed data.

3. **Install and start the frontend**:
   ```bash
   cd front
   npm install
   npm start
   ```
   The frontend will be available at the default Vite dev server port.

### Environment Configuration

- Backend and frontend environment files are in `env_files/`
- Use `docker-compose.yml` for local development orchestration

## Development Workflow

### Backend Development

**Run all rails commands in docker compose, no local execution**:

```bash
docker compose run --rm web <command>
```

## Make commands

The root of the repository defines a Makefile with a bunch of useful make commands. Most apply to the back-end, so despite the code of the back-end living in `back/`, executing any make commands should be done through the root folder.

### Frontend Development

- **Start dev server**: `npm start` (in `front/`)
- **Run tests**: `npm test`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`

### Testing

- **Backend tests**: `docker compose run --rm web bin/rspec`
- **Frontend unit tests**: `cd front && npm test`
- **E2E tests**:
  ```bash
  make e2e-setup  # Backend setup
  cd front && npm run cypress:open  # Run Cypress
  ```

## Additional Resources

- Main README: [README.md](./README.md)
- Frontend README: [front/README.md](./front/README.md)
- Backend README: [back/README.md](./back/README.md)
- Official Website: https://www.govocal.com

## CI/CD

- CircleCI runs tests on all PRs and master branch commits
- Config: `.circleci/config.yml`
- Tests include: backend specs, frontend unit tests, E2E tests, linting
