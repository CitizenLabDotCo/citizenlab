# Webhooks Engine

Webhook subscription and delivery system for Go Vocal, enabling integration with iPaaS platforms like n8n, Zapier, and Make.com.

## Features

- **Event-driven webhooks**: Deliver real-time notifications when events occur
- **Multi-tenant support**: Tenant-scoped subscriptions with Apartment
- **Security**: HMAC-SHA256 signature verification, SSRF protection, HTTPS enforcement
- **Reliability**: At-least-once delivery with exponential backoff retries
- **Observability**: Comprehensive delivery tracking and logging

## Supported Events (Phase 1)

- `idea.created` - New idea submitted
- `idea.published` - Idea published from draft
- `idea.changed` - Idea updated
- `user.created` - New user registered

## Architecture

This engine integrates with Go Vocal's existing Activity system:

```
User Action → SideFxService → LogActivityJob → Activity
                                      ↓
                               Webhooks::EnqueueService
                                      ↓
                               Webhooks::DeliveryJob
                                      ↓
                               HTTP POST to subscriber URL
```

## Security

- **SSRF Protection**: Blocks private IP ranges, localhost, cloud metadata endpoints
- **Signature Verification**: HMAC-SHA256 signatures for authenticity
- **HTTPS Enforcement**: Production webhooks require HTTPS
- **Tenant Isolation**: Database-level tenant scoping via Apartment

## Database Tables

- `webhooks_subscriptions`: Webhook subscription configuration
- `webhooks_deliveries`: Delivery attempts and results

## API Endpoints

```
GET    /web_api/v1/webhook_subscriptions
POST   /web_api/v1/webhook_subscriptions
GET    /web_api/v1/webhook_subscriptions/:id
PATCH  /web_api/v1/webhook_subscriptions/:id
DELETE /web_api/v1/webhook_subscriptions/:id
POST   /web_api/v1/webhook_subscriptions/:id/test
POST   /web_api/v1/webhook_subscriptions/:id/regenerate_secret
```

## Configuration

No additional configuration required. The engine uses:
- Que for background job processing (`:default` queue)
- HTTP gem for webhook delivery
- Apartment for multi-tenancy

## Development

Run tests:
```bash
docker compose run --rm web bin/rspec engines/commercial/webhooks
```

## Documentation

See `doc/TAN-5687-webhooks/implementation-plan.md` for full implementation details.
