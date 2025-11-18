import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CostsPage() {
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
    .select("client_id")
    .eq("user_id", user.id)
    .single();

  const clientId = userClient?.client_id;

  // Get last 30 days of executions
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: executions } = await supabase
    .from("workflow_executions")
    .select("*")
    .eq("client_id", clientId)
    .gte("executed_at", thirtyDaysAgo.toISOString())
    .order("executed_at", { ascending: false });

  const safeExecutions = executions || [];

  // Calculate total cost
  const totalCost = safeExecutions.reduce((sum, e) => sum + (e.cost || 0), 0);

  // Group by provider
  const costByProvider = safeExecutions.reduce((acc: any, e) => {
    const provider = e.ai_provider || "Unknown";
    if (!acc[provider]) {
      acc[provider] = { count: 0, cost: 0 };
    }
    acc[provider].count += 1;
    acc[provider].cost += e.cost || 0;
    return acc;
  }, {});

  // Group by workflow
  const costByWorkflow = safeExecutions.reduce((acc: any, e) => {
    const workflow = e.workflow_name || "Unnamed";
    if (!acc[workflow]) {
      acc[workflow] = { count: 0, cost: 0 };
    }
    acc[workflow].count += 1;
    acc[workflow].cost += e.cost || 0;
    return acc;
  }, {});

  const providerData = Object.entries(costByProvider)
    .map(([name, data]: [string, any]) => ({
      name,
      count: data.count,
      cost: data.cost,
    }))
    .sort((a, b) => b.cost - a.cost);

  const workflowData = Object.entries(costByWorkflow)
    .map(([name, data]: [string, any]) => ({
      name,
      count: data.count,
      cost: data.cost,
      avgCost: data.cost / data.count,
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Cost Analytics</h1>
        <p className="text-muted-foreground">
          Track and analyze your AI usage costs
        </p>
      </div>

      {/* Total Cost Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total AI Cost (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            ${totalCost.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Across {safeExecutions.length} workflow executions
          </p>
        </CardContent>
      </Card>

      {/* Cost by Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Cost by AI Provider</CardTitle>
        </CardHeader>
        <CardContent>
          {providerData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cost data available yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providerData.map((provider) => (
                  <TableRow key={provider.name}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.count}</TableCell>
                    <TableCell className="font-bold">
                      ${provider.cost.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {((provider.cost / totalCost) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cost by Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Workflows by Cost</CardTitle>
        </CardHeader>
        <CardContent>
          {workflowData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No workflow data available yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow Name</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Avg Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflowData.map((workflow) => (
                  <TableRow key={workflow.name}>
                    <TableCell className="font-medium">{workflow.name}</TableCell>
                    <TableCell>{workflow.count}</TableCell>
                    <TableCell className="font-bold">
                      ${workflow.cost.toFixed(4)}
                    </TableCell>
                    <TableCell>${workflow.avgCost.toFixed(4)}</TableCell>
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
