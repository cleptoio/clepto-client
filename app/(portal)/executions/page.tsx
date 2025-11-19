"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ai_model: string;
  ai_provider: string;
  cost: number;
  duration_ms: number;
  executed_at: string;
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    try {
      const supabase = createClient();

      // Get user's client ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userClient } = await supabase
        .from("user_clients")
        .select("client_id")
        .eq("user_id", user.id)
        .single();

      if (!userClient) return;

      setClientId(userClient.client_id);

      // Fetch executions for this client
      const { data, error } = await supabase
        .from("workflow_executions")
        .select("*")
        .eq("client_id", userClient.client_id)
        .order("executed_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error("Error loading executions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to Realtime updates
  useEffect(() => {
    if (!clientId) return;

    const supabase = createClient();
    setIsLive(true);

    const channel = supabase
      .channel("executions_list")
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

          // Prepend to the list
          setExecutions((prev) => [newExecution, ...prev]);

          // Show toast notification
          toast({
            title: "New Execution",
            description: `${newExecution.workflow_name || "Unnamed Workflow"} - ${newExecution.status}`,
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

  // Filter executions
  const filteredExecutions = executions.filter((exec) => {
    const matchesSearch =
      exec.workflow_name?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesStatus = statusFilter === "all" || exec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalExecutions = filteredExecutions.length;
  const successRate =
    totalExecutions > 0
      ? (
          (filteredExecutions.filter((e) => e.status === "success").length /
            totalExecutions) *
          100
        ).toFixed(1)
      : "0.0";
  const totalCost = filteredExecutions
    .reduce((sum, e) => sum + (e.cost || 0), 0)
    .toFixed(2);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
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
          <h1 className="text-3xl font-bold tracking-tight">Workflow Executions</h1>
          <p className="text-muted-foreground">
            View and filter all your workflow execution history
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Live</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by workflow name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExecutions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No executions found matching your filters.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Model</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Executed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExecutions.map((execution) => (
                    <TableRow
                      key={execution.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/executions/${execution.id}`)}
                    >
                      <TableCell className="font-medium">
                        {execution.workflow_name || "Unnamed Workflow"}
                      </TableCell>
                      <TableCell>{getStatusBadge(execution.status)}</TableCell>
                      <TableCell>{execution.ai_model || "N/A"}</TableCell>
                      <TableCell>{execution.ai_provider || "N/A"}</TableCell>
                      <TableCell>${(execution.cost || 0).toFixed(4)}</TableCell>
                      <TableCell>{execution.duration_ms || 0}ms</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(execution.executed_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
