# iPaaS Integration via Webhooks - Implementation Plan

**Date:** 2025-10-17
**Status:** Implementation Plan
**Jira:** TAN-5687

## Executive Summary

This document outlines the implementation plan for integrating Go Vocal with iPaaS platforms (primarily n8n) through a Rails-native webhook subscription and delivery system.

**Approach:** Leverage the existing Activity-driven event architecture to deliver webhooks for selected event types (ideas and users initially) with optional project-based filtering.

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Requirements](#requirements)
3. [Solution Architecture](#solution-architecture)
4. [Implementation Plan](#implementation-plan)
5. [Appendix](#appendix)

---

## Current Architecture

### Event-Driven Foundation

Go Vocal already has a sophisticated event-driven architecture centered around the **Activity** system:

```
User Action → SideFxService → LogActivityJob → Activity Record
                                      ↓
                    ┌─────────────────┼─────────────────┐
                    ↓                 ↓                 ↓
           Notifications    Email Campaigns    RabbitMQ Publishing
```

**Key Components:**

| Component                           | File                                                                            | Purpose                                   |
| ----------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| **Activity**                        | `back/app/models/activity.rb`                                                   | Universal event log for all domain events |
| **LogActivityJob**                  | `back/app/jobs/log_activity_job.rb`                                             | Orchestrates event reactions              |
| **PublishActivityToRabbitJob**      | `back/app/jobs/publish_activity_to_rabbit_job.rb`                               | Publishes events to RabbitMQ              |
| **NotificationService**             | `back/app/services/notification_service.rb`                                     | Routes notifications                      |
| **EmailCampaigns::DeliveryService** | `engines/free/email_campaigns/app/services/email_campaigns/delivery_service.rb` | Email orchestration                       |

### Activity Schema

```ruby
# back/app/models/activity.rb
{
  id: UUID,
  item_type: String,      # Polymorphic: 'Idea', 'Comment', 'Project', etc.
  item_id: UUID,
  action: String,         # 'created', 'changed', 'deleted', 'published', etc.
  payload: JSONB,         # Event-specific data
  user_id: UUID,          # Who triggered the event (nil for anonymous)
  acted_at: DateTime,
  project_id: UUID,       # For scoping/filtering
  created_at: DateTime
}
```

### Existing Event Flow

When an idea is created (`back/app/controllers/web_api/v1/ideas_controller.rb:170-247`):

```ruby
# 1. Controller saves idea
idea.save!

# 2. Side effects triggered (line 236)
SideFxIdeaService.new.after_create(idea, current_user)

# 3. Activity logged (back/app/services/side_fx_idea_service.rb:20-26)
LogActivityJob.perform_later(idea, 'created', user, timestamp)

# 4. LogActivityJob orchestrates (back/app/jobs/log_activity_job.rb:40-46)
def run(item, action, user, acted_at, options = {})
  activity = create_activity(item, action, user, acted_at, options)
  trigger_notifications(activity)    # → MakeNotificationsForClassJob
  trigger_campaigns(activity)        # → EmailCampaigns::TriggerOnActivityJob
  publish_activity_to_rabbit(activity)  # → PublishActivityToRabbitJob
  trigger_track_activity_job(activity, item)  # → Analytics
end
```

### RabbitMQ Integration

**Current Status:** ✅ Already publishing comprehensive events

**Configuration:**

- Exchange: `cl2back` (topic exchange)
- Routing keys: `{item_type}.{action}` (e.g., `idea.created`, `comment.deleted`)
- Message format: JSON

**Published Events (partial list):**

- `idea.created`, `idea.changed`, `idea.deleted`, `idea.published`
- `comment.created`, `comment.updated`, `comment.deleted`
- `project.created`, `project.published`, `project.changed`
- `phase.started`, `phase.upcoming`, `phase.ended`
- `user.created`, `invite.created`, `notification.*`
- 20+ additional event types

**Message Structure:**

```json
{
  "event": "Idea created",
  "timestamp": "2025-10-17T10:30:00Z",
  "item_content": {
    "id": "uuid",
    "title_multiloc": {...},
    "body_multiloc": {...},
    "author_id": "uuid",
    "project_id": "uuid"
  },
  "item_type": "Idea",
  "item_id": "uuid",
  "action": "created",
  "payload": {...},
  "user_id": "uuid",
  "user_email": "user@example.com",
  "tenantId": "tenant-id",
  "tenantName": "City of Example"
}
```

**Files:**

- Connection: `back/config/initializers/bunny.rb`
- Library: `back/lib/citizen_lab/bunny.rb`
- Publisher: `back/app/jobs/publish_generic_event_to_rabbit_job.rb`
- Serialization: `back/app/services/tracking_service.rb`

### Existing Webhook Patterns

Go Vocal already implements webhook **ingestion** (receiving webhooks from external services):

#### 1. Typeform Survey Webhooks

**Files:**

- Manager: `back/engines/free/surveys/app/services/surveys/typeform_webhook_manager.rb`
- Controller: `back/engines/free/surveys/app/controllers/surveys/hooks/typeform_events_controller.rb`
- Parser: `back/engines/free/surveys/app/services/surveys/typeform_webhook_parser.rb`

**Security:** HMAC-SHA256 signature verification using `ENV['SECRET_TOKEN_TYPEFORM']`

**Pattern:**

```ruby
def verify_signature
  received_signature = request.headers['HTTP_TYPEFORM_SIGNATURE']
  payload_body = request.body.read
  hash = OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), secret, payload_body)
  encoding = Base64.strict_encode64(hash)
  actual_signature = "sha256=#{encoding}"
  head :not_acceptable unless Rack::Utils.secure_compare(actual_signature, received_signature)
end
```

#### 2. Mailgun Email Event Webhooks

**Files:**

- Controller: `back/engines/free/email_campaigns/app/controllers/email_campaigns/hooks/mailgun_events_controller.rb`

**Security:** HMAC-SHA256 signature verification using `ENV['MAILGUN_API_KEY']`

**Pattern:**

```ruby
def verify
  token = params[:signature][:token]
  timestamp = params[:signature][:timestamp]
  signature = params[:signature][:signature]
  digest = OpenSSL::Digest.new('SHA256')
  data = [timestamp, token].join
  head :not_acceptable if signature != OpenSSL::HMAC.hexdigest(digest, api_key, data)
end
```

### Background Job Infrastructure

**Queue System:** Que (PostgreSQL-backed job queue)

**Benefits:**

- ✅ Transactional job enqueueing
- ✅ Reliable delivery (survives crashes)
- ✅ Built-in retry logic
- ✅ Already proven at scale

**Usage:** Extensively used for notifications, emails, analytics, RabbitMQ publishing

---

## Requirements

### Functional Requirements

1. **Event Triggers:** Enable external systems (n8n, Zapier, Make.com) to receive real-time notifications when events occur in Go Vocal
2. **Event Types:** Support selected event types:
   - **Phase 1:** Idea events (`idea.created`, `idea.published`, `idea.changed`) and User events (`user.created`)
   - **Future:** Additional event types can be added incrementally
3. **Event Filtering:**
   - Filter by event type (required)
   - Filter by project (optional) - only deliver events for specific projects
4. **Multi-tenancy:** Tenant-scoped subscriptions (using Apartment)
5. **Reliability:** At-least-once delivery with retry logic
6. **Security:** Signature verification, HTTPS enforcement, tenant isolation

### Non-Functional Requirements

1. **Performance:** Handle webhook delivery without impacting main application
2. **Scalability:** Support hundreds of webhook subscriptions per tenant
3. **Observability:** Track delivery success/failure for debugging
4. **Maintainability:** Follow existing code patterns, minimal new dependencies
5. **Developer Experience:** Simple setup for n8n users

### n8n Integration Requirements

Based on n8n documentation research:

1. **Webhook URL:** n8n provides webhook URLs like `https://n8n.example.com/webhook/unique-id`
2. **Authentication:** Supports various methods (none, header auth, query parameters)
3. **Payload:** Expects JSON payload in request body
4. **Headers:** Can read custom headers (e.g., `X-GoVocal-Event`, `X-GoVocal-Signature`)
5. **Response:** n8n returns 200 OK immediately or after workflow completion

**Alternative:** n8n also supports **RabbitMQ Trigger** node for consuming directly from message queues

---

## Solution Architecture

### Rails-Native Webhook Delivery System

Build webhook subscriptions in Rails, leveraging existing Activity infrastructure.

#### Architecture Diagram

```
User Action
    ↓
SideFxService.after_create
    ↓
LogActivityJob.perform_later
    ↓
Activity.create!
    ↓
trigger_webhooks(activity)  ← NEW
    ↓
WebhookSubscription.where(events: includes activity.routing_key)
    ↓
WebhookDeliveryJob.perform_later (per subscription)
    ↓
HTTP POST to subscriber URL
    ├→ Success: Log delivery
    └→ Failure: Retry with exponential backoff
```

#### Database Schema

```ruby
# Migration: create_webhook_subscriptions
create_table :webhook_subscriptions, id: :uuid do |t|
  t.string :name, null: false
  t.string :url, null: false
  t.string :secret_token, null: false
  t.jsonb :events, default: [], null: false  # ['idea.created', 'idea.published', 'user.created']
  t.uuid :project_id  # Optional: filter to specific project
  t.boolean :enabled, default: true
  t.integer :max_retries, default: 3
  t.integer :timeout_seconds, default: 10
  t.timestamps

  t.index :enabled
  t.index :project_id
end

# Migration: create_webhook_deliveries
create_table :webhook_deliveries, id: :uuid do |t|
  t.uuid :webhook_subscription_id, null: false, index: true
  t.uuid :activity_id, null: false, index: true
  t.string :event_type, null: false  # 'idea.created'
  t.string :status, null: false, default: 'pending'  # pending, success, failed
  t.integer :attempts, default: 0
  t.integer :response_code
  t.text :response_body
  t.text :error_message
  t.datetime :last_attempt_at
  t.datetime :succeeded_at
  t.timestamps

  t.index [:webhook_subscription_id, :status]
  t.index [:created_at]
end
```

#### Implementation Components

##### 1. WebhookSubscription Model

```ruby
# app/models/webhook_subscription.rb
class WebhookSubscription < ApplicationRecord
  # Tenant-scoped via Apartment
  belongs_to :project, optional: true
  has_many :webhook_deliveries, dependent: :destroy

  # Supported event types (Phase 1)
  SUPPORTED_EVENTS = [
    'idea.created',
    'idea.published',
    'idea.changed',
    'user.created'
  ].freeze

  validates :url, presence: true, url: true
  validates :name, presence: true
  validates :events, presence: true
  validates :secret_token, presence: true
  validates :max_retries, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 10 }
  validates :timeout_seconds, numericality: { greater_than: 0, less_than_or_equal_to: 30 }
  validate :validate_supported_events

  before_validation :generate_secret_token, on: :create

  scope :enabled, -> { where(enabled: true) }
  scope :for_event, ->(event_type) do
    where("events @> ?", [event_type].to_json)
  end
  scope :for_project, ->(project_id) do
    where(project_id: [nil, project_id])
  end

  def matches_event?(event_type)
    events.include?(event_type)
  end

  def matches_project?(activity_project_id)
    # If subscription has no project filter, match all
    return true if project_id.nil?

    # If activity has no project, always send (e.g., user.created)
    return true if activity_project_id.nil?

    # Otherwise, must match the subscription's project
    project_id == activity_project_id
  end

  private

  def generate_secret_token
    self.secret_token ||= SecureRandom.base64(32)
  end

  def validate_supported_events
    unsupported = events - SUPPORTED_EVENTS
    if unsupported.any?
      errors.add(:events, "contains unsupported event types: #{unsupported.join(', ')}")
    end
  end
end
```

##### 2. WebhookDelivery Model

```ruby
# app/models/webhook_delivery.rb
class WebhookDelivery < ApplicationRecord
  belongs_to :webhook_subscription
  belongs_to :activity

  STATUSES = %w[pending success failed].freeze

  validates :status, inclusion: { in: STATUSES }
  validates :event_type, presence: true

  scope :pending, -> { where(status: 'pending') }
  scope :succeeded, -> { where(status: 'success') }
  scope :failed, -> { where(status: 'failed') }
  scope :recent, -> { order(created_at: :desc) }
end
```

##### 3. WebhookDeliveryJob

```ruby
# app/jobs/webhook_delivery_job.rb
class WebhookDeliveryJob < ApplicationJob
  queue_as :default

  # Exponential backoff: 1min, 5min, 30min
  retry_on StandardError, wait: :exponentially_longer, attempts: 3, queue: :webhooks do |job, exception|
    delivery = WebhookDelivery.find(job.arguments.first)
    delivery.update!(
      status: 'failed',
      error_message: "#{exception.class}: #{exception.message}",
      last_attempt_at: Time.current
    )
  end

  def perform(webhook_delivery_id)
    delivery = WebhookDelivery.find(webhook_delivery_id)
    subscription = delivery.webhook_subscription

    return unless subscription.enabled?

    # Generate payload
    payload = WebhookPayloadService.new.generate(delivery.activity)

    # Generate HMAC signature
    signature = generate_signature(payload.to_json, subscription.secret_token)

    # Deliver webhook
    response = HTTP
      .timeout(subscription.timeout_seconds)
      .headers(
        'Content-Type' => 'application/json',
        'X-GoVocal-Event' => delivery.event_type,
        'X-GoVocal-Signature' => signature,
        'X-GoVocal-Delivery-ID' => delivery.id,
        'User-Agent' => 'GoVocal-Webhooks/1.0'
      )
      .post(subscription.url, json: payload)

    # Record success
    delivery.update!(
      status: 'success',
      attempts: delivery.attempts + 1,
      response_code: response.code,
      response_body: response.body.to_s.truncate(10_000),
      last_attempt_at: Time.current,
      succeeded_at: Time.current
    )
  rescue HTTP::Error, HTTP::TimeoutError => e
    # Record attempt, will retry via Que
    delivery.update!(
      attempts: delivery.attempts + 1,
      error_message: "#{e.class}: #{e.message}",
      last_attempt_at: Time.current
    )
    raise # Re-raise to trigger retry
  end

  private

  def generate_signature(payload, secret)
    hmac = OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), secret, payload)
    "sha256=#{Base64.strict_encode64(hmac)}"
  end
end
```

##### 4. WebhookPayloadService

```ruby
# app/services/webhook_payload_service.rb
class WebhookPayloadService
  def generate(activity)
    {
      id: activity.id,
      event: event_name(activity),
      event_type: routing_key(activity),
      timestamp: activity.acted_at.iso8601,
      data: serialize_item(activity),
      metadata: {
        item_type: activity.item_type,
        item_id: activity.item_id,
        action: activity.action,
        user_id: activity.user_id,
        project_id: activity.project_id,
        tenant: tenant_info
      }
    }
  end

  private

  def event_name(activity)
    TrackingService.new.activity_event_name(activity)
  end

  def routing_key(activity)
    "#{activity.item_type.underscore}.#{activity.action.underscore}"
  end

  def serialize_item(activity)
    return {} unless activity.item

    serializer_class = "WebApi::V1::External::#{activity.item_type}Serializer".constantize
    TrackingService.new.serialize(serializer_class, activity.item)
  rescue NameError
    {} # No serializer available
  end

  def tenant_info
    {
      id: Tenant.current.id,
      name: Tenant.current.name,
      host: Tenant.current.host
    }
  end
end
```

##### 5. SideFxWebhookService

```ruby
# app/services/side_fx_webhook_service.rb
class SideFxWebhookService
  def after_activity_created(activity)
    event_type = routing_key(activity)

    # Only process supported event types
    return unless WebhookSubscription::SUPPORTED_EVENTS.include?(event_type)

    # Find matching subscriptions (event type + optional project filter)
    subscriptions = WebhookSubscription
      .enabled
      .for_event(event_type)
      .for_project(activity.project_id)

    # Create delivery records and enqueue jobs
    subscriptions.find_each do |subscription|
      next unless subscription.matches_event?(event_type)
      next unless subscription.matches_project?(activity.project_id)

      delivery = WebhookDelivery.create!(
        webhook_subscription: subscription,
        activity: activity,
        event_type: event_type,
        status: 'pending'
      )

      WebhookDeliveryJob.perform_later(delivery.id)
    end
  end

  private

  def routing_key(activity)
    "#{activity.item_type.underscore}.#{activity.action.underscore}"
  end
end
```

##### 6. Integration into LogActivityJob

```ruby
# app/jobs/log_activity_job.rb
class LogActivityJob < ApplicationJob
  # ... existing code ...

  def run(item, action, user, acted_at, options = {})
    activity = create_activity(item, action, user, acted_at, options)
    trigger_notifications(activity)
    trigger_campaigns(activity)
    trigger_webhooks(activity)  # ← NEW
    publish_activity_to_rabbit(activity)
    trigger_track_activity_job(activity, item)
  end

  private

  # ... existing methods ...

  def trigger_webhooks(activity)
    SideFxWebhookService.new.after_activity_created(activity)
  end
end
```

#### API Endpoints

```ruby
# config/routes.rb
namespace :web_api, defaults: { format: :json } do
  namespace :v1 do
    resources :webhook_subscriptions do
      member do
        post :test  # Send test webhook
        post :regenerate_secret
      end
      resources :deliveries, only: [:index, :show], controller: 'webhook_deliveries' do
        member do
          post :retry
        end
      end
    end
  end
end
```

```ruby
# app/controllers/web_api/v1/webhook_subscriptions_controller.rb
class WebApi::V1::WebhookSubscriptionsController < ApplicationController
  before_action :authenticate_admin

  def index
    @subscriptions = policy_scope(WebhookSubscription)
      .includes(:webhook_deliveries)
      .order(created_at: :desc)
      .page(params[:page])

    render json: serialize(@subscriptions)
  end

  def create
    @subscription = WebhookSubscription.new(subscription_params)
    authorize @subscription

    if @subscription.save
      render json: serialize(@subscription), status: :created
    else
      render json: { errors: @subscription.errors.details }, status: :unprocessable_entity
    end
  end

  def test
    @subscription = WebhookSubscription.find(params[:id])
    authorize @subscription

    # Create test activity
    test_activity = create_test_activity

    # Create and deliver immediately
    delivery = WebhookDelivery.create!(
      webhook_subscription: @subscription,
      activity: test_activity,
      event_type: 'test.webhook',
      status: 'pending'
    )

    WebhookDeliveryJob.perform_now(delivery.id)

    render json: serialize(delivery.reload)
  end

  # ... other actions ...
end
```

#### Pros

- ✅ **Architectural Elegance:** Perfectly leverages existing Activity system
- ✅ **Zero Infrastructure:** No new services, databases, or message brokers
- ✅ **Proven Patterns:** Follows SideFx, Que jobs, HMAC verification patterns already in codebase
- ✅ **Security:** Tenant isolation via database scoping, signature verification
- ✅ **Observability:** All deliveries logged in database
- ✅ **Testability:** Can write unit/integration tests using existing infrastructure
- ✅ **Maintainability:** Team familiar with these patterns
- ✅ **Industry Standard:** Webhooks are how GitHub, Stripe, Twilio, Mailgun all work
- ✅ **n8n Compatibility:** Perfect match for n8n's Webhook Trigger node

#### Cons

- ⚠️ **UI Development:** Need admin interface for managing subscriptions
- ⚠️ **Retry Logic:** Need to implement (but simpler than it sounds with Que)
- ⚠️ **Worker Capacity:** Que workers need capacity for webhook delivery

#### Effort Estimate

| Phase             | Tasks                                                | Effort       |
| ----------------- | ---------------------------------------------------- | ------------ |
| **Database**      | Migrations, models, validations                      | 0.5 days     |
| **Core Logic**    | Payload service, delivery job, SideFx integration    | 1.5 days     |
| **Security**      | Signature generation/verification, HTTPS enforcement | 0.5 days     |
| **API**           | REST endpoints for CRUD operations                   | 1 day        |
| **Admin UI**      | Frontend for subscription management                 | 2 days       |
| **Testing**       | Unit tests, integration tests, E2E                   | 1.5 days     |
| **Documentation** | API docs, n8n integration guide                      | 0.5 days     |
| **Total**         |                                                      | **7-8 days** |

---

## Implementation Plan

### Phase 1: Core Infrastructure (3-4 days)

#### 1.1 Database Migrations (0.5 days)

- [ ] Create `webhook_subscriptions` table
- [ ] Create `webhook_deliveries` table
- [ ] Add indexes for performance
- [ ] Run migrations in development

#### 1.2 Models & Validations (0.5 days)

- [ ] `WebhookSubscription` model with validations
- [ ] `WebhookDelivery` model with validations
- [ ] Scopes for querying (enabled, for_event, etc.)
- [ ] Event pattern matching logic (wildcards)
- [ ] Secret token generation

#### 1.3 Webhook Delivery System (1.5 days)

- [ ] `WebhookPayloadService` - serialize Activity to webhook payload
- [ ] `WebhookDeliveryJob` - HTTP POST with retries
- [ ] HMAC signature generation/verification
- [ ] Timeout handling (default 10s)
- [ ] Error handling and logging

#### 1.4 Integration (0.5 days)

- [ ] `SideFxWebhookService` - find matching subscriptions
- [ ] Hook into `LogActivityJob#run`
- [ ] Create deliveries and enqueue jobs

#### 1.5 Testing (1 day)

- [ ] Unit tests for models
- [ ] Unit tests for payload service
- [ ] Integration test for delivery flow
- [ ] Test retry logic
- [ ] Test signature verification

---

### Phase 2: Admin API & UI (2-3 days)

#### 2.1 REST API (1 day)

- [ ] `WebhookSubscriptionsController` with CRUD actions
- [ ] `WebhookDeliveriesController` for viewing deliveries
- [ ] Pundit policies for authorization
- [ ] Serializers for JSON responses
- [ ] Test webhook endpoint
- [ ] Regenerate secret endpoint
- [ ] Retry delivery endpoint

#### 2.2 Admin Frontend (2 days)

- [ ] Subscription list view
- [ ] Create/edit subscription form
- [ ] Event type selector (checkboxes for common events, pattern input)
- [ ] Test webhook button
- [ ] Delivery history view
- [ ] Retry failed delivery button
- [ ] Secret regeneration flow

---

### Phase 3: Documentation & Polish (1.5 days)

#### 3.1 API Documentation (0.5 days)

- [ ] OpenAPI/Swagger spec for webhook subscription API
- [ ] Webhook payload schema
- [ ] Event type reference (all available events)
- [ ] Signature verification guide

#### 3.2 User Documentation (0.5 days)

- [ ] n8n integration guide with screenshots
- [ ] Example n8n workflow (idea created → Slack notification)
- [ ] Security best practices
- [ ] Troubleshooting guide

#### 3.3 Admin Documentation (0.5 days)

- [ ] How to manage subscriptions
- [ ] Monitoring delivery success
- [ ] Handling failed deliveries
- [ ] Performance considerations

---

### Phase 4: Optional - RabbitMQ Direct Access (1 day)

#### 4.1 RabbitMQ Security (0.5 days)

- [ ] Create per-tenant read-only RabbitMQ users
- [ ] Configure tenant-scoped exchanges/queues
- [ ] Document connection details

#### 4.2 Documentation (0.5 days)

- [ ] Advanced: RabbitMQ direct consumption guide
- [ ] n8n RabbitMQ Trigger node configuration
- [ ] Security implications warning
- [ ] Example workflow

---

### Total Timeline

| Phase                        | Duration     | Dependencies       |
| ---------------------------- | ------------ | ------------------ |
| Phase 1: Core                | 3-4 days     | None               |
| Phase 2: Admin UI            | 2-3 days     | Phase 1 complete   |
| Phase 3: Docs                | 1.5 days     | Phase 1-2 complete |
| Phase 4: RabbitMQ (Optional) | 1 day        | None (parallel)    |
| **Total**                    | **7-9 days** |                    |

---

## Appendix

### A. Event Types Reference

Phase 1 supported event types:

#### Ideas

- `idea.created` - New idea submitted
- `idea.published` - Idea published (from draft)
- `idea.changed` - Idea updated (title, body, or other attributes)
- `idea.deleted` - Idea removed

#### Users

- `user.created` - New user registered
- `user.deleted` - User removed their profile
- `user.changed` - User updated

**Note:** Additional event types (comments, projects, votes, etc.) can be added in future phases as needed.

---

### B. Webhook Payload Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "Idea created",
  "event_type": "idea.created",
  "timestamp": "2025-10-17T14:30:00Z",
  "data": {
    "id": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8",
    "type": "idea",
    "attributes": {
      "title_multiloc": {
        "en": "New bike lanes on Main Street"
      },
      "body_multiloc": {
        "en": "We need protected bike lanes to improve safety..."
      },
      "author_id": "u1s2e3r4-i5d6-7890-a123-b4c5d6e7f8g9",
      "project_id": "p1r2o3j4-e5c6-7890-t123-i4d5e6f7g8h9",
      "publication_status": "published",
      "likes_count": 0,
      "comments_count": 0,
      "created_at": "2025-10-17T14:30:00Z",
      "updated_at": "2025-10-17T14:30:00Z"
    }
  },
  "metadata": {
    "item_type": "Idea",
    "item_id": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8",
    "action": "created",
    "user_id": "u1s2e3r4-i5d6-7890-a123-b4c5d6e7f8g9",
    "project_id": "p1r2o3j4-e5c6-7890-t123-i4d5e6f7g8h9",
    "tenant": {
      "id": "city-of-example",
      "name": "City of Example",
      "host": "example.govocal.com"
    }
  }
}
```

**HTTP Headers:**

```
Content-Type: application/json
X-GoVocal-Event: idea.created
X-GoVocal-Signature: sha256=5f8d9a7b6c4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a
X-GoVocal-Delivery-ID: d1e2l3i4-v5e6-7890-r123-y4i5d6e7f8g9
User-Agent: GoVocal-Webhooks/1.0
```

---

### C. Signature Verification (Client-Side)

For webhook consumers to verify signatures:

**Node.js Example:**

```javascript
const crypto = require("crypto");

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = "sha256=" + hmac.digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In Express.js handler
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-govocal-signature"];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send("Invalid signature");
  }

  // Process webhook
  console.log("Received event:", req.body.event_type);
  res.status(200).send("OK");
});
```

**Python Example:**

```python
import hmac
import hashlib
import base64

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected_signature = 'sha256=' + base64.b64encode(
        hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).digest()
    ).decode()

    return hmac.compare_digest(signature, expected_signature)

