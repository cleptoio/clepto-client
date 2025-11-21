export interface Client {
  id: string;
  name: string;
  email: string;
  industry: string | null;
  status: string;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  client_id: string;
  workflow_name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  start_time: string;
  end_time: string | null;
  ai_provider: string;
  cost: number;
  input_tokens: number;
  output_tokens: number;
  model_used: string;
  execution_metadata: any;
}

export interface SupportTicket {
  id: string;
  client_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

export interface ComplianceRecord {
  id: string;
  record_type: string;
  content: string;
  effective_date: string;
}

export interface SubProcessor {
  id: string;
  name: string;
  service: string;
  location: string;
  purpose: string;
}

export interface DPASignature {
  id: string;
  client_id: string;
  signed_at: string;
  ip_address: string;
  signature_data: any;
}

export interface UserClient {
  user_id: string;
  client_id: string;
}
