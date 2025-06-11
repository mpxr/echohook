// This file exports the HTML content from index.html
// Generated automatically - do not edit manually
// To update, modify index.html and run: npm run sync-html

export const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🪝 EchoHook - Webhook Bin Service</title>
    <meta name="description" content="Capture, inspect, and debug HTTP webhooks with ease. Built with CloudFlare Workers and Durable Objects.">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Custom styling -->
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .glass-card {
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            background-color: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(209, 213, 219, 0.3);
        }

        .code-block {
            background: #1f2937;
            border-radius: 8px;
            padding: 1rem;
            overflow-x: auto;
        }

        .feature-card:hover {
            transform: translateY(-4px);
            transition: all 0.3s ease;
        }

        .animate-float {
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        .animate-pulse-slow {
            animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm fixed w-full top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <div class="text-2xl font-bold text-indigo-600">🪝 EchoHook</div>
                </div>
                <div class="hidden md:block">
                    <div class="ml-10 flex items-baseline space-x-4">
                        <a href="#features" class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                        <a href="#getting-started" class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Getting Started</a>
                        <a href="#api" class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">API</a>
                        <a href="https://github.com/mpxr/echohook" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">GitHub</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-16 gradient-bg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center">
                <div class="animate-float mb-8">
                    <div class="text-8xl mb-4">🪝</div>
                </div>
                <h1 class="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span class="block">EchoHook</span>
                    <span class="block text-indigo-200">Webhook Bin Service</span>
                </h1>
                <p class="mt-3 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Capture, inspect, and debug HTTP webhooks with ease.
                </p>
                <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                    <div class="rounded-md shadow">
                        <a href="#getting-started" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                            Get Started
                        </a>
                    </div>
                    <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                        <a href="#features" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 md:py-4 md:text-lg md:px-10">
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Powerful Features
                </h2>
                <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                    Use our hosted service at echohook.dev or deploy your own instance - everything you need to test, debug, and monitor webhooks.
                </p>
            </div>

            <div class="mt-20">
                <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <!-- Feature 1 -->
                    <div class="feature-card glass-card rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl">
                                    🔐
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">Token Authentication</h3>
                            </div>
                        </div>
                        <div class="mt-4">
                            <p class="text-base text-gray-500">
                                Secure API access with Bearer tokens. Keep your webhook endpoints protected.
                            </p>
                        </div>
                    </div>

                    <!-- Feature 2 -->
                    <div class="feature-card glass-card rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white text-2xl">
                                    📡
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">Real-time Capture</h3>
                            </div>
                        </div>
                        <div class="mt-4">
                            <p class="text-base text-gray-500">
                                Instantly capture any HTTP method and payload. View webhooks as they arrive.
                            </p>
                        </div>
                    </div>

                    <!-- Feature 3 -->
                    <div class="feature-card glass-card rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white text-2xl">
                                    🔍
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">Request Inspection</h3>
                            </div>
                        </div>
                        <div class="mt-4">
                            <p class="text-base text-gray-500">
                                Deep dive into headers, body, query parameters, and metadata for debugging.
                            </p>
                        </div>
                    </div>

                    <!-- Feature 4 -->
                    <div class="feature-card glass-card rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white text-2xl">
                                    📦
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">Bin Management</h3>
                            </div>
                        </div>
                        <div class="mt-4">
                            <p class="text-base text-gray-500">
                                Create, update, and delete webhook bins. Organize your testing workflows.
                            </p>
                        </div>
                    </div>

                    <!-- Feature 5 -->
                    <div class="feature-card glass-card rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                                    ⚡
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">CloudFlare Powered</h3>
                            </div>
                        </div>
                        <div class="mt-4">
                            <p class="text-base text-gray-500">
                                Built on CloudFlare Workers and Durable Objects for global scale and reliability.
                            </p>
                        </div>
                    </div>

                    <!-- Feature 6 -->
                    <div class="feature-card glass-card rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white text-2xl">
                                    🔌
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">API First</h3>
                            </div>
                        </div>
                        <div class="mt-4">
                            <p class="text-base text-gray-500">
                                Complete REST API with programmatic access. Build automation and integrate with your tools.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Use Cases Section -->
    <section class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Perfect For
                </h2>
                <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                    Whether you're developing APIs or integrating with third-party services, EchoHook has you covered.
                </p>
            </div>

            <div class="mt-16">
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">🚀 API Development</h3>
                        <p class="text-gray-600">Test webhooks during development and ensure your integrations work perfectly.</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">🔗 Third-party Integration</h3>
                        <p class="text-gray-600">Debug webhooks from services like GitHub, Stripe, PayPal, and more.</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">📈 API Monitoring</h3>
                        <p class="text-gray-600">Monitor webhook delivery and payloads in real-time for production systems.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Getting Started Section -->
    <section id="getting-started" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Get Started in Minutes
                </h2>
                <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                    Use our hosted service instantly, or deploy your own EchoHook instance with these simple steps.
                </p>
            </div>

            <div class="mt-16">
                <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <!-- Step 1 -->
                    <div class="text-center">
                        <div class="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-2xl font-bold mx-auto mb-4">
                            1
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Create API Token</h3>
                        <div class="code-block text-left">
                            <pre class="text-green-400 text-sm"><code>curl -X POST https://echohook.dev/api/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Token"}'</code></pre>
                        </div>
                    </div>

                    <!-- Step 2 -->
                    <div class="text-center">
                        <div class="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-2xl font-bold mx-auto mb-4">
                            2
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Create Webhook Bin</h3>
                        <div class="code-block text-left">
                            <pre class="text-green-400 text-sm"><code>curl -X POST https://echohook.dev/api/bins \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Test Bin"}'</code></pre>
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="text-center">
                        <div class="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-2xl font-bold mx-auto mb-4">
                            3
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Send Webhooks</h3>
                        <div class="code-block text-left">
                            <pre class="text-green-400 text-sm"><code>curl -X POST https://echohook.dev/api/webhook/BIN_ID \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello webhook!"}'</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- API Endpoints Section -->
    <section id="api" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    API Endpoints
                </h2>
                <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                    Simple and intuitive REST API for all your webhook testing needs.
                </p>
            </div>

            <div class="mt-16">
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">Core Endpoints</h3>
                    </div>
                    <div class="divide-y divide-gray-200">
                        <div class="px-6 py-4 flex items-center justify-between">
                            <div>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">POST</span>
                                <span class="ml-3 text-sm font-mono text-gray-900">/api/auth/token</span>
                            </div>
                            <span class="text-sm text-gray-500">Create API token</span>
                        </div>
                        <div class="px-6 py-4 flex items-center justify-between">
                            <div>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span>
                                <span class="ml-3 text-sm font-mono text-gray-900">/api/bins</span>
                            </div>
                            <span class="text-sm text-gray-500">List webhook bins</span>
                        </div>
                        <div class="px-6 py-4 flex items-center justify-between">
                            <div>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">POST</span>
                                <span class="ml-3 text-sm font-mono text-gray-900">/api/bins</span>
                            </div>
                            <span class="text-sm text-gray-500">Create webhook bin</span>
                        </div>
                        <div class="px-6 py-4 flex items-center justify-between">
                            <div>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">GET</span>
                                <span class="ml-3 text-sm font-mono text-gray-900">/api/bins/:binId/requests</span>
                            </div>
                            <span class="text-sm text-gray-500">Get captured requests</span>
                        </div>
                        <div class="px-6 py-4 flex items-center justify-between">
                            <div>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">ANY</span>
                                <span class="ml-3 text-sm font-mono text-gray-900">/api/webhook/:binId</span>
                            </div>
                            <span class="text-sm text-gray-500">Capture webhook</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="gradient-bg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="text-center">
                <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
                    Ready to start testing webhooks?
                </h2>
                <p class="mt-4 text-xl text-indigo-100">
                    Start using EchoHook right away at echohook.dev, or deploy your own instance to CloudFlare Workers in seconds.
                </p>
                <div class="mt-8 flex justify-center space-x-4">
                    <a href="https://echohook.dev" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 2L3 7v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7l-7-5zM10 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 4c2.7 0 5.4 1.3 6 4H4c.6-2.7 3.3-4 6-4z" clip-rule="evenodd"></path>
                        </svg>
                        Use Hosted Service
                    </a>
                    <a href="https://github.com/mpxr/echohook" class="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-indigo-600">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path>
                        </svg>
                        Deploy Your Own
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="text-center">
                <div class="text-2xl font-bold text-white mb-4">🪝 EchoHook</div>
                <p class="text-gray-400 mb-8">Runs on the edge thanks to CloudFlare Workers, Hono, and Durable Objects</p>
                <div class="flex justify-center space-x-6">
                    <a href="https://github.com/mpxr/echohook" class="text-gray-400 hover:text-white">
                        <span class="sr-only">GitHub</span>
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Scroll to top function
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Add scroll effect to navigation
        window.addEventListener('scroll', function() {
            const nav = document.querySelector('nav');
            if (window.scrollY > 100) {
                nav.classList.add('backdrop-blur-md', 'bg-white/80');
            } else {
                nav.classList.remove('backdrop-blur-md', 'bg-white/80');
            }
        });

        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    </script>
</body>
</html>
`;
