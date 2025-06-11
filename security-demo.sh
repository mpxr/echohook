#!/bin/bash

# EchoHook Security Demo Script
# This script demonstrates the new security features

set -e

echo "🛡️  EchoHook Security Features Demo"
echo "====================================="

# Configuration
BASE_URL="http://localhost:8787"  # Change to your deployment URL
ADMIN_KEY="demo-admin-key-12345"  # Set your actual admin key

echo ""
echo "📋 Testing Rate Limiting..."
echo "Making multiple rapid requests to test rate limiting:"

for i in {1..6}; do
    echo "Request $i:"
    curl -s -w "Status: %{http_code}\n" "$BASE_URL/api/auth/token" \
        -H "Content-Type: application/json" \
        -d '{"name": "Test Token"}' || true
    sleep 0.1
done

echo ""
echo "🔐 Testing Admin Authentication..."
echo "Attempting to create token without admin key (should fail):"

curl -s -w "Status: %{http_code}\n" "$BASE_URL/api/auth/token" \
    -H "Content-Type: application/json" \
    -d '{"name": "Unauthorized Token"}' || true

echo ""
echo "Creating token with admin key (should succeed):"

TOKEN_RESPONSE=$(curl -s "$BASE_URL/api/auth/token" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Demo Token",
        "description": "Token for security demo",
        "dailyQuota": 100,
        "expiresIn": 7
    }')

echo "Response: $TOKEN_RESPONSE"

# Extract token from response
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo ""
    echo "✅ Token created successfully: ${TOKEN:0:16}..."
    
    echo ""
    echo "📊 Testing Token Usage and Quotas..."
    echo "Creating a bin with the new token:"
    
    BIN_RESPONSE=$(curl -s "$BASE_URL/api/bins" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name": "Security Demo Bin"}')
    
    echo "Bin Response: $BIN_RESPONSE"
    
    # Extract bin ID
    BIN_ID=$(echo "$BIN_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$BIN_ID" ]; then
        echo ""
        echo "🎣 Testing Webhook Capture (with validation)..."
        echo "Sending webhook to bin: $BIN_ID"
        
        curl -s -w "Status: %{http_code}\n" "$BASE_URL/api/webhook/$BIN_ID" \
            -H "Content-Type: application/json" \
            -d '{"event": "security_demo", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
        
        echo ""
        echo "📈 Checking token usage..."
        
        TOKENS_RESPONSE=$(curl -s "$BASE_URL/api/auth/tokens" \
            -H "Authorization: Bearer $TOKEN")
        
        echo "Tokens Response: $TOKENS_RESPONSE"
    fi
    
    echo ""
    echo "🧪 Testing Input Validation..."
    echo "Attempting to create token with invalid name:"
    
    curl -s -w "Status: %{http_code}\n" "$BASE_URL/api/auth/token" \
        -H "X-Admin-Key: $ADMIN_KEY" \
        -H "Content-Type: application/json" \
        -d '{"name": "Invalid@Name$With#Special!Characters"}' || true
    
    echo ""
    echo "Testing invalid bin ID format:"
    
    curl -s -w "Status: %{http_code}\n" "$BASE_URL/api/webhook/invalid-bin-id" \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}' || true
    
else
    echo "❌ Failed to create token. Check admin key configuration."
fi

echo ""
echo "🔍 Security Headers Check..."
echo "Checking for rate limit headers:"

curl -s -I "$BASE_URL/api" | grep -i "x-ratelimit" || echo "Rate limiting may be disabled"

echo ""
echo "✅ Security demo completed!"
echo ""
echo "💡 Tips:"
echo "  - Set RATE_LIMIT_ENABLED=true to enable rate limiting"
echo "  - Configure ADMIN_API_KEY for token creation security"
echo "  - Monitor logs for security events"
echo "  - Use reasonable daily quotas for tokens"
