# Vercel Deployment - Backend URL Setup

## ⚠️ CRITICAL: Environment Variable Setup

### **Step 1: Set Environment Variable in Vercel**

**Before deploying, you MUST set this in Vercel:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add this variable:

```
Name:  VITE_API_URL
Value: https://api.arpitdev.site
```

**Apply to:** All environments (Production, Preview, Development)

### **Step 2: Verify Build Settings**

Vercel → Settings → General:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **Step 3: Deploy**

After setting the environment variable:
1. Trigger a new deployment
2. OR push a new commit to trigger auto-deploy

---

## 🔍 How to Debug

### **Check 1: Environment Variable is Set**

After deployment, visit your site and open browser console:

```javascript
// This will NOT work in production (env vars are build-time only)
console.log(import.meta.env.VITE_API_URL);

// Instead, check the actual API calls in Network tab
```

### **Check 2: API Base URL**

In browser console on deployed site:

```javascript
// Check what URL the app is using
fetch('/api/books')
  .then(r => console.log('Response:', r))
  .catch(e => console.log('Error:', e));
```

If it tries to call `https://elib.arpitdev.site/api/books` instead of `https://api.arpitdev.site/api/books`, the env var isn't set!

### **Check 3: Network Tab**

1. Open DevTools → Network tab
2. Try to login
3. Check the request URL
4. Should be: `https://api.arpitdev.site/api/users/login`
5. NOT: `https://elib.arpitdev.site/api/users/login`

---

## ✅ Correct Configuration

### **Environment Variable (Vercel)**
```bash
VITE_API_URL=https://api.arpitdev.site
```

### **Expected API Calls**
```
Login:    https://api.arpitdev.site/api/users/login
Register: https://api.arpitdev.site/api/users/register
Books:    https://api.arpitdev.site/api/books
Upload:   https://api.arpitdev.site/api/books
Download: https://api.arpitdev.site/api/books/:id/download
Health:   https://api.arpitdev.site/health
```

### **Backend CORS (Already Set)**
```typescript
// backend/src/app.ts ✅
origin: ['https://elib.arpitdev.site']
```

---

## 🐛 Common Issues

### **Issue 1: API calls go to elib.arpitdev.site instead of api.arpitdev.site**

**Cause:** `VITE_API_URL` not set in Vercel

**Solution:**
1. Vercel → Settings → Environment Variables
2. Add `VITE_API_URL` = `https://api.arpitdev.site`
3. Redeploy

### **Issue 2: "Failed to fetch" errors**

**Cause:** CORS not configured or backend down

**Check:**
```bash
# Test if backend is up
curl https://api.arpitdev.site/health
# Should return: {"message":"OK"}

# Test CORS
curl -H "Origin: https://elib.arpitdev.site" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://api.arpitdev.site/api/users/login
```

### **Issue 3: Environment variable not updating**

**Cause:** Needs rebuild

**Solution:**
1. Vercel → Deployments
2. Click latest deployment → Redeploy
3. **Uncheck** "Use existing Build Cache"
4. Redeploy

---

## 📋 Deployment Checklist

Before deploying:

- [ ] Backend is deployed to `api.arpitdev.site`
- [ ] Backend accepts CORS from `elib.arpitdev.site`
- [ ] Test backend health: `curl https://api.arpitdev.site/health`
- [ ] Set `VITE_API_URL` in Vercel environment variables
- [ ] Pushed all code to GitHub
- [ ] Triggered Vercel deployment
- [ ] Hard refresh deployed site (Ctrl+Shift+R)
- [ ] Check Network tab to verify API calls

---

## 🔧 Quick Fix Commands

### **Test Backend**
```bash
# Health check
curl https://api.arpitdev.site/health

# Test CORS
curl -I -H "Origin: https://elib.arpitdev.site" https://api.arpitdev.site/api/books
```

### **Redeploy**
```bash
# Via CLI
vercel --prod

# Or just push to trigger auto-deploy
git push origin feature/backend
```

---

## 📱 After Deployment

1. Visit: `https://elib.arpitdev.site`
2. Open DevTools → Network tab
3. Try to login with test credentials
4. **Verify request URL shows:** `https://api.arpitdev.site/api/users/login`

If it shows `https://elib.arpitdev.site/api/...` → Environment variable not set!

---

**Remember:** Vite environment variables are **build-time only**. You must set them BEFORE building, and rebuild when you change them!