# In Flask handler
@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-GoVocal-Signature')
    payload = request.get_data()

    if not verify_webhook_signature(payload, signature, os.environ['WEBHOOK_SECRET']):
        return 'Invalid signature', 401

    data = request.json
    print(f"Received event: {data['event_type']}")
    return 'OK', 200
```

---

### D. n8n Integration Guide

#### Step 1: Create Webhook Subscription in Go Vocal

1. Navigate to **Settings → Integrations → Webhooks**
2. Click **Add Webhook**
3. Configure:
   - **Name:** "n8n Integration"
   - **URL:** `https://your-n8n.com/webhook/unique-id`
   - **Events:** Select events to subscribe to (e.g., `idea.created`, `comment.*`)
4. Copy the **Secret Token**
5. Click **Save**

#### Step 2: Configure n8n Workflow

1. Create new workflow in n8n
2. Add **Webhook** trigger node
3. Configure:
   - **HTTP Method:** POST
   - **Path:** `unique-id` (matches URL from Step 1)
   - **Authentication:** Header Auth
   - **Header Name:** `X-GoVocal-Signature`
   - **Header Value:** Use Function node to verify (see below)
4. Add subsequent nodes for your automation

#### Step 3: Verify Signature (Optional but Recommended)

Add **Function** node after Webhook:

