# Claude Prompt Log - Webhook Implementation (TAN-5687)

This document logs all prompts used to create the webhook implementation documentation for Go Vocal's iPaaS integration.

**Date:** 2025-10-22
**Jira Ticket:** TAN-5687
**Output Files:** `webhook-analysis.md`, `webhook-challenges.md`, `n8n-blocks-research.md`, `implementation-plan.md`

---

## Prompt 1: Initial Architectural Exploration

```
I want to build support for an iPaaS with the Go Vocal platform. I'm thinking
mostly of using n8n.

I'm considering two main architectures:

1. **Webhooks**: Build a webhook subscription system where n8n can subscribe to
   events (e.g., idea.created, comment.posted). When events occur, we POST the
   event data to the subscriber's webhook URL.

2. **RabbitMQ**: Expose our existing RabbitMQ exchange and let n8n consume
   events directly using the RabbitMQ Trigger node.

Think ultrahard, and compare these approaches. Also come up with other
suggestions. Explore the codebase to understand the current mechanism (e.g.
understand how notification and the email engine work, as they build on some
kind of hand rolled pub/sub (start from CreateActivityJob and follow the trail).
Also research the out-of-the-box approaches tham might exist with RabbitMQ.
Think about effort, think about security, think about performance, think about
maintainability.
```

**Output:** Comprehensive architectural exploration, codebase analysis of Activity system, comparison of 5 architectural options.

---

## Prompt 2: Create Analysis Document

```
Write out your detailed architectural analysis and plan to doc/webhook-analysis.md
```

**Output:** Created `doc/webhook-analysis.md` with:

- Current architecture documentation
- 5 architectural options compared
- Recommendation for Rails-native webhooks (Option 1)
- Detailed implementation plan
- Complete code examples
- Scoring matrix (Option 1: 19/20)

---

## Prompt 3: Research Webhook Implementation Challenges

```
Research on the web (prioritize hacker news, reddit or individual blog content)
about the common pitfalls and challengees when implementing webhooks (from the
provider side as we are here).

Write your findings in doc/webhook-challenges.md
```

**Output:** Created `doc/webhook-challenges.md` with research on:

- Reliability & retry logic (Slack retry storm incident)
- SSRF vulnerabilities (Gitea attack, DNS rebinding)
- Ordering & delivery guarantees
- Performance & scaling issues
- Database growth (365M rows/year projection)
- 6 real-world incidents with lessons learned
- Sources: Hookdeck (100B+ webhooks), WorkOS, Convoy, HackerNews threads

---

## Prompt 4: Research n8n Custom Nodes

```
Research how to implement n8n nodes to (a) consume the webhooks and (b) perform
actions on the public_api

Some things to focus on in particular:
- Are the declarative n8n blocks able to deal with the authentication mechanism
  currently employed in our public_api? (jwt token with expiration).
- What are the limitations of a custom block. Is it hard to install in n8n? Can
  it work in n8n cloud, or only self hosted?
- What is the alternative if we don't build custom blocks. How can we make it
  easier in n8n to consume our webhooks and call our APIs for users?

Write your findings in doc/n8n-blocks-research.md
```

**Output:** Created `doc/n8n-blocks-research.md` with findings:

- JWT auto-refresh is a **known bug** in n8n (not supported)
- Custom nodes NOT available on n8n Cloud without 2-8 week verification
- Recommendation: Generic approach (Webhook + HTTP Request nodes)
- Cost-benefit analysis: 60-95 hours vs 20-35 hours
- OpenAPI generation as middle ground option

---

## Prompt 5: File Organization

