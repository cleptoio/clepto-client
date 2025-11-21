'use client';

import { useEffect, useState } from 'react';
import { useClient } from '@/contexts/ClientContext';
import { createClient } from '@/lib/supabase';
import { WorkflowExecution } from '@/types/database';
import Header from '@/components/Header';
import MetricsCard from '@/components/MetricsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
    const { clientId, isLoading: clientLoading } = useClient();
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');

    useEffect(() => {
        if (!clientLoading && clientId) {
            fetchExecutions();
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
        } finally {
            setLoading(false);
        }
    };

    const daysCount = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysCount);

    const filteredExecutions = executions.filter(
        (e) => new Date(e.start_time) >= cutoffDate
    );

    const totalCost = filteredExecutions.reduce((sum, e) => sum + e.cost, 0);
    const avgCost = filteredExecutions.length > 0 ? totalCost / filteredExecutions.length : 0;

    const workflowCounts = filteredExecutions.reduce((acc, e) => {
        acc[e.workflow_name] = (acc[e.workflow_name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostUsedWorkflow = Object.entries(workflowCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Cost trend comparison
    const prevCutoffDate = new Date();
    prevCutoffDate.setDate(prevCutoffDate.getDate() - (daysCount * 2));
    const prevPeriodExecutions = executions.filter(
        (e) => new Date(e.start_time) >= prevCutoffDate && new Date(e.start_time) < cutoffDate
    );
    const prevTotalCost = prevPeriodExecutions.reduce((sum, e) => sum + e.cost, 0);
    const costTrend = prevTotalCost > 0 ? ((totalCost - prevTotalCost) / prevTotalCost) * 100 : 0;

    // Daily cost data
    const dailyCostData = Array.from({ length: daysCount }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (daysCount - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            cost: filteredExecutions
                .filter((e) => e.start_time.split('T')[0] === dateStr)
                .reduce((sum, e) => sum + e.cost, 0),
        };
    });

    // Cost by provider
    const providerCostData = Object.entries(
        filteredExecutions.reduce((acc, e) => {
            acc[e.ai_provider] = (acc[e.ai_provider] || 0) + e.cost;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    // Cost by workflow
    const workflowCostData = Object.entries(
        filteredExecutions.reduce((acc, e) => {
            acc[e.workflow_name] = (acc[e.workflow_name] || 0) + e.cost;
            return acc;
        }, {} as Record<string, number>)
    )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    // Token distribution
    const totalInputTokens = filteredExecutions.reduce((sum, e) => sum + e.input_tokens, 0);
    const totalOutputTokens = filteredExecutions.reduce((sum, e) => sum + e.output_tokens, 0);
    const tokenData = [
        { name: 'Input Tokens', value: totalInputTokens },
        { name: 'Output Tokens', value: totalOutputTokens },
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (clientLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Your Cost Analytics</h1>
                        <p className="text-muted-foreground">Analyze your AI automation costs and usage</p>
                    </div>
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <MetricsCard
                        title="Total Cost"
                        value={formatCurrency(totalCost)}
                        icon={DollarSign}
                    />
                    <MetricsCard
                        title="Average Cost per Execution"
                        value={formatCurrency(avgCost)}
                        icon={Activity}
                    />
                    <MetricsCard
                        title="Most Used Workflow"
                        value={mostUsedWorkflow}
                        icon={TrendingUp}
                    />
                    <MetricsCard
                        title="Cost Trend"
                        value={`${costTrend > 0 ? '+' : ''}${costTrend.toFixed(1)}%`}
                        icon={costTrend > 0 ? ArrowUp : ArrowDown}
                        trend={{ value: Math.abs(costTrend), isPositive: costTrend < 0 }}
                    />
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                    {/* Daily Costs */}
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>Your Daily Costs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyCostData}>
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
                            <CardTitle>Cost by AI Provider</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={providerCostData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Cost by Workflow */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cost by Workflow Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={workflowCostData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Bar dataKey="value" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Token Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Token Usage Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={tokenData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {tokenData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => (value as number).toLocaleString()} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Token Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cost Distribution by Workflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={workflowCostData.slice(0, 5)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name.slice(0, 15)}... ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {workflowCostData.slice(0, 5).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
