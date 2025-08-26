# Rails Backend Conventions (CLAUDE.md)

This file documents specific Rails conventions and patterns used in the Go Vocal backend. For general project information, see the root CLAUDE.md.

## Side Effects Service Pattern

Controllers delegate lifecycle callbacks to dedicated SideFxService classes:

```ruby
# In controllers:
def create
  resource = authorize(Model.new(params))
  side_fx.before_create(resource, current_user)
  if resource.save
    side_fx.after_create(resource, current_user)
    render json: serializer
  end
end

private
def side_fx
  @side_fx ||= ModelSideFxService.new
end
```

All SideFx services extend `BaseSideFxService` which:
- Provides before/after hooks for create, update, destroy
- Automatically queues `LogActivityJob` in after_* hooks
- Uses `SideFxHelper` for encoding frozen resources

## Activities and Background Processing

### Activity Tracking
- `Activity` model tracks all significant user and system actions
- Polymorphic association to any `item`
- `LogActivityJob` creates activity records and triggers:
  - `MakeNotificationsForClassJob` - Creates notifications
  - `EmailCampaigns::TriggerOnActivityJob` - Sends emails
  - `PublishActivityToRabbitJob` - Publishes to message queue
  - `TrackEventJob` - Analytics tracking

### Que Background Jobs
- All jobs inherit from `ApplicationJob` which includes `Que::ActiveJob::JobExtensions`
- Default priority: 50
- Automatic retries enabled
- Jobs are enqueued via `perform_later`

## Testing with rspec-api-documentation

Acceptance tests in `spec/acceptance/` use rspec-api-documentation DSL:

```ruby
resource 'Projects' do
  explanation 'Projects can have phases...'
  
  with_options scope: :project do
    parameter :title_multiloc, 'The title...', required: true
  end
  
  get 'web_api/v1/projects' do
    example 'List all projects' do
      do_request
      expect(status).to eq 200
    end
  end
end
```

## Engine Architecture

Engines are used as modules to organize functionality, not as standalone distributable gems:

- **Free engines** (`engines/free/`): Core open-source features
- **Commercial engines** (`engines/commercial/`): Premium features

Engines are mounted in main routes and contain isolated:
- Models, controllers, services
- Database migrations
- Specs
- Routes (mounted into main app)

## Email Campaigns Engine

The `email_campaigns` engine handles all transactional and campaign emails:

- `Campaign` model uses STI for different campaign types
- Campaigns have multiloc fields for internationalization
- `TriggerOnActivityJob` listens to activities and sends appropriate emails
- Each campaign type has its own mailer and template

## Multi-tenancy and Configuration

### AppConfiguration
- Singleton pattern: `AppConfiguration.instance`
- Settings stored as JSONB with JSON schema validation
- Feature flags via `Settings` module
- Extensions register features: `Settings.add_feature('feature_name')`

### Multi-tenancy (via multi_tenancy engine)
- PostgreSQL schema-based isolation using Apartment gem
- `Tenant.current` - Current tenant context
- `tenant.switch { ... }` - Execute in tenant context
- `Tenant.safe_switch_each` - Safely iterate all tenants

## Authorization with Pundit

All authorization handled through Pundit policies:

```ruby
class ResourcePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      # Scope logic based on user permissions
    end
  end
  
  def create?
    # Authorization logic
  end
end
```

Controllers use `authorize` helper to enforce policies.

## Additional Patterns

### Serializers
- Uses JSONAPI::Serializer (not ActiveModel::Serializers)
- Base serializer provides `current_user` and context helpers
- Consistent API response format following JSON:API spec

### Service Objects
- Naming convention: `*Service` suffix
- Located in `app/services/`
- Encapsulate complex business logic
- Examples: `AuthenticationService`, `NotificationService`, `SlugService`

### Internationalization
- `_multiloc` suffix for multilingual fields
- Stored as JSONB in PostgreSQL
- Supported throughout models and serializers

### API Versioning
- Controllers namespaced under `WebApi::V1::`
- Consistent RESTful routing
- Nested resources follow Rails conventions