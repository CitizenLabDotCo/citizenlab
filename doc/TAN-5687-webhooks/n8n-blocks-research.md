# n8n Custom Nodes Research for Go Vocal Integration

**Date:** 2025-10-17
**Status:** Research & Analysis
**Purpose:** Evaluate building custom n8n nodes vs. alternatives for Go Vocal integration

---

## Executive Summary

This document analyzes the feasibility of building custom n8n nodes (blocks) for Go Vocal to enable:

1. **Trigger Node:** Receive webhooks from Go Vocal
2. **Action Node:** Perform operations via Go Vocal's public API

**Key Findings:**

- ✅ Custom nodes are technically feasible
- ⚠️ JWT authentication with expiration has known issues in n8n (no automatic refresh)
- ❌ Custom nodes **NOT available on n8n Cloud** unless verified (lengthy process)
- ✅ Alternatives exist that work better for most users (HTTP Request + Webhook nodes)
- ✅ OpenAPI generators can automate 80% of custom node development

**Recommendation:** Start with **generic approach** (Webhook + HTTP Request nodes) and provide excellent documentation. Consider custom nodes only if significant user demand materializes.

---

## Table of Contents

1. [Custom Node Development Overview](#custom-node-development-overview)
2. [Authentication Mechanisms](#authentication-mechanisms)
3. [Trigger Node Implementation](#trigger-node-implementation)
4. [Action Node Implementation](#action-node-implementation)
5. [Limitations & Constraints](#limitations--constraints)
6. [Installation & Distribution](#installation--distribution)
7. [Alternatives to Custom Nodes](#alternatives-to-custom-nodes)
8. [Recommendation](#recommendation)

---

## Custom Node Development Overview

### What Are n8n Nodes?

n8n nodes are npm packages that extend n8n's functionality. Each node package can contain:

- **Nodes** - Actions or triggers
- **Credentials** - Authentication configurations
- **Icons** - Visual branding

### Development Approaches

n8n supports two node building styles:

#### 1. Declarative Style (Recommended)

Low-code approach using JSON-like configuration:

```typescript
// Example declarative resource definition
const resource: INodeProperties = {
  displayName: "Resource",
  name: "resource",
  type: "options",
  options: [
    {
      name: "Idea",
      value: "idea",
    },
    {
      name: "Comment",
      value: "comment",
    },
  ],
  default: "idea",
};
```

**Pros:**

- Less code to maintain
- Built-in pagination, error handling
- Easier to understand

**Cons:**

- Less flexible
- May not support all edge cases

#### 2. Programmatic Style

Full TypeScript implementation with `execute()` method:

```typescript
export class GoVocal implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Go Vocal",
    name: "goVocal",
    group: ["transform"],
    version: 1,
    description: "Interact with Go Vocal API",
    defaults: {
      name: "Go Vocal",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "goVocalApi",
        required: true,
      },
    ],
    properties: [
      // ... node parameters
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter("resource", i) as string;
      const operation = this.getNodeParameter("operation", i) as string;

      // Make API calls
      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        "goVocalApi",
        {
          method: "GET",
          url: `https://api.govocal.com/api/${resource}`,
        }
      );

      returnData.push({ json: response });
    }

    return [returnData];
  }
}
```

**Pros:**

- Full control
- Can handle complex logic
- Better for edge cases

**Cons:**

- More code to write
- Must handle errors manually

### Starter Template

n8n provides official starter template:

```bash
npm create @n8n/node
# Scaffolds complete node package with:
# - Example nodes (basic + advanced)
# - Credential examples (OAuth2, API Key)
# - Build tooling (TypeScript, linter)
# - Testing setup
```

**Repository:** https://github.com/n8n-io/n8n-nodes-starter

**Structure:**

```
n8n-nodes-govocal/
├── nodes/
│   ├── GoVocal/
│   │   ├── GoVocal.node.ts          # Main node
│   │   └── govocal.svg              # Icon
│   └── GoVocalTrigger/
│       ├── GoVocalTrigger.node.ts   # Webhook trigger
│       └── govocal.svg
├── credentials/
│   └── GoVocalApi.credentials.ts    # Auth config
├── package.json
└── tsconfig.json
```

---

## Authentication Mechanisms

### Go Vocal's Current Authentication

Go Vocal's public API uses **JWT tokens** with the following characteristics:

- Bearer token authentication
- Tokens expire (typical: 1 hour, 24 hours, or custom)
- Requires token refresh mechanism
- Token obtained via `/auth/sign_in` endpoint

### n8n Authentication Support

n8n supports multiple authentication types:

| Type             | Supported | Notes                      |
| ---------------- | --------- | -------------------------- |
| **Basic Auth**   | ✅ Yes    | Username/password          |
| **OAuth2**       | ✅ Yes    | Multiple grant types       |
| **API Key**      | ✅ Yes    | Header or query param      |
| **JWT**          | ✅ Yes    | Can generate/verify tokens |
| **Bearer Token** | ✅ Yes    | Simple header auth         |

### The JWT Expiration Problem

**CRITICAL ISSUE:** n8n has **known bugs** with automatic token refresh.

From GitHub Issues and community forums:

> "OAuth2 credentials work initially, but after token expiration, the credential does not automatically request a new token. Instead, n8n continues to use the expired token, resulting in 403 errors."
>
> — Multiple GitHub issues (#17450, #13413) spanning 2022-2025

**Impact on Go Vocal:**

- Users would need to manually re-authenticate when tokens expire
- Workflows would fail silently after token expiration
- No automatic refresh mechanism available

### Workaround Options

#### Option 1: Manual Token Management (Current n8n Limitation)

Users must manually refresh tokens:

```typescript
// In credential test
async authenticate(
  credentials: ICredentialDataDecryptedObject,
): Promise<IAuthenticateGeneric> {
  return {
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  };
}
```

**Downside:** Token expires, user must update credential manually.

#### Option 2: Client Credentials Flow (If Go Vocal Supports)

If Go Vocal implements OAuth2 **Client Credentials** grant type:

```typescript
// credentials/GoVocalOAuth2Api.credentials.ts
export class GoVocalOAuth2Api implements ICredentialType {
  name = "goVocalOAuth2Api";
  extends = ["oAuth2Api"];
  displayName = "Go Vocal OAuth2 API";

  properties: INodeProperties[] = [
    {
      displayName: "Grant Type",
      name: "grantType",
      type: "hidden",
      default: "clientCredentials",
    },
    {
      displayName: "Access Token URL",
      name: "accessTokenUrl",
      type: "string",
      default: "https://{{tenant}}.govocal.com/oauth/token",
    },
    {
      displayName: "Client ID",
      name: "clientId",
      type: "string",
      default: "",
    },
    {
      displayName: "Client Secret",
      name: "clientSecret",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
    },
  ];
}
```

**Note:** This requires implementing OAuth2 Client Credentials in Go Vocal's backend.

#### Option 3: Long-Lived Tokens

Issue very long-lived tokens (e.g., 1 year):

```typescript
{
  displayName: 'API Token',
  name: 'apiToken',
  type: 'string',
  typeOptions: {
    password: true,
  },
  default: '',
  description: 'Long-lived API token from Go Vocal settings',
}
```

**Downside:** Security implications of long-lived tokens.

#### Option 4: Use HTTP Request Node Directly (Recommended)

Let users handle token refresh in their workflow:

```
[Schedule Trigger: Every 55 minutes]
   ↓
[HTTP Request: POST /auth/refresh_token]
   ↓
[Set: Store new token in variable]
   ↓
[HTTP Request: Use token for API calls]
```

**Pros:**

- Full control
- Works with any auth mechanism
- No dependency on n8n's buggy OAuth2

---

## Trigger Node Implementation

### Overview

Trigger nodes start workflows when events occur. For Go Vocal, we need a webhook trigger.

### Implementation Approaches

#### Approach 1: Generic Webhook Trigger (Simplest)

Users configure n8n's built-in **Webhook** trigger node:

```
[Webhook Trigger]
  ↓
  Configuration:
  - HTTP Method: POST
  - Path: govocal-webhook-{unique-id}
  - Authentication: Header Auth
    - Header Name: X-GoVocal-Signature
    - Header Value: {secret from Go Vocal}
  ↓
[Process webhook payload]
```

**Webhook URL:** `https://n8n.example.com/webhook/govocal-webhook-{unique-id}`

**Pros:**

- No custom node needed
- Works immediately
- Full flexibility

**Cons:**

- User must manually configure
- No Go Vocal branding
- Must manually verify signature

#### Approach 2: Custom Trigger Node

Build dedicated Go Vocal trigger:

```typescript
export class GoVocalTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Go Vocal Trigger",
    name: "goVocalTrigger",
    group: ["trigger"],
    version: 1,
    description: "Starts workflow on Go Vocal events",
    defaults: {
      name: "Go Vocal Trigger",
    },
    inputs: [],
    outputs: ["main"],
    credentials: [
      {
        name: "goVocalWebhookApi",
        required: true,
      },
    ],
    webhooks: [
      {
        name: "default",
        httpMethod: "POST",
        responseMode: "onReceived",
        path: "webhook",
      },
    ],
    properties: [
      {
        displayName: "Events",
        name: "events",
        type: "multiOptions",
        options: [
          {
            name: "Idea Created",
            value: "idea.created",
          },
          {
            name: "Comment Created",
            value: "comment.created",
          },
          {
            name: "Project Published",
            value: "project.published",
          },
          // ... all event types from doc/webhook-analysis.md
        ],
        default: [],
        required: true,
        description: "Events that will trigger the workflow",
      },
    ],
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const credentials = await this.getCredentials("goVocalWebhookApi");

    // Verify signature
    const signature = req.headers["x-govocal-signature"] as string;
    const payload = JSON.stringify(req.body);
    const secret = credentials.secret as string;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = "sha256=" + hmac.digest("base64");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return {
        workflowData: [[]],
      };
    }

    // Check if event type matches configured events
    const events = this.getNodeParameter("events") as string[];
    const eventType = req.body.event_type;

    if (!events.includes(eventType)) {
      return {
        workflowData: [[]],
      };
    }

    // Return webhook data to workflow
    return {
      workflowData: [
        [
          {
            json: req.body,
          },
        ],
      ],
    };
  }
}
```

**Pros:**

- Go Vocal branding
- Automatic signature verification
- Event filtering built-in
- Better UX

**Cons:**

- Requires custom node (installation complexity)
- Not available on n8n Cloud (unless verified)

### Webhook Credential

```typescript
export class GoVocalWebhookApi implements ICredentialType {
  name = "goVocalWebhookApi";
  displayName = "Go Vocal Webhook API";
  documentationUrl = "https://developers.govocal.com/webhooks";

  properties: INodeProperties[] = [
    {
      displayName: "Secret Token",
      name: "secret",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      required: true,
      description: "Secret token from Go Vocal webhook subscription",
    },
  ];

  async test(
    this: ICredentialTestFunctions,
    credential: ICredentialDataDecryptedObject
  ): Promise<INodeCredentialTestResult> {
    // Could verify token by making test request to Go Vocal
    return {
      status: "OK",
      message: "Connection successful",
    };
  }
}
```

---

## Action Node Implementation

### Overview

Action nodes perform operations on the Go Vocal API (create idea, post comment, update project, etc.).

### Declarative Style Example

```typescript
export const ideaOperations: INodeProperties[] = [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    displayOptions: {
      show: {
        resource: ["idea"],
      },
    },
    options: [
      {
        name: "Create",
        value: "create",
        description: "Create a new idea",
        action: "Create an idea",
      },
      {
        name: "Get",
        value: "get",
        description: "Get an idea",
        action: "Get an idea",
      },
      {
        name: "Update",
        value: "update",
        description: "Update an idea",
        action: "Update an idea",
      },
      {
        name: "Delete",
        value: "delete",
        description: "Delete an idea",
        action: "Delete an idea",
      },
    ],
    default: "create",
  },
];

export const ideaFields: INodeProperties[] = [
  // Create fields
  {
    displayName: "Project ID",
    name: "projectId",
    type: "string",
    displayOptions: {
      show: {
        resource: ["idea"],
        operation: ["create"],
      },
    },
    default: "",
    required: true,
    description: "The ID of the project to create the idea in",
  },
  {
    displayName: "Title",
    name: "title",
    type: "string",
    displayOptions: {
      show: {
        resource: ["idea"],
        operation: ["create", "update"],
      },
    },
    default: "",
    required: true,
    description: "The title of the idea",
  },
  {
    displayName: "Body",
    name: "body",
    type: "string",
    typeOptions: {
      rows: 5,
    },
    displayOptions: {
      show: {
        resource: ["idea"],
        operation: ["create", "update"],
      },
    },
    default: "",
    description: "The body content of the idea",
  },
  // Get fields
  {
    displayName: "Idea ID",
    name: "ideaId",
    type: "string",
    displayOptions: {
      show: {
        resource: ["idea"],
        operation: ["get", "update", "delete"],
      },
    },
    default: "",
    required: true,
    description: "The ID of the idea",
  },
];
```

### Programmatic Execute Method

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      let response;

      if (resource === 'idea') {
        if (operation === 'create') {
          const projectId = this.getNodeParameter('projectId', i) as string;
          const title = this.getNodeParameter('title', i) as string;
          const body = this.getNodeParameter('body', i) as string;

          response = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'goVocalApi',
            {
              method: 'POST',
              url: `https://api.govocal.com/api/ideas`,
              body: {
                idea: {
                  project_id: projectId,
                  title_multiloc: { en: title },
                  body_multiloc: { en: body },
                },
              },
              json: true,
            },
          );
        } else if (operation === 'get') {
          const ideaId = this.getNodeParameter('ideaId', i) as string;

          response = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'goVocalApi',
            {
              method: 'GET',
              url: `https://api.govocal.com/api/ideas/${ideaId}`,
              json: true,
            },
          );
        }
        // ... other operations
      }
      // ... other resources (comment, project, etc.)

      returnData.push({ json: response });
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message } });
        continue;
      }
      throw error;
    }
  }

  return [returnData];
}
```

### API Credential

```typescript
export class GoVocalApi implements ICredentialType {
  name = "goVocalApi";
  displayName = "Go Vocal API";
  documentationUrl = "https://developers.govocal.com/authentication";

