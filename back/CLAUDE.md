# Go Vocal - Backend API

## Overview

Ruby on Rails REST API backend for the Go Vocal digital democracy platform. Provides multi-tenant architecture with an engine-based plugin system for modular features.

## Tech Stack

- **Framework**: Ruby on Rails 7.1.5+
- **Language**: Ruby 3.3+
- **Database**: PostgreSQL 1.5.6+ with PostGIS (spatial extension)
- **Background Jobs**: Que 2.3
- **Message Queue**: RabbitMQ (via Bunny gem)
- **File Storage**: Carrierwave 3.0.7 + Fog-AWS 3.24 (S3)
- **Authentication**: JWT 2.8.1, OmniAuth 2.1 (various providers)
- **Authorization**: Pundit 2.5
- **API Serialization**: Active Model Serializers 0.10.15, JSONAPI Serializer
- **Testing**: RSpec 6.1.2

## Project Structure

```
back/
├── app/
│   ├── controllers/        # API controllers
│   ├── models/            # ActiveRecord models
│   ├── serializers/       # JSON serializers
│   ├── services/          # Business logic services
│   ├── policies/          # Pundit authorization policies
│   ├── jobs/              # Background jobs
│   └── uploaders/         # Carrierwave file uploaders
├── config/
│   ├── environments/      # Environment-specific configs
│   ├── initializers/      # Rails initializers
│   ├── locales/          # i18n translations
│   └── tenant_templates/ # Multi-tenant seed templates
├── db/
│   ├── migrate/          # Database migrations
│   ├── seeds.rb          # Seed data
│   └── structure.sql     # Database schema
├── engines/
│   ├── free/            # Engines grouping specific functionality 
│   └── commercial/      # More engines grouping specific functionality
├── lib/
│   └── tasks/           # Rake tasks
|       └── single_use/  # Rake tasks that play a role in a migration, single use
├── spec/                # RSpec tests
│   ├── acceptance/      # API acceptance tests
│   ├── models/          # Model tests
│   ├── services/        # Service tests
│   └── factories/       # FactoryBot factories
└── Dockerfile           # Production Docker image
└── Dockerfile.development  # Development Docker image

```

## Getting Started

### Prerequisites

- Docker and Docker Compose (latest versions)

### Setup

**Build and initialize database**:
Run in the root repository folder (parent of back/)

```bash
make reset-dev-env
```

This will:
1. Build Docker images
2. Create and migrate database
3. Load seed data

### Running

**Start all services**:
```bash
docker compose up
```

API available at: http://localhost:4000

### Executing Commands

All commands MUST be run through docker compose. The docker compose configuration lives at the root of the repository (parent of `back` folder), so any docker compose commands must be launched from there.

```bash
docker compose run --rm web <command>
```

## Development

### Commands

The development environment is always run through docker compose. Never run the tests locally, but always run all commands through `docker compose run`.

### Handling Updates

After `git pull`, if there are schema or seed changes:

```bash
docker compose down
docker compose build web
docker compose run --rm web bundle exec rake db:reset
docker compose up
```

Or use the convenience script in the parent folder:
```bash
make reset-dev-env
```

### Environment Configuration

Environment variables are in `../env_files/`:
- `back-safe.env` - Safe to commit
- `back-secret.env` - Secrets (gitignored)

## Architecture

### Multi-Tenancy

Uses `ros-apartment` gem for database-level tenant isolation:
- Each tenant has separate schema
- Automatic tenant switching via subdomain/host
- Shared tables in `public` schema

### Engine System

Modular feature architecture:

**Free Engines** (`engines/free/`):
- document_annotation
- email_campaigns
- frontend
- onboarding
- polls
- seo
- surveys
- volunteering

**Commercial Engines** (`engines/commercial/`):
- multi_tenancy (required)
- admin_api
- analysis, analytics
- bulk_import_ideas
- content_builder
- custom_idea_statuses, custom_maps
- idea_assignment, idea_custom_fields
- machine_translations
- smart_groups
- SSO/ID verification engines (id_*)

There is no difference anymore between free and commercial engines, historically they had a different license but they could as well all just live under `engines/`

## Testing

### Running Tests

**All tests**:
```bash
docker compose run --rm web bin/rspec
```

**Specific test**:
```bash
docker compose run --rm web bin/rspec spec/models/user_spec.rb
```
For engines, the specs also need to be executed from the root of the rails projects, and not from the engine folder e.g.
```bash
docker compose run --rm web bin/rspec engines/commercial/multi_tenancy
```