```
I moved all the .md files to @doc/TAN-5687-webhooks/ , the documents are
otherwise unchanged. I also deleted the older webhooks-plan.md file, as the
@doc/TAN-5687-webhooks/webhook-analysis.md is better and more complete. Make a
few changes to the webhooks-analysis.md document and turn it into a plan document
instead.

- Since Appartment makes model tenant-specific by default, remove any tenant_id
  attributes you're suggesting
- Don't support all existing event types, instead make the code explicitly
  specificy which events to support through webhhooks. The initial implementation
  should support some idea and user events only
- Next to filtering webhook delivery by event type, also make it possible to
  (optionally) filter by project. This should make use of the project_id
  attribute of the activity for matching. In case the activity has no project,
  it should always be sent
- Remove option all implementation options except for the recommended option (1),
  it's the option we're going for
```

**Output:** Updated `webhook-analysis.md`:

- Changed title to "Implementation Plan"
- Removed tenant_id (Apartment handles multi-tenancy)
- Added SUPPORTED_EVENTS constant (Phase 1: idea.created, idea.published, idea.changed, user.created)
- Added project_id filtering with matches_project? logic
- Removed architectural Options 2-5 and comparative analysis
- Reduced from ~1,700 lines to 1,219 lines

---

## Prompt 6: Incorporate Research Findings

```
Now, incorporate the webhook-challenges.md document into the plan and update the
plan document.

Some extra pointers:
- Don't implement anything specific about infrastructure, we already have
  auto-scaling Que in production, and will handle all firewall/monitoring/...
  needs separately.
- Don't do partitioning of the deliveries table, but do implement a job to do
  clean up older than 30 days. Also implement a rake task that calls the job,
  which we can manually add to the production cron
- Don't implement the front-end for now, we'll make a dedicated plan for the
  front-end later
- Make sure to implement proper timeouts in doing the HTTP call, but also make
  sure it's only local to this HTTP call, and not affecting anything else
- Don't do connection pooling, because I think it adds no real value since each
  background job is alread doing a single http call. If I get that wrong, add it
  to the doc and explain why
- Don't add any instrumentation or monitoring code. I will do so later myself
- Make sure SSRF is covered, but allow calls to localhost if `Rails.env.development?`
- Add proper test coverage
- Don't add load tests
- Implement everything about webhooks in a separate `commercial/webhooks` engine
- Go for the implementation where ordering is not guaranteed
- Since most tenants will not have any webhook defined, add a small optimization
  where LogActivityJob does not enqueue a background job for webhooks in case no
  webhook listeners are defined
- Don't try to implement request-id tracking, we will look at it later
```

**Output:** Created `implementation-plan.md` with:

- All research insights incorporated (SSRF, retry storms, DNS rebinding)
- Comprehensive SSRF protection with URL/IP validation
- Cleanup job + rake task (no partitioning)
- Hardcoded timeouts (connect: 5s, read: 10s, write: 10s)
- Explanation of why NO connection pooling
- No front-end implementation
- No monitoring/instrumentation code
- Localhost allowed in development only
- Extensive test strategy (no load tests)
- Engine location: `engines/commercial/webhooks/`
- Explicit "no ordering guarantees" documentation
- Optimization: `any_enabled?` cache check
- Timeline: 5-6.5 days

---

## Prompt 7: Final Refinements

```
Make a few more changes:

- Dont' add `max_retries` and `timeout_seconds` to the subscriptions table, but
  hard code the values
- Change the table names to match the <module_name>_<class_name> pattern (e.g.
  `webhooks_delivery` instead of `webhook_delivery`)
- Don't include tenant info in the webhook payload, only the tenant_id
- Don't queue on other queues than the :default queue
- Rename the SideFxWebhookService, as it's breaking the pattern in the codebase
  where a side_fx service is expected to react to model CRUD operations, which
  in this case it is not. Rather call it WebhookEnqueueService
```

**Output:** Updated `implementation-plan.md`:

- **Hardcoded constants:** MAX_RETRIES=3, CONNECT_TIMEOUT=5, READ_TIMEOUT=10, WRITE_TIMEOUT=10
- **Removed columns:** max_retries, timeout_seconds from schema
- **Table names:** `webhooks_subscriptions`, `webhooks_deliveries` (module_singular pattern)
- **Foreign key:** `webhooks_subscription_id`
- **Payload simplified:** `metadata.tenant_id` instead of full tenant object
- **Queue:** All jobs use `queue_as :default`
- **Service renamed:** `SideFxWebhookService` → `Webhooks::EnqueueService`
- **Method renamed:** `after_activity_created` → `call`
- **Rationale documented:** SideFx pattern is for model CRUD reactions

