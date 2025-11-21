# Authentication Setup Guide

## Issue 2: User Authentication & Client Linking

Your app requires a logged-in user that is linked to a client. Follow these steps:

## Step 1: Create a Test User in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `john.smith@acmecorp.com`
   - **Password**: `TestPassword123!`
   - Check **"Auto Confirm User"** (important!)
4. Click **"Create user"**
5. **Copy the User ID** (it looks like: `a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8`)

## Step 2: Link User to Client

Run this SQL in **Supabase SQL Editor** (replace `YOUR_USER_ID` with the copied ID):

```sql
INSERT INTO user_clients (user_id, client_id, created_at)
VALUES
  ('YOUR_USER_ID', '550e8400-e29b-41d4-a716-446655440001', NOW());
```

Example:
```sql
INSERT INTO user_clients (user_id, client_id, created_at)
VALUES
  ('a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', '550e8400-e29b-41d4-a716-446655440001', NOW());
```

## Step 3: Test Login

1. Go to your deployed app (or localhost)
2. Navigate to `/login` page
3. Login with:
   - **Email**: `john.smith@acmecorp.com`
   - **Password**: `TestPassword123!`
4. You should now see data!

## Create Additional Test Users (Optional)

For Client 2 (Sarah Johnson):
```sql
-- After creating user in Supabase Auth, run:
INSERT INTO user_clients (user_id, client_id, created_at)
VALUES
  ('SARAH_USER_ID', '550e8400-e29b-41d4-a716-446655440002', NOW());
```

For Client 3 (Michael Chen):
```sql
-- After creating user in Supabase Auth, run:
INSERT INTO user_clients (user_id, client_id, created_at)
VALUES
  ('MICHAEL_USER_ID', '550e8400-e29b-41d4-a716-446655440003', NOW());
```

## Troubleshooting

### No data showing after login?
1. Check browser console for errors
2. Verify the user_clients record exists:
   ```sql
   SELECT * FROM user_clients WHERE user_id = 'YOUR_USER_ID';
   ```
3. Verify client exists:
   ```sql
   SELECT * FROM clients WHERE id = '550e8400-e29b-41d4-a716-446655440001';
   ```

### Still seeing "No executions yet"?
1. Verify workflow_executions data:
   ```sql
   SELECT COUNT(*) FROM workflow_executions
   WHERE client_id = '550e8400-e29b-41d4-a716-446655440001';
   ```
2. Check if start_time column exists:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'workflow_executions';
   ```

### Environment Variables Missing?
Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)
