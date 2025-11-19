"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "lucide-react";

interface Execution {
  id: string;
  workflow_name: string;
  ai_provider: string;
  cost: number;
  executed_at: string;
}

interface ProviderData {
  name: string;
  count: number;
  cost: number;
}

interface WorkflowData {
  name: string;
  count: number;
  cost: number;
  avgCost: number;
}

export default function CostsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: userClient } = await supabase
          .from("user_clients")
          .select("client_id")
          .eq("user_id", user.id)
          .single();

        if (!userClient) return;

        setClientId(userClient.client_id);

        // Get last 30 days of executions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from("workflow_executions")
          .select("*")
          .eq("client_id", userClient.client_id)
          .gte("executed_at", thirtyDaysAgo.toISOString())
          .order("executed_at", { ascending: false });

        if (error) throw error;
        setExecutions(data || []);
      } catch (error) {
        console.error("Error loading costs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Subscribe to Realtime updates
  useEffect(() => {
    if (!clientId) return;

    setIsLive(true);

    const channel = supabase
      .channel("costs_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workflow_executions",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          console.log("New execution received for costs:", payload);

          const newExecution = payload.new as Execution;

          // Add to executions list
          setExecutions((prev) => [newExecution, ...prev]);

          // Show toast notification
          toast({
            title: "Cost Updated",
            description: `New execution added: $${(newExecution.cost || 0).toFixed(4)}`,
          });
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [clientId, toast]);

  // Calculate total cost
  const totalCost = executions.reduce((sum, e) => sum + (e.cost || 0), 0);

  // Group by provider
  const costByProvider = executions.reduce((acc: any, e) => {
    const provider = e.ai_provider || "Unknown";
    if (!acc[provider]) {
      acc[provider] = { count: 0, cost: 0 };
    }
    acc[provider].count += 1;
    acc[provider].cost += e.cost || 0;
    return acc;
  }, {});

  // Group by workflow
  const costByWorkflow = executions.reduce((acc: any, e) => {
    const workflow = e.workflow_name || "Unnamed";
    if (!acc[workflow]) {
      acc[workflow] = { count: 0, cost: 0 };
    }
    acc[workflow].count += 1;
    acc[workflow].cost += e.cost || 0;
    return acc;
  }, {});

  const providerData: ProviderData[] = Object.entries(costByProvider)
    .map(([name, data]: [string, any]) => ({
      name,
      count: data.count,
      cost: data.cost,
    }))
    .sort((a, b) => b.cost - a.cost);

  const workflowData: WorkflowData[] = Object.entries(costByWorkflow)
    .map(([name, data]: [string, any]) => ({
      name,
      count: data.count,
      cost: data.cost,
      avgCost: data.cost / data.count,
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-20 w-96" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Cost Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze your AI usage costs
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Live</span>
          </div>
        )}
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
            Across {executions.length} workflow executions
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
                      {totalCost > 0 ? ((provider.cost / totalCost) * 100).toFixed(1) : "0.0"}%
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
