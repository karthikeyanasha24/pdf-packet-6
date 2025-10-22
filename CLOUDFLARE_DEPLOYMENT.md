# 🚀 Cloudflare Worker Deployment Guide

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Node.js**: Version 18 or higher
3. **Wrangler CLI**: Cloudflare's command-line tool

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 3: Navigate to Worker Directory

```bash
cd worker
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Deploy to Cloudflare

### For Development/Testing:
```bash
npm run deploy:staging
```

### For Production:
```bash
npm run deploy:production
```

## Step 6: Get Your Worker URL

After deployment, Wrangler will show your worker URL:
```
Published maxterra-pdf-worker (1.23s)
  https://maxterra-pdf-worker.your-subdomain.workers.dev
```

## Step 7: Update Frontend Configuration

1. Copy your worker URL from the deployment output
2. Update your `.env` file:
```bash
VITE_WORKER_URL=https://maxterra-pdf-worker.your-subdomain.workers.dev
```

## Step 8: Test the Integration

1. Start your frontend development server:
```bash
npm run dev
```

2. Test PDF generation to ensure it's using the Cloudflare Worker

## Local Development

To run the worker locally for development:

```bash
cd worker
npm run dev
```

This starts the worker at `http://localhost:8787`

## Environment Variables

Configure these in your Cloudflare dashboard or wrangler.toml:

- `CORS_ORIGIN`: Set to your frontend domain for production
- Add any other environment variables as needed

## Monitoring

Monitor your worker in the Cloudflare dashboard:
1. Go to Workers & Pages
2. Click on your worker
3. View metrics, logs, and performance data

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure CORS_ORIGIN is set correctly
2. **Memory Limits**: Large PDFs may hit worker limits
3. **Timeout**: Increase CPU time limits in wrangler.toml
4. **Authentication**: Re-run `wrangler login` if needed

### Debugging:

```bash
# View worker logs
wrangler tail

# Test worker directly
curl -X POST https://your-worker.workers.dev/health
```

## Cost Optimization

- Workers have generous free tier (100,000 requests/day)
- Monitor usage in Cloudflare dashboard
- Consider caching strategies for frequently accessed PDFs

## Security

- Set CORS_ORIGIN to your specific domain in production
- Consider adding API authentication for sensitive documents
- Monitor for abuse in Cloudflare analytics