```javascript
const crypto = require("crypto");

const signature = $input.item.headers["x-govocal-signature"];
const payload = JSON.stringify($input.item.body);
const secret = "<YOUR_SECRET_TOKEN>";

const hmac = crypto.createHmac("sha256", secret);
hmac.update(payload);
const expectedSignature = "sha256=" + hmac.digest("base64");

if (signature !== expectedSignature) {
  throw new Error("Invalid signature");
}

return $input.item.body;
```

#### Step 4: Process Events

Add logic nodes based on event type:

```javascript
// Switch node based on event_type
const eventType = $json.event_type;

switch (eventType) {
  case "idea.created":
    return 0; // Route to "New Idea" path
  case "comment.created":
    return 1; // Route to "New Comment" path
  default:
    return 2; // Route to "Other" path
}
```

#### Example Workflow: Idea → Slack Notification

```
[Webhook Trigger]
    ↓
[Verify Signature]
    ↓
[Filter: idea.created]
    ↓
[Function: Format Message]
    ↓
[Slack: Send Message]
```

---

### E. Performance Considerations

#### Expected Load

Assuming:

- 100 active tenants
- 10 webhook subscriptions per tenant = 1,000 total subscriptions
- 1,000 events/day per tenant = 100,000 events/day total
- Average 3 matching subscriptions per event = 300,000 webhook deliveries/day