  properties: INodeProperties[] = [
    {
      displayName: "Tenant",
      name: "tenant",
      type: "string",
      default: "",
      required: true,
      placeholder: "mycity",
      description:
        "Your Go Vocal tenant name (e.g., mycity from mycity.govocal.com)",
    },
    {
      displayName: "API Token",
      name: "apiToken",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      required: true,
      description: "API token from Go Vocal admin settings",
    },
  ];

  async authenticate(
    credentials: ICredentialDataDecryptedObject,
    requestOptions: IHttpRequestOptions
  ): Promise<IHttpRequestOptions> {
    // Add Bearer token to headers
    requestOptions.headers = {
      ...requestOptions.headers,
      Authorization: `Bearer ${credentials.apiToken}`,
    };

    // Update URL with tenant
    if (requestOptions.url?.includes("{{tenant}}")) {
      requestOptions.url = requestOptions.url.replace(
        "{{tenant}}",
        credentials.tenant as string
      );
    }

    return requestOptions;
  }

  async test(
    this: ICredentialTestFunctions,
    credential: ICredentialDataDecryptedObject
  ): Promise<INodeCredentialTestResult> {
    const credentials = credential.data as IDataObject;

    try {
      const response = await this.helpers.request({
        method: "GET",
        url: `https://${credentials.tenant}.govocal.com/api/me`,
        headers: {
          Authorization: `Bearer ${credentials.apiToken}`,
        },
        json: true,
      });

      return {
        status: "OK",
        message: "Authentication successful",
      };
    } catch (error) {
      return {
        status: "Error",
        message: `Authentication failed: ${error.message}`,
      };
    }
  }
}
```

---

## Limitations & Constraints

### Cloud vs Self-Hosted

| Feature                        | Self-Hosted | n8n Cloud           |
| ------------------------------ | ----------- | ------------------- |
| **Install any npm package**    | ✅ Yes      | ❌ No               |
| **Unverified community nodes** | ✅ Yes      | ❌ No               |
| **Verified community nodes**   | ✅ Yes      | ✅ Yes              |
| **Private nodes**              | ✅ Yes      | ❌ No               |
| **Custom backend**             | ✅ Yes      | ❌ No               |
| **Installation method**        | GUI or CLI  | GUI only (verified) |

### Getting Custom Node on n8n Cloud

**The Verification Process:**

1. **Publish to npm** (anyone can do this)

   ```bash
   npm publish
   ```

2. **Submit for verification** (optional, for Cloud access)

   - Fill out n8n's submission form
   - Provide GitHub repository URL
   - Wait for n8n team review

3. **Review criteria** (from community observations):

   - ✅ Code quality (linting passes)
   - ✅ Security (no malicious code)
   - ✅ Documentation (README, usage examples)
   - ✅ Testing (some tests provided)
   - ✅ Maintenance (responsive maintainer)

4. **Timeline:**

   - No official SLA
   - Community reports: 2-8 weeks
   - Some nodes never get verified

5. **Verification badge:**
   - Verified nodes show shield icon 🛡️
   - Appear in n8n Cloud's node panel

**Reality Check:**

- Only ~200 of 2,000+ community nodes are verified
- n8n prioritizes popular/high-quality nodes
- Small/niche integrations may wait indefinitely

### Technical Limitations

#### 1. OAuth2 Token Refresh (Critical)

**Known bug:** Tokens don't auto-refresh after expiration.

**Impact:** Workflows fail silently when tokens expire.

**Workaround:** Use long-lived tokens or manual refresh workflow.

#### 2. No Async Webhook Processing

Webhook triggers must respond immediately. Can't:

- Query database
- Call external API
- Perform long computations

Before responding to webhook.

**Workaround:** Use webhook just to receive, process in subsequent nodes.

#### 3. Limited Error Handling in Declarative Style

Declarative nodes have basic error handling. For complex scenarios (retry logic, custom error messages), need programmatic style.

#### 4. No Built-in Rate Limiting

If Go Vocal API has rate limits, custom node must implement:

- Request queuing
- Backoff/retry
- Rate limit tracking

#### 5. Multi-Language Support

Go Vocal uses `title_multiloc`, `body_multiloc` objects:

```json
{
  "title_multiloc": {
    "en": "English title",
    "nl": "Nederlandse titel"
  }
}
```

n8n UI doesn't have native multi-language field type. Must use:

- JSON input (complex for users)
- Separate fields per language (repetitive)
- Custom component (requires n8n core changes)

---

## Installation & Distribution

### For Self-Hosted Users

#### Method 1: GUI Installation (Easiest)

1. User goes to **Settings → Community Nodes**
2. Click **Install**
3. Search for `n8n-nodes-govocal`
4. Click **Install**
5. Restart n8n

**Requirements:**

- n8n 0.185.0+
- Node.js 18+
- npm registry access

#### Method 2: npm CLI

```bash
# In n8n installation directory
npm install n8n-nodes-govocal

