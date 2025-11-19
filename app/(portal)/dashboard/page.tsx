"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "lucide-react";

interface Execution {
  id: string;
  workflow_name: string;
  status: string;
  cost: number;
  duration_ms: number;
  executed_at: string;
}

export default function DashboardPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("Client");
  const [isLive, setIsLive] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Get user and client ID
  useEffect(() => {
    const fetchClientId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: userClient } = await supabase
        .from("user_clients")
        .select("client_id, clients(name)")
        .eq("user_id", user.id)
        .single();

      if (userClient) {
        setClientId(userClient.client_id);
        setClientName((userClient.clients as any)?.name || "Client");
      }
    };

    fetchClientId();
  }, []);

  // Load initial executions
  useEffect(() => {
    if (!clientId) return;

    const loadExecutions = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from("workflow_executions")
          .select("*")
          .eq("client_id", clientId)
          .gte("executed_at", thirtyDaysAgo.toISOString())
          .order("executed_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setExecutions(data || []);
      } catch (error) {
        console.error("Error loading executions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExecutions();
  }, [clientId]);

  // Subscribe to Realtime updates
  useEffect(() => {
    if (!clientId) return;

    setIsLive(true);

    const channel = supabase
      .channel("dashboard_executions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workflow_executions",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          console.log("New execution received:", payload);

          const newExecution = payload.new as Execution;

          // Add to the top of the list and keep only the last 10
          setExecutions((prev) => [newExecution, ...prev].slice(0, 10));

          // Show toast notification
          toast({
            title: "Workflow Completed",
            description: `${newExecution.workflow_name || "Unnamed Workflow"} finished with status: ${newExecution.status}`,
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

  // Calculate metrics
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(
    (e) => e.status === "success"
  ).length;
  const successRate =
    totalExecutions > 0
      ? ((successfulExecutions / totalExecutions) * 100).toFixed(1)
      : "0.0";
  const totalCost = executions
    .reduce((sum, e) => sum + (e.cost || 0), 0)
    .toFixed(2);
  const avgExecutionTime =
    totalExecutions > 0
      ? (
          executions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) /
          totalExecutions
        ).toFixed(0)
      : "0";

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-20 w-96" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {clientName}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your workflows
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Live</span>
          </div>
        )}
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
          {executions.length === 0 ? (
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
                {executions.map((execution) => (
                  <TableRow
                    key={execution.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/executions/${execution.id}`)}
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