### Test Structure

- **Acceptance tests**: Full request/response API tests
- **Model tests**: ActiveRecord model behavior
- **Service tests**: Business logic services
- **Policy tests**: Pundit authorization
- **Factories**: FactoryBot test data

### Test Tools

- **RSpec**: Test framework
- **FactoryBot**: Test data generation
- **WebMock**: HTTP request stubbing
- **VCR**: Record/replay HTTP interactions
- **Shoulda Matchers**: Rails-specific matchers
- **DatabaseCleaner**: Clean test database
- **SimpleCov**: Code coverage

## Code Quality

### Rubocop

**Run linter**:
```bash
docker compose run --rm web bundle exec rubocop
```

**Auto-fix**:
```bash
docker compose run --rm web bundle exec rubocop -a
```

**Check modified files only**:
```bash
docker compose run --rm web "git diff --name-only --diff-filter=MA | xargs bundle exec rubocop"
```

Configuration:
- `.rubocop.yml` - Rules
- `.rubocop_todo.yml` - Temporarily disabled rules

## Performance

### Profiling

**Rack Mini Profiler**:
1. Run backend
2. Execute requests
3. Visit: http://localhost:4000/rack-mini-profiler/requests

### N+1 Query Detection

Check `log/bullet.log` for N+1 query warnings.

## Message Queue (RabbitMQ)

**Access RabbitMQ UI**: http://localhost:8088 (guest/guest)

## Database

### Migrations

**Create migration**:
```bash
docker compose run --rm web rails generate migration <name>
```

**Run migrations**:
```bash
docker compose run --rm web rails db:migrate
```

### Schema

The schema is stored at structure.sql as opposed to schema.rb, because it generates deterministic database states for new tenants in the multi-tenant setup.

## Authentication & Authorization

### JWT Authentication

Token-based auth using `jwt` gem.

### OmniAuth Providers

Supported SSO providers (via engines):
- Google OAuth2
- Facebook
- Auth0
- SAML (Keycloak, Vienna SAML, etc.)
- Various government ID systems (ClaveÚnica, NemLog-in, ID Austria, etc.)

### Pundit Authorization

**Policy example**:
```ruby
class PostPolicy < ApplicationPolicy
  def update?
    user.admin? || record.author == user
  end
end
```

**Use in controller**:
```ruby
def update
  @post = Post.find(params[:id])
  authorize @post
  @post.update!(post_params)
end
```

## API Documentation

Generated with `rspec_api_documentation`:

**Generate docs**:
```bash
docker compose run --rm web bin/rake docs:generate
```

Output in `doc/api/`.

## File Uploads

Uses **Carrierwave** with **Fog-AWS** for S3:

**Uploader example**:
```ruby
class ImageUploader < CarrierWave::Uploader::Base
  storage :fog

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end
end
```

**In model**:
```ruby
class User < ApplicationRecord
  mount_uploader :avatar, ImageUploader
end
```

**S3 in development**:
Set `USE_AWS_S3_IN_DEV=true` in env file.

## Dependency Management

### License Checking

Uses `license_finder` for license compliance:

**Approve new license**:
```bash
docker compose run web license_finder permitted_licenses add "MIT"
```

**Approve specific gem**:
```bash
docker compose run web license_finder approvals add <gem_name>
```

Configuration stored in `doc/dependency_decisions.yml`.

## Debugging

### Console

```bash
docker compose run --rm web bin/rails c
```

### Byebug

Add `byebug` in code to set breakpoint.

## Monitoring & Logging

### Logs

**View logs**:
```bash
docker compose logs -f web
```

**Rails logs**: `log/development.log`


## Common Tasks

### Rake Tasks

```bash
# List all tasks
docker compose run --rm web rails -T

# Run custom task
docker compose run --rm web rails my_namespace:my_task
```

## Resources

- Rails Guides: https://guides.rubyonrails.org
- Ruby Docs: https://ruby-doc.org
- RSpec: https://rspec.info
- Pundit: https://github.com/varvet/pundit
- Apartment: https://github.com/influitive/apartment
- Que: https://github.com/que-rb/que

## Contributing

- Follow Ruby style guide
- Write RSpec tests for new features
- Run Rubocop before committing
- Update API documentation
- Check for N+1 queries
- Approve new gem licenses