# Restart n8n
systemctl restart n8n
```

#### Method 3: Docker

```dockerfile
FROM n8nio/n8n:latest

USER root
RUN npm install -g n8n-nodes-govocal
USER node
```

Or via docker-compose:

```yaml
version: "3.8"
services:
  n8n:
    image: n8nio/n8n
    environment:
      - NODE_FUNCTION_ALLOW_EXTERNAL=n8n-nodes-govocal
    volumes:
      - ./n8n-data:/home/node/.n8n
    command: sh -c "npm install -g n8n-nodes-govocal && n8n start"
```

### For n8n Cloud Users

**Option A: Verified Node (Best UX)**

1. Submit to n8n for verification
2. Wait 2-8 weeks
3. Once verified, appears in node panel automatically

**Option B: Use Generic Nodes (No Custom Node Needed)**

- Provide documentation on using Webhook + HTTP Request nodes
- Users can implement same functionality
- Works immediately, no waiting

### Publishing to npm

```bash
# 1. Update package.json
{
  "name": "n8n-nodes-govocal",
  "version": "1.0.0",
  "description": "n8n nodes for Go Vocal digital democracy platform",
  "license": "MIT",
  "homepage": "https://developers.govocal.com/n8n",
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "govocal",
    "civic-tech",
    "democracy"
  ],
  "n8n": {
    "nodes": [
      "dist/nodes/GoVocal/GoVocal.node.js",
      "dist/nodes/GoVocalTrigger/GoVocalTrigger.node.js"
    ],
    "credentials": [
      "dist/credentials/GoVocalApi.credentials.js",
      "dist/credentials/GoVocalWebhookApi.credentials.js"
    ]
  }
}