**Calculations:**

- 300,000 deliveries / day
- 12,500 deliveries / hour
- 208 deliveries / minute
- **3.5 deliveries / second**

#### Resource Requirements

**Que Workers:**

- At 3.5 jobs/second with 10-second timeout: Need ~35 concurrent workers
- Recommendation: Start with 50 workers, scale if needed

**Database:**

- `webhook_deliveries` table growth: ~9M records/month
- Implement retention policy (e.g., delete deliveries > 30 days)
- Partition by `created_at` for performance

**HTTP Client:**

- Use connection pooling (HTTP gem supports this)
- Set reasonable timeout (10s default)
- Implement circuit breaker if subscriber is consistently slow

#### Scaling Strategies

1. **Horizontal Scaling:** Add more Que worker processes
2. **Queue Partitioning:** Separate queue for webhooks (`:webhooks` queue)
3. **Rate Limiting:** Limit deliveries per subscription (e.g., 100/minute)
4. **Batching:** Batch multiple events into single delivery (advanced)

---

### F. Monitoring & Alerting

#### Key Metrics

1. **Delivery Success Rate:** `successful_deliveries / total_deliveries`
2. **Average Delivery Time:** Time from event to successful delivery
3. **Queue Depth:** Number of pending webhook jobs
4. **Failed Deliveries:** Count of permanently failed deliveries
5. **Retry Rate:** Percentage of deliveries requiring retries

