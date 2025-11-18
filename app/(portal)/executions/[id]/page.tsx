import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ExecutionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExecutionDetailPage({
  params,
}: ExecutionDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  // Get user's client
  const { data: userClient } = await supabase
    .from("user_clients")
    .select("client_id")
    .eq("user_id", user.id)
    .single();

  if (!userClient) {
    return notFound();
  }

  // Fetch execution
  const { data: execution, error } = await supabase
    .from("workflow_executions")
    .select("*")
    .eq("id", id)
    .eq("client_id", userClient.client_id)
    .single();

  if (error || !execution) {
    return notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="success" className="text-base">Success</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-base">Failed</Badge>;
      case "running":
        return <Badge variant="info" className="text-base">Running</Badge>;
      default:
        return <Badge variant="secondary" className="text-base">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/executions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Execution Details
            </h1>
            <p className="text-muted-foreground">
              {execution.workflow_name || "Unnamed Workflow"}
            </p>
          </div>
        </div>
      </div>

      {/* Execution Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Execution ID
              </p>
              <p className="text-sm font-mono">{execution.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(execution.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Workflow Name
              </p>
              <p className="text-sm">{execution.workflow_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Executed At
              </p>
              <p className="text-sm">
                {format(new Date(execution.executed_at), "PPpp")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">{execution.duration_ms || 0} ms</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Cost
              </p>
              <p className="text-sm font-bold">
                ${(execution.cost || 0).toFixed(4)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Details */}
      <Card>
        <CardHeader>
          <CardTitle>AI Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                AI Model
              </p>
              <p className="text-sm">{execution.ai_model || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Provider
              </p>
              <p className="text-sm">{execution.ai_provider || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tokens Used
              </p>
              <p className="text-sm">{execution.tokens_used || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Cost per Token
              </p>
              <p className="text-sm">
                {execution.tokens_used && execution.cost
                  ? `$${(execution.cost / execution.tokens_used).toFixed(6)}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Data */}
      {execution.input_data && (
        <Card>
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
              {JSON.stringify(execution.input_data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Output Data */}
      {execution.output_data && (
        <Card>
          <CardHeader>
            <CardTitle>Output Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
              {JSON.stringify(execution.output_data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {execution.status === "failed" && execution.error_message && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Error Message
                </p>
                <p className="text-sm text-destructive">
                  {execution.error_message}
                </p>
              </div>
              {execution.stack_trace && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Stack Trace
                  </p>
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-48 text-xs">
                    {execution.stack_trace}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
