# 📝 UPDATE YOUR .env FILE AFTER DEPLOYMENT

## After your worker deploys successfully, you'll get a URL like:
```
https://your-chosen-subdomain.workers.dev
```

## Open your .env file and replace this line:
```
VITE_WORKER_URL="https://your-chosen-subdomain.workers.dev"
```

## With your actual URL, for example:
```
VITE_WORKER_URL="https://maxterra-pdf-builder.workers.dev"
```

## Then restart your development server:
```bash
npm run dev
```

## Test your PDF generation - it should now use the Cloudflare Worker!
