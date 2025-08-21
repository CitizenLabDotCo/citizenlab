# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Go Vocal is a digital democracy platform consisting of:

- **Backend (`back/`)**: Ruby on Rails API application with PostgreSQL database
- **Frontend (`front/`)**: React/TypeScript single-page application built with Vite
- **Engine Architecture**: Modular system with free and commercial engines in `back/engines/`
  - Free engines: email_campaigns, frontend, onboarding, polls, seo, surveys, volunteering
  - Commercial engines: multi_tenancy, analytics, idea_assignment, user_custom_fields, and various SSO integrations

## Development Environment Setup

### Prerequisites

- Docker and docker-compose
- Node.js (for frontend development)

### Common Commands

**Environment Setup:**

```bash
# Reset and build complete development environment
make reset-dev-env

# Build containers and install dependencies
make build

# Start both backend and frontend
make up

# Start only backend
make be-up

# Start only frontend (from front/ directory)
make fe-up
# or: cd front && npm start
```

**Database Operations:**

```bash
# Run database migrations and maintenance tasks
make migrate

# Reset database with fresh data
docker compose run --rm web bin/rails db:reset

# Access PostgreSQL console
make psql

# Rails console
make c
# or: make rails-console
```

**Testing:**

```bash
# Backend tests (RSpec)
docker compose run --rm web rspec
# or: make r file=spec/path/to/test_spec.rb

# Frontend tests (Jest)
cd front && npm test

# E2E tests setup and run
make e2e-setup
cd front && npm run cypress:run

# Linting
make blint  # Backend rubocop
cd front && npm run lint  # Frontend ESLint
```

### Multi-tenancy Architecture

The platform uses a multi-tenant architecture with PostgreSQL schemas. Each tenant has its own schema, with shared authentication and configuration managed centrally.

### Key Rails Patterns

- **Engines**: Functionality is modularized into Rails engines (both free and commercial)
- **Policies**: Authorization handled through Pundit policies
- **Serializers**: API responses use ActiveModel::Serializers
- **Services**: Business logic organized in service objects
- **Interactors**: Complex operations use the Interactor pattern
- **Background Jobs**: Que for job processing

### Frontend Architecture

- **React 18** with TypeScript
- **Styled Components** for styling
- **React Query** for data fetching and caching
- **React Router** for navigation
- **React Hook Form** with Yup validation
- **Vite** for bundling and development server

### File Structure Conventions

**Backend:**

- `app/controllers/web_api/v1/` - API controllers
- `app/models/` - ActiveRecord models
- `app/policies/` - Pundit authorization policies
- `app/services/` - Business logic services
- `app/serializers/web_api/v1/` - JSON API serializers
- `engines/` - Modular engines (free and commercial)

**Frontend:**

- `app/containers/` - Page-level React components
- `app/components/` - Reusable UI components
- `app/api/` - API client and data fetching
- `app/utils/` - Utility functions and helpers

### Configuration Files

- **Backend**: `config/application.rb`, `config/database.yml`, `docker-compose.yml`
- **Frontend**: `vite.config.ts`, `package.json`, `tsconfig.json`
- **Environment**: `env_files/` for environment-specific variables

### Testing Approach

- **Backend**: RSpec for unit/integration tests, follows Rails testing conventions
- **Frontend**: Jest for unit tests, Cypress for E2E tests
- **Coverage**: Both backend and frontend have comprehensive test suites

### Development Workflows

1. **Feature Development**: Create feature in appropriate engine or main app
2. **API Changes**: Update controllers, serializers, and policies as needed
3. **Database Changes**: Create migrations and update models
4. **Frontend Changes**: Update components, API clients, and routes
5. **Testing**: Write tests for both backend and frontend changes

### Engine Development

When working with engines:

- Free engines are in `engines/free/`
- Commercial engines are in `engines/commercial/`
- Each engine has its own routes, controllers, models, and specs
- Engines are mounted in the main application's routes

### Docker Development

All backend commands should be run through docker-compose:

```bash
# General pattern for Linux users
docker-compose run --user "$(id -u):$(id -g)" --rm web [command]

# Mac/Windows users can omit the --user flag
docker-compose run --rm web [command]
```
