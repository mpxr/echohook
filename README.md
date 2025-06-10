# EchoHook - Webhook Bin Service

A webhook bin service built with CloudFlare Workers, Hono framework, and CloudFlare Durable Objects. Capture, inspect, and debug HTTP webhooks with ease.

## Use Cases

- **API Development**: Test webhooks during development
- **Third-party Integration**: Debug webhooks from services like GitHub, Stripe, PayPal
- **API Monitoring**: Monitor webhook delivery and payloads
- **Development Testing**: Create temporary endpoints for testing
- **Webhook Inspection**: Analyze webhook structure and content

## Features

- ✅ **Token Authentication**: Secure API access with Bearer tokens
- ✅ **Webhook Capture**: Capture any HTTP method and payload
- ✅ **Request Inspection**: View headers, body, query parameters, and metadata
- ✅ **Bin Management**: Create, update, and delete webhook bins
- ✅ **Structured Logging**: JSON-formatted logs for monitoring and debugging
- ✅ **TypeScript**: Fully typed with modern TypeScript
- ✅ **CloudFlare Durable Objects**: Serverless stateful storage with strong consistency
- ✅ **Hono Framework**: Fast and lightweight web framework
- ✅ **Real-time**: Instant webhook capture and viewing
- ✅ **CORS**: Cross-Origin Resource Sharing enabled

## Authentication

All API endpoints (except root `/` and token creation) require authentication using Bearer tokens.

### Getting Started

1. **Create an API Token**:

```bash
curl -X POST https://your-domain.com/auth/token \
  -H "Content-Type: application/json" \
  -d '{"name": "My Token", "description": "Token for webhook testing"}'
```

2. **Use the token in all requests**:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-domain.com/bins
```

## 🚀 Quick Start with Authentication

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Create an API Token

```bash
curl -X POST http://localhost:8787/auth/token \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Token", "description": "For testing"}'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "token-uuid",
    "token": "your-64-char-token",
    "name": "My API Token",
    "description": "For testing",
    "created_at": "2025-06-10T12:00:00.000Z",
    "is_active": true
  }
}
```

### 3. Use the Token in API Calls

```bash
# Set your token
TOKEN="your-64-char-token"

# List webhook bins
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8787/bins

# Create a webhook bin
curl -X POST http://localhost:8787/bins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Webhook Bin", "description": "Test bin"}'

# Capture a webhook
curl -X POST http://localhost:8787/webhook/your-bin-id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello webhook!"}'
```

## API Endpoints

### Health Check

- `GET /` - API health check and endpoint overview (no auth required)

### Authentication

- `POST /auth/token` - Create new API token (no auth required)
- `GET /auth/tokens` - List your API tokens
- `DELETE /auth/tokens/:tokenId` - Delete an API token

### Webhook Bin Management

- `GET /bins` - List all webhook bins
- `GET /bins/:binId` - Get single bin details
- `POST /bins` - Create new webhook bin
- `PUT /bins/:binId` - Update bin details
- `DELETE /bins/:binId` - Delete bin and all its captured requests

### Webhook Requests

- `GET /bins/:binId/requests` - Get all captured requests for a bin
- `POST /webhook/:binId` - Capture webhook (accepts any HTTP method)

### Request/Response Format

#### Create API Token (POST /auth/token)

```json
{
  "name": "My API Token",
  "description": "Optional description",
  "expiresIn": "365"
}
```

#### Create Webhook Bin (POST /bins)

```json
{
  "name": "My Webhook Bin",
  "description": "Optional description"
}
```

#### Webhook Bin Response

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "My Webhook Bin",
    "description": "Optional description",
    "created_at": "2024-06-01T12:00:00.000Z",
    "updated_at": "2024-06-01T12:00:00.000Z",
    "request_count": 5,
    "last_request_at": "2024-06-01T12:30:00.000Z"
  }
}
```

#### Captured Webhook Request Response

````json
{
  "success": true,
  "data": [
    {
      "id": "req-123e4567-e89b-12d3-a456-426614174000",
      "bin_id": "123e4567-e89b-12d3-a456-426614174000",
      "method": "POST",
      "url": "https://your-worker.your-subdomain.workers.dev/webhook/123e4567-e89b-12d3-a456-426614174000",
      "headers": {
        "content-type": "application/json",
        "user-agent": "GitHub-Hookshot/abc123"
      },
      "body": "{\"action\":\"push\",\"repository\":{\"name\":\"my-repo\"}}",
      "query_params": {
        "source": "github"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "GitHub-Hookshot/abc123",
      "content_type": "application/json",
      "content_length": 45,
      "received_at": "2024-06-01T12:30:00.000Z"
    }
  ]
}

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
````

### 2. Development

```bash
pnpm run dev
```

This starts the development server at `http://localhost:8787`

### 3. Deploy to CloudFlare

```bash
pnpm run deploy
```

**Note**: Durable Objects automatically handle storage without requiring database setup or migrations.

## Usage Examples

### Create a Webhook Bin

```bash
curl -X POST http://localhost:8787/bins \
  -H "Content-Type: application/json" \
  -d '{"name": "GitHub Webhooks", "description": "Capture GitHub webhook events"}'
```

### Send a Webhook to Your Bin

```bash
# Any HTTP method is supported
curl -X POST http://localhost:8787/webhook/YOUR_BIN_ID \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"action": "push", "repository": {"name": "my-repo"}}'
```

### View Captured Requests

```bash
curl http://localhost:8787/bins/YOUR_BIN_ID/requests
```

### Get All Bins

```bash
curl http://localhost:8787/bins
```

### Get Single Bin

```bash
curl http://localhost:8787/bins/YOUR_BIN_ID
```

### Update Bin

```bash
curl -X PUT http://localhost:8787/bins/YOUR_BIN_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Bin Name", "description": "New description"}'
```

### Delete Bin

```bash
curl -X DELETE http://localhost:8787/bins/YOUR_BIN_ID
```
