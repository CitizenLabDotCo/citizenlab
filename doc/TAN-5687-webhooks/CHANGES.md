# Changes Made to Implementation Plan

## Summary of Updates (2025-10-22)

The following changes were made to the implementation plan based on your requirements:

### 1. Table Names

**Changed:** Table names now follow the `<module_name>_<singular>` pattern

- `webhook_subscriptions` → `webhooks_subscriptions`
- `webhook_deliveries` → `webhooks_deliveries`
- Updated foreign key: `webhook_subscription_id` → `webhooks_subscription_id`
- Updated model `table_name` declarations to match

### 2. Hardcoded Constants (Removed Database Columns)

**Removed columns from `webhooks_subscriptions` table:**

- `max_retries` (now hardcoded as `MAX_RETRIES = 3` in DeliveryJob)
- `timeout_seconds` (now hardcoded as `READ_TIMEOUT = 10` in DeliveryJob)

**Hardcoded values in `Webhooks::DeliveryJob`:**

```ruby
MAX_RETRIES = 3
CONNECT_TIMEOUT = 5  # seconds
READ_TIMEOUT = 10    # seconds
WRITE_TIMEOUT = 10   # seconds
```

**Removed validations:**

- No longer validating `max_retries` or `timeout_seconds` in Subscription model

### 3. Webhook Payload Simplified

**Changed:** `metadata.tenant` → `metadata.tenant_id`

**Before:**

```json
"metadata": {
  "tenant": {
    "id": "tenant-id",
    "name": "City of Example",
    "host": "example.govocal.com"
  }
}
```

**After:**

```json
"metadata": {
  "tenant_id": "tenant-id"
}
```

**Updated:**

- `Webhooks::PayloadService` - removed `tenant_info` method, now just includes `Tenant.current.id`
- Payload example in Appendix B
- Test expectations for PayloadService

### 4. Queue Configuration

**Changed:** All jobs use the `:default` queue

**Before:**

```ruby
queue_as :webhooks
```

**After:**

```ruby
queue_as :default
```

### 5. Service Naming

**Renamed:** `SideFxWebhookService` → `Webhooks::EnqueueService`

**Rationale:** The naming pattern `SideFx*Service` is reserved for services that react to model CRUD operations (via callbacks or similar). This service is actually enqueueing webhook deliveries based on activities, not reacting to a specific model's lifecycle.

**Changes:**

- File location: `app/services/side_fx_webhook_service.rb` → `engines/commercial/webhooks/app/services/webhooks/enqueue_service.rb`
- Class name: `SideFxWebhookService` → `Webhooks::EnqueueService`
- Method name: `after_activity_created(activity)` → `call(activity)`
- Updated `LogActivityJob` to use `Webhooks::EnqueueService.new.call(activity)`
- Updated task list to reference `Webhooks::EnqueueService`

### 6. Controller Parameter Updates

**Removed from permitted params:**

- `max_retries`
- `timeout_seconds`

**Updated `subscription_params`:**

```ruby
params.require(:subscription).permit(
  :name, :url, :enabled, :project_id,
  events: []
)
```

### 7. Test Updates

**Updated tests to reflect changes:**

- Removed test for `timeout_seconds` configuration
- Added test for hardcoded timeout settings
- Updated PayloadService test to expect `tenant_id` instead of `tenant` object
- All foreign key references updated to use `webhooks_subscription_id`

## Files Affected in Implementation Plan

1. Database schema (migrations)
2. `Webhooks::Subscription` model
3. `Webhooks::Delivery` model
4. `Webhooks::PayloadService`
5. `Webhooks::DeliveryJob`
6. `Webhooks::EnqueueService` (renamed)
7. `LogActivityJob` integration
8. Controller (subscription_params)
9. All test examples
10. Appendix (payload example)

## No Changes Made To

- SSRF protection logic (remains unchanged)
- Signature verification (remains unchanged)
- Retry logic behavior (still 3 attempts with exponential backoff)
- Cleanup job (remains unchanged)
- API endpoints structure (remains unchanged)
- Documentation approach (remains unchanged)

## Verification Checklist

- [x] All table names follow `webhooks_<singular>` pattern
- [x] No `max_retries` or `timeout_seconds` columns in schema
- [x] All timeout values hardcoded in DeliveryJob
- [x] Payload only includes `tenant_id` in metadata
- [x] All jobs queue to `:default`
- [x] Service renamed to `Webhooks::EnqueueService`
- [x] All tests updated to match changes
- [x] Controller params don't include removed columns
- [x] Model validations don't reference removed columns
