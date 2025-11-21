-- ============================================
-- CORRECTED DUMMY DATA (Run AFTER fix-schema.sql)
-- ============================================

-- Clear existing dummy data (optional)
-- DELETE FROM workflow_executions;
-- DELETE FROM support_tickets;
-- DELETE FROM projects;
-- DELETE FROM dpa_signatures;
-- DELETE FROM sub_processors;
-- DELETE FROM admin_notes;
-- DELETE FROM clients WHERE email LIKE '%@acmecorp.com' OR email LIKE '%@techstart.io';

-- ============================================
-- 1. INSERT CLIENT DATA
-- ============================================
INSERT INTO clients (id, name, email, company, industry, status, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john.smith@acmecorp.com', 'Acme Corporation', 'Technology', 'active', NOW() - INTERVAL '90 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah.j@techstart.io', 'TechStart Inc', 'SaaS', 'active', NOW() - INTERVAL '60 days'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Michael Chen', 'michael@innovate.co', 'Innovate Labs', 'Marketing', 'active', NOW() - INTERVAL '30 days')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. INSERT PROJECTS
-- ============================================
INSERT INTO projects (id, client_id, name, description, status, budget, created_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'AI Marketing Automation', 'Automated email campaigns and social media content generation', 'active', 15000.00, NOW() - INTERVAL '60 days'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Customer Support AI', 'Intelligent chatbot for handling customer inquiries 24/7', 'active', 25000.00, NOW() - INTERVAL '45 days'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Content Generation Pipeline', 'Automated blog posts, product descriptions, and SEO content', 'completed', 12000.00, NOW() - INTERVAL '90 days'),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Sales Email Optimizer', 'AI system to optimize sales emails', 'active', 20000.00, NOW() - INTERVAL '30 days'),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Lead Qualification Bot', 'Automated lead scoring', 'in_planning', 18000.00, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. INSERT WORKFLOW EXECUTIONS (CORRECTED)
-- ============================================
INSERT INTO workflow_executions (
  client_id, project_id, workflow_name, status, ai_model, ai_provider, model_used,
  tokens_used, input_tokens, output_tokens, cost, duration_ms,
  start_time, end_time, input_data, output_data, executed_at
)
VALUES
  -- Recent successful executions
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Email Campaign Generator', 'success', 'gpt-4', 'openai', 'gpt-4', 2140, 1250, 890, 0.045, 45000, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '45 seconds', '{"campaign_type": "product_launch"}'::jsonb, '{"emails_generated": 5}'::jsonb, NOW() - INTERVAL '2 hours'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Social Media Content Creator', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 3600, 2100, 1500, 0.082, 72000, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours' + INTERVAL '1 minute 12 seconds', '{"platform": "linkedin"}'::jsonb, '{"posts_created": 3}'::jsonb, NOW() - INTERVAL '5 hours'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Customer Support Responder', 'success', 'gpt-4-turbo', 'openai', 'gpt-4-turbo', 1540, 890, 650, 0.032, 35000, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours' + INTERVAL '35 seconds', '{"ticket_type": "billing"}'::jsonb, '{"response_generated": true}'::jsonb, NOW() - INTERVAL '8 hours'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'SEO Blog Writer', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 6300, 3500, 2800, 0.125, 125000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes 5 seconds', '{"topic": "AI in healthcare"}'::jsonb, '{"word_count": 1500}'::jsonb, NOW() - INTERVAL '1 day'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Lead Qualification Bot', 'success', 'gpt-4', 'openai', 'gpt-4', 1850, 1100, 750, 0.038, 42000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '42 seconds', '{"lead_source": "website"}'::jsonb, '{"score": 85}'::jsonb, NOW() - INTERVAL '1 day'),

  -- Failed executions
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Data Analysis Pipeline', 'failed', 'gpt-4', 'openai', 'gpt-4', 570, 450, 120, 0.015, 15000, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 seconds', '{"data_source": "csv"}'::jsonb, NULL, NOW() - INTERVAL '2 days'),

  -- Past week
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Email Campaign Generator', 'success', 'gpt-4', 'openai', 'gpt-4', 2220, 1300, 920, 0.047, 48000, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '48 seconds', '{"campaign_type": "newsletter"}'::jsonb, '{"emails_generated": 3}'::jsonb, NOW() - INTERVAL '3 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Product Description Writer', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 3200, 1800, 1400, 0.068, 65000, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '1 minute 5 seconds', '{"product_category": "software"}'::jsonb, '{"descriptions": 10}'::jsonb, NOW() - INTERVAL '4 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Customer Support Responder', 'success', 'gpt-4-turbo', 'openai', 'gpt-4-turbo', 1600, 920, 680, 0.034, 38000, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '38 seconds', '{"ticket_type": "technical"}'::jsonb, '{"resolved": true}'::jsonb, NOW() - INTERVAL '5 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Social Media Content Creator', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 3800, 2200, 1600, 0.088, 78000, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '1 minute 18 seconds', '{"platform": "twitter"}'::jsonb, '{"posts": 5}'::jsonb, NOW() - INTERVAL '6 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'SEO Blog Writer', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 6500, 3600, 2900, 0.128, 130000, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '2 minutes 10 seconds', '{"topic": "remote work"}'::jsonb, '{"word_count": 1800}'::jsonb, NOW() - INTERVAL '7 days'),

  -- Past 2-3 weeks
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Email Campaign Generator', 'success', 'gpt-4', 'openai', 'gpt-4', 2160, 1280, 900, 0.046, 46000, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '46 seconds', '{"campaign_type": "promo"}'::jsonb, '{"emails": 4}'::jsonb, NOW() - INTERVAL '10 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Lead Qualification Bot', 'success', 'gpt-4', 'openai', 'gpt-4', 1930, 1150, 780, 0.040, 44000, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '44 seconds', '{"lead_source": "linkedin"}'::jsonb, '{"score": 92}'::jsonb, NOW() - INTERVAL '12 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Customer Support Responder', 'success', 'gpt-4-turbo', 'openai', 'gpt-4-turbo', 1520, 880, 640, 0.031, 34000, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '34 seconds', '{"ticket_type": "account"}'::jsonb, '{"resolved": true}'::jsonb, NOW() - INTERVAL '14 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Social Media Content Creator', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 3700, 2150, 1550, 0.085, 75000, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '1 minute 15 seconds', '{"platform": "instagram"}'::jsonb, '{"posts": 4}'::jsonb, NOW() - INTERVAL '16 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Product Description Writer', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 3300, 1850, 1450, 0.070, 70000, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '1 minute 8 seconds', '{"product_category": "electronics"}'::jsonb, '{"descriptions": 8}'::jsonb, NOW() - INTERVAL '18 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'SEO Blog Writer', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 6400, 3550, 2850, 0.127, 127000, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '2 minutes 8 seconds', '{"topic": "cybersecurity"}'::jsonb, '{"word_count": 1700}'::jsonb, NOW() - INTERVAL '20 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Email Campaign Generator', 'success', 'gpt-4', 'openai', 'gpt-4', 2180, 1290, 910, 0.046, 47000, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days' + INTERVAL '47 seconds', '{"campaign_type": "webinar"}'::jsonb, '{"emails": 3}'::jsonb, NOW() - INTERVAL '22 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Lead Qualification Bot', 'success', 'gpt-4', 'openai', 'gpt-4', 1880, 1120, 760, 0.039, 43000, NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days' + INTERVAL '43 seconds', '{"lead_source": "trade_show"}'::jsonb, '{"score": 68}'::jsonb, NOW() - INTERVAL '24 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Customer Support Responder', 'success', 'gpt-4-turbo', 'openai', 'gpt-4-turbo', 1560, 900, 660, 0.033, 36000, NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days' + INTERVAL '36 seconds', '{"ticket_type": "feature"}'::jsonb, '{"forwarded": true}'::jsonb, NOW() - INTERVAL '26 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Social Media Content Creator', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 3760, 2180, 1580, 0.086, 77000, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days' + INTERVAL '1 minute 17 seconds', '{"platform": "facebook"}'::jsonb, '{"posts": 3}'::jsonb, NOW() - INTERVAL '28 days'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Product Description Writer', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 3180, 1820, 1420, 0.069, 69000, NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days' + INTERVAL '1 minute 6 seconds', '{"product_category": "home"}'::jsonb, '{"descriptions": 12}'::jsonb, NOW() - INTERVAL '29 days'),

  -- Running executions
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Data Analysis Pipeline', 'running', 'gpt-4', 'openai', 'gpt-4', 2500, 2500, 0, 0.0, 0, NOW() - INTERVAL '5 minutes', NULL, '{"data_source": "api"}'::jsonb, NULL, NOW() - INTERVAL '5 minutes'),

  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Report Generator', 'running', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 0, 0, 0, 0.0, 0, NOW() - INTERVAL '2 minutes', NULL, '{"report_type": "monthly"}'::jsonb, NULL, NOW() - INTERVAL '2 minutes'),

  -- Client 2
  ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Sales Email Optimizer', 'success', 'gpt-4', 'openai', 'gpt-4', 1680, 980, 700, 0.036, 40000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '40 seconds', '{"email_type": "cold"}'::jsonb, '{"optimized": true}'::jsonb, NOW() - INTERVAL '1 day'),

  ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Sales Email Optimizer', 'success', 'claude-3-5-sonnet-20241022', 'anthropic', 'claude-3-5-sonnet-20241022', 2400, 1400, 1000, 0.055, 58000, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '58 seconds', '{"email_type": "follow_up"}'::jsonb, '{"variants": 2}'::jsonb, NOW() - INTERVAL '3 days'),

  -- Client 3
  ('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Lead Qualification Bot', 'success', 'gpt-4', 'openai', 'gpt-4', 1750, 1020, 730, 0.037, 41000, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours' + INTERVAL '41 seconds', '{"lead_source": "webinar"}'::jsonb, '{"score": 88}'::jsonb, NOW() - INTERVAL '6 hours');

-- ============================================
-- 4. INSERT SUPPORT TICKETS
-- ============================================
INSERT INTO support_tickets (client_id, subject, description, status, priority, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Email workflow not triggering', 'The email campaign generator workflow is not triggering automatically as scheduled.', 'open', 'high', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440001', 'API rate limit questions', 'We are approaching our API rate limits. Can we discuss upgrading?', 'in_progress', 'medium', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Request for new integration', 'Would like to integrate with HubSpot for better CRM automation.', 'open', 'low', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Cost optimization consultation', 'Looking for ways to optimize our AI costs.', 'resolved', 'medium', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Dashboard loading slowly', 'The analytics dashboard takes a long time to load.', 'in_progress', 'medium', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Workflow execution failed', 'Our lead qualification workflow failed with an error.', 'resolved', 'high', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days');

-- ============================================
-- 5. INSERT SUB-PROCESSORS
-- ============================================
INSERT INTO sub_processors (name, service, location, purpose, status, added_at)
VALUES
  ('OpenAI LLC', 'AI Model API - GPT-4', 'United States', 'AI text generation and processing', 'active', NOW() - INTERVAL '365 days'),
  ('Anthropic PBC', 'AI Model API - Claude', 'United States', 'AI language understanding and generation', 'active', NOW() - INTERVAL '365 days'),
  ('Supabase Inc', 'Database Services', 'European Union', 'Application database and authentication', 'active', NOW() - INTERVAL '365 days'),
  ('Vercel Inc', 'Web Hosting', 'Global', 'Application hosting and CDN', 'active', NOW() - INTERVAL '365 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. INSERT DPA SIGNATURES
-- ============================================
INSERT INTO dpa_signatures (client_id, signed_at, version, ip_address, signer_name, signer_email)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '85 days', 'v2.1', '192.168.1.100', 'John Smith', 'john.smith@acmecorp.com'),
  ('550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '55 days', 'v2.1', '192.168.1.101', 'Sarah Johnson', 'sarah.j@techstart.io'),
  ('550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '28 days', 'v2.1', '192.168.1.102', 'Michael Chen', 'michael@innovate.co')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. INSERT ADMIN NOTES
-- ============================================
INSERT INTO admin_notes (client_id, author, note, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Admin', 'Client requested enterprise pricing. Scheduled call for next Tuesday.', NOW() - INTERVAL '5 days'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Mike Support', 'Resolved API rate limit issue by upgrading to Pro plan.', NOW() - INTERVAL '8 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Admin', 'New client onboarding completed.', NOW() - INTERVAL '55 days'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sarah Admin', 'Fast-growing startup. Keep an eye on usage patterns.', NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;