#### Recommended Alerts

```yaml
# Prometheus/Grafana alerts
- name: WebhookDeliveryFailureRate
  expr: (webhook_delivery_failures / webhook_delivery_total) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High webhook delivery failure rate (>10%)"

- name: WebhookQueueBacklog
  expr: webhook_queue_depth > 10000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Large webhook delivery backlog"

- name: WebhookDeliveryLatency
  expr: webhook_delivery_p95_seconds > 30
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Slow webhook deliveries (p95 > 30s)"
```

#### Dashboard Widgets

1. Deliveries over time (line chart)
2. Success vs. failure rate (pie chart)
3. Top failing subscriptions (table)
4. Average delivery latency (gauge)
5. Queue depth (area chart)

---

### G. Security Best Practices

#### For Go Vocal (Provider)

1. **Always use HTTPS** for webhook URLs (enforce in validation)
2. **Generate strong secrets** (32+ bytes, cryptographically random)
3. **Rotate secrets regularly** (provide UI for regeneration)
4. **Rate limit** delivery attempts to prevent abuse
5. **Validate URLs** (no localhost, no internal IPs)
6. **Timeout requests** (prevent hanging on slow subscribers)
7. **Log all deliveries** (audit trail for security incidents)

#### For Webhook Consumers (Users)

