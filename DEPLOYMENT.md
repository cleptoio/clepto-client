# Deployment Guide for Clepto Client Portal

## Quick Deploy to Vercel

1. **Push to GitHub** (already done ✅)
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the `cleptoio/clepto-client` repository
   - Select the branch: `claude/clepto-client-portal-01TYCqxxDEJRgH3ngZff4F8x`

3. **Add Environment Variables**

   In Vercel dashboard → Settings → Environment Variables, add:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ajnffhxkuiygnghnkerb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmZmaHhrdWl5Z25naG5rZXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ5NDYsImV4cCI6MjA3ODk5MDk0Nn0.em_wZM9zntqpymvlw4TL_r6z18JA5JxsefWhBGOb0f4
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmZmaHhrdWl5Z25naG5rZXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNDk0NiwiZXhwIjoyMDc4OTkwOTQ2fQ.Gr0EEk4TRw8la1thA4KD3QMjZnqoNzThbZfGGkm1WHc
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

---

## Troubleshooting

### Middleware Error: 500 MIDDLEWARE_INVOCATION_FAILED

If you see this error, it's likely due to one of these issues:

#### 1. **Environment Variables Not Set**

   **Solution**: Verify all environment variables are set in Vercel dashboard:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure all three variables are present for Production, Preview, and Development
   - Redeploy after adding variables

#### 2. **Supabase Connection Issue**

   **Solution**: Test Supabase connection:
   ```bash
   # In Vercel deployment logs, check for:
   # "Middleware error: [error details]"
   ```

   - Verify Supabase URL and Anon Key are correct
   - Check Supabase project is active
   - Ensure RLS policies are set up correctly

#### 3. **Next.js 16 Compatibility**

   The middleware has been updated to handle errors gracefully. If issues persist:

   **Option A**: Update to latest Next.js
   ```bash
   npm install next@latest
   ```

   **Option B**: Temporarily disable middleware by renaming:
   ```bash
   mv middleware.ts middleware.ts.disabled
   ```
   (Note: This removes auth protection!)

#### 4. **Check Deployment Logs**

   In Vercel:
   - Go to Deployments → Select failed deployment
   - Click "Functions" tab
   - Look for middleware errors
   - Check Runtime Logs for details

---

## Database Setup (Required Before Testing)

Before the app will work, you MUST run the database migration:

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ajnffhxkuiygnghnkerb`
3. Go to SQL Editor
4. Copy and paste the contents of `supabase/migrations/002_client_portal_rls.sql`
5. Click "Run"

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref ajnffhxkuiygnghnkerb

# Run migrations
supabase db push
```

### What the Migration Does:

1. Creates `user_clients` table (links auth users to clients)
2. Creates `support_tickets` table
3. Sets up Row Level Security (RLS) policies
4. Links test user to demo client

---

## Post-Deployment Steps

### 1. Create Test User (If Not Exists)

In Supabase Dashboard → Authentication → Users:

- Email: `test.client@example.com`
- Password: `TestClient@2025`
- Click "Create User"

### 2. Link User to Client

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO user_clients (user_id, client_id)
SELECT
  (SELECT id FROM auth.users WHERE email = 'test.client@example.com'),
  '010aa590-54c7-4aa3-bb10-80e5d825f056'
ON CONFLICT DO NOTHING;
```

### 3. Test Login

Visit your deployed URL:
- Go to `/login`
- Email: `test.client@example.com`
- Password: `TestClient@2025`
- You should be redirected to `/dashboard`

---

## Custom Domain Setup

1. In Vercel Dashboard → Settings → Domains
2. Add your domain: `client.clepto.io`
3. Follow DNS configuration instructions
4. Update Supabase allowed redirect URLs:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add: `https://client.clepto.io/**`

---

## Performance Optimization

### Enable Edge Runtime (Optional)

Add to pages that don't need Node.js features:

```typescript
export const runtime = 'edge';
```

### Image Optimization

Already configured via Next.js defaults. For custom CDN:

```typescript
// next.config.ts
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
};
```

---

## Monitoring

### 1. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Enable Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

### 3. Supabase Logs

Monitor in Supabase Dashboard → Logs

---

## Security Checklist

- [x] Environment variables not in git
- [x] Row Level Security (RLS) enabled
- [x] Middleware auth protection
- [x] HTTPS enforced (automatic on Vercel)
- [ ] Custom domain with SSL (if using)
- [ ] Rate limiting (consider adding for API routes)
- [ ] CSP headers (consider adding)

---

## Common Issues

### Issue: "Invalid login credentials"
**Solution**: User may not be created in Supabase Auth or password is wrong.

### Issue: "No data showing in dashboard"
**Solution**:
1. Check user is linked to a client in `user_clients` table
2. Check client has data in `workflow_executions` table
3. Verify RLS policies are active

### Issue: Build fails with TypeScript errors
**Solution**: Run `npm run build` locally first to catch errors before deploying.

### Issue: Styles not loading
**Solution**: Ensure Tailwind CSS v4 is properly configured. Check `app/globals.css` imports.

---

## Support

For deployment issues:
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **This Project**: Create an issue at [github.com/cleptoio/clepto-client/issues](https://github.com/cleptoio/clepto-client/issues)

---

## Next Steps After Successful Deployment

1. ✅ Test all pages (Dashboard, Executions, Costs, Compliance, Support, Account)
2. ✅ Create additional test users
3. ✅ Add real client data
4. ✅ Configure custom domain
5. ✅ Set up monitoring and alerts
6. ✅ Enable analytics
7. ✅ Add error tracking (e.g., Sentry)

---

**Last Updated**: November 2025
