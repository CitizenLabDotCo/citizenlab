# iPaaS Integration via Webhooks - Implementation Plan

**Date:** 2025-10-22
**Status:** Implementation Plan
**Jira:** TAN-5687
**Engine:** `engines/commercial/webhooks/`

## Executive Summary

This document outlines the implementation plan for integrating Go Vocal with iPaaS platforms (primarily n8n) through a Rails-native webhook subscription and delivery system.

**Approach:** Leverage the existing Activity-driven event architecture to deliver webhooks for selected event types (ideas and users initially) with optional project-based filtering.

**Key Design Decisions:**

1. **No Ordering Guarantees:** Following industry standards (Stripe, GitHub), we explicitly do not guarantee event ordering. Consumers must handle out-of-order events using timestamps.
2. **Engine Location:** All code lives in `engines/commercial/webhooks/` (commercial feature)
3. **Performance Optimization:** LogActivityJob checks for subscriptions before enqueueing, avoiding overhead for tenants without webhooks
4. **SSRF Protection:** Comprehensive protection through URL/IP validation, with localhost allowed in development only
5. **No Front-End (Phase 1):** API-only implementation, front-end to be planned separately

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Requirements](#requirements)
3. [Solution Architecture](#solution-architecture)
4. [Security Considerations](#security-considerations)
5. [Implementation Plan](#implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Appendix](#appendix)

---

## Current Architecture

### Event-Driven Foundation

Go Vocal has a sophisticated event-driven architecture centered around the **Activity** system:

```
User Action → SideFxService → LogActivityJob → Activity Record
                                      ↓
                    ┌─────────────────┼─────────────────┐
                    ↓                 ↓                 ↓
           Notifications    Email Campaigns    RabbitMQ Publishing
```

**Key Components:**

| Component                      | File                                              | Purpose                                   |
| ------------------------------ | ------------------------------------------------- | ----------------------------------------- |
| **Activity**                   | `back/app/models/activity.rb`                     | Universal event log for all domain events |
| **LogActivityJob**             | `back/app/jobs/log_activity_job.rb`               | Orchestrates event reactions              |
| **PublishActivityToRabbitJob** | `back/app/jobs/publish_activity_to_rabbit_job.rb` | Publishes events to RabbitMQ              |

---

## Requirements

### Functional Requirements

1. **Event Triggers:** Enable external systems (n8n, Zapier, Make.com) to receive real-time notifications when events occur
2. **Event Types:** Support selected event types:
   - **Phase 1:** `idea.created`, `idea.published`, `idea.changed`, `user.created`
   - **Future:** Additional event types added incrementally
3. **Event Filtering:**
   - Filter by event type (required)
   - Filter by project (optional) - only deliver events for specific projects
4. **Multi-tenancy:** Tenant-scoped subscriptions (using Apartment)
5. **Reliability:** At-least-once delivery with exponential backoff retries
6. **Security:** SSRF protection, signature verification, HTTPS enforcement, tenant isolation
7. **No Ordering Guarantees:** Events may arrive out of order (documented clearly)

### Non-Functional Requirements

1. **Performance:** Handle webhook delivery without impacting main application
2. **Scalability:** Support hundreds of webhook subscriptions per tenant
3. **Maintainability:** Follow existing code patterns, minimal new dependencies
4. **Developer Experience:** Simple setup for n8n users

---

## Solution Architecture

### Rails-Native Webhook Delivery System

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
trigger_webhooks(activity)  ← NEW (checks if subscriptions exist first)
    ↓
WebhookSubscription.where(events: includes activity.routing_key)
    ↓
WebhookDeliveryJob.perform_later (per subscription)
    ↓
HTTP POST to subscriber URL (with timeout, SSRF protection)
    ├→ Success: Log delivery
    └→ Failure: Retry with exponential backoff (1min → 5min → 30min)
```

#### Database Schema

```ruby
# engines/commercial/webhooks/db/migrate/create_webhooks_subscriptions.rb
create_table :webhooks_subscriptions, id: :uuid do |t|
  t.string :name, null: false
  t.string :url, null: false
  t.string :secret_token, null: false
  t.jsonb :events, default: [], null: false  # ['idea.created', 'idea.published']
  t.uuid :project_id  # Optional: filter to specific project
  t.boolean :enabled, default: true
  t.timestamps

  t.index :enabled
  t.index :project_id
end

# engines/commercial/webhooks/db/migrate/create_webhooks_deliveries.rb
create_table :webhooks_deliveries, id: :uuid do |t|
  t.uuid :webhooks_subscription_id, null: false, index: true
  t.uuid :activity_id, null: false, index: true
  t.string :event_type, null: false  # 'idea.created'
  t.string :status, null: false, default: 'pending'  # pending, success, failed
  t.integer :attempts, default: 0
  t.integer :response_code
  t.text :response_body  # Truncated to 10KB
  t.text :error_message
  t.datetime :last_attempt_at
  t.datetime :succeeded_at
  t.timestamps

  t.index [:webhooks_subscription_id, :status]
  t.index [:created_at]  # For cleanup job
  t.index [:status, :created_at]  # For cleanup job queries
end
```

**Note:** Retry logic and timeouts are hardcoded in the delivery job:

- **Max retries:** 3 attempts with exponential backoff (1min → 5min → 30min)
- **Connect timeout:** 5 seconds
- **Read timeout:** 10 seconds
- **Write timeout:** 10 seconds

---

## Security Considerations

### SSRF (Server-Side Request Forgery) Protection

**Critical Issue:** Webhooks are vulnerable to SSRF because consumers can specify arbitrary URLs that the server will call. Attackers can exploit this to access internal services, cloud metadata endpoints, or perform port scanning.

#### Attack Vectors

1. **Internal Service Access:**

   ```
   http://localhost:6379/          # Redis
   http://10.0.0.5:5432/           # PostgreSQL
   http://169.254.169.254/...      # AWS metadata (contains credentials!)
   ```

2. **DNS Rebinding (Time-of-Check, Time-of-Use):**

   - Validation: `evil.com` resolves to `1.2.3.4` (public IP) → passes
   - 0.1s later: `evil.com` resolves to `127.0.0.1` (localhost) → SSRF

3. **HTTP Redirect Exploitation:**
   - Webhook URL: `https://public-site.com/webhook`
   - Server responds: `302 Redirect → http://localhost:6379/`
   - If redirects are followed → SSRF

#### Defense Implementation

##### URL Validator

```ruby
# engines/commercial/webhooks/app/validators/webhook_url_validator.rb
class WebhookUrlValidator < ActiveModel::EachValidator
  # Block private IP ranges (RFC 1918, loopback, link-local, etc.)
  BLOCKED_IP_RANGES = [
    IPAddr.new('127.0.0.0/8'),      # Loopback
    IPAddr.new('::1/128'),          # IPv6 loopback
    IPAddr.new('10.0.0.0/8'),       # Private class A
    IPAddr.new('172.16.0.0/12'),    # Private class B
    IPAddr.new('192.168.0.0/16'),   # Private class C
    IPAddr.new('169.254.0.0/16'),   # Link-local (AWS metadata!)
    IPAddr.new('169.254.169.254/32'), # AWS/GCP/Azure metadata
    IPAddr.new('fd00::/8'),         # IPv6 private
    IPAddr.new('0.0.0.0/8'),        # Current network
    IPAddr.new('fe80::/10'),        # IPv6 link-local
  ].freeze

  def validate_each(record, attribute, value)
    return if value.blank?

    begin
      uri = URI.parse(value)
    rescue URI::InvalidURIError
      record.errors.add(attribute, 'is not a valid URL')
      return
    end

    # Require HTTPS (or HTTP in development)
    unless valid_scheme?(uri.scheme)
      record.errors.add(attribute, 'must use HTTPS')
      return
    end

    # Validate hostname exists
    if uri.host.blank?
      record.errors.add(attribute, 'must include a hostname')
      return
    end

    # Resolve DNS and check against blocklist
    begin
      addresses = Resolv.getaddresses(uri.host)

      if addresses.empty?
        record.errors.add(attribute, 'hostname does not resolve')
        return
      end

      addresses.each do |addr_string|
        ip = IPAddr.new(addr_string)

        # Allow localhost in development only
        if is_private_ip?(ip) && !allow_localhost?(uri.host)
          record.errors.add(attribute, 'cannot be an internal or private address')
          return
        end
      end
    rescue Resolv::ResolvError
      record.errors.add(attribute, 'hostname does not resolve')
    rescue ArgumentError => e
      record.errors.add(attribute, "invalid IP address: #{e.message}")
    end
  end

  private

  def valid_scheme?(scheme)
    return false if scheme.blank?

    if Rails.env.development?
      %w[http https].include?(scheme.downcase)
    else
      scheme.downcase == 'https'
    end
  end

  def is_private_ip?(ip)
    BLOCKED_IP_RANGES.any? { |range| range.include?(ip) }
  end

  def allow_localhost?(host)
    Rails.env.development? && ['localhost', '127.0.0.1', '::1'].include?(host)
  end
end
```

##### Runtime SSRF Protection

Even with URL validation, DNS can change between validation and delivery (DNS rebinding). We need to re-validate at delivery time:

```ruby
# engines/commercial/webhooks/app/services/webhooks/delivery_service.rb
module Webhooks
  class DeliveryService
    def deliver(delivery)
      subscription = delivery.webhook_subscription

      # Re-validate URL before delivery (DNS rebinding protection)
      unless valid_url?(subscription.url)
        raise SecurityError, "URL validation failed at delivery time (possible DNS rebinding)"
      end

      # Configure HTTP client with security settings
      http_client = HTTP
        .timeout(
          connect: 5,  # Connection timeout
          read: subscription.timeout_seconds,
          write: 10
        )
        .follow(max_hops: 0)  # Disable redirects (SSRF protection)
        .headers(headers(delivery))

      response = http_client.post(subscription.url, json: payload(delivery))

      handle_success(delivery, response)
    rescue HTTP::TimeoutError => e
      handle_failure(delivery, e, 'timeout')
      raise  # Re-raise for retry logic
    rescue HTTP::ConnectionError => e
      handle_failure(delivery, e, 'connection_refused')
      raise
    rescue SecurityError => e
      # Don't retry security errors
      handle_permanent_failure(delivery, e)
    end

    private

    def valid_url?(url)
      # Same validation logic as WebhookUrlValidator
      # Returns false if URL resolves to private IP
    end
  end
end
```

### Signature Verification

Generate HMAC-SHA256 signatures for webhook authenticity:

```ruby
def generate_signature(payload, secret)
  hmac = OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), secret, payload)
  "sha256=#{Base64.strict_encode64(hmac)}"
end
```

---

## Implementation Plan

### Phase 1: Core Infrastructure (3-4 days)

#### 1.1 Engine Setup (0.5 days)

- [ ] Create `engines/commercial/webhooks/` engine structure
- [ ] Add engine to Gemfile and routes
- [ ] Configure engine with:
  - Models directory
  - Jobs directory
  - Services directory
  - Validators directory
  - Migrations directory

#### 1.2 Database Migrations (0.5 days)

- [ ] Create `webhook_subscriptions` table migration
- [ ] Create `webhook_deliveries` table migration
- [ ] Add indexes for performance (enabled, project_id, created_at, status + created_at)
- [ ] Run migrations in development

#### 1.3 Models & Validations (1 day)

**WebhookSubscription Model:**

```ruby
# engines/commercial/webhooks/app/models/webhooks/subscription.rb
module Webhooks
  class Subscription < ApplicationRecord
    self.table_name = 'webhooks_subscriptions'

    belongs_to :project, optional: true, class_name: 'Project'
    has_many :deliveries,
             class_name: 'Webhooks::Delivery',
             foreign_key: :webhooks_subscription_id,
             dependent: :destroy

    # Supported event types (Phase 1)
    SUPPORTED_EVENTS = [
      'idea.created',
      'idea.published',
      'idea.changed',
      'user.created'
    ].freeze

    validates :name, presence: true
    validates :url, presence: true, webhook_url: true  # Custom validator
    validates :events, presence: true
    validates :secret_token, presence: true
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
      return true if project_id.nil?
      return true if activity_project_id.nil?
      project_id == activity_project_id
    end

    # Class method for optimization in LogActivityJob
    def self.any_enabled?
      Rails.cache.fetch('webhooks:any_enabled', expires_in: 1.minute) do
        enabled.exists?
      end
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
end
```

**WebhookDelivery Model:**

```ruby
# engines/commercial/webhooks/app/models/webhooks/delivery.rb
module Webhooks
  class Delivery < ApplicationRecord
    self.table_name = 'webhooks_deliveries'

    belongs_to :subscription,
               class_name: 'Webhooks::Subscription',
               foreign_key: :webhooks_subscription_id
    belongs_to :activity, class_name: 'Activity'

    STATUSES = %w[pending success failed].freeze

    validates :status, inclusion: { in: STATUSES }
    validates :event_type, presence: true

    scope :pending, -> { where(status: 'pending') }
    scope :succeeded, -> { where(status: 'success') }
    scope :failed, -> { where(status: 'failed') }
    scope :recent, -> { order(created_at: :desc) }
    scope :older_than, ->(date) { where('created_at < ?', date) }
  end
end
```

**Tasks:**

- [ ] Create `Webhooks::Subscription` model
- [ ] Create `Webhooks::Delivery` model
- [ ] Implement all scopes and methods
- [ ] Add unit tests for models

#### 1.4 Webhook Delivery System (1.5 days)

**Payload Service:**

```ruby
# engines/commercial/webhooks/app/services/webhooks/payload_service.rb
module Webhooks
  class PayloadService
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
          tenant_id: Tenant.current.id
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
      {}
    end
  end
end
```

**Delivery Job:**

```ruby
# engines/commercial/webhooks/app/jobs/webhooks/delivery_job.rb
module Webhooks
  class DeliveryJob < ApplicationJob
    queue_as :default

    # Hardcoded constants
    MAX_RETRIES = 3
    CONNECT_TIMEOUT = 5  # seconds
    READ_TIMEOUT = 10    # seconds
    WRITE_TIMEOUT = 10   # seconds

    # Exponential backoff: 1min, 5min, 30min
    retry_on StandardError,
             wait: :exponentially_longer,
             attempts: MAX_RETRIES do |job, exception|
      delivery_id = job.arguments.first
      delivery = Webhooks::Delivery.find(delivery_id)

      delivery.update!(
        status: 'failed',
        error_message: "#{exception.class}: #{exception.message}",
        last_attempt_at: Time.current
      )

      # Consider disabling subscription after many consecutive failures
      check_subscription_health(delivery.subscription)
    end

    def perform(delivery_id)
      delivery = Webhooks::Delivery.find(delivery_id)
      subscription = delivery.subscription

      return unless subscription.enabled?

      # Generate payload
      payload_json = Webhooks::PayloadService.new
                                              .generate(delivery.activity)
                                              .to_json

      # Generate HMAC signature
      signature = generate_signature(payload_json, subscription.secret_token)

      # Validate URL at delivery time (DNS rebinding protection)
      unless validate_url_safe(subscription.url)
        raise SecurityError, "URL validation failed at delivery time"
      end

      # Deliver webhook with proper timeout and no redirects
      response = HTTP
        .timeout(
          connect: CONNECT_TIMEOUT,
          read: READ_TIMEOUT,
          write: WRITE_TIMEOUT
        )
        .follow(max_hops: 0)  # Disable redirects (SSRF protection)
        .headers(
          'Content-Type' => 'application/json',
          'X-GoVocal-Event' => delivery.event_type,
          'X-GoVocal-Signature' => signature,
          'X-GoVocal-Delivery-ID' => delivery.id,
          'User-Agent' => 'GoVocal-Webhooks/1.0'
        )
        .post(subscription.url, body: payload_json)

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
      # Record attempt, will retry via ActiveJob
      delivery.update!(
        attempts: delivery.attempts + 1,
        error_message: "#{e.class}: #{e.message}",
        last_attempt_at: Time.current
      )
      raise  # Re-raise to trigger retry
    rescue SecurityError => e
      # Don't retry security errors
      delivery.update!(
        status: 'failed',
        attempts: delivery.attempts + 1,
        error_message: "Security error: #{e.message}",
        last_attempt_at: Time.current
      )
      # Don't re-raise - permanent failure
    end

    private

    def generate_signature(payload, secret)
      hmac = OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), secret, payload)
      "sha256=#{Base64.strict_encode64(hmac)}"
    end

    def validate_url_safe(url)
      # Same validation logic as WebhookUrlValidator
      validator = WebhookUrlValidator.new(attributes: [:url])
      record = OpenStruct.new(errors: ActiveModel::Errors.new(self), url: url)
      validator.validate_each(record, :url, url)
      record.errors.empty?
    end

    def check_subscription_health(subscription)
      # Check if last N deliveries all failed
      recent_failures = subscription.deliveries
                                   .order(created_at: :desc)
                                   .limit(10)
                                   .count { |d| d.status == 'failed' }

      if recent_failures >= 10
        # Consider disabling or alerting
        Rails.logger.warn("Webhook subscription #{subscription.id} has 10 consecutive failures")
      end
    end
  end
end
```

**Note on Connection Pooling:**

We are NOT implementing HTTP connection pooling for the following reasons:

1. Each Que background job makes a single HTTP request to a unique URL
2. Connection pooling requires persistent connections to the same host
3. Webhook endpoints are diverse (different hosts per tenant/subscription)
4. The overhead saved by pooling (~50-200ms TLS handshake) is negligible compared to network latency and the async nature of webhooks
5. Adds complexity without meaningful benefit at expected scale

If we were making multiple requests to the same endpoint repeatedly, pooling would be valuable, but that's not our use case.

**Tasks:**

- [ ] Implement `Webhooks::PayloadService`
- [ ] Implement `Webhooks::DeliveryJob` with retry logic
- [ ] Implement HMAC signature generation
- [ ] Add timeout handling (connect: 5s, read: configurable, write: 10s)
- [ ] Add SSRF protection in delivery job
- [ ] Disable HTTP redirects
- [ ] Add error handling and logging
- [ ] Add unit tests for services and jobs

#### 1.5 Integration with LogActivityJob (0.5 days)

**WebhookEnqueueService:**

```ruby
# engines/commercial/webhooks/app/services/webhooks/enqueue_service.rb
module Webhooks
  class EnqueueService
    def call(activity)
      event_type = routing_key(activity)

      # Only process supported event types
      return unless Webhooks::Subscription::SUPPORTED_EVENTS.include?(event_type)

      # Find matching subscriptions (event type + optional project filter)
      subscriptions = Webhooks::Subscription
        .enabled
        .for_event(event_type)
        .for_project(activity.project_id)

      # Create delivery records and enqueue jobs
      subscriptions.find_each do |subscription|
        next unless subscription.matches_event?(event_type)
        next unless subscription.matches_project?(activity.project_id)

        delivery = Webhooks::Delivery.create!(
          subscription: subscription,
          activity: activity,
          event_type: event_type,
          status: 'pending'
        )

        Webhooks::DeliveryJob.perform_later(delivery.id)
      end
    end

    private

    def routing_key(activity)
      "#{activity.item_type.underscore}.#{activity.action.underscore}"
    end
  end
end
```

**Update LogActivityJob:**

```ruby
# back/app/jobs/log_activity_job.rb
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
    # Optimization: Skip if no webhooks are enabled
    # This avoids overhead for tenants without webhooks configured
    return unless Webhooks::Subscription.any_enabled?

    Webhooks::EnqueueService.new.call(activity)
  end
end
```

**Tasks:**

- [ ] Create `Webhooks::EnqueueService`
- [ ] Add optimization check (`any_enabled?` with caching)
- [ ] Update `LogActivityJob` to call `trigger_webhooks`
- [ ] Add integration tests

#### 1.6 Database Cleanup (0.5 days)

**Cleanup Job:**

```ruby
# engines/commercial/webhooks/app/jobs/webhooks/cleanup_deliveries_job.rb
module Webhooks
  class CleanupDeliveriesJob < ApplicationJob
    queue_as :low_priority

    def perform
      # Delete successful deliveries older than 30 days
      deleted_success = Webhooks::Delivery.succeeded
                                          .older_than(30.days.ago)
                                          .delete_all

      # Delete failed deliveries older than 30 days
      deleted_failed = Webhooks::Delivery.failed
                                         .older_than(30.days.ago)
                                         .delete_all

      Rails.logger.info(
        "Cleaned up webhook deliveries: #{deleted_success} successful, #{deleted_failed} failed"
      )

      {
        deleted_successful: deleted_success,
        deleted_failed: deleted_failed,
        total_deleted: deleted_success + deleted_failed
      }
    end
  end
end
```

**Rake Task:**

```ruby
# engines/commercial/webhooks/lib/tasks/webhooks.rake
namespace :webhooks do
  desc 'Clean up webhook deliveries older than 30 days'
  task cleanup_deliveries: :environment do
    puts "Starting webhook deliveries cleanup..."
    result = Webhooks::CleanupDeliveriesJob.new.perform
    puts "Cleanup complete:"
    puts "  - Successful deliveries deleted: #{result[:deleted_successful]}"
    puts "  - Failed deliveries deleted: #{result[:deleted_failed]}"
    puts "  - Total deleted: #{result[:total_deleted]}"
  end
end
```

**Production Cron (Manual):**

Add to production cron manually:

```bash
# Run daily at 2am
0 2 * * * cd /app && bundle exec rake webhooks:cleanup_deliveries RAILS_ENV=production
```

**Tasks:**

- [ ] Implement `Webhooks::CleanupDeliveriesJob`
- [ ] Create rake task
- [ ] Add tests for cleanup logic
- [ ] Document cron setup in deployment docs

---

### Phase 2: API Endpoints (1-1.5 days)

#### 2.1 REST API

**Routes:**

```ruby
# engines/commercial/webhooks/config/routes.rb
Webhooks::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :webhook_subscriptions, except: [:edit, :new] do
        member do
          post :test
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
end
```

**Controller:**

```ruby
# engines/commercial/webhooks/app/controllers/web_api/v1/webhook_subscriptions_controller.rb
module Webhooks
  module WebApi
    module V1
      class WebhookSubscriptionsController < ::ApplicationController
        before_action :authenticate_admin

        def index
          @subscriptions = policy_scope(Webhooks::Subscription)
            .includes(:deliveries)
            .order(created_at: :desc)
            .page(params[:page])

          render json: serialize(@subscriptions)
        end

        def show
          @subscription = Webhooks::Subscription.find(params[:id])
          authorize @subscription
          render json: serialize(@subscription)
        end

        def create
          @subscription = Webhooks::Subscription.new(subscription_params)
          authorize @subscription

          if @subscription.save
            # Clear cache
            Rails.cache.delete('webhooks:any_enabled')
            render json: serialize(@subscription), status: :created
          else
            render json: { errors: @subscription.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          @subscription = Webhooks::Subscription.find(params[:id])
          authorize @subscription

          if @subscription.update(subscription_params)
            Rails.cache.delete('webhooks:any_enabled')
            render json: serialize(@subscription)
          else
            render json: { errors: @subscription.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          @subscription = Webhooks::Subscription.find(params[:id])
          authorize @subscription
          @subscription.destroy!
          Rails.cache.delete('webhooks:any_enabled')
          head :no_content
        end

        def test
          @subscription = Webhooks::Subscription.find(params[:id])
          authorize @subscription

          # Create test delivery
          delivery = Webhooks::Delivery.create!(
            subscription: @subscription,
            event_type: 'test.webhook',
            status: 'pending',
            activity: create_test_activity
          )

          # Deliver synchronously
          begin
            Webhooks::DeliveryJob.perform_now(delivery.id)
            render json: {
              success: true,
              delivery: serialize(delivery.reload)
            }
          rescue => e
            render json: {
              success: false,
              error: e.message,
              delivery: serialize(delivery.reload)
            }, status: :unprocessable_entity
          end
        end

        def regenerate_secret
          @subscription = Webhooks::Subscription.find(params[:id])
          authorize @subscription

          @subscription.update!(secret_token: SecureRandom.base64(32))
          render json: serialize(@subscription)
        end

        private

        def subscription_params
          params.require(:subscription).permit(
            :name, :url, :enabled, :project_id,
            events: []
          )
        end

        def create_test_activity
          # Create a minimal test activity (not saved to DB)
          Activity.new(
            item_type: 'Test',
            action: 'webhook',
            acted_at: Time.current,
            payload: { test: true, message: 'This is a test webhook' }
          )
        end
      end
    end
  end
end
```

**Pundit Policy:**

```ruby
# engines/commercial/webhooks/app/policies/webhooks/subscription_policy.rb
module Webhooks
  class SubscriptionPolicy < ApplicationPolicy
    class Scope < Scope
      def resolve
        scope.all  # Tenant-scoped via Apartment
      end
    end

    def index?
      user&.admin?
    end

    def show?
      user&.admin?
    end

    def create?
      user&.admin?
    end

    def update?
      user&.admin?
    end

    def destroy?
      user&.admin?
    end

    def test?
      user&.admin?
    end

    def regenerate_secret?
      user&.admin?
    end
  end
end
```

**Tasks:**

- [ ] Implement webhook subscription controller (CRUD)
- [ ] Implement webhook deliveries controller (read-only + retry)
- [ ] Add Pundit policies (admin-only)
- [ ] Add serializers for JSON responses
- [ ] Implement test webhook endpoint
- [ ] Implement regenerate secret endpoint
- [ ] Add controller tests

---

### Phase 3: Documentation (0.5-1 day)

#### 3.1 API Documentation

**Topics to Cover:**

- Webhook subscription API endpoints
- Event types reference (Phase 1 events)
- Webhook payload schema with examples
- Signature verification guide with code samples (Node.js, Python, Ruby)
- Retry policy explanation
- No ordering guarantees (explicit documentation)
- Error codes and troubleshooting

#### 3.2 n8n Integration Guide

**Topics to Cover:**

- Step-by-step setup guide with screenshots
- Webhook node configuration
- Signature verification in n8n (Function node)
- Example workflows (idea created → Slack notification)
- Testing webhooks locally (ngrok)
- Troubleshooting common issues

**Tasks:**

- [ ] Write API documentation (OpenAPI/Swagger spec optional)
- [ ] Write n8n integration guide
- [ ] Create example payloads for each event type
- [ ] Write signature verification examples (3 languages)
- [ ] Document "no ordering guarantees" clearly
- [ ] Create troubleshooting guide

---

## Testing Strategy

### Unit Tests

#### Model Tests

```ruby
# engines/commercial/webhooks/spec/models/webhooks/subscription_spec.rb
require 'rails_helper'

RSpec.describe Webhooks::Subscription, type: :model do
  describe 'validations' do
    it 'requires a name' do
      subscription = build(:webhook_subscription, name: nil)
      expect(subscription).not_to be_valid
      expect(subscription.errors[:name]).to be_present
    end

    it 'requires a valid URL' do
      subscription = build(:webhook_subscription, url: 'not-a-url')
      expect(subscription).not_to be_valid
    end

    it 'rejects localhost URLs in production' do
      allow(Rails.env).to receive(:development?).and_return(false)
      subscription = build(:webhook_subscription, url: 'http://localhost:3000')
      expect(subscription).not_to be_valid
      expect(subscription.errors[:url]).to include('cannot be an internal or private address')
    end

    it 'allows localhost URLs in development' do
      allow(Rails.env).to receive(:development?).and_return(true)
      subscription = build(:webhook_subscription, url: 'http://localhost:3000')
      expect(subscription).to be_valid
    end

    it 'rejects private IP addresses' do
      ['10.0.0.1', '192.168.1.1', '172.16.0.1'].each do |ip|
        subscription = build(:webhook_subscription, url: "http://#{ip}")
        expect(subscription).not_to be_valid
        expect(subscription.errors[:url]).to include('cannot be an internal or private address')
      end
    end

    it 'rejects cloud metadata endpoints' do
      subscription = build(:webhook_subscription, url: 'http://169.254.169.254/latest/meta-data')
      expect(subscription).not_to be_valid
    end

    it 'rejects IPv6 localhost' do
      subscription = build(:webhook_subscription, url: 'http://[::1]:3000')
      expect(subscription).not_to be_valid
    end

    it 'validates supported events' do
      subscription = build(:webhook_subscription, events: ['idea.created', 'invalid.event'])
      expect(subscription).not_to be_valid
      expect(subscription.errors[:events]).to include('contains unsupported event types: invalid.event')
    end
  end

  describe 'scopes' do
    it 'filters by event type' do
      sub1 = create(:webhook_subscription, events: ['idea.created'])
      sub2 = create(:webhook_subscription, events: ['user.created'])

      results = described_class.for_event('idea.created')
      expect(results).to include(sub1)
      expect(results).not_to include(sub2)
    end

    it 'filters by project' do
      project = create(:project)
      sub1 = create(:webhook_subscription, project: project)
      sub2 = create(:webhook_subscription, project: nil)
      sub3 = create(:webhook_subscription, project: create(:project))

      results = described_class.for_project(project.id)
      expect(results).to include(sub1, sub2)  # nil project_id matches all
      expect(results).not_to include(sub3)
    end
  end

  describe '#matches_project?' do
    it 'matches when subscription has no project filter' do
      subscription = create(:webhook_subscription, project: nil)
      expect(subscription.matches_project?('any-project-id')).to be true
    end

    it 'matches when activity has no project' do
      subscription = create(:webhook_subscription, project: create(:project))
      expect(subscription.matches_project?(nil)).to be true
    end

    it 'matches when projects match' do
      project = create(:project)
      subscription = create(:webhook_subscription, project: project)
      expect(subscription.matches_project?(project.id)).to be true
    end

    it 'does not match when projects differ' do
      subscription = create(:webhook_subscription, project: create(:project))
      expect(subscription.matches_project?('different-project-id')).to be false
    end
  end

  describe '.any_enabled?' do
    it 'returns true when enabled subscriptions exist' do
      create(:webhook_subscription, enabled: true)
      Rails.cache.clear
      expect(described_class.any_enabled?).to be true
    end

    it 'returns false when no enabled subscriptions exist' do
      create(:webhook_subscription, enabled: false)
      Rails.cache.clear
      expect(described_class.any_enabled?).to be false
    end

    it 'caches the result' do
      expect(described_class).to receive(:exists?).once.and_return(true)
      2.times { described_class.any_enabled? }
    end
  end
end
```

#### Job Tests

```ruby
# engines/commercial/webhooks/spec/jobs/webhooks/delivery_job_spec.rb
require 'rails_helper'

RSpec.describe Webhooks::DeliveryJob, type: :job do
  let(:subscription) { create(:webhook_subscription, url: 'https://webhook.example.com/receive') }
  let(:activity) { create(:activity, item_type: 'Idea', action: 'created') }
  let(:delivery) { create(:webhook_delivery, subscription: subscription, activity: activity) }

  describe '#perform' do
    it 'delivers webhook successfully' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 200, body: 'OK')

      described_class.perform_now(delivery.id)

      expect(delivery.reload.status).to eq('success')
      expect(delivery.response_code).to eq(200)
      expect(delivery.attempts).to eq(1)
      expect(delivery.succeeded_at).to be_present
    end

    it 'includes correct headers' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 200)

      described_class.perform_now(delivery.id)

      expect(WebMock).to have_requested(:post, 'https://webhook.example.com/receive')
        .with(headers: {
          'Content-Type' => 'application/json',
          'X-Govocal-Event' => 'idea.created',
          'X-Govocal-Signature' => /^sha256=.+/,
          'X-Govocal-Delivery-Id' => delivery.id,
          'User-Agent' => 'GoVocal-Webhooks/1.0'
        })
    end

    it 'generates valid HMAC signature' do
      request_body = nil
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 200) do |request|
        request_body = request.body
      end

      described_class.perform_now(delivery.id)

      signature = WebMock.requests.first.headers['X-Govocal-Signature']
      expected_hmac = OpenSSL::HMAC.digest(
        OpenSSL::Digest.new('sha256'),
        subscription.secret_token,
        request_body
      )
      expected_signature = "sha256=#{Base64.strict_encode64(expected_hmac)}"

      expect(signature).to eq(expected_signature)
    end

    it 'handles timeout errors' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_timeout

      expect {
        described_class.perform_now(delivery.id)
      }.to raise_error(HTTP::TimeoutError)

      expect(delivery.reload.status).to eq('pending')  # Will retry
      expect(delivery.attempts).to eq(1)
      expect(delivery.error_message).to include('TimeoutError')
    end

    it 'handles connection errors' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_raise(HTTP::ConnectionError.new('Connection refused'))

      expect {
        described_class.perform_now(delivery.id)
      }.to raise_error(HTTP::ConnectionError)

      expect(delivery.reload.attempts).to eq(1)
      expect(delivery.error_message).to include('Connection refused')
    end

    it 'does not retry security errors' do
      allow_any_instance_of(described_class)
        .to receive(:validate_url_safe)
        .and_return(false)

      described_class.perform_now(delivery.id)

      expect(delivery.reload.status).to eq('failed')
      expect(delivery.error_message).to include('Security error')
    end

    it 'uses hardcoded timeout settings' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 200)

      allow(HTTP).to receive(:timeout).with(
        connect: 5,
        read: 10,
        write: 10
      ).and_call_original

      described_class.perform_now(delivery.id)

      expect(HTTP).to have_received(:timeout).with(
        connect: 5,
        read: 10,
        write: 10
      )
    end

    it 'does not follow HTTP redirects' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 302, headers: { 'Location' => 'http://localhost:6379' })

      allow(HTTP).to receive(:follow).with(max_hops: 0).and_call_original

      described_class.perform_now(delivery.id)

      expect(HTTP).to have_received(:follow).with(max_hops: 0)
    end

    it 'truncates large response bodies' do
      large_body = 'x' * 50_000
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 200, body: large_body)

      described_class.perform_now(delivery.id)

      expect(delivery.reload.response_body.length).to eq(10_000)
    end

    it 'skips delivery if subscription is disabled' do
      subscription.update!(enabled: false)

      described_class.perform_now(delivery.id)

      expect(WebMock).not_to have_requested(:post, 'https://webhook.example.com/receive')
    end
  end

  describe 'retry logic' do
    it 'retries with exponential backoff' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 500)

      # Attempt 1
      expect { described_class.perform_now(delivery.id) }.to raise_error(StandardError)
      expect(delivery.reload.attempts).to eq(1)
      expect(delivery.status).to eq('pending')

      # After max retries, should be marked as failed
      allow(delivery).to receive(:attempts).and_return(3)
      described_class.perform_now(delivery.id) rescue nil
      # The retry handler should mark it as failed
    end

    it 'marks as failed after max retries' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 500)

      # Simulate 3 failed attempts
      3.times do
        begin
          described_class.perform_now(delivery.id)
        rescue => e
          # Manually update attempts as retry logic would
          delivery.update!(attempts: delivery.attempts + 1)
        end
      end

      # On the 3rd attempt, the retry handler should mark it as failed
      expect(delivery.reload.status).to eq('failed')
    end
  end
end
```

#### Service Tests

```ruby
# engines/commercial/webhooks/spec/services/webhooks/payload_service_spec.rb
require 'rails_helper'

RSpec.describe Webhooks::PayloadService do
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:idea) { create(:idea, author: user, project: project) }
  let(:activity) do
    create(:activity,
           item: idea,
           item_type: 'Idea',
           action: 'created',
           user: user,
           project: project,
           acted_at: Time.zone.parse('2025-10-22 10:30:00'))
  end

  describe '#generate' do
    it 'generates webhook payload with all required fields' do
      payload = described_class.new.generate(activity)

      expect(payload).to include(
        id: activity.id,
        event_type: 'idea.created',
        timestamp: '2025-10-22T10:30:00Z'
      )
      expect(payload[:data]).to be_present
      expect(payload[:metadata]).to be_present
    end

    it 'includes metadata' do
      payload = described_class.new.generate(activity)

      expect(payload[:metadata]).to include(
        item_type: 'Idea',
        item_id: idea.id,
        action: 'created',
        user_id: user.id,
        project_id: project.id,
        tenant_id: Tenant.current.id
      )
    end

    it 'serializes the item data' do
      payload = described_class.new.generate(activity)

      expect(payload[:data]).to include(:id, :type, :attributes)
    end

    it 'handles missing item gracefully' do
      activity.update_column(:item_id, nil)
      activity.item = nil

      payload = described_class.new.generate(activity)

      expect(payload[:data]).to eq({})
    end
  end
end
```

### Integration Tests

```ruby
# engines/commercial/webhooks/spec/integration/webhook_delivery_spec.rb
require 'rails_helper'

RSpec.describe 'Webhook delivery integration', type: :integration do
  let(:subscription) do
    create(:webhook_subscription,
           url: 'https://webhook.example.com/receive',
           events: ['idea.created'])
  end

  it 'delivers webhook when idea is created' do
    stub_request(:post, 'https://webhook.example.com/receive')
      .to_return(status: 200, body: 'OK')

    perform_enqueued_jobs do
      create(:idea)
    end

    expect(WebMock).to have_requested(:post, 'https://webhook.example.com/receive')
      .with { |req|
        body = JSON.parse(req.body)
        body['event_type'] == 'idea.created' &&
        req.headers['X-Govocal-Signature'].present?
      }

    delivery = Webhooks::Delivery.last
    expect(delivery.status).to eq('success')
    expect(delivery.response_code).to eq(200)
  end

  it 'filters by project' do
    project = create(:project)
    subscription.update!(project: project)

    other_project = create(:project)

    stub_request(:post, 'https://webhook.example.com/receive')
      .to_return(status: 200)

    perform_enqueued_jobs do
      create(:idea, project: project)  # Should trigger webhook
      create(:idea, project: other_project)  # Should NOT trigger
    end

    expect(WebMock).to have_requested(:post, 'https://webhook.example.com/receive').once
  end

  it 'does not deliver for unsupported event types' do
    subscription.update!(events: ['comment.created'])

    perform_enqueued_jobs do
      create(:idea)  # idea.created not in subscription events
    end

    expect(WebMock).not_to have_requested(:post, 'https://webhook.example.com/receive')
  end

  it 'skips webhook delivery when no subscriptions exist' do
    subscription.destroy!

    expect(Webhooks::DeliveryJob).not_to receive(:perform_later)

    create(:idea)
  end
end
```

### Controller Tests

```ruby
# engines/commercial/webhooks/spec/controllers/web_api/v1/webhook_subscriptions_controller_spec.rb
require 'rails_helper'

RSpec.describe Webhooks::WebApi::V1::WebhookSubscriptionsController, type: :controller do
  let(:admin) { create(:admin) }

  before { sign_in admin }

  describe 'POST #create' do
    let(:valid_params) do
      {
        subscription: {
          name: 'My Webhook',
          url: 'https://webhook.example.com/receive',
          events: ['idea.created', 'user.created']
        }
      }
    end

    it 'creates a webhook subscription' do
      expect {
        post :create, params: valid_params
      }.to change(Webhooks::Subscription, :count).by(1)

      expect(response).to have_http_status(:created)
      subscription = Webhooks::Subscription.last
      expect(subscription.name).to eq('My Webhook')
      expect(subscription.secret_token).to be_present
    end

    it 'rejects invalid URLs' do
      invalid_params = valid_params.deep_merge(subscription: { url: 'http://localhost:3000' })

      allow(Rails.env).to receive(:development?).and_return(false)

      expect {
        post :create, params: invalid_params
      }.not_to change(Webhooks::Subscription, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'rejects unsupported event types' do
      invalid_params = valid_params.deep_merge(subscription: { events: ['invalid.event'] })

      expect {
        post :create, params: invalid_params
      }.not_to change(Webhooks::Subscription, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'clears the cache' do
      expect(Rails.cache).to receive(:delete).with('webhooks:any_enabled')
      post :create, params: valid_params
    end
  end

  describe 'POST #test' do
    let(:subscription) { create(:webhook_subscription) }

    it 'sends a test webhook' do
      stub_request(:post, subscription.url).to_return(status: 200)

      post :test, params: { id: subscription.id }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['success']).to be true
      expect(WebMock).to have_requested(:post, subscription.url)
    end

    it 'returns error if delivery fails' do
      stub_request(:post, subscription.url).to_timeout

      post :test, params: { id: subscription.id }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['success']).to be false
    end
  end

  describe 'POST #regenerate_secret' do
    let(:subscription) { create(:webhook_subscription) }

    it 'generates a new secret token' do
      old_secret = subscription.secret_token

      post :regenerate_secret, params: { id: subscription.id }

      expect(response).to have_http_status(:ok)
      expect(subscription.reload.secret_token).not_to eq(old_secret)
    end
  end
end
```

### Validator Tests

```ruby
# engines/commercial/webhooks/spec/validators/webhook_url_validator_spec.rb
require 'rails_helper'

RSpec.describe WebhookUrlValidator do
  let(:subscription) { Webhooks::Subscription.new(name: 'Test', events: ['idea.created']) }

  describe 'SSRF protection' do
    it 'blocks localhost' do
      subscription.url = 'http://localhost:3000'
      allow(Rails.env).to receive(:development?).and_return(false)

      expect(subscription).not_to be_valid
      expect(subscription.errors[:url]).to include('cannot be an internal or private address')
    end

    it 'blocks IPv4 loopback (127.0.0.1)' do
      subscription.url = 'http://127.0.0.1:6379'
      expect(subscription).not_to be_valid
    end

    it 'blocks IPv6 loopback (::1)' do
      subscription.url = 'http://[::1]:6379'
      expect(subscription).not_to be_valid
    end

    it 'blocks private networks (10.0.0.0/8)' do
      subscription.url = 'http://10.0.0.1'
      expect(subscription).not_to be_valid
    end

    it 'blocks private networks (192.168.0.0/16)' do
      subscription.url = 'http://192.168.1.1'
      expect(subscription).not_to be_valid
    end

    it 'blocks private networks (172.16.0.0/12)' do
      subscription.url = 'http://172.16.0.1'
      expect(subscription).not_to be_valid
    end

    it 'blocks link-local (169.254.0.0/16)' do
      subscription.url = 'http://169.254.169.254/latest/meta-data'
      expect(subscription).not_to be_valid
    end

    it 'blocks IPv6 link-local (fe80::/10)' do
      subscription.url = 'http://[fe80::1]'
      expect(subscription).not_to be_valid
    end

    it 'allows localhost in development' do
      subscription.url = 'http://localhost:3000'
      allow(Rails.env).to receive(:development?).and_return(true)

      expect(subscription).to be_valid
    end

    it 'allows public IPs' do
      subscription.url = 'https://webhook.example.com'

      # Mock DNS resolution to public IP
      allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])  # example.com

      expect(subscription).to be_valid
    end

    it 'requires HTTPS in production' do
      subscription.url = 'http://webhook.example.com'
      allow(Rails.env).to receive(:development?).and_return(false)

      expect(subscription).not_to be_valid
      expect(subscription.errors[:url]).to include('must use HTTPS')
    end

    it 'allows HTTP in development' do
      subscription.url = 'http://webhook.example.com'
      allow(Rails.env).to receive(:development?).and_return(true)
      allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])

      expect(subscription).to be_valid
    end
  end
end
```

### Cleanup Job Tests

```ruby
# engines/commercial/webhooks/spec/jobs/webhooks/cleanup_deliveries_job_spec.rb
require 'rails_helper'

RSpec.describe Webhooks::CleanupDeliveriesJob, type: :job do
  describe '#perform' do
    let!(:old_success) { create(:webhook_delivery, status: 'success', created_at: 31.days.ago) }
    let!(:old_failed) { create(:webhook_delivery, status: 'failed', created_at: 31.days.ago) }
    let!(:recent_success) { create(:webhook_delivery, status: 'success', created_at: 1.day.ago) }
    let!(:recent_failed) { create(:webhook_delivery, status: 'failed', created_at: 1.day.ago) }

    it 'deletes deliveries older than 30 days' do
      result = described_class.new.perform

      expect(Webhooks::Delivery.exists?(old_success.id)).to be false
      expect(Webhooks::Delivery.exists?(old_failed.id)).to be false
      expect(Webhooks::Delivery.exists?(recent_success.id)).to be true
      expect(Webhooks::Delivery.exists?(recent_failed.id)).to be true

      expect(result[:deleted_successful]).to eq(1)
      expect(result[:deleted_failed]).to eq(1)
      expect(result[:total_deleted]).to eq(2)
    end

    it 'logs cleanup results' do
      expect(Rails.logger).to receive(:info).with(/Cleaned up webhook deliveries/)
      described_class.new.perform
    end
  end
end
```

**Testing Tasks:**

- [ ] Write unit tests for models (100% coverage)
- [ ] Write unit tests for jobs (100% coverage)
- [ ] Write unit tests for services (100% coverage)
- [ ] Write validator tests (SSRF protection)
- [ ] Write integration tests (full delivery flow)
- [ ] Write controller tests (all endpoints)
- [ ] Write cleanup job tests
- [ ] All tests must pass before merging

**Explicitly NOT Testing:**

- Load tests (handled separately if needed)
- Performance benchmarks (handled separately if needed)
- Manual QA testing (to be done separately)

---

## Timeline Summary

| Phase                  | Duration       | Dependencies |
| ---------------------- | -------------- | ------------ |
| Phase 1: Core          | 3-4 days       | None         |
| Phase 2: API           | 1-1.5 days     | Phase 1      |
| Phase 3: Documentation | 0.5-1 day      | Phase 1-2    |
| **Total**              | **5-6.5 days** |              |

**Note:** Front-end implementation (admin UI) is intentionally excluded and will be planned separately.

---

## Appendix

### A. Event Types Reference

Phase 1 supported event types:

#### Ideas

- `idea.created` - New idea submitted
- `idea.published` - Idea published (from draft)
- `idea.changed` - Idea updated (title, body, or other attributes)

#### Users

- `user.created` - New user registered

**Note:** Additional event types (comments, projects, votes, etc.) can be added in future phases as needed.

---

### B. Webhook Payload Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "Idea created",
  "event_type": "idea.created",
  "timestamp": "2025-10-22T14:30:00Z",
  "data": {
    "id": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8",
    "type": "idea",
    "attributes": {
      "title_multiloc": {
        "en": "New bike lanes on Main Street"
      },
      "body_multiloc": {
        "en": "We need protected bike lanes..."
      },
      "author_id": "user-uuid",
      "project_id": "project-uuid",
      "publication_status": "published",
      "likes_count": 0,
      "comments_count": 0,
      "created_at": "2025-10-22T14:30:00Z"
    }
  },
  "metadata": {
    "item_type": "Idea",
    "item_id": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8",
    "action": "created",
    "user_id": "user-uuid",
    "project_id": "project-uuid",
    "tenant_id": "tenant-id"
  }
}
```

**HTTP Headers:**

```
Content-Type: application/json
X-GoVocal-Event: idea.created
X-GoVocal-Signature: sha256=5f8d9a7b6c4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a
X-GoVocal-Delivery-ID: delivery-uuid
User-Agent: GoVocal-Webhooks/1.0
```

---

### C. Signature Verification (Consumer Side)

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

**Ruby Example:**

```ruby
require 'openssl'
require 'base64'

def verify_webhook_signature(payload, signature, secret)
  hmac = OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), secret, payload)
  expected_signature = "sha256=#{Base64.strict_encode64(hmac)}"

  Rack::Utils.secure_compare(signature, expected_signature)
end

# In Sinatra handler
post '/webhook' do
  signature = request.env['HTTP_X_GOVOCAL_SIGNATURE']
  payload = request.body.read

  unless verify_webhook_signature(payload, signature, ENV['WEBHOOK_SECRET'])
    halt 401, 'Invalid signature'
  end

  data = JSON.parse(payload)
  puts "Received event: #{data['event_type']}"
  'OK'
end
```

---

### D. Ordering and Idempotency

**Important: No Ordering Guarantees**

Following industry standards (Stripe, GitHub, etc.), we **do not guarantee** that webhooks will be delivered in the order events were created. This is due to:

1. Retries can cause events to be delivered out of order
2. Network latency varies
3. Parallel workers process events simultaneously

**Consumer Best Practices:**

1. **Use Timestamps:** Compare `timestamp` or `metadata.created_at` fields to determine which event is newer
2. **Implement Idempotency:** Handle duplicate deliveries gracefully (same event delivered multiple times due to retries)
3. **Query API for Current State:** When in doubt, fetch the current state from our API

**Example (handling out-of-order events):**

```javascript
// Consumer-side pattern
function handleUserUpdatedWebhook(payload) {
  const user = findUser(payload.data.id);

  // Ignore if webhook is stale
  if (user.updatedAt > payload.timestamp) {
    console.log("Ignoring stale webhook");
    return;
  }

  user.update(payload.data.attributes);
}
```

---

### E. Error Codes and Troubleshooting

| Response Code      | Meaning                    | Action                                |
| ------------------ | -------------------------- | ------------------------------------- |
| 200-299            | Success                    | No retry                              |
| 400-499            | Client error (permanent)   | No retry, check webhook configuration |
| 429                | Too many requests          | Longer backoff, then retry            |
| 500-599            | Server error (temporary)   | Retry with exponential backoff        |
| Timeout            | No response within timeout | Retry with exponential backoff        |
| Connection refused | Endpoint unreachable       | Retry, check firewall/URL             |

**Common Issues:**

1. **"Webhook not receiving events"**

   - Check webhook is enabled
   - Check event types match
   - Check project filter (if set)
   - Use "Test Webhook" button to verify connectivity

2. **"Invalid signature" errors**

   - Ensure using raw request body (not parsed JSON)
   - Check secret token is correct
   - Verify signature algorithm is HMAC-SHA256
   - Use timing-safe comparison

3. **"Connection timeout"**

   - Endpoint must respond within configured timeout (default 10s)
   - Check server performance
   - Check firewall rules

4. **"Cannot be an internal address" error**
   - Webhook URL resolves to private IP
   - Use public endpoint or ngrok in development

---

### F. Key Insights from Research

The implementation incorporates lessons learned from companies processing billions of webhooks:

1. **SSRF Protection:** Multi-layered defense (URL validation + runtime checks) based on real-world attacks (Gitea incident)
2. **Exponential Backoff:** Prevents retry storms that overwhelmed Slack's infrastructure
3. **No Ordering Guarantees:** Explicitly documented, following Stripe/GitHub patterns
4. **Database Retention:** Automatic cleanup prevents table bloat (365M rows/year without cleanup)
5. **Timeout Configuration:** 5s connect, 10s read based on 99th percentile analysis
6. **No Redirects:** Prevents SSRF via HTTP redirect attacks
7. **Performance Optimization:** Cache check avoids overhead for tenants without webhooks

**References:**

- Hookdeck: "Webhooks at Scale" (100B+ webhooks processed)
- Convoy: "Tackling SSRF in Webhooks"
- WorkOS: "Building Webhooks Guidelines"
- Real-world incidents: Slack retry storm, Gitea SSRF attack

---

**Document Version:** 2.0
**Last Updated:** 2025-10-22
**Next Review:** After Phase 1 implementation
