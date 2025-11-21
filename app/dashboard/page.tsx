'use client';

import { useEffect, useState } from 'react';
import { useClient } from '@/contexts/ClientContext';
import { createClient } from '@/lib/supabase';
import { WorkflowExecution } from '@/types/database';
import Header from '@/components/Header';
import MetricsCard from '@/components/MetricsCard';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, DollarSign, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDateTime, formatDuration } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { clientId, client, isLoading: clientLoading } = useClient();
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!clientLoading && clientId) {
            fetchExecutions();
            subscribeToExecutions();
        }
    }, [clientId, clientLoading]);

    const fetchExecutions = async () => {
        if (!clientId) return;

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('workflow_executions')
                .select('*')
                .eq('client_id', clientId)
                .order('start_time', { ascending: false });

            if (error) throw error;
            setExecutions(data || []);
        } catch (error) {
            console.error('Error fetching executions:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch execution data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const subscribeToExecutions = () => {
        if (!clientId) return;

        const supabase = createClient();
        const channel = supabase
            .channel('workflow_executions_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'workflow_executions',
                    filter: `client_id=eq.${clientId}`,
                },
                (payload) => {
                    const newExecution = payload.new as WorkflowExecution;
                    setExecutions((prev) => [newExecution, ...prev]);
                    toast({
                        title: 'New Execution Completed',
                        description: `Workflow: ${newExecution.workflow_name}`,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    // Calculate metrics
    const currentMonth = new Date().getMonth();
    const currentMonthExecutions = executions.filter(
        (e) => new Date(e.start_time).getMonth() === currentMonth
    );

    const totalExecutions = currentMonthExecutions.length;
    const totalCost = currentMonthExecutions.reduce((sum, e) => sum + e.cost, 0);
    const avgExecutionTime = currentMonthExecutions.length > 0
        ? currentMonthExecutions
            .filter(e => e.end_time)
            .reduce((sum, e) => {
                const duration = new Date(e.end_time!).getTime() - new Date(e.start_time).getTime();
                return sum + duration;
            }, 0) / currentMonthExecutions.filter(e => e.end_time).length
        : 0;

    const successRate = totalExecutions > 0
        ? (currentMonthExecutions.filter((e) => e.status === 'success').length / totalExecutions) * 100
        : 0;

    // Chart data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
    });

    const costData = last30Days.map((date) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cost: executions
            .filter((e) => e.start_time.split('T')[0] === date)
            .reduce((sum, e) => sum + e.cost, 0),
    }));

    const workflowData = Object.entries(
        executions.reduce((acc, e) => {
            acc[e.workflow_name] = (acc[e.workflow_name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    )
        .map(([name, count]) => ({ name, count }))
        .slice(0, 5);

    const providerData = Object.entries(
        executions.reduce((acc, e) => {
            acc[e.ai_provider] = (acc[e.ai_provider] || 0) + e.cost;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const recentExecutions = executions.slice(0, 10);

    if (clientLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {client?.name}!</h1>
                <p className="text-muted-foreground mb-8">Here's an overview of your AI automation activity</p>

                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <MetricsCard
                        title="Total Executions (This Month)"
                        value={totalExecutions}
                        icon={Activity}
                    />
                    <MetricsCard
                        title="Total AI Cost (This Month)"
                        value={formatCurrency(totalCost)}
                        icon={DollarSign}
                    />
                    <MetricsCard
                        title="Avg Execution Time"
                        value={avgExecutionTime > 0 ? `${(avgExecutionTime / 1000).toFixed(1)}s` : '--'}
                        icon={Clock}
                    />
                    <MetricsCard
                        title="Success Rate"
                        value={`${successRate.toFixed(1)}%`}
                        icon={CheckCircle2}
                    />
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {/* Cost Over Time */}
                    <Card className="col-span-full lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Your AI Costs (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={costData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Cost by Provider */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cost by Provider</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={providerData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {providerData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Executions by Workflow */}
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>Your Executions by Workflow Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={workflowData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Executions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Executions</CardTitle>
                            <CardDescription>Your last 10 workflow executions</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => router.push('/executions')}>
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentExecutions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No executions yet</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Workflow Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentExecutions.map((execution) => (
                                        <TableRow key={execution.id}>
                                            <TableCell className="font-medium">{execution.workflow_name}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={execution.status} />
                                            </TableCell>
                                            <TableCell>{execution.ai_provider}</TableCell>
                                            <TableCell>{formatCurrency(execution.cost)}</TableCell>
                                            <TableCell>{formatDuration(execution.start_time, execution.end_time)}</TableCell>
                                            <TableCell>{formatDateTime(execution.start_time)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
