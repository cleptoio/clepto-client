# Clepto Client Portal

A production-ready client portal for Clepto.io built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Authentication**: Secure login with Supabase Auth
- **Dashboard**: Overview of workflow executions, success rates, and AI costs
- **Executions**: View and filter workflow execution history
- **Costs Analytics**: Track AI usage costs by provider and workflow
- **Compliance**: View DPA, sub-processors, and data rights information
- **Support**: Submit and manage support tickets
- **Account Management**: View profile and security information
- **Row Level Security**: Clients can ONLY see their own data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/cleptoio/clepto-client.git
cd clepto-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**IMPORTANT**: Never commit `.env.local` to git. Use `.env.example` as a template.

### 4. Database Setup

#### Run the Migration

Apply the database migration to set up tables and RLS policies:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL file
# supabase/migrations/002_client_portal_rls.sql
```

The migration creates:
- `user_clients` table (links auth users to clients)
- `support_tickets` table
- Row Level Security (RLS) policies for all tables

#### Link a User to a Client

After creating a user in Supabase Auth, link them to a client:

```sql
INSERT INTO user_clients (user_id, client_id)
VALUES (
  'user-uuid-from-auth-users',
  'client-uuid-from-clients-table'
);
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test Login

Use the test credentials:
- **Email**: test.client@example.com
- **Password**: TestClient@2025
- **Client ID**: 010aa590-54c7-4aa3-bb10-80e5d825f056

## Project Structure

```
clepto-client/
├── app/                      # Next.js App Router
│   ├── (portal)/            # Authenticated routes
│   │   ├── dashboard/       # Dashboard page
│   │   ├── executions/      # Executions list & detail
│   │   ├── costs/           # Cost analytics
│   │   ├── compliance/      # Compliance information
│   │   ├── support/         # Support center
│   │   ├── account/         # Account settings
│   │   └── layout.tsx       # Portal layout with nav
│   ├── login/               # Login page
│   ├── api/auth/logout/     # Logout API route
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   └── page.tsx             # Home (redirects to dashboard)
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── logout-button.tsx    # Logout button component
├── lib/                     # Utilities
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Client-side
│   │   └── server.ts       # Server-side
│   └── utils.ts            # Utility functions
├── supabase/               # Database
│   └── migrations/         # SQL migrations
├── middleware.ts           # Auth middleware
└── .env.local             # Environment variables (not committed)
```

## Database Schema

### Key Tables

- **clients**: Client organizations
- **projects**: Projects for each client
- **workflow_executions**: AI workflow execution logs
- **user_clients**: Maps auth users to clients (for RLS)
- **support_tickets**: Support ticket submissions

### Row Level Security (RLS)

All tables have RLS policies that ensure:
- Users can only view data for clients they're linked to
- No cross-client data access
- Automatic filtering at the database level

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# Or use Vercel CLI
vercel --prod
```

### Environment Variables for Production

Add these to Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Features

- **Row Level Security**: Database-level access control
- **Authentication Required**: All routes protected except login
- **Session Management**: Automatic session refresh
- **HTTPS Only**: Enforced in production
- **No Secrets in Code**: All credentials in environment variables

## Adding New Users

To add a new client user:

1. Create user in Supabase Auth dashboard or via API
2. Link user to their client:

```sql
INSERT INTO user_clients (user_id, client_id)
VALUES ('auth-user-uuid', 'client-uuid');
```

3. User can now log in and see only their client's data

## Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Adding New Features

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Ensure RLS policies are correct
5. Create pull request

## Support

For issues or questions:
- **Email**: support@clepto.io
- **GitHub Issues**: [github.com/cleptoio/clepto-client/issues](https://github.com/cleptoio/clepto-client/issues)

## License

Proprietary - Clepto.io

---

Built with ❤️ by the Clepto.io team
