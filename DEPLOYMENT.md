# AssessAI Deployment Guide

## Quick Start
```bash
# Install dependencies
npm ci

# Build production bundle
npm run build

# Deploy to Vercel (requires VERCEL_TOKEN in secrets)
npx vercel --prod
```

## Environment Variables
Create `.env.local` with:
```
NEXT_PUBLIC_AI_API_KEY=your_api_key
NODE_ENV=production
```

## Vercel Configuration
1. Set build command: `next build`
2. Add environment variables in project settings
3. Set output directory to `.next`

## Security Enhancements
Added Content-Security-Policy headers and optimized caching in `next.config.ts`

## CI/CD Pipeline (GitHub Actions)
```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v30
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Monitoring
1. Add Logtail integration for error tracking
2. Configure Vercel analytics
3. Set up uptime monitoring