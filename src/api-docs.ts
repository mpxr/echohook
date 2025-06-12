// API Documentation Page
export const generateApiDocsHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - EchoHook</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .code-block {
            background: #1a202c;
            border-radius: 0.375rem;
            padding: 1rem;
            overflow-x: auto;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="text-2xl font-bold text-indigo-600">🪝 EchoHook</a>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/" class="text-gray-600 hover:text-indigo-600">← Back to Home</a>
                    <a href="https://github.com/mpxr/echohook" class="text-gray-600 hover:text-indigo-600">GitHub</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Header -->
    <section class="gradient-bg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="text-center">
                <h1 class="text-4xl font-extrabold text-white sm:text-5xl">
                    API Documentation
                </h1>
                <p class="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
                    Complete reference for the EchoHook REST API
                </p>
            </div>
        </div>
    </section>

    <!-- API Documentation -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Core Endpoints Summary -->
            <div class="mb-12">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Core Endpoints</h2>
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">POST</span></td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">/api/auth/token</td>
                                <td class="px-6 py-4 text-sm text-gray-900">Create authentication token</td>
                            </tr>
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span></td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">/api/bins</td>
                                <td class="px-6 py-4 text-sm text-gray-900">List webhook bins</td>
                            </tr>
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">POST</span></td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">/api/bins</td>
                                <td class="px-6 py-4 text-sm text-gray-900">Create webhook bin</td>
                            </tr>
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span></td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">/api/bins/:binId/requests</td>
                                <td class="px-6 py-4 text-sm text-gray-900">Get captured requests</td>
                            </tr>
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">ANY</span></td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">/api/webhook/:binId</td>
                                <td class="px-6 py-4 text-sm text-gray-900">Capture webhook requests</td>
                            </tr>
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span></td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">/api</td>
                                <td class="px-6 py-4 text-sm text-gray-900">API health check</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Authentication Notice -->
            <div class="mb-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-amber-800">Authentication Required</h3>
                        <div class="mt-2 text-sm text-amber-700">
                            <ul class="space-y-1">
                                <li>• <strong>Admin key required:</strong> Token creation requires admin authorization with <code class="bg-amber-100 px-1 rounded">X-Admin-Key</code> header</li>
                                <li>• <strong>Bearer tokens:</strong> All API endpoints require <code class="bg-amber-100 px-1 rounded">Authorization: Bearer your_token_here</code></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detailed API Documentation -->
            <div class="space-y-16">
                <!-- Create Token -->
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="px-6 py-4 bg-blue-50 border-b border-blue-200">
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">POST</span>
                            <h3 class="ml-3 text-lg font-semibold text-gray-900">/api/auth/token</h3>
                        </div>
                        <p class="mt-2 text-sm text-gray-600">Create a new API token for authentication (requires admin key)</p>
                    </div>
                    <div class="px-6 py-4">
                        <div class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                            <p class="text-sm text-red-700">
                                <strong>⚠️ Admin Authorization Required:</strong> Include <code class="bg-red-100 px-1 rounded">X-Admin-Key: your_admin_key</code> header
                            </p>
                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Request Body</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>{
  "name": "string",         // Required: Token name (1-100 chars)
  "description": "string",  // Optional: Token description
  "expiresIn": "number",    // Optional: Days until expiration
  "dailyQuota": "number"    // Optional: Daily request limit (1-10000)
}</code></pre>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Response (201)</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>{
  "success": true,
  "data": {
    "token": "string",        // Bearer token
    "id": "string",           // Token ID
    "name": "string",         // Token name
    "expires_at": "string",   // ISO timestamp (null if no expiration)
    "created_at": "string",   // ISO timestamp
    "daily_quota": number,    // Daily request limit
    "usage_count": 0,         // Current daily usage
    "is_active": true
  }
}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- List Bins -->
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="px-6 py-4 bg-green-50 border-b border-green-200">
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span>
                            <h3 class="ml-3 text-lg font-semibold text-gray-900">/api/bins</h3>
                        </div>
                        <p class="mt-2 text-sm text-gray-600">List all webhook bins for the authenticated user</p>
                    </div>
                    <div class="px-6 py-4">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Headers</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>Authorization: Bearer {token}</code></pre>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Response (200)</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>{
  "bins": [
    {
      "id": "string",       // Bin ID
      "name": "string",     // Bin name
      "createdAt": "string" // ISO timestamp
    }
  ]
}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Create Bin -->
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="px-6 py-4 bg-blue-50 border-b border-blue-200">
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">POST</span>
                            <h3 class="ml-3 text-lg font-semibold text-gray-900">/api/bins</h3>
                        </div>
                        <p class="mt-2 text-sm text-gray-600">Create a new webhook bin</p>
                    </div>
                    <div class="px-6 py-4">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Headers</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>Authorization: Bearer {token}</code></pre>
                                </div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2 mt-4">Request Body</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>{
  "name": "string" // Required: Bin name
}</code></pre>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Response (201)</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>{
  "id": "string",       // Bin ID
  "name": "string",     // Bin name
  "url": "string",      // Webhook URL
  "createdAt": "string" // ISO timestamp
}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Get Requests -->
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="px-6 py-4 bg-green-50 border-b border-green-200">
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span>
                            <h3 class="ml-3 text-lg font-semibold text-gray-900">/api/bins/:binId/requests</h3>
                        </div>
                        <p class="mt-2 text-sm text-gray-600">Get all captured webhook requests for a bin</p>
                    </div>
                    <div class="px-6 py-4">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Headers</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>Authorization: Bearer {token}</code></pre>
                                </div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2 mt-4">Query Parameters</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>limit=50    // Optional: Max requests
