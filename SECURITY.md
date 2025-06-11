# EchoHook Security Configuration

This document describes the security features and configuration options for EchoHook.

## Environment Variables

Configure these environment variables in your `wrangler.toml` or deployment environment:

```toml
[env.production.vars]
ADMIN_API_KEY = "your-secure-admin-key-here"
RATE_LIMIT_ENABLED = "true"
DEFAULT_TOKEN_QUOTA = "1000"
LOG_LEVEL = "info"
```

### Security Configuration

- **ADMIN_API_KEY** (required): Admin key for creating API tokens. Use a strong, random key.
- **RATE_LIMIT_ENABLED** (optional): Set to "true" to enable rate limiting. Default: disabled.
- **DEFAULT_TOKEN_QUOTA** (optional): Default daily request quota for new tokens. Default: 1000.

## Security Features

### 🔐 Admin-Protected Token Creation
- API tokens can only be created with valid admin key
- Include `X-Admin-Key: your-admin-key` header when creating tokens
- Prevents unauthorized token generation

### 🚦 Rate Limiting
When enabled, the following limits apply:
- Token creation: 5 requests per hour per IP
- Webhook capture: 1000 requests per hour per IP  
- General API: 100 requests per hour per IP

### 📊 Daily Quotas
- Each token has a configurable daily request limit
- Usage resets daily at midnight UTC
- Quota exceeded requests return 401 error

### ✅ Input Validation
- Token names: 1-100 characters, alphanumeric + spaces/hyphens/underscores
- Bin IDs: Must be valid UUIDs
- All inputs are sanitized and length-limited

### ⏰ Token Expiration
- Tokens can be configured with expiration dates
- Expired tokens automatically become invalid
- Usage tracking includes last used timestamp

## API Security Headers

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Best Practices

1. **Use Strong Admin Keys**: Generate a secure random string (32+ characters)
2. **Enable Rate Limiting**: Prevent abuse in production environments
3. **Set Reasonable Quotas**: Limit token usage based on expected traffic
4. **Monitor Usage**: Check token usage and expire unused tokens
5. **Regular Key Rotation**: Periodically rotate admin keys

## Example Configuration

For a production deployment:

```bash
# Generate a secure admin key
openssl rand -hex 32

# Set environment variables
export ADMIN_API_KEY="your-generated-key"
export RATE_LIMIT_ENABLED="true"
export DEFAULT_TOKEN_QUOTA="5000"
```

## Security Monitoring

The system logs security-related events:
- Failed authentication attempts
- Rate limit violations
- Admin key usage
- Token creation/deletion
- Quota exceeded events

Monitor these logs to detect potential abuse or security issues.
