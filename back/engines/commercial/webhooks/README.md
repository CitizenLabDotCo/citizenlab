# Webhooks Engine

Webhook subscription and delivery system.

## Features

- **Event-driven webhooks**: Deliver real-time notifications when events occur
- **Multi-tenant support**: Tenant-scoped subscriptions with Apartment
- **Security**: HMAC-SHA256 signature verification, SSRF protection, HTTPS enforcement
- **Reliability**: At-least-once delivery with exponential backoff retries
- **Observability**: Comprehensive delivery tracking and logging

## Supported Events

See the `Webhooks::Subscription` model

## Architecture

This engine integrates with Go Vocal's existing Activity system:

```
User Action → SideFxService → LogActivityJob → Activity
                                      ↓
                               Webhooks::EnqueueService
                                      ↓
                               Webhooks::DeliveryJob (perform later)
                                      ↓
                               HTTP POST to subscriber URL
```

## Security

- **SSRF Protection**: Blocks private IP ranges, localhost, cloud metadata endpoints
- **Signature Verification**: HMAC-SHA256 signatures for authenticity
- **HTTPS Enforcement**: Production webhooks require HTTPS
- **Tenant Isolation**: Database-level tenant scoping via Apartment

## Database Tables

The most important concepts are a webhook `Subscription` and a webhook `Delivery`.

A subscription is a rule the admin end-user defines in the back office, that specifies the URL to which a certain number of events need to be sent.

A delivery is one such event, in the scope of a single subscription. It's used to track the delivery status.

## Development

Run tests:
```bash
docker compose run --rm web bin/rspec engines/commercial/webhooks
```
## Documentation

The end user documentation is part of our developers platform at https://developers.govocal.com, defined [here](https://github.com/CitizenLabDotCo/documentation/blob/master/docs/guides/reference-webhooks.md).