# 2. Build
npm run build

# 3. Publish
npm publish

# 4. Verify
npm info n8n-nodes-govocal
```

**Post-publish:**

- Package immediately available via `npm install`
- Self-hosted users can install immediately
- Cloud users must wait for verification

---

## Alternatives to Custom Nodes

### Option 1: Generic Webhook + HTTP Request (Recommended)

**For Webhooks:**

```
┌──────────────────────────────────────────────────┐
│ Webhook Trigger                                  │
│ - HTTP Method: POST                              │
│ - Path: govocal-{workflow-name}                  │
│ - Authentication: Header Auth                    │
│   - Name: X-GoVocal-Signature                    │
│   - Value: {{$credentials.secret}}               │
├──────────────────────────────────────────────────┤
│ ↓                                                │
├──────────────────────────────────────────────────┤
│ Code Node (Verify Signature - Optional)          │
│                                                  │
│ const crypto = require('crypto');                │
│ const signature = $json.headers['x-govocal...]; │
│ // ... verify HMAC                               │
├──────────────────────────────────────────────────┤
│ ↓                                                │
├──────────────────────────────────────────────────┤
│ Switch Node (Route by event_type)               │
│ - idea.created → Branch 1                       │
│ - comment.created → Branch 2                    │
│ - project.published → Branch 3                  │
└──────────────────────────────────────────────────┘
```

**For API Calls:**

```
┌──────────────────────────────────────────────────┐
│ HTTP Request                                     │
│ - Method: POST                                   │
│ - URL: https://{{tenant}}.govocal.com/api/ideas  │
│ - Authentication: Generic Credential             │
│   - Header Auth                                  │
│   - Name: Authorization                          │
│   - Value: Bearer {{$credentials.token}}         │
│ - Body:                                          │
│   {                                              │
│     "idea": {                                    │
│       "project_id": "{{$json.project_id}}",      │
│       "title_multiloc": {                        │
│         "en": "{{$json.title}}"                  │
│       }                                          │
│     }                                            │
│   }                                              │
└──────────────────────────────────────────────────┘
```

**Pros:**

- ✅ Works immediately
- ✅ Works on n8n Cloud
- ✅ No installation required
- ✅ Full flexibility
- ✅ No maintenance burden

**Cons:**

- ⚠️ Manual configuration
- ⚠️ No Go Vocal branding
- ⚠️ More complex for beginners

### Option 2: OpenAPI/Swagger Generation

Use automated node generators:

#### Tool 1: @devlikeapro/n8n-openapi-node

```bash
npm install -g @devlikeapro/n8n-openapi-node

# Generate node from OpenAPI spec
n8n-openapi-node generate \
  --spec https://api.govocal.com/openapi.json \
  --name govocal \
  --output ./n8n-nodes-govocal
```

**Generates:**

- All API endpoints as operations
- Request/response schemas
- Authentication configuration
- Type definitions

**Estimated effort:** 1-2 hours (vs 40+ hours manual)

#### Tool 2: n8n-openapi-node-plugin-generator

```bash
npx n8n-openapi-node-plugin-generator \
  --input https://api.govocal.com/openapi.json \
  --output ./n8n-nodes-govocal \
  --packageName n8n-nodes-govocal
```

Supports OpenAPI 3.0.x.

**Pros:**

- ✅ 80-90% automated
- ✅ Consistent with API spec
- ✅ Updates easy (regenerate)
- ✅ Reduces human error

**Cons:**

- ⚠️ Requires OpenAPI spec (Go Vocal must provide)
- ⚠️ Generated code may need tweaking
- ⚠️ Less customization

### Option 3: Provide n8n Workflow Templates

Create pre-built workflow templates:

**Example: "Go Vocal - Idea to Slack"**

```json
{
  "name": "Go Vocal - Idea to Slack",
  "nodes": [
    {
      "name": "Go Vocal Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "govocal-ideas",
        "authentication": "headerAuth"
      }
    },
    {
      "name": "Filter Ideas Only",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.event_type}}",
              "value2": "idea.created"
            }
          ]
        }
      }
    },
    {
      "name": "Send to Slack",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "resource": "message",
        "operation": "post",
        "text": "New idea: {{$json.data.attributes.title_multiloc.en}}"
      }
    }
  ]
}
```

**Publish to:**

- n8n workflow templates (https://n8n.io/workflows)
- Go Vocal documentation
- GitHub repository

**Benefits:**

- Users can import with one click
- No installation required
- Works on Cloud + Self-hosted
- Easy to understand and modify

### Option 4: Documentation-First Approach

Create comprehensive integration guide:

**Topics to cover:**

1. **Authentication Setup**

   - Generate API token
   - Configure credentials in n8n
   - Test connection

2. **Receiving Webhooks**

   - Create webhook subscription in Go Vocal
   - Configure Webhook node in n8n
   - Verify signature (code example)
   - Handle different event types

3. **Making API Calls**

   - Common operations (create idea, post comment, etc.)
   - Request/response examples
   - Error handling
   - Rate limiting

4. **Example Workflows**

   - Idea → Slack notification
   - Form submission → Create idea
   - New comment → Email notification
   - Bulk import ideas from CSV

5. **Troubleshooting**
   - Authentication errors
   - Webhook not receiving
   - API rate limits
   - Token expiration

**Deliverables:**

- `/docs/integrations/n8n.md` on developers.govocal.com
- Video tutorials on YouTube
- Blog post with screenshots
- Sample workflow JSON files

---

## Recommendation

### Phase 1: Generic Approach (Immediate - 0-2 weeks)

**✅ Implement webhooks** (from `doc/webhook-analysis.md`)

- Provides foundation for all integrations
- Works with n8n immediately via Webhook node

**✅ Create comprehensive documentation**

- "Integrating Go Vocal with n8n" guide
- Step-by-step screenshots
- Code examples for signature verification
- Example workflows

**✅ Publish workflow templates**

- 5-10 common use cases
- Upload to n8n workflow library
- Host on GitHub

**Effort:** 3-5 days
**Benefit:** Immediate value, works for all n8n users

### Phase 2: OpenAPI Specification (1-2 weeks)

**✅ Generate OpenAPI spec for public API**

- Use automated tools (RSwag, Grape-Swagger)
- Document all endpoints
- Include authentication

**✅ Use OpenAPI generators**

- Generate basic node with @devlikeapro/n8n-openapi-node
- Customize as needed
- Publish to npm

**Effort:** 5-10 days
**Benefit:** Custom node for self-hosted users

### Phase 3: Verification (If Demand Exists - 2-8 weeks)

**If Phase 2 gets significant adoption:**

✅ Submit to n8n for verification

- Polish documentation
- Add comprehensive tests
- Responsive to feedback

**Effort:** 1-2 weeks (prep) + waiting
**Benefit:** n8n Cloud users can use it

### Phase 4: OAuth2 (Future - If API Supports)

**If Go Vocal implements OAuth2 Client Credentials:**

✅ Update credentials to use OAuth2

- Automatic token refresh
- Better security
- Better UX

**Effort:** 3-5 days
**Benefit:** Eliminates token expiration issues

---

## Cost-Benefit Analysis

### Custom Node

**Costs:**

- Development: 40-60 hours
- Testing: 10-20 hours
- Documentation: 10-15 hours
- Maintenance: 5-10 hours/month
- Support: Ongoing
- **Total initial:** 60-95 hours
- **Ongoing:** 5-10 hours/month

**Benefits:**

- Better UX (Go Vocal branding)
- Easier for beginners
- Marketing value
- Self-hosted users only (unless verified)

**ROI:** Low initially, increases if verified and adopted

### Generic Approach

**Costs:**

- Documentation: 10-15 hours
- Workflow templates: 5-10 hours
- Video tutorials: 5-10 hours
- **Total:** 20-35 hours
- **Ongoing:** 1-2 hours/month

**Benefits:**

- Works immediately
- Works on Cloud + Self-hosted
- Low maintenance
- Flexible

**ROI:** High — 3x less effort, works for everyone

### OpenAPI Generation

**Costs:**

- OpenAPI spec: 10-20 hours (one-time)
- Generation: 2-5 hours
- Customization: 10-20 hours
- **Total:** 22-45 hours
- **Ongoing:** 2-3 hours/month

**Benefits:**

- 50% of custom node benefits
- 40% less effort
- Easier maintenance
- Self-hosted users

**ROI:** Medium — good middle ground

---

## Technical Specifications Summary

### JWT Authentication in n8n

| Feature                   | n8n Support        | Go Vocal Needs     | Solution                    |
| ------------------------- | ------------------ | ------------------ | --------------------------- |
| Bearer token              | ✅ Yes             | ✅ Yes             | Use Header Auth             |
| Token expiration          | ⚠️ No auto-refresh | ✅ Expires         | Long-lived tokens or OAuth2 |
| OAuth2 Client Credentials | ✅ Yes             | ❌ Not implemented | Implement in Go Vocal       |
| Manual token refresh      | ✅ Yes             | N/A                | Workaround with workflow    |

### Cloud Availability

| Deployment            | Custom Node             | Generic Nodes | OpenAPI Generated       |
| --------------------- | ----------------------- | ------------- | ----------------------- |
| **Self-hosted**       | ✅ Yes                  | ✅ Yes        | ✅ Yes                  |
| **n8n Cloud**         | ❌ No (unless verified) | ✅ Yes        | ❌ No (unless verified) |
| **Installation**      | npm or GUI              | Built-in      | npm or GUI              |
| **Verification time** | 2-8 weeks               | N/A           | 2-8 weeks               |

### Feature Comparison

| Feature              | Custom Node    | Generic Approach | OpenAPI        |
| -------------------- | -------------- | ---------------- | -------------- |
| **Setup complexity** | Low            | Medium           | Low            |
| **Flexibility**      | Medium         | High             | Medium         |
| **Maintenance**      | High           | Low              | Medium         |
| **Branding**         | ✅ Yes         | ❌ No            | ✅ Yes         |
| **Cloud compatible** | ⚠️ If verified | ✅ Yes           | ⚠️ If verified |
| **Development time** | 60-95h         | 20-35h           | 22-45h         |

---

## Next Steps

### Immediate Actions (This Sprint)

1. **✅ Implement webhook system** (Priority 1 from webhook-analysis.md)

   - Enables all n8n integrations
   - Works with Webhook trigger node

2. **✅ Write integration documentation**

   - Create `/docs/integrations/n8n.md`
   - Include authentication setup
   - Webhook configuration
   - API call examples

3. **✅ Create 3-5 example workflows**
   - Export as JSON
   - Upload to GitHub
   - Submit to n8n workflow library

### Short Term (Next Month)

4. **✅ Generate OpenAPI specification**

   - Use automated tools
   - Document public API
   - Host at `/api/openapi.json`

5. **⚠️ Generate custom node** (optional)
   - Use OpenAPI generator
   - Customize and test
   - Publish to npm

### Medium Term (3-6 Months)

6. **⚠️ Monitor adoption** (optional)

   - Track npm downloads
   - Collect user feedback
   - Identify pain points

7. **⚠️ Submit for verification** (if warranted)
   - Polish node based on feedback
   - Add comprehensive tests
   - Submit to n8n team

### Long Term (Future)

8. **⚠️ Implement OAuth2** (if API supports)
   - Client Credentials grant
   - Automatic token refresh
   - Better security

---

## Conclusion

**Key Findings:**

1. **Custom nodes are feasible** but have significant limitations (Cloud availability, OAuth2 bugs)

2. **Generic approach is more practical** for initial launch:

   - ✅ Works immediately
   - ✅ Works everywhere (Cloud + Self-hosted)
   - ✅ 3x less effort
   - ✅ More flexible

3. **OpenAPI generation is the sweet spot** if custom node becomes necessary:

   - ✅ 50% less effort than manual
   - ✅ Maintainable
   - ✅ Consistent with API

4. **JWT token expiration is a blocker** for seamless UX:
   - ⚠️ Known bug in n8n (not auto-refreshing)
   - ⚠️ Requires workarounds (long-lived tokens or OAuth2)
   - ⚠️ Would need implementing OAuth2 in Go Vocal

**Recommended Path:**

```
Phase 1: Generic Approach (Immediate)
  ↓
  [Monitor adoption & gather feedback]
  ↓
