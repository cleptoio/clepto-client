-- Link users to clients (authentication → client mapping)
CREATE TABLE IF NOT EXISTS user_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for client portal access
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Clients can ONLY see their own data

-- user_clients: Users see only their own mappings
CREATE POLICY "Users can view their own client mappings" ON user_clients
    FOR SELECT USING (auth.uid() = user_id);

-- clients: Users can only see clients they're linked to
DROP POLICY IF EXISTS "Admin full access to clients" ON clients;
CREATE POLICY "Users can view their linked clients" ON clients
    FOR SELECT USING (
        id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
    );

-- projects: Users see only projects for their clients
DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
CREATE POLICY "Users can view their client projects" ON projects
    FOR SELECT USING (
        client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
    );

-- workflow_executions: Users see only their client's executions
DROP POLICY IF EXISTS "Admin full access to executions" ON workflow_executions;
CREATE POLICY "Users can view their client executions" ON workflow_executions
    FOR SELECT USING (
        client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
    );

-- support_tickets: Users can view and create their own tickets
CREATE POLICY "Users can view their client tickets" ON support_tickets
    FOR SELECT USING (
        client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create tickets for their clients" ON support_tickets
    FOR INSERT WITH CHECK (
        client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
    );

-- Link test user to demo client
INSERT INTO user_clients (user_id, client_id)
SELECT
    (SELECT id FROM auth.users WHERE email = 'test.client@example.com'),
    '010aa590-54c7-4aa3-bb10-80e5d825f056'
ON CONFLICT DO NOTHING;