offset=0    // Optional: Pagination offset</code></pre>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Response (200)</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>{
  "requests": [
    {
      "id": "string",
      "method": "string",
      "headers": {},
      "body": "string",
      "query": {},
      "ip": "string",
      "userAgent": "string",
      "timestamp": "string"
    }
  ],
  "total": 0,
  "hasMore": false
}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Capture Webhook -->
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="px-6 py-4 bg-purple-50 border-b border-purple-200">
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">ANY</span>
                            <h3 class="ml-3 text-lg font-semibold text-gray-900">/api/webhook/:binId</h3>
                        </div>
                        <p class="mt-2 text-sm text-gray-600">Capture incoming webhook requests (accepts any HTTP method)</p>
                    </div>
                    <div class="px-6 py-4">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Request Body</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>// Any HTTP method (GET, POST, PUT, etc.)
// Any headers accepted
// Any body content accepted
// Query parameters captured

{
  "event": "user.created",
  "data": { ... }
}</code></pre>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Response (200)</h4>
                                <div class="code-block">
                                    <pre class="text-green-400 text-sm"><code>{
  "status": "captured",
  "requestId": "string",
  "timestamp": "string"
}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Getting Started Example -->
            <div class="mt-12 bg-gray-900 rounded-lg p-8">
                <h2 class="text-2xl font-bold text-white mb-6">Quick Start Example</h2>
                <div class="space-y-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-300 mb-2">1. Create a token (Admin only)</h3>
                        <div class="code-block">
                            <pre class="text-green-400 text-sm"><code>curl -X POST https://echohook.dev/api/auth/token \\
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Token", "dailyQuota": 1000}'</code></pre>
                        </div>
                        <p class="text-sm text-gray-400 mt-2">💡 Configure daily quotas and expiration: <code class="bg-gray-800 px-1 rounded text-green-400">"expiresIn": 30, "dailyQuota": 5000</code></p>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-300 mb-2">2. Create a bin</h3>
                        <div class="code-block">
                            <pre class="text-green-400 text-sm"><code>curl -X POST https://echohook.dev/api/bins \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Webhook Bin"}'</code></pre>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-300 mb-2">3. Send a test webhook</h3>
                        <div class="code-block">
                            <pre class="text-green-400 text-sm"><code>curl -X POST https://echohook.dev/api/webhook/YOUR_BIN_ID \\
  -H "Content-Type: application/json" \\
  -d '{"event": "test", "data": {"message": "Hello EchoHook!"}}'</code></pre>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-300 mb-2">4. View captured requests</h3>
                        <div class="code-block">
                            <pre class="text-green-400 text-sm"><code>curl https://echohook.dev/api/bins/YOUR_BIN_ID/requests \\
  -H "Authorization: Bearer YOUR_TOKEN"</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="text-center">
                <div class="text-2xl font-bold text-white mb-4">🪝 EchoHook</div>
                <p class="text-gray-400 mb-8">Runs on the edge thanks to CloudFlare Workers, Hono and Durable Objects</p>
                <div class="flex justify-center space-x-6">
                    <a href="https://github.com/mpxr/echohook" class="text-gray-400 hover:text-white">
                        <span class="sr-only">GitHub</span>
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>
`;