Phase 2: OpenAPI Generation (If demand exists)
  ↓
  [Monitor npm downloads & issues]
  ↓
Phase 3: Verification (If high adoption)
  ↓
Phase 4: OAuth2 (If token expiration becomes major pain point)
```

**Why this approach:**

- ✅ Delivers value immediately (weeks, not months)
- ✅ Works for all users (not just self-hosted)
- ✅ Low maintenance burden
- ✅ Validates demand before heavy investment
- ✅ Provides clear upgrade path if warranted

---

**Document Version:** 1.0
**Last Updated:** 2025-10-17
**Next Review:** After Phase 1 implementation

## References

### Official Documentation

- n8n node development: https://docs.n8n.io/integrations/creating-nodes/
- n8n starter template: https://github.com/n8n-io/n8n-nodes-starter
- n8n community nodes: https://docs.n8n.io/integrations/community-nodes/

### Tools

- OpenAPI generator (devlikeapro): https://github.com/devlikeapro/n8n-openapi-node
- OpenAPI generator (tumf): https://github.com/tumf/n8n-openapi-node-plugin-generator

### GitHub Issues

- OAuth2 token refresh bug: https://github.com/n8n-io/n8n/issues/17450
- OAuth2 client credentials: https://github.com/n8n-io/n8n/issues/13413

### Community Resources

- Trigger node tutorial: https://medium.com/@jovial_brass_otter_147/introduction-to-developing-an-n8n-trigger-node-1a286bbd0abd
- Custom credentials tutorial: https://rapidevelopers.com/n8n-tutorial/how-to-add-custom-credentials-in-n8n