1. **Always verify signatures** before processing
2. **Use constant-time comparison** for signature verification
3. **Keep secrets secure** (environment variables, not in code)
4. **Implement idempotency** (same event delivered multiple times)
5. **Validate payload schema** before processing
6. **Use HTTPS endpoints** only
7. **Implement rate limiting** on webhook endpoints

---

### H. Migration from RabbitMQ (If Needed)

If you start with RabbitMQ direct access and want to migrate users to webhooks:

#### Migration Plan

1. **Phase 1:** Introduce webhooks alongside RabbitMQ
2. **Phase 2:** Document webhooks as "recommended" approach
3. **Phase 3:** Email users on RabbitMQ to migrate
4. **Phase 4:** Deprecate RabbitMQ direct access (6-month notice)
5. **Phase 5:** Remove RabbitMQ external access

#### Communication Template

```
Subject: [Action Required] Migrate to Webhooks by [DATE]

Hi there,

We're improving our integration capabilities! We're introducing a new webhook system that's more secure and easier to use than direct RabbitMQ access.

What's changing:
- NEW: Webhook subscriptions (recommended)
- DEPRECATING: Direct RabbitMQ access (by [DATE])

Migration guide: [link]

Questions? Contact support@govocal.com
```

---

### I. Future Enhancements

