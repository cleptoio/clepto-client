import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's client
  const { data: userClient } = await supabase
    .from("user_clients")
    .select("client_id, clients(name)")
    .eq("user_id", user.id)
    .single();

  const clientId = userClient?.client_id;
  const clientName = (userClient?.clients as any)?.name || "Client";

  // Get recent executions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: executions } = await supabase
    .from("workflow_executions")
    .select("*")
    .eq("client_id", clientId)
    .gte("executed_at", thirtyDaysAgo.toISOString())
    .order("executed_at", { ascending: false })
    .limit(10);

  const safeExecutions = executions || [];

  // Calculate metrics
  const totalExecutions = safeExecutions.length;
  const successfulExecutions = safeExecutions.filter(
    (e) => e.status === "success"
  ).length;
  const successRate =
    totalExecutions > 0
      ? ((successfulExecutions / totalExecutions) * 100).toFixed(1)
      : "0.0";
  const totalCost = safeExecutions
    .reduce((sum, e) => sum + (e.cost || 0), 0)
    .toFixed(2);
  const avgExecutionTime =
    totalExecutions > 0
      ? (
          safeExecutions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) /
          totalExecutions
        ).toFixed(0)
      : "0";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="success">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "running":
        return <Badge variant="info">Running</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {clientName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your workflows
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulExecutions} successful
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Execution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgExecutionTime}ms</div>
            <p className="text-xs text-muted-foreground">Average duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {safeExecutions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No workflow executions yet. Your data will appear here once
              workflows run.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Executed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeExecutions.map((execution) => (
                  <TableRow
                    key={execution.id}
                    className="cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/executions/${execution.id}`)
                    }
                  >
                    <TableCell className="font-medium">
                      {execution.workflow_name || "Unnamed Workflow"}
                    </TableCell>
                    <TableCell>{getStatusBadge(execution.status)}</TableCell>
                    <TableCell>${(execution.cost || 0).toFixed(4)}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(execution.executed_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
