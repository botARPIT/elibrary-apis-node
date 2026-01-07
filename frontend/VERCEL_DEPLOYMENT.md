# Vercel Deployment Guide

## Environment Variables Setup

This guide shows how to configure environment variables for deployment on Vercel.

---

## Quick Setup

### 1. In Vercel Dashboard

Go to your project → **Settings** → **Environment Variables**

Add the following variables:

| Variable Name | Value (Production) | Environment |
|--------------|-------------------|-------------|
| `VITE_API_URL` | `https://api.elibrary.com` | Production |
| `VITE_APP_NAME` | `E-Library` | All |
| `VITE_APP_VERSION` | `1.0.0` | All |
| `VITE_ENABLE_ANALYTICS` | `true` | Production |
| `VITE_ENABLE_DEBUG` | `false` | Production |
| `VITE_LOG_LEVEL` | `warn` | Production |

---

## Environment-Specific Configuration

### Production
```env
VITE_API_URL=https://api.elibrary.com
VITE_APP_NAME=E-Library
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_LOG_LEVEL=warn
```

### Preview (Staging)
```env
VITE_API_URL=https://staging-api.elibrary.com
VITE_APP_NAME=E-Library (Staging)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Development
```env
VITE_API_URL=/api
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=debug
```

---

## Vercel CLI Method

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variables
vercel env add VITE_API_URL production
# Enter value: https://api.elibrary.com

vercel env add VITE_ENABLE_ANALYTICS production
# Enter value: true

# Pull env vars to local
vercel env pull
```

---

## Using vercel.json

Create `vercel.json` in project root:

```json
{
  "build": {
    "env": {
      "VITE_API_URL": "https://api.elibrary.com",
      "VITE_APP_NAME": "E-Library",
      "VITE_APP_VERSION": "1.0.0",
      "VITE_ENABLE_ANALYTICS": "true",
      "VITE_ENABLE_DEBUG": "false",
      "VITE_LOG_LEVEL": "warn"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Note:** Environment variables in `vercel.json` are committed to git. Use Vercel dashboard for sensitive values.

---

## GitHub Integration

When using GitHub integration, set up environment variables in Vercel dashboard:

1. **Push to `main` branch** → Deploys to Production (uses Production env vars)
2. **Push to other branches** → Deploys to Preview (uses Preview env vars)
3. **Pull Requests** → Deploys to Preview

---

## Verification

After deployment, check the configuration:

```javascript
// In browser console on deployed site
console.log(window.location.origin);
// Should show your Vercel URL

// Test API call
fetch('/api/health')
  .then(r => r.json())
  .then(d => console.log('API Response:', d));
// If VITE_API_URL is set correctly, this should hit your backend
```

---

## Common Issues

### Issue 1: API calls failing

**Problem:** Frontend can't reach backend

**Solution:** Verify `VITE_API_URL` is set correctly:
- Should be full URL: `https://api.elibrary.com`
- NOT relative path: `/api` (only works with Vite proxy in dev)

### Issue 2: Environment variables not updating

**Problem:** Changed env vars but site still uses old values

**Solution:**
1. Redeploy the application (Vercel doesn't rebuild automatically)
2. Go to Deployments → Redeploy

### Issue 3: CORS errors

**Problem:** Backend rejects frontend requests

**Solution:** Update backend CORS configuration to allow Vercel domain:

```javascript
// backend/src/app.ts
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://elibrary.vercel.app',          // Add your Vercel domain
    'https://elibrary-staging.vercel.app',  // Add preview domain
  ],
  credentials: true,
};
```

---

## Build Configuration

Vercel automatically detects Vite. No additional configuration needed.

Default build settings:
```
Build Command:       npm run build
Output Directory:    dist
Install Command:     npm install
```

---

## Custom Domains

If using custom domain:

1. Add domain in Vercel dashboard
2. Update `VITE_API_URL` if needed
3. Update backend CORS to allow custom domain

---

## Best Practices

✅ **DO:**
- Use Vercel dashboard for environment variables
- Set different values for Production/Preview/Development
- Use full URLs in production (`https://api.elibrary.com`)
- Keep sensitive data in backend only

❌ **DON'T:**
- Commit `.env` files to git
- Put secrets in frontend env vars (they're public!)
- Use relative URLs in production
- Forget to update env vars when changing backends

---

## Example: Deploying Backend + Frontend

### 1. Deploy Backend
```bash
# Deploy backend to your hosting (Railway, Render, etc.)
# Get backend URL: https://api.elibrary.com
```

### 2. Configure Frontend
```bash
# In Vercel dashboard, set:
VITE_API_URL=https://api.elibrary.com
```

### 3. Deploy Frontend
```bash
git push origin main
# Vercel auto-deploys
```

### 4. Update Backend CORS
```javascript
// Add Vercel domain to CORS
origin: [
  'https://elibrary.vercel.app',
]
```

✅ Done!

---

## Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel CLI](https://vercel.com/docs/cli)

---

**Last Updated:** 2026-01-07