Potential features to add later:

1. **Webhook Retry Configuration** - Custom retry attempts/delays per subscription
2. **Event Filtering** - Filter events by project, user, or custom criteria
3. **Payload Customization** - Choose which fields to include
4. **Batching** - Bundle multiple events into single delivery
5. **Delivery Scheduling** - Deliver at specific times (e.g., daily digest)
6. **Webhook Templates** - Pre-configured webhooks for common integrations
7. **Visual Workflow Builder** - No-code automation builder (like Zapier)
8. **Marketplace** - Community-shared n8n workflows
9. **Webhook Replay** - Re-deliver past events
10. **GraphQL Webhooks** - Deliver as GraphQL subscriptions

---

### J. References

#### Internal Documentation

- Activity System: `back/app/models/activity.rb`
- LogActivityJob: `back/app/jobs/log_activity_job.rb`
- RabbitMQ Publishing: `back/app/jobs/publish_activity_to_rabbit_job.rb`
- Typeform Webhooks: `back/engines/free/surveys/app/controllers/surveys/hooks/typeform_events_controller.rb`
- Mailgun Webhooks: `back/engines/free/email_campaigns/app/controllers/email_campaigns/hooks/mailgun_events_controller.rb`

#### External Resources

- n8n Webhook Documentation: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- n8n RabbitMQ Trigger: https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.rabbitmqtrigger/
- Webhook Best Practices: https://zapier.com/engineering/webhook-design/
- HMAC Signature Verification: https://www.rfc-editor.org/rfc/rfc2104
- Transactional Outbox Pattern: https://microservices.io/patterns/data/transactional-outbox.html

---

**Document Version:** 1.0
**Last Updated:** 2025-10-17
**Next Review:** After implementation Phase 1
