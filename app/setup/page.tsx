"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface HealthCheck {
  timestamp: string;
  environment: {
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    supabaseServiceRole: boolean;
  };
  database: {
    connected: boolean;
    userClientsTable: boolean;
    supportTicketsTable: boolean;
    error: string | null;
  };
  status: string;
  message?: string;
}

export default function SetupPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const StatusIcon = ({ status }: { status: boolean }) => {
    if (status) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Clepto Client Portal Setup</h1>
          <p className="text-muted-foreground mt-2">
            Diagnostic tool to verify your deployment configuration
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : health ? (
          <>
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {health.status === "healthy" ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : health.status === "partial" ? (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span>
                    {health.status === "healthy"
                      ? "System Healthy"
                      : health.status === "partial"
                      ? "Partial Setup"
                      : "Setup Required"}
                  </span>
                </CardTitle>
                {health.message && (
                  <CardDescription className="text-red-600">{health.message}</CardDescription>
                )}
              </CardHeader>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Required configuration for Supabase connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
                  <StatusIcon status={health.environment.supabaseUrl} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  <StatusIcon status={health.environment.supabaseAnonKey} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SUPABASE_SERVICE_ROLE_KEY</span>
                  <StatusIcon status={health.environment.supabaseServiceRole} />
                </div>
                {(!health.environment.supabaseUrl || !health.environment.supabaseAnonKey) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Action Required:</strong> Add environment variables in Vercel Dashboard
                      → Settings → Environment Variables
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Status */}
            <Card>
              <CardHeader>
                <CardTitle>Database</CardTitle>
                <CardDescription>Database connection and table verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection</span>
                  <StatusIcon status={health.database.connected} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">user_clients table</span>
                  <StatusIcon status={health.database.userClientsTable} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">support_tickets table</span>
                  <StatusIcon status={health.database.supportTicketsTable} />
                </div>
                {health.database.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800 font-mono">{health.database.error}</p>
                  </div>
                )}
                {(!health.database.userClientsTable || !health.database.supportTicketsTable) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800 font-semibold mb-2">
                      Action Required: Run Database Migration
                    </p>
                    <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                      <li>Go to Supabase Dashboard → SQL Editor</li>
                      <li>
                        Copy contents from:{" "}
                        <code className="bg-yellow-100 px-1 rounded">
                          supabase/migrations/002_client_portal_rls.sql
                        </code>
                      </li>
                      <li>Paste and run the SQL</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button onClick={checkHealth} variant="outline">
                Refresh Status
              </Button>
              {health.status === "healthy" && (
                <Button onClick={() => (window.location.href = "/login")}>
                  Go to Login
                </Button>
              )}
            </div>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  1. Ensure all environment variables are set and the database migration has run
                </p>
                <p>
                  2. Create a test user in Supabase Auth:{" "}
                  <code className="bg-muted px-1 rounded">test.client@example.com</code>
                </p>
                <p>
                  3. Link the user to a client in the{" "}
                  <code className="bg-muted px-1 rounded">user_clients</code> table
                </p>
                <p className="text-muted-foreground">
                  For detailed instructions, see{" "}
                  <a
                    href="https://github.com/cleptoio/clepto-client/blob/main/DEPLOYMENT.md"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    DEPLOYMENT.md
                  </a>
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Failed to load health check</p>
              <Button onClick={checkHealth} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