**Supporting file created:** `CHANGES.md` documenting all modifications

---

## Final Deliverables

1. **`webhook-analysis.md`** (1,219 lines)

   - Original architectural analysis
   - Converted to implementation plan
   - Focused on Rails-native approach

2. **`webhook-challenges.md`** (1,900 lines)

   - Real-world webhook pitfalls
   - SSRF vulnerabilities
   - Production incidents
   - Research from Hookdeck, WorkOS, Convoy, HackerNews

3. **`n8n-blocks-research.md`** (~800 lines)

   - Custom node feasibility analysis
   - JWT token refresh limitations
   - Cloud vs self-hosted constraints
   - Recommendation: Generic approach

4. **`implementation-plan.md`** (1,900+ lines)

   - Complete production-ready implementation plan
   - Phase 1 events: idea.created, idea.published, idea.changed, user.created
   - SSRF protection with DNS rebinding defense
   - Comprehensive test strategy
   - Timeline: 5-6.5 days
   - Engine: `engines/commercial/webhooks/`

5. **`CHANGES.md`**

   - Summary of all modifications
   - Verification checklist

6. **`claude-prompt-log.md`** (this file)
   - Complete prompt history
   - Context for future reference

---

## Key Design Decisions Made

### Security

- Multi-layered SSRF protection (URL validation + runtime checks)
- Localhost allowed in `Rails.env.development?` only
- HMAC-SHA256 signature verification
- HTTP redirects disabled (SSRF prevention)

### Performance

- Optimization: Cache check before enqueueing (`any_enabled?`)
- No connection pooling (explained: each job = single request to unique URL)
- Hardcoded timeouts (5s connect, 10s read, 10s write)

### Architecture

- Engine location: `engines/commercial/webhooks/`
- No ordering guarantees (explicitly documented)
- Table naming: `webhooks_subscriptions`, `webhooks_deliveries`
- Service naming: `Webhooks::EnqueueService` (not SideFx pattern)

### Scope Decisions

- ❌ No front-end (separate plan)
- ❌ No monitoring/instrumentation (added later)
- ❌ No request-id tracking (added later)
- ❌ No connection pooling (not beneficial for this use case)
- ❌ No partitioning (cleanup job instead)
- ❌ No load tests (handled separately if needed)
- ✅ Cleanup job + rake task (30-day retention)
- ✅ Comprehensive unit/integration tests

### Data Model

- Hardcoded retry/timeout values (not configurable per subscription)
- Phase 1 events only (4 event types)
- Optional project filtering
- Simplified payload (tenant_id only, not full object)

---

## Lessons from Research Applied

1. **Retry Storms** (Slack incident): Exponential backoff with jitter
2. **SSRF Attacks** (Gitea incident): Multi-layered defense, DNS rebinding protection
3. **Ordering Issues**: Explicitly documented as not guaranteed
4. **Database Growth**: 30-day cleanup job (prevents 365M rows/year)
5. **Security Errors**: Don't retry, permanent failure
6. **Response Truncation**: 10KB limit on response_body
7. **Subscription Health**: Warn after 10 consecutive failures

---

## Total Effort Estimate

**Documentation Phase:** ~4-6 hours of research and writing
**Implementation Phase:** 5-6.5 days (based on plan)

**Research Sources:**

- Hookdeck blog (100B+ webhooks processed)
- WorkOS engineering blog
- Convoy documentation
- HackerNews threads (10+)
- n8n documentation
- GitHub issues (n8n JWT bug, Gitea SSRF)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-22
**Next Steps:** Begin Phase 1 implementation following `implementation-plan.md`
